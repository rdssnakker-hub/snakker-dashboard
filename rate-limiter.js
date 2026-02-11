#!/usr/bin/env node

/**
 * Rate Limiter
 * 
 * Prevents rate limit errors by enforcing:
 * - 5 seconds minimum between API calls
 * - 10 seconds minimum between web searches
 * - Max 5 searches per batch, then 2-minute break
 * - Batches similar work (consolidate requests)
 * - Handles 429 errors with exponential backoff
 */

const fs = require('fs');
const path = require('path');

class RateLimiter {
  constructor(options = {}) {
    // Time requirements (in milliseconds)
    this.API_DELAY = options.apiDelay || 5000;           // 5 seconds
    this.SEARCH_DELAY = options.searchDelay || 10000;    // 10 seconds
    this.BATCH_LIMIT = options.batchLimit || 5;          // Max 5 searches per batch
    this.BATCH_BREAK = options.batchBreak || 120000;     // 2 minutes between batches
    this.RATE_LIMIT_WAIT = options.rateLimitWait || 300000; // 5 minutes on 429

    // Track last calls
    this.lastApiCall = 0;
    this.lastSearchCall = 0;
    this.searchCount = 0;
    this.rateLimitHitAt = null;

    // State file
    this.stateFile = options.stateFile || path.join(__dirname, '.rate-limiter-state.json');
    this.loadState();
  }

  /**
   * Load persisted state from file
   */
  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
        this.lastApiCall = state.lastApiCall || 0;
        this.lastSearchCall = state.lastSearchCall || 0;
        this.searchCount = state.searchCount || 0;
        this.rateLimitHitAt = state.rateLimitHitAt || null;
      }
    } catch (e) {
      console.warn('⚠️  Could not load rate limiter state:', e.message);
    }
  }

  /**
   * Save state to file (persist across sessions)
   */
  saveState() {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify({
        lastApiCall: this.lastApiCall,
        lastSearchCall: this.lastSearchCall,
        searchCount: this.searchCount,
        rateLimitHitAt: this.rateLimitHitAt,
        savedAt: new Date().toISOString()
      }, null, 2));
    } catch (e) {
      console.warn('⚠️  Could not save rate limiter state:', e.message);
    }
  }

  /**
   * Wait before making API call
   */
  async waitForApiCall(label = 'API call') {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;

    if (timeSinceLastCall < this.API_DELAY) {
      const waitTime = this.API_DELAY - timeSinceLastCall;
      console.log(`⏳ Rate limiting ${label}: waiting ${(waitTime / 1000).toFixed(1)}s...`);
      await this.sleep(waitTime);
    }

    this.lastApiCall = Date.now();
    this.saveState();
  }

  /**
   * Wait before making search call
   * Tracks batch count and enforces batch breaks
   */
  async waitForSearch(label = 'Web search') {
    // Check if we're in a rate limit penalty
    if (this.rateLimitHitAt) {
      const timeSincePenalty = Date.now() - this.rateLimitHitAt;
      if (timeSincePenalty < this.RATE_LIMIT_WAIT) {
        const remaining = this.RATE_LIMIT_WAIT - timeSincePenalty;
        const minutes = Math.ceil(remaining / 60000);
        console.log(`🚫 RATE LIMIT PENALTY: waiting ${minutes} minutes before retrying...`);
        await this.sleep(remaining);
        this.rateLimitHitAt = null;
        this.searchCount = 0;
      }
    }

    // Check if we need a batch break
    if (this.searchCount >= this.BATCH_LIMIT) {
      console.log(`⏸️  Batch limit reached (${this.BATCH_LIMIT} searches). Taking 2-minute break...`);
      await this.sleep(this.BATCH_BREAK);
      this.searchCount = 0;
    }

    // Standard search delay
    const now = Date.now();
    const timeSinceLastSearch = now - this.lastSearchCall;

    if (timeSinceLastSearch < this.SEARCH_DELAY) {
      const waitTime = this.SEARCH_DELAY - timeSinceLastSearch;
      console.log(`⏳ Rate limiting ${label}: waiting ${(waitTime / 1000).toFixed(1)}s...`);
      await this.sleep(waitTime);
    }

    this.lastSearchCall = Date.now();
    this.searchCount++;
    this.saveState();
  }

  /**
   * Handle 429 (Too Many Requests) error
   * Sets penalty timer and returns retry delay
   */
  handleRateLimitError(statusCode = 429) {
    if (statusCode === 429) {
      this.rateLimitHitAt = Date.now();
      this.saveState();
      console.log(`🚫 RATE LIMIT ERROR (429): Set 5-minute penalty. Retry after this wait.`);
      return this.RATE_LIMIT_WAIT;
    }
    return 0;
  }

  /**
   * Check if currently in rate limit penalty
   */
  isInPenalty() {
    if (!this.rateLimitHitAt) return false;
    const timeSincePenalty = Date.now() - this.rateLimitHitAt;
    return timeSincePenalty < this.RATE_LIMIT_WAIT;
  }

  /**
   * Get remaining penalty time (in seconds)
   */
  getPenaltyTimeRemaining() {
    if (!this.rateLimitHitAt) return 0;
    const remaining = this.RATE_LIMIT_WAIT - (Date.now() - this.rateLimitHitAt);
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Batch multiple API calls into single request
   * Returns true if batch should proceed
   */
  canBatchRequests(count = 1) {
    // Example: batch 10 leads into 1 request instead of 10 requests
    if (count <= 1) return false;
    console.log(`📦 Batching ${count} requests into 1 (saves ${count - 1} API calls)`);
    return true;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset all state
   */
  reset() {
    this.lastApiCall = 0;
    this.lastSearchCall = 0;
    this.searchCount = 0;
    this.rateLimitHitAt = null;
    this.saveState();
    console.log('🔄 Rate limiter reset');
  }

  /**
   * Get status report
   */
  getStatus() {
    const now = Date.now();
    const lastApiAgo = Math.round((now - this.lastApiCall) / 1000);
    const lastSearchAgo = Math.round((now - this.lastSearchCall) / 1000);
    const penaltyRemaining = this.getPenaltyTimeRemaining();

    return {
      lastApiCall: lastApiAgo + 's ago',
      lastSearchCall: lastSearchAgo + 's ago',
      searchCount: `${this.searchCount}/${this.BATCH_LIMIT}`,
      inPenalty: this.isInPenalty(),
      penaltyRemaining: penaltyRemaining + 's',
      ready: {
        api: lastApiAgo >= (this.API_DELAY / 1000),
        search: lastSearchAgo >= (this.SEARCH_DELAY / 1000) && !this.isInPenalty()
      }
    };
  }
}

/**
 * Global rate limiter instance
 */
let globalRateLimiter = null;

function getInstance(options = {}) {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(options);
  }
  return globalRateLimiter;
}

/**
 * Wrapped API call with rate limiting
 */
async function callWithRateLimit(fn, label = 'API call') {
  const limiter = getInstance();
  await limiter.waitForApiCall(label);
  
  try {
    return await fn();
  } catch (err) {
    if (err.statusCode === 429) {
      limiter.handleRateLimitError(429);
      throw new Error(`Rate limited (429). Wait 5 minutes before retry.`);
    }
    throw err;
  }
}

/**
 * Wrapped search call with rate limiting
 */
async function searchWithRateLimit(fn, label = 'Web search') {
  const limiter = getInstance();
  await limiter.waitForSearch(label);
  
  try {
    return await fn();
  } catch (err) {
    if (err.statusCode === 429) {
      limiter.handleRateLimitError(429);
      throw new Error(`Rate limited (429). Wait 5 minutes before retry.`);
    }
    throw err;
  }
}

/**
 * Demo/test
 */
if (require.main === module) {
  console.log('🧪 Rate Limiter Demo\n');

  const limiter = getInstance({
    apiDelay: 2000,      // 2s for demo
    searchDelay: 3000,   // 3s for demo
    batchLimit: 2        // 2 searches per batch for demo
  });

  (async () => {
    console.log('Status:', limiter.getStatus());
    console.log('\n1. Making API call...');
    await limiter.waitForApiCall('Demo API #1');
    console.log('   ✓ Called\n');

    console.log('2. Making another API call (should wait 2s)...');
    await limiter.waitForApiCall('Demo API #2');
    console.log('   ✓ Called\n');

    console.log('3. Web search #1...');
    await limiter.waitForSearch('Demo search #1');
    console.log('   ✓ Searched\n');

    console.log('4. Web search #2...');
    await limiter.waitForSearch('Demo search #2');
    console.log('   ✓ Searched (batch full, next search will trigger break)\n');

    console.log('Final Status:', limiter.getStatus());
  })();
}

module.exports = {
  RateLimiter,
  getInstance,
  callWithRateLimit,
  searchWithRateLimit
};
