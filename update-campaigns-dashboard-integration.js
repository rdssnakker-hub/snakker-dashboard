#!/usr/bin/env node

/**
 * Update All Campaigns - Dashboard Integration
 * 
 * Upgrades existing campaigns to work with:
 * - Interactive dashboard
 * - AI chat interface
 * - Magic Patterns link regeneration
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGNS_ROOT = path.join(__dirname, '..', '..', 'campaigns');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Find all campaigns
 */
function findAllCampaigns() {
  const campaigns = [];

  function walkDir(dir, depth = 0) {
    if (!fs.existsSync(dir)) return;
    if (depth > 5) return; // Prevent infinite recursion

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Check if this is a campaign directory (has campaign.json)
        const campaignJsonPath = path.join(itemPath, 'campaign.json');
        if (fs.existsSync(campaignJsonPath)) {
          const parts = itemPath.replace(CAMPAIGNS_ROOT, '').split(path.sep).filter(p => p);
          campaigns.push({
            path: itemPath,
            company: parts[0],
            country: parts[1],
            product: parts[2],
            number: parts[3]
          });
        } else {
          walkDir(itemPath, depth + 1);
        }
      }
    }
  }

  walkDir(CAMPAIGNS_ROOT);
  return campaigns;
}

/**
 * Upgrade campaign for dashboard integration
 */
function upgradeCampaign(campaign) {
  const campaignJsonPath = path.join(campaign.path, 'campaign.json');

  try {
    log(`Upgrading: ${campaign.company}/${campaign.country}/${campaign.product}/${campaign.number}`);

    // Read existing campaign data
    const campaignData = JSON.parse(fs.readFileSync(campaignJsonPath, 'utf-8'));

    // Ensure intake data is present
    if (!campaignData.intake) {
      campaignData.intake = {};
    }

    // Ensure magic patterns links are set
    if (!campaignData.magicPatterns) {
      const mockupId = `${campaignData.intake.productName || campaign.product}-${campaign.company}-${campaign.number}`.toLowerCase().replace(/\s+/g, '-');
      campaignData.magicPatterns = {
        mockupId,
        editorUrl: `https://editor.magicpatterns.com/patterns/${mockupId}`,
        previewUrl: `https://www.magicpatterns.com/patterns/${mockupId}`,
        createdAt: campaignData.metadata?.created || new Date().toISOString()
      };
    }

    // Ensure dashboard metadata
    if (!campaignData.dashboard) {
      campaignData.dashboard = {
        enabled: true,
        createdAt: new Date().toISOString(),
        url: `http://localhost:4444/?company=${campaign.company}&country=${campaign.country}&product=${campaign.product}&number=${campaign.number}`
      };
    }

    // Save updated campaign
    fs.writeFileSync(campaignJsonPath, JSON.stringify(campaignData, null, 2));

    // Ensure design-links.json exists
    const designLinksPath = path.join(campaign.path, 'design-links.json');
    if (!fs.existsSync(designLinksPath)) {
      const designLinks = {
        magicPatterns: campaignData.magicPatterns
      };
      fs.writeFileSync(designLinksPath, JSON.stringify(designLinks, null, 2));
    }

    // Create dashboard-config.json for quick reference
    const dashboardConfigPath = path.join(campaign.path, 'dashboard-config.json');
    const dashboardConfig = {
      company: campaign.company,
      country: campaign.country,
      product: campaign.product,
      number: campaign.number,
      dashboardUrl: campaignData.dashboard.url,
      apiBase: 'http://localhost:4444',
      features: {
        chat: true,
        flashBrief: true,
        storyboard: true,
        magicPatterns: true,
        regenerate: true
      },
      createdAt: campaignData.dashboard.createdAt
    };
    fs.writeFileSync(dashboardConfigPath, JSON.stringify(dashboardConfig, null, 2));

    log(`   ✅ Upgraded successfully`);
    log(`   📊 Dashboard: ${campaignData.dashboard.url}`);
    log(`   🔗 Editor: ${campaignData.magicPatterns.editorUrl}`);

    return true;
  } catch (err) {
    log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

/**
 * Main upgrade process
 */
async function upgradeAllCampaigns() {
  log('🔄 Scanning for campaigns...\n');

  const campaigns = findAllCampaigns();
  log(`Found ${campaigns.length} campaign(s)\n`);

  if (campaigns.length === 0) {
    log('No campaigns found to upgrade');
    return;
  }

  let successful = 0;
  let failed = 0;

  for (const campaign of campaigns) {
    if (upgradeCampaign(campaign)) {
      successful++;
    } else {
      failed++;
    }
  }

  log(`\n✅ Upgrade complete:`);
  log(`   Successful: ${successful}`);
  log(`   Failed: ${failed}`);
  log(`   Total: ${successful + failed}`);

  if (successful > 0) {
    log(`\n🚀 Start the dashboard with: node dashboard-api.js`);
    log(`📊 Open: http://localhost:4444`);
    log(`\n💬 All campaigns now support:
  • Interactive chat interface
  • Flash brief editing
  • Storyboard customization
  • One-click Magic Patterns regeneration`);
  }
}

// Run if called directly
if (require.main === module) {
  upgradeAllCampaigns().catch(err => {
    log(`❌ Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { findAllCampaigns, upgradeCampaign };
