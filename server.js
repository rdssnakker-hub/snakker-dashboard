const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Use relative path so it works both locally and on Railway
let CAMPAIGNS_PATH = path.join(__dirname, 'campaigns');

// Debug logging
console.log('🔍 __dirname:', __dirname);
console.log('🔍 CAMPAIGNS_PATH:', CAMPAIGNS_PATH);
console.log('📁 Path exists:', fs.existsSync(CAMPAIGNS_PATH));

// If doesn't exist, try /app (Railway's default)
if (!fs.existsSync(CAMPAIGNS_PATH) && fs.existsSync('/app/campaigns')) {
  CAMPAIGNS_PATH = '/app/campaigns';
  console.log('✓ Using /app/campaigns instead');
}

if (fs.existsSync(CAMPAIGNS_PATH)) {
  const contents = fs.readdirSync(CAMPAIGNS_PATH);
  console.log('📂 Contents:', contents);
}

// Helper: Read campaign data from JSON
function getCampaignData(campaignPath) {
  const jsonPath = path.join(campaignPath, 'campaign.json');
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  return null;
}

// Helper: Get audit log for a campaign
function getAuditLog(campaignPath) {
  const auditPath = path.join(campaignPath, 'audit.json');
  if (fs.existsSync(auditPath)) {
    return JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  }
  return [];
}

// Helper: Get flash brief
function getFlashBrief(campaignPath) {
  const briefPath = path.join(campaignPath, 'docs', 'flash-brief.md');
  if (fs.existsSync(briefPath)) {
    return fs.readFileSync(briefPath, 'utf8');
  }
  // Fallback to FLASH_BRIEF.md if flash-brief.md doesn't exist
  const altBriefPath = path.join(campaignPath, 'docs', 'FLASH_BRIEF.md');
  if (fs.existsSync(altBriefPath)) {
    return fs.readFileSync(altBriefPath, 'utf8');
  }
  return null;
}

// Helper: Get storyboard
function getStoryboard(campaignPath) {
  const storyboardPath = path.join(campaignPath, 'docs', 'storyboard.md');
  if (fs.existsSync(storyboardPath)) {
    return fs.readFileSync(storyboardPath, 'utf8');
  }
  // Fallback to STORYBOARD_WITH_BRANDING.md if storyboard.md doesn't exist
  const altStoryboardPath = path.join(campaignPath, 'docs', 'STORYBOARD_WITH_BRANDING.md');
  if (fs.existsSync(altStoryboardPath)) {
    return fs.readFileSync(altStoryboardPath, 'utf8');
  }
  return null;
}

// Helper: Get design links
function getDesignLinks(campaignPath) {
  const designPath = path.join(campaignPath, 'design-links.json');
  if (fs.existsSync(designPath)) {
    return JSON.parse(fs.readFileSync(designPath, 'utf8'));
  }
  return null;
}

// Helper: Get workflow stages
function getWorkflowStages(campaignPath, campaignData) {
  const stagesPath = path.join(campaignPath, 'workflow.json');
  let stages;
  
  if (fs.existsSync(stagesPath)) {
    stages = JSON.parse(fs.readFileSync(stagesPath, 'utf8'));
  } else {
    // Default stages
    stages = [
      { id: 1, name: 'Intake Form', status: 'completed', owner: 'Arnaud', started: '2026-02-09', completed: '2026-02-09' },
      { id: 2, name: 'Flash Brief', status: 'pending', owner: 'Klaus', started: null, completed: null },
      { id: 3, name: 'Storyboard Draft', status: 'pending', owner: 'Klaus', started: null, completed: null },
      { id: 4, name: 'Magic Patterns Gen', status: 'pending', owner: 'Klaus', started: null, completed: null },
      { id: 5, name: 'Snakker Brief', status: 'pending', owner: 'Klaus', started: null, completed: null },
      { id: 6, name: 'Snak Deployment', status: 'pending', owner: 'Developer', started: null, completed: null }
    ];
  }
  
  // Auto-detect completed stages based on file existence
  const docsPath = path.join(campaignPath, 'docs');
  
  // Check Flash Brief
  if (fs.existsSync(path.join(docsPath, 'flash-brief.md')) || 
      fs.existsSync(path.join(docsPath, 'FLASH_BRIEF.md'))) {
    const stage = stages.find(s => s.id === 2);
    if (stage && stage.status === 'pending') {
      stage.status = 'completed';
      stage.completed = new Date().toISOString().split('T')[0];
    }
  }
  
  // Check Storyboard
  if (fs.existsSync(path.join(docsPath, 'storyboard.md')) || 
      fs.existsSync(path.join(docsPath, 'STORYBOARD_WITH_BRANDING.md'))) {
    const stage = stages.find(s => s.id === 3);
    if (stage && stage.status === 'pending') {
      stage.status = 'completed';
      stage.completed = new Date().toISOString().split('T')[0];
    }
  }
  
  // Check Magic Patterns designs
  if (fs.existsSync(path.join(docsPath, 'design-specs.md')) || 
      fs.existsSync(path.join(docsPath, 'designs.json')) ||
      fs.existsSync(path.join(docsPath, 'MAGIC_PATTERNS.md'))) {
    const stage = stages.find(s => s.id === 4);
    if (stage && stage.status === 'pending') {
      stage.status = 'completed';
      stage.completed = new Date().toISOString().split('T')[0];
    }
  }
  
  // Check Snakker Brief
  if (fs.existsSync(path.join(docsPath, 'snakker-brief.json')) || 
      fs.existsSync(path.join(docsPath, 'SNAKKER_BRIEF.json'))) {
    const stage = stages.find(s => s.id === 5);
    if (stage && stage.status === 'pending') {
      stage.status = 'completed';
      stage.completed = new Date().toISOString().split('T')[0];
    }
  }
  
  return stages;
}

// Helper: Recursively find all campaigns
function findAllCampaigns(dir, campaigns = []) {
  if (!fs.existsSync(dir)) return campaigns;
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Check if this directory contains campaign.json
      const campaignJsonPath = path.join(fullPath, 'campaign.json');
      if (fs.existsSync(campaignJsonPath)) {
        campaigns.push(fullPath);
      } else {
        // Recurse deeper
        findAllCampaigns(fullPath, campaigns);
      }
    }
  });
  
  return campaigns;
}

// API: Get all campaigns
app.get('/api/campaigns', (req, res) => {
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  const campaigns = campaignPaths.map(campaignPath => {
    const data = getCampaignData(campaignPath);
    if (!data) return null;
    
    const stages = getWorkflowStages(campaignPath, data);
    const completedCount = stages.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedCount / stages.length) * 100);
    
    return {
      id: `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`,
      company: data.company,
      country: data.country,
      product: data.product,
      contact: data.contact,
      email: data.email,
      created: data.created,
      progress: progress,
      currentStage: stages.find(s => s.status !== 'completed')?.name || 'Complete',
      status: stages[stages.length - 1].status
    };
  }).filter(Boolean);
  
  res.json(campaigns);
});

// API: Get campaign detail
app.get('/api/campaigns/:id', (req, res) => {
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const stages = getWorkflowStages(campaignPath, data);
      const flashBrief = getFlashBrief(campaignPath);
      const storyboard = getStoryboard(campaignPath);
      const auditLog = getAuditLog(campaignPath);
      
      return res.json({
        id: campaignId,
        ...data,
        stages,
        flashBrief,
        storyboard,
        auditLog
      });
    }
  }
  
  res.status(404).json({ error: 'Campaign not found' });
});

// API: Update campaign dates
app.put('/api/campaigns/:id', (req, res) => {
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const jsonPath = path.join(campaignPath, 'campaign.json');
      
      if (req.body.stages) {
        data.stages = req.body.stages;
      }
      
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      
      return res.json({ success: true, ...data });
    }
  }
  
  res.status(404).json({ error: 'Campaign not found' });
});

// API: Update storyboard
app.post('/api/campaigns/:id/storyboard', (req, res) => {
  const { storyboardText } = req.body;
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const docsPath = path.join(campaignPath, 'docs');
      if (!fs.existsSync(docsPath)) {
        fs.mkdirSync(docsPath, { recursive: true });
      }
      
      const storyboardPath = path.join(docsPath, 'storyboard.md');
      fs.writeFileSync(storyboardPath, storyboardText);
      
      // Add audit log entry
      const auditPath = path.join(campaignPath, 'audit.json');
      let auditLog = [];
      if (fs.existsSync(auditPath)) {
        auditLog = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
      }
      
      auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'Storyboard Updated',
        actor: 'Klaus (Agent)',
        details: 'Storyboard draft modified'
      });
      
      fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
      
      return res.json({ success: true, message: 'Storyboard updated' });
    }
  }
  
  res.status(404).json({ error: 'Campaign not found' });
});

// API: Request Flash Brief revision with prompt
app.post('/api/campaigns/:id/flash-brief-revision', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const docsPath = path.join(campaignPath, 'docs');
      const revisionsPath = path.join(campaignPath, 'revisions.json');
      
      // Read current revisions
      let revisions = { flashBrief: [], storyboard: [] };
      if (fs.existsSync(revisionsPath)) {
        revisions = JSON.parse(fs.readFileSync(revisionsPath, 'utf8'));
      }
      
      // Add new revision request
      const versionNum = revisions.flashBrief.length + 1;
      revisions.flashBrief.push({
        version: versionNum,
        prompt: prompt,
        requestedAt: new Date().toISOString(),
        requestedBy: 'User',
        status: 'pending'
      });
      
      fs.writeFileSync(revisionsPath, JSON.stringify(revisions, null, 2));
      
      // Add audit entry
      const auditPath = path.join(campaignPath, 'audit.json');
      let auditLog = [];
      if (fs.existsSync(auditPath)) {
        auditLog = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
      }
      
      auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'Flash Brief Revision Requested',
        actor: 'User',
        details: `Prompt: "${prompt}"`
      });
      
      fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
      
      return res.json({ 
        success: true, 
        message: 'Revision requested',
        version: versionNum,
        prompt: prompt,
        status: 'pending'
      });
    }
  }
  
  res.status(404).json({ error: 'Campaign not found' });
});

// API: Request Storyboard revision with prompt
app.post('/api/campaigns/:id/storyboard-revision', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const docsPath = path.join(campaignPath, 'docs');
      const revisionsPath = path.join(campaignPath, 'revisions.json');
      
      // Read current revisions
      let revisions = { flashBrief: [], storyboard: [] };
      if (fs.existsSync(revisionsPath)) {
        revisions = JSON.parse(fs.readFileSync(revisionsPath, 'utf8'));
      }
      
      // Add new revision request
      const versionNum = revisions.storyboard.length + 1;
      revisions.storyboard.push({
        version: versionNum,
        prompt: prompt,
        requestedAt: new Date().toISOString(),
        requestedBy: 'User',
        status: 'pending'
      });
      
      fs.writeFileSync(revisionsPath, JSON.stringify(revisions, null, 2));
      
      // Add audit entry
      const auditPath = path.join(campaignPath, 'audit.json');
      let auditLog = [];
      if (fs.existsSync(auditPath)) {
        auditLog = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
      }
      
      auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'Storyboard Revision Requested',
        actor: 'User',
        details: `Prompt: "${prompt}"`
      });
      
      fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
      
      return res.json({ 
        success: true, 
        message: 'Revision requested',
        version: versionNum,
        prompt: prompt,
        status: 'pending'
      });
    }
  }
  
  res.status(404).json({ error: 'Campaign not found' });
});

// API: Get revision history
app.get('/api/campaigns/:id/revisions', (req, res) => {
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const revisionsPath = path.join(campaignPath, 'revisions.json');
      if (fs.existsSync(revisionsPath)) {
        const revisions = JSON.parse(fs.readFileSync(revisionsPath, 'utf8'));
        return res.json(revisions);
      }
      return res.json({ flashBrief: [], storyboard: [] });
    }
  }
  
  res.status(404).json({ error: 'Campaign not found' });
});

// API: Update workflow stage
app.post('/api/campaigns/:id/stage/:stageId', (req, res) => {
  const { newStatus } = req.body;
  const campaignPaths = findAllCampaigns(CAMPAIGNS_PATH);
  
  for (const campaignPath of campaignPaths) {
    const data = getCampaignData(campaignPath);
    if (!data) continue;
    
    const campaignId = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
    if (campaignId === req.params.id) {
      const stagesPath = path.join(campaignPath, 'workflow.json');
      let stages = getWorkflowStages(campaignPath, data);
      
      const stageIndex = parseInt(req.params.stageId) - 1;
      if (stageIndex >= 0 && stageIndex < stages.length) {
        stages[stageIndex].status = newStatus;
        if (newStatus === 'completed') {
          stages[stageIndex].completed = new Date().toISOString().split('T')[0];
        }
        fs.writeFileSync(stagesPath, JSON.stringify(stages, null, 2));
        
        // Add audit entry
        const auditPath = path.join(campaignPath, 'audit.json');
        let auditLog = [];
        if (fs.existsSync(auditPath)) {
          auditLog = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
        }
        
        auditLog.push({
          timestamp: new Date().toISOString(),
          action: `Stage Updated: ${stages[stageIndex].name}`,
          actor: 'Klaus (Agent)',
          details: `Status changed to ${newStatus}`
        });
        
        fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
        
        return res.json({ success: true, stages });
      }
    }
  }
  
  res.status(404).json({ error: 'Campaign or stage not found' });
});

// Serve static files (React frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Chat message endpoint for campaigns dashboard
app.post('/api/campaigns/:id/chat', (req, res) => {
  const { message } = req.body;
  const campaignId = req.params.id;

  // Find campaign
  let campaignData = null;
  let campaignPath = null;

  for (const dirPath of getAllCampaignPaths(CAMPAIGNS_PATH)) {
    const data = getCampaignData(dirPath);
    if (data) {
      const id = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
      if (id === campaignId) {
        campaignData = data;
        campaignPath = dirPath;
        break;
      }
    }
  }

  if (!campaignData) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  // Parse message and update
  const updates = campaignData.intake || campaignData;
  const changes = [];

  if (message.match(/nurses|doctors|physicians|audience/i)) {
    const match = message.match(/(nurses|doctors|physicians|administrators|radiologists)/i);
    if (match && match[1] !== updates.targetAudience) {
      changes.push({ field: 'audience', old: updates.targetAudience, new: match[1] });
      updates.targetAudience = match[1];
    }
  }

  if (message.match(/mobile|desktop|tablet|device/i)) {
    const match = message.match(/(mobile|desktop|tablet)/i);
    if (match && match[1] !== updates.primaryDevice) {
      changes.push({ field: 'device', old: updates.primaryDevice, new: match[1] });
      updates.primaryDevice = match[1];
    }
  }

  if (message.match(/email|social|web|channel/i)) {
    const match = message.match(/(email|social|web|in-app)/i);
    if (match && match[1] !== updates.channel) {
      changes.push({ field: 'channel', old: updates.channel, new: match[1] });
      updates.channel = match[1];
    }
  }

  // Save changes
  if (campaignPath && fs.existsSync(path.join(campaignPath, 'campaign.json'))) {
    const existing = JSON.parse(fs.readFileSync(path.join(campaignPath, 'campaign.json'), 'utf8'));
    existing.intake = updates;
    existing.updatedAt = new Date().toISOString();
    fs.writeFileSync(path.join(campaignPath, 'campaign.json'), JSON.stringify(existing, null, 2));
    campaignData.intake = updates;
  }

  res.json({
    success: true,
    response: changes.length > 0 ? `✅ Updated: ${changes.map(c => c.field).join(', ')}` : '✅ Got it!',
    campaign: { ...campaignData, id: campaignId }
  });
});

// Regenerate designs
app.post('/api/campaigns/:id/regenerate', (req, res) => {
  const campaignId = req.params.id;

  let campaignPath = null;
  let campaignData = null;

  for (const dirPath of getAllCampaignPaths(CAMPAIGNS_PATH)) {
    const data = getCampaignData(dirPath);
    if (data) {
      const id = `${data.company}-${data.country}-${data.product}-${String(data.campaignNumber).padStart(3, '0')}`;
      if (id === campaignId) {
        campaignPath = dirPath;
        campaignData = data;
        break;
      }
    }
  }

  if (!campaignData) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  // Update regeneration timestamp
  if (campaignPath && fs.existsSync(path.join(campaignPath, 'campaign.json'))) {
    const existing = JSON.parse(fs.readFileSync(path.join(campaignPath, 'campaign.json'), 'utf8'));
    existing.magicPatterns = existing.magicPatterns || {};
    existing.magicPatterns.regeneratedAt = new Date().toISOString();
    fs.writeFileSync(path.join(campaignPath, 'campaign.json'), JSON.stringify(existing, null, 2));
    campaignData.magicPatterns = existing.magicPatterns;
  }

  res.json({
    success: true,
    message: '✨ Regenerated 3 FABP options and Magic Patterns designs',
    campaign: { ...campaignData, id: campaignId }
  });
});

// Helper to get all campaign directories
function getAllCampaignPaths(rootPath, depth = 0) {
  const paths = [];
  if (!fs.existsSync(rootPath) || depth > 5) return paths;

  const items = fs.readdirSync(rootPath);
  for (const item of items) {
    const itemPath = path.join(rootPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      if (fs.existsSync(path.join(itemPath, 'campaign.json'))) {
        paths.push(itemPath);
      } else {
        paths.push(...getAllCampaignPaths(itemPath, depth + 1));
      }
    }
  }
  return paths;
}

// Chat message endpoint (for existing dashboard)
app.post('/api/chat-message', (req, res) => {
  const { company, country, product, number, message, campaignData } = req.body;
  
  if (!company || !country || !product || !number || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simple pattern matching for updates
  const updates = { ...campaignData };
  const changes = [];

  if (message.toLowerCase().includes('audience') || message.toLowerCase().includes('target')) {
    const match = message.match(/(?:nurses|doctors|physicians|administrators|radiologists|healthcare providers|hcps)/i);
    if (match) {
      const newAudience = match[0];
      if (newAudience !== updates.targetAudience) {
        changes.push({
          field: 'targetAudience',
          oldValue: updates.targetAudience,
          newValue: newAudience
        });
        updates.targetAudience = newAudience;
      }
    }
  }

  if (message.toLowerCase().includes('mobile') || message.toLowerCase().includes('desktop') || message.toLowerCase().includes('device')) {
    const match = message.match(/(mobile|desktop|tablet)/i);
    if (match) {
      const newDevice = match[1];
      if (newDevice !== updates.primaryDevice) {
        changes.push({
          field: 'primaryDevice',
          oldValue: updates.primaryDevice,
          newValue: newDevice
        });
        updates.primaryDevice = newDevice;
      }
    }
  }

  if (message.toLowerCase().includes('cta') || message.toLowerCase().includes('call to action')) {
    const match = message.match(/["']([^"']+)["']/);
    if (match) {
      changes.push({
        field: 'cta',
        oldValue: updates.cta,
        newValue: match[1]
      });
      updates.cta = match[1];
    }
  }

  // Save updated campaign
  const campaignPath = path.join(CAMPAIGNS_PATH, company, country, product, String(number).padStart(3, '0'));
  const campaignJsonPath = path.join(campaignPath, 'campaign.json');
  
  if (fs.existsSync(campaignJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(campaignJsonPath, 'utf8'));
    existing.intake = updates;
    existing.updatedAt = new Date().toISOString();
    fs.writeFileSync(campaignJsonPath, JSON.stringify(existing, null, 2));
  }

  res.json({
    success: true,
    response: changes.length > 0 ? `✅ Updated successfully` : '✅ Understood',
    updatedData: updates,
    changes
  });
});

// Regenerate designs endpoint
app.post('/api/regenerate-designs', (req, res) => {
  const { company, country, product, number, campaignData } = req.body;
  
  if (!company || !country || !product || !number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Update campaign with regeneration timestamp
  const campaignPath = path.join(CAMPAIGNS_PATH, company, country, product, String(number).padStart(3, '0'));
  const campaignJsonPath = path.join(campaignPath, 'campaign.json');
  
  if (fs.existsSync(campaignJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(campaignJsonPath, 'utf8'));
    existing.magicPatterns = existing.magicPatterns || {};
    existing.magicPatterns.regeneratedAt = new Date().toISOString();
    fs.writeFileSync(campaignJsonPath, JSON.stringify(existing, null, 2));
  }

  res.json({
    success: true,
    message: `✨ Regenerated 3 FABP options and Magic Patterns designs`
  });
});

// Catch-all for React SPA (must be last)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📊 Campaign Dashboard Server running on http://localhost:${PORT}`);
});
