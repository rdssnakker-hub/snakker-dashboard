const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const WORKSPACE_PATH = '/root/.openclaw/workspace';
const CAMPAIGNS_PATH = path.join(WORKSPACE_PATH, 'campaigns');

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
  return null;
}

// Helper: Get storyboard
function getStoryboard(campaignPath) {
  const storyboardPath = path.join(campaignPath, 'docs', 'storyboard.md');
  if (fs.existsSync(storyboardPath)) {
    return fs.readFileSync(storyboardPath, 'utf8');
  }
  return null;
}

// Helper: Get workflow stages
function getWorkflowStages(campaignPath, campaignData) {
  const stagesPath = path.join(campaignPath, 'workflow.json');
  if (fs.existsSync(stagesPath)) {
    return JSON.parse(fs.readFileSync(stagesPath, 'utf8'));
  }
  
  // Default stages
  return [
    { id: 1, name: 'Intake Form', status: 'completed', owner: 'Arnaud', started: '2026-02-09', completed: '2026-02-09' },
    { id: 2, name: 'Flash Brief', status: 'in-progress', owner: 'Klaus', started: '2026-02-09', completed: null },
    { id: 3, name: 'Storyboard Draft', status: 'pending', owner: 'Klaus', started: null, completed: null },
    { id: 4, name: 'Magic Patterns Gen', status: 'pending', owner: 'Klaus', started: null, completed: null },
    { id: 5, name: 'Snakker Brief', status: 'pending', owner: 'Klaus', started: null, completed: null },
    { id: 6, name: 'Snak Deployment', status: 'pending', owner: 'Developer', started: null, completed: null }
  ];
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

// Catch-all for React SPA (must be last)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📊 Campaign Dashboard Server running on http://localhost:${PORT}`);
});
