# Rate Limiting Implementation Guide

**Status:** ✅ Implemented  
**Date:** February 11, 2026  
**Purpose:** Prevent API rate limit errors across all integrations

---

## Problem Statement

You were hitting rate limit errors (429 Too Many Requests) because:
- Multiple API calls happening too quickly
- Web searches not respecting throttle windows
- No batch consolidation
- No penalty handling on 429 errors

---

## Solution: Rate Limiter Module

### Core Rules Implemented

| Limit | Requirement | Enforcement |
|-------|-------------|-------------|
| **API Calls** | 5 seconds minimum between calls | Auto-wait before each call |
| **Web Searches** | 10 seconds minimum between searches | Auto-wait before each search |
| **Search Batch** | Max 5 searches per batch | Counter resets after batch break |
| **Batch Break** | 2 minutes between batches | Automatic pause after 5 searches |
| **429 Error** | 5-minute penalty on rate limit hit | Exponential backoff + state persistence |

---

## Architecture

### Rate Limiter Module (`rate-limiter.js`)

```javascript
const { getInstance, callWithRateLimit, searchWithRateLimit } = require('./rate-limiter');

// Get global instance
const limiter = getInstance();

// Option 1: Manual wait before call
await limiter.waitForApiCall('HubSpot query');
const result = await myApiCall();

// Option 2: Wrapped call with auto-limiting
const result = await callWithRateLimit(
  () => myApiCall(),
  'HubSpot query'
);

// Option 3: Search with auto-limiting
const results = await searchWithRateLimit(
  () => web_search({ query: 'something' }),
  'Competitor search'
);

// Handle 429 errors
try {
  await callWithRateLimit(fn, label);
} catch (err) {
  if (err.statusCode === 429) {
    const waitTime = limiter.handleRateLimitError(429);
    // Wait 5 minutes, then retry
  }
}
```

### State Persistence

Rate limiter state is saved to `.rate-limiter-state.json`:

```json
{
  "lastApiCall": 1707555600000,
  "lastSearchCall": 1707555610000,
  "searchCount": 3,
  "rateLimitHitAt": null,
  "savedAt": "2026-02-11T08:59:00Z"
}
```

This survives server restarts - limits continue across sessions.

---

## Integration Examples

### Example 1: HubSpot Form Poller (Updated)

```javascript
const { getInstance } = require('./rate-limiter');
const limiter = getInstance();

async function pollHubSpot() {
  // Skip if in penalty
  if (limiter.isInPenalty()) {
    const remaining = limiter.getPenaltyTimeRemaining();
    console.log(`Skipping: penalty expires in ${remaining}s`);
    return;
  }

  // Wait before API call
  await limiter.waitForApiCall('HubSpot submissions query');
  
  try {
    const response = await makeHubSpotRequest(endpoint);
    // Process response
  } catch (err) {
    if (err.statusCode === 429) {
      limiter.handleRateLimitError(429);
      console.log('Rate limited - will retry in 5 minutes');
      return;
    }
    throw err;
  }
}
```

### Example 2: Web Search Batch

```javascript
const { getInstance } = require('./rate-limiter');
const limiter = getInstance();

async function searchCompetitors(competitors) {
  const results = [];

  for (const competitor of competitors) {
    // Auto-enforces 10s delay between searches
    // Auto-enforces 2-minute break after 5 searches
    await limiter.waitForSearch(`Search: ${competitor}`);
    
    try {
      const result = await web_search({ query: competitor });
      results.push(result);
    } catch (err) {
      if (err.statusCode === 429) {
        limiter.handleRateLimitError(429);
        break; // Stop batch, retry later
      }
    }
  }

  return results;
}
```

### Example 3: Batch Multiple Requests Into One

```javascript
// ❌ BAD: 10 individual API calls
for (let i = 0; i < 10; i++) {
  await limiter.waitForApiCall(`Lead ${i}`);
  await createLead(leads[i]);
}

// ✅ GOOD: 1 batched API call
if (limiter.canBatchRequests(leads.length)) {
  await limiter.waitForApiCall('Batch create leads');
  await createLeadsBatch(leads);
}
```

---

## Configuration

### Default Settings

```javascript
const limiter = getInstance({
  apiDelay: 5000,           // 5 seconds between API calls
  searchDelay: 10000,       // 10 seconds between web searches
  batchLimit: 5,            // Max 5 searches per batch
  batchBreak: 120000,       // 2 minutes between batches
  rateLimitWait: 300000,    // 5 minutes on 429 error
  stateFile: '.rate-limiter-state.json'
});
```

### Custom Configuration

```javascript
// For testing (shorter delays)
const limiter = getInstance({
  apiDelay: 500,
  searchDelay: 1000,
  batchLimit: 2,
  batchBreak: 10000
});

// For aggressive APIs (longer delays)
const limiter = getInstance({
  apiDelay: 10000,
  searchDelay: 15000,
  batchLimit: 3,
  batchBreak: 180000
});
```

---

## Monitoring & Status

### Get Current Status

```javascript
const limiter = getInstance();
const status = limiter.getStatus();

console.log(status);
// {
//   lastApiCall: '2s ago',
//   lastSearchCall: '8s ago',
//   searchCount: '3/5',
//   inPenalty: false,
//   penaltyRemaining: '0s',
//   ready: {
//     api: true,
//     search: true
//   }
// }
```

### Check If Ready for Call

```javascript
const status = limiter.getStatus();

if (status.ready.api) {
  // Safe to make API call
  await makeApiCall();
} else {
  console.log('Not ready - wait:', status.lastApiCall);
}

if (status.ready.search) {
  // Safe to search
  await web_search(query);
} else {
  console.log('Not ready - wait:', status.lastSearchCall);
}
```

### Check Penalty Status

```javascript
if (limiter.isInPenalty()) {
  const remaining = limiter.getPenaltyTimeRemaining();
  console.log(`Rate limited. Retry in ${remaining} seconds`);
}
```

---

## Error Handling

### 429 (Too Many Requests)

When you get a 429 error:

1. **Immediately log it**
```javascript
if (err.statusCode === 429) {
  log(`🚫 Rate limit error (429)`);
}
```

2. **Trigger penalty**
```javascript
const waitTime = limiter.handleRateLimitError(429);
// Sets 5-minute penalty
```

3. **Stop the batch**
```javascript
return; // Stop processing this batch
```

4. **Retry later**
```javascript
// Check penalty before retrying
if (limiter.isInPenalty()) {
  console.log('Still in penalty - wait');
  return;
}
```

### Other Error Codes

```javascript
try {
  await callWithRateLimit(fn, label);
} catch (err) {
  if (err.statusCode === 429) {
    // Rate limit - handle penalty
    limiter.handleRateLimitError(429);
  } else if (err.statusCode === 403) {
    // Forbidden - check API key
    console.error('API key invalid or insufficient permissions');
  } else if (err.statusCode === 401) {
    // Unauthorized - credentials expired
    console.error('Authentication failed');
  } else {
    // Other errors
    throw err;
  }
}
```

---

## Batch Consolidation Strategy

### Reduce API Calls

**Before:**
```javascript
// 100 individual API calls
const hubspotContacts = [];
for (const email of emails) {
  const contact = await getContact(email);  // 100 calls!
  hubspotContacts.push(contact);
}
```

**After:**
```javascript
// 1 batched API call
const hubspotContacts = await getContactsBatch(emails);  // 1 call!
```

### Search Consolidation

**Before:**
```javascript
// 10 individual searches
for (const competitor of competitors) {
  const info = await web_search(`${competitor} pricing`);
  await limiter.waitForSearch();
  // 10 * 10 seconds = 100 seconds!
}
```

**After:**
```javascript
// 1 batched search
const query = competitors.join(' OR ');
const results = await web_search(query);
await limiter.waitForSearch();
// 10 seconds total
```

---

## Workflow: Hitting a Rate Limit

### What Happens

```
1. Make API call
   ↓
2. Get 429 Too Many Requests
   ↓
3. Limiter sets 5-minute penalty
   ↓
4. State saved to .rate-limiter-state.json
   ↓
5. All subsequent calls check penalty
   ↓
6. Calls skipped until penalty expires
   ↓
7. After 5 minutes, penalty clears
   ↓
8. Normal rate limiting resumes
```

### In Logs

```
📡 Making API call...
🚫 RATE LIMIT ERROR (429): Hit limit
🚫 Set 5-minute penalty. Will skip calls until 08:59 UTC

[waiting...]

⏸️  RATE LIMIT PENALTY: Skipping poll. Resume in 240s
⏸️  RATE LIMIT PENALTY: Skipping poll. Resume in 180s
⏸️  RATE LIMIT PENALTY: Skipping poll. Resume in 60s

✅ Penalty expired. Resuming normal operations
```

---

## Testing

### Run Demo

```bash
node rate-limiter.js
```

Output:
```
🧪 Rate Limiter Demo

Status: {
  lastApiCall: '0s ago',
  searchCount: '0/5',
  ...
}

1. Making API call...
   ⏳ Rate limiting: waiting 2.0s...
   ✓ Called

2. Making another API call (should wait 2s)...
   ⏳ Rate limiting: waiting 2.0s...
   ✓ Called

3. Web search #1...
   ⏳ Rate limiting: waiting 3.0s...
   ✓ Searched

Final Status: {...}
```

### Manual Testing

```javascript
const { getInstance } = require('./rate-limiter');

const limiter = getInstance({
  apiDelay: 1000,   // 1 second for testing
  searchDelay: 2000 // 2 seconds for testing
});

(async () => {
  console.log('Call 1:', new Date().toISOString());
  await limiter.waitForApiCall();
  
  console.log('Call 2:', new Date().toISOString());
  await limiter.waitForApiCall();
  // Will show ~1 second gap
})();
```

---

## Files Updated

### New Files
- ✅ `rate-limiter.js` - Core rate limiter module

### Modified Files
- ✅ `hubspot-form-poller.js` - Integrated rate limiting

### To Update Next
- `upload-server.js` - Add rate limiting for webhook processing
- `dashboard-api.js` - Add rate limiting for regeneration
- Any other API-calling modules

---

## Best Practices

### DO ✅

- **Batch similar requests** (10 leads → 1 batch call)
- **Check penalty before retrying** (avoids 429 spam)
- **Persist state** (limiter uses `.rate-limiter-state.json`)
- **Use wrapped functions** (`callWithRateLimit`, `searchWithRateLimit`)
- **Log rate limit events** for debugging
- **Monitor status** between batches

### DON'T ❌

- Don't ignore 429 errors (handle them!)
- Don't make concurrent API calls (violates rate limits)
- Don't retry immediately after 429 (wait 5 minutes)
- Don't forget batch breaks (enforce 2-minute pause)
- Don't make 10 individual calls when 1 batch would work
- Don't lose state (filesystem persistence is critical)

---

## Troubleshooting

### Still Getting 429 Errors?

1. Check state file exists:
```bash
cat .rate-limiter-state.json
```

2. Verify delays are being applied:
```bash
tail -f poller-log.txt | grep "Rate limiting\|waiting"
```

3. Check penalty status:
```javascript
const { getInstance } = require('./rate-limiter');
const limiter = getInstance();
console.log(limiter.getStatus());
```

4. May need longer delays:
```javascript
const limiter = getInstance({
  apiDelay: 10000,    // Increase to 10 seconds
  searchDelay: 20000, // Increase to 20 seconds
  batchBreak: 180000  // Increase to 3 minutes
});
```

### State File Issues

If `.rate-limiter-state.json` is corrupted:

```bash
rm .rate-limiter-state.json
# State will be recreated on next call
```

### Penalty Won't Clear

```javascript
const limiter = getInstance();

// Force reset (only if truly stuck)
limiter.reset();
console.log('Rate limiter reset');
```

---

## Summary

**Rate Limiter prevents:**
- ✅ Rapid-fire API calls (enforces 5s minimum)
- ✅ Overwhelming searches (enforces 10s + batch breaks)
- ✅ 429 error spam (5-minute penalty on hit)
- ✅ Lost state (persists to JSON file)

**To use:**
```javascript
const { getInstance } = require('./rate-limiter');
const limiter = getInstance();

await limiter.waitForApiCall('My operation');
// Safe to call API now
```

**Status/Monitoring:**
```javascript
console.log(limiter.getStatus());
console.log(limiter.isInPenalty());
console.log(limiter.getPenaltyTimeRemaining());
```

Done! 🚀
