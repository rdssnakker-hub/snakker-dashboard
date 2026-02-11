# Interactive Campaign Dashboard - Complete Guide

**Status:** ✅ Ready to use
**Version:** 1.0
**Date:** February 11, 2026

## Overview

The new **Snakker Cortex Interactive Dashboard** provides a modern, chat-driven interface for:
- 📋 **Compact Flash Brief** - Single-page, slide-presentation style
- 💬 **Chat Interface** - Natural language editing of brief and storyboard  
- 🎬 **3-Option Storyboard** - Dynamic FABP strategic options
- ✨ **One-Click Regeneration** - Update Magic Patterns designs

## What's New

### 1. Compact Flash Brief (No More Verbose Narratives!)

**Before:** Long, paragraph-heavy briefs
**After:** Single-page slide format

```
╔════════════════════════════════════════════════════════════════════════╗
║                    FLASH BRIEF: GLP-1 Therapy Guide                   ║
╚════════════════════════════════════════════════════════════════════════╝

📍 THE PROBLEM
HCPs dont recognize candidates until after complications

💡 THE SOLUTION
GLP-1 Therapy Guide | Brand: Novo Insights
Unique: First real-world evidence platform for GLP-1 outcomes

🎯 OBJECTIVE
Drive HCP understanding of patient selection criteria
CTA: "Use our patient screening checklist"

👥 AUDIENCE: Primary Care Physicians
📱 DEVICE: Desktop
📡 CHANNEL: Email campaign

📅 GO-LIVE: 2026-03-01
🏷️ STYLE: Branded
📊 SUCCESS: 15% screening rate adoption, 10% referral increase
```

Perfect for quick scanning and sharing!

### 2. Chat-Driven Brief Editing

**No more form filling.** Just chat naturally:

```
YOU:   "Change the target audience to nurses"
CORTEX: ✅ Updated! Changed target audience from "Primary Care 
         Physicians" to "Nurses"

YOU:   "Update the CTA to 'Download our clinical guide'"
CORTEX: ✅ Updated! New CTA: "Download our clinical guide"

YOU:   "Focus on mobile devices instead of desktop"
CORTEX: ✅ Updated! Changed primary device from "Desktop" to "Mobile"
```

**Supported updates:**
- 📍 Problem / Challenge
- 🎯 Objective / CTA
- 👥 Audience
- 📱 Device (Mobile/Desktop/Tablet)
- 📡 Channel
- 📊 Success metrics
- 🏷️ Branding style

### 3. One-Click Design Regeneration

**Problem:** Update brief → Manually regenerate mockups → Wait

**Solution:** Just click **"✨ Regenerate Magic Patterns"**

What happens:
1. Brief sent to Snakker Cortex agent
2. New 3 FABP strategic options generated
3. Magic Patterns mockups created for each
4. Editor/preview links updated
5. Campaign files saved with new designs
6. Complete in ~30 seconds

## Files & Architecture

### Components

```
dashboard-interactive.html        ← Frontend UI (no dependencies!)
├─ Responsive two-panel layout
├─ Real-time brief rendering
├─ Chat message thread
└─ Action buttons

dashboard-api.js                  ← Backend API server
├─ Campaign data loader
├─ Chat message processor
├─ FABP regeneration trigger
└─ File persistence

flash-brief-compact.js            ← Brief generator
├─ Compact slide format
├─ Chat input parser
└─ Field update logic
```

### Running the Dashboard

**Start the API server:**
```bash
cd /root/.openclaw/workspace/agents/snakker
node dashboard-api.js
```

Output:
```
🚀 Snakker Dashboard API running on http://localhost:4444

Endpoints:
  GET  /dashboard.html              ← Interactive dashboard UI
  GET  /api/campaign                ← Load campaign data
  POST /api/chat                    ← Process chat message
  POST /api/regenerate              ← Regenerate FABP options
```

**Open in browser:**
```
http://localhost:4444
```

## Workflow Examples

### Example 1: Quick Update & Regenerate

```
1. Open dashboard
2. Read the compact flash brief (takes 10 seconds)
3. Chat: "Change the challenge to early detection"
4. See brief update instantly
5. Click "Regenerate Magic Patterns"
6. New mockups appear in 30 seconds
7. Share links with stakeholders
```

### Example 2: Multi-Step Campaign Evolution

```
1. Chat: "Our audience is actually nurses, not doctors"
   CORTEX: ✅ Updated audience

2. Chat: "We need mobile-first design"
   CORTEX: ✅ Changed device to Mobile

3. Chat: "The CTA should be 'Request training session'"
   CORTEX: ✅ Updated CTA

4. Chat: "When do we need this?"
   CORTEX: Let me update the timeline - what's the new go-live date?

5. User: "March 15th, 2026"
   CORTEX: ✅ Updated go-live date

6. Click "Regenerate Magic Patterns"
7. All mockups regenerated with new specs
8. Everything updated in campaign directory
```

### Example 3: A/B Testing Different Angles

```
1. Initial design created (Option 1)
2. Chat: "What if we focused on outcomes instead?"
   CORTEX: Let me regenerate with that angle...
3. Regenerate → Get new Option 1
4. Compare with previous design
5. Chat: "Actually, let's try emphasizing ease of use"
6. Regenerate again
7. Pick best option
```

## Chat Input Patterns (Supported)

### Audience
```
"Change audience to nurses"
"Update target to hospital administrators"
"Our audience is radiologists"
```

### Device
```
"Focus on mobile"
"Desktop only"
"Make it tablet-friendly"
"Switch to mobile-first"
```

### Challenge/Problem
```
"The main challenge is..."
"Update problem to..."
"HCPs struggle with..."
```

### Objective
```
"New objective: increase referrals"
"Update goal to..."
"We want to drive..."
```

### CTA (Call to Action)
```
"CTA should be 'Download guide'"
"Change button to 'Request demo'"
"New action: 'Schedule consultation'"
```

### Channel
```
"We're doing social media, not email"
"Change channel to webinar"
"Distribution: in-app messaging"
```

### Metrics
```
"Success metrics: 20% engagement"
"We want to measure: click-through rates"
```

## UI Layout

### Left Panel (50%)
- 📋 **Flash Brief** (Compact slide format)
  - Problem
  - Solution
  - Objective & CTA
  - Audience, Device, Channel
  - Timeline & branding
  - Contact info
  
- 🎬 **Storyboard** (3 FABP options)
  - Option title
  - Strategic approach
  - Magic Patterns editor link
  - Magic Patterns preview link

### Right Panel (50%)
- 💬 **Chat Interface**
  - Initial greeting from Cortex
  - User messages (right-aligned, purple)
  - AI responses (left-aligned, blue)
  - Input field
  - ✨ Regenerate button

## API Endpoints (For Integration)

### GET /api/campaign
Load campaign data

```bash
curl "http://localhost:4444/api/campaign?company=ROCHE&country=Ivory_Coast&product=Vabysmo&number=1"
```

Response:
```json
{
  "success": true,
  "data": {
    "productName": "Vabysmo",
    "challenge": "...",
    "objective": "...",
    "email": "contact@example.com"
  },
  "brief": "[compact flash brief text]"
}
```

### POST /api/chat
Process chat message and update brief

```bash
curl -X POST http://localhost:4444/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "company": "ROCHE",
    "country": "Ivory_Coast",
    "product": "Vabysmo",
    "number": 1,
    "message": "Change audience to nurses",
    "campaignData": {...}
  }'
```

Response:
```json
{
  "success": true,
  "response": "✅ Updated! Changed target audience from 'Primary Care Physicians' to 'Nurses'",
  "updatedData": {...},
  "changes": [
    {
      "field": "targetAudience",
      "oldValue": "Primary Care Physicians",
      "newValue": "Nurses"
    }
  ]
}
```

### POST /api/regenerate
Regenerate FABP options and Magic Patterns designs

```bash
curl -X POST http://localhost:4444/api/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "company": "ROCHE",
    "country": "Ivory_Coast",
    "product": "Vabysmo",
    "number": 1,
    "campaignData": {...}
  }'
```

Response:
```json
{
  "success": true,
  "options": [
    {
      "number": 1,
      "title": "Option 1: [Title]",
      "content": "[Strategic approach]"
    },
    ...
  ],
  "message": "✨ Regenerated 3 FABP options"
}
```

## Data Persistence

All changes are saved to the campaign directory:

```
/campaigns/COMPANY/COUNTRY/PRODUCT/NUMBER/
├── campaign.json              ← Updated with new intake data
├── design-links.json          ← Magic Patterns URLs
├── fabp-options.json          ← Regenerated FABP options (NEW)
├── docs/
└── mockups/
```

**Example: campaign.json after update**
```json
{
  "metadata": {...},
  "intake": {
    "productName": "Vabysmo",
    "challenge": "[UPDATED]",
    "targetAudience": "[UPDATED]",
    "cta": "[UPDATED]"
  },
  "magicPatterns": {
    "editorUrl": "https://editor.magicpatterns.com/patterns/...",
    "previewUrl": "https://www.magicpatterns.com/patterns/..."
  },
  "updatedAt": "2026-02-11T07:15:00Z"
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send chat message |
| `Shift+Enter` | New line in input |
| `Cmd/Ctrl+K` | Focus chat input |
| `Click 🔗 Edit` | Open Magic Patterns editor |
| `Click 👁️ Preview` | Open live preview |

## Troubleshooting

### Brief not updating
- Check console for errors (F12)
- Ensure campaign.json exists in campaign directory
- Verify file permissions (should be readable/writable)

### Chat messages not processing
- Check that Snakker agent is available (`openclaw agents status`)
- Verify campaign data is loaded
- Check dashboard-api.log for errors

### Regenerate taking too long
- First regeneration may take 30-60s (Snakker agent startup)
- Subsequent regenerations are faster (15-30s)
- Check webhook-log.txt for Magic Patterns API status

### Links not working
- Verify mockupId is correctly formatted: `product-company-number`
- Check design-links.json for valid URLs
- Ensure Magic Patterns API is accessible

## Performance Tips

1. **Keep chats concise** - One change per message is clearest
2. **Review brief before regenerating** - Avoid unnecessary API calls
3. **Cache campaign data** - API caches loaded campaigns in memory
4. **Batch regenerations** - Do all edits, then one final regenerate

## Next Steps

1. **Start dashboard:** `node dashboard-api.js`
2. **Open browser:** `http://localhost:4444`
3. **Load a campaign:** Use the campaign selector dropdown
4. **Chat naturally:** "Change X to Y"
5. **Regenerate:** Click button to update designs
6. **Share:** Copy brief and send links to stakeholders

## Questions?

For issues or feature requests:
- Check `/agents/snakker/dashboard-api.log`
- Review chat messages in browser console
- Check campaign.json for data integrity
