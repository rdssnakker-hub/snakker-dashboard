#!/usr/bin/env node

/**
 * Dashboard API Server
 * 
 * Powers the interactive campaign dashboard
 * - Chat interface for revising briefs/storyboards
 * - Real-time brief updates
 * - Magic Patterns regeneration trigger
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 4444;
const CAMPAIGNS_ROOT = path.join(__dirname, '..', '..', 'campaigns');

// Import utilities
const { generateCompactFlashBrief, parseChartInputForUpdates } = require('./flash-brief-compact');

/**
 * Load campaign data
 */
function loadCampaignData(company, country, product, number) {
  const campaignPath = path.join(
    CAMPAIGNS_ROOT,
    company,
    country,
    product,
    String(number).padStart(3, '0')
  );

  const campaignJsonPath = path.join(campaignPath, 'campaign.json');
  if (!fs.existsSync(campaignJsonPath)) {
    throw new Error(`Campaign not found: ${campaignPath}`);
  }

  const campaignData = JSON.parse(fs.readFileSync(campaignJsonPath, 'utf-8'));
  return {
    ...campaignData.intake || {},
    ...campaignData.metadata || {},
    magicPatterns: campaignData.magicPatterns || {}
  };
}

/**
 * Save updated campaign data
 */
function saveCampaignData(company, country, product, number, data) {
  const campaignPath = path.join(
    CAMPAIGNS_ROOT,
    company,
    country,
    product,
    String(number).padStart(3, '0')
  );

  const campaignJsonPath = path.join(campaignPath, 'campaign.json');
  const existing = JSON.parse(fs.readFileSync(campaignJsonPath, 'utf-8'));

  const updated = {
    ...existing,
    intake: data,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(campaignJsonPath, JSON.stringify(updated, null, 2));
  return updated;
}

/**
 * Process chat message and update brief
 */
function processChatMessage(campaignData, userMessage) {
  const updatedData = parseChartInputForUpdates(userMessage, campaignData);
  
  const changes = [];
  for (const key in updatedData) {
    if (updatedData[key] !== campaignData[key]) {
      changes.push({
        field: key,
        oldValue: campaignData[key],
        newValue: updatedData[key]
      });
    }
  }

  return {
    updatedData,
    changes,
    briefChanged: changes.length > 0
  };
}

/**
 * Generate FABP options via Snakker agent
 */
function generateFABPOptions(campaignData) {
  return new Promise((resolve, reject) => {
    const prompt = buildSnakerPrompt(campaignData);
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    const command = `openclaw agent --agent snakker --message "${escapedPrompt}" --json`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Snakker generation failed: ${error.message}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        const response = result.reply || result.message || stdout;
        
        // Parse FABP options from response
        const options = parseFABPOptions(response);
        resolve(options);
      } catch (e) {
        reject(new Error(`Parse error: ${e.message}`));
      }
    });
  });
}

function buildSnakerPrompt(campaignData) {
  return `
You are Snakker Cortex, behavioral storytelling strategist.

UPDATED CAMPAIGN INTAKE
Company: ${campaignData.company}
Product: ${campaignData.productName}
Problem: ${campaignData.challenge}
Objective: ${campaignData.objective}
CTA: ${campaignData.cta}
Audience: ${campaignData.targetAudience}
Device: ${campaignData.primaryDevice}
Channel: ${campaignData.channel}

Create 3 BRIEF FABP strategic options (keep each under 100 words).
Format each as:
## Option [N]: [Title]
[Strategic angle and approach]
`;
}

function parseFABPOptions(response) {
  const options = [];
  const sections = response.split(/## Option \d+:/i).slice(1);

  sections.forEach((section, i) => {
    const lines = section.trim().split('\n');
    const title = lines[0]?.trim() || `Option ${i + 1}`;
    const content = lines.slice(1).join('\n').trim();

    options.push({
      number: i + 1,
      title,
      content
    });
  });

  return options.slice(0, 3);
}

/**
 * HTTP Server
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Serve dashboard HTML
    if (pathname === '/' || pathname === '/dashboard.html') {
      const htmlPath = path.join(__dirname, 'dashboard-interactive.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

    // API: Load campaign
    if (pathname === '/api/campaign' && req.method === 'GET') {
      const { company, country, product, number } = query;
      const campaignData = loadCampaignData(company, country, product, number);
      const briefHtml = generateCompactFlashBrief(campaignData);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: campaignData,
        brief: briefHtml
      }));
      return;
    }

    // API: Process chat message
    if (pathname === '/api/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { company, country, product, number, message, campaignData } = JSON.parse(body);

          // Process message and update data
          const { updatedData, changes } = processChatMessage(campaignData, message);

          // Save updated campaign
          const saved = saveCampaignData(company, country, product, number, updatedData);

          // Generate response
          const responseMsg = changes.length > 0
            ? `✅ Updated ${changes.map(c => c.field).join(', ')}`
            : '👌 Got it! What else would you like to change?';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            response: responseMsg,
            updatedData,
            changes
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    // API: Regenerate Magic Patterns
    if (pathname === '/api/regenerate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { company, country, product, number, campaignData } = JSON.parse(body);

          console.log(`🔄 Regenerating FABP options for ${product}...`);

          // Generate new FABP options
          const options = await generateFABPOptions(campaignData);

          // Save options
          const optionsPath = path.join(
            CAMPAIGNS_ROOT,
            company,
            country,
            product,
            String(number).padStart(3, '0'),
            'fabp-options.json'
          );

          fs.writeFileSync(optionsPath, JSON.stringify({
            options,
            regeneratedAt: new Date().toISOString(),
            campaignData
          }, null, 2));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            options,
            message: `✨ Regenerated ${options.length} FABP options`
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (err) {
    console.error('Server error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`
🚀 Snakker Dashboard API running on http://localhost:${PORT}

Endpoints:
  GET  /dashboard.html              ← Interactive dashboard UI
  GET  /api/campaign                ← Load campaign data
  POST /api/chat                    ← Process chat message
  POST /api/regenerate              ← Regenerate FABP options

Usage:
  1. Open http://localhost:${PORT} in browser
  2. Chat to revise brief and storyboard
  3. Click "Regenerate" to update Magic Patterns designs
  4. Download or deploy updated campaign

Logs: tail -f dashboard-api.log
  `);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Dashboard API shutting down...');
  server.close(() => process.exit(0));
});
