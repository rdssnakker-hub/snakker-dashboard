#!/usr/bin/env node

/**
 * Compact Flash Brief Generator
 * 
 * Creates single-page, slide-presentation style brief
 * Replaces verbose narrative with structured, scannable format
 */

/**
 * Generate compact, single-page flash brief
 */
function generateCompactFlashBrief(formData) {
  const brief = `
╔════════════════════════════════════════════════════════════════════════╗
║                    FLASH BRIEF: ${formData.productName}               ║
║                        ${new Date().toLocaleDateString()}                    ║
╚════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 THE PROBLEM
${formData.challenge || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 THE SOLUTION
${formData.productName} | Brand: ${formData.brandName}
Unique: ${formData.uniqueness || 'TBD'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OBJECTIVE
${formData.objective || 'N/A'}

CTA: "${formData.cta || 'N/A'}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 AUDIENCE: ${formData.targetAudience || 'N/A'}
📱 DEVICE: ${formData.primaryDevice || 'N/A'}
📡 CHANNEL: ${formData.channel || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 GO-LIVE: ${formData.goLiveDate || 'TBD'}
🏷️ STYLE: ${formData.branded ? 'Branded' : 'Unbranded Educational'}
📊 SUCCESS: ${formData.successMetrics || 'TBD'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 STAKEHOLDER
${formData.firstName} ${formData.lastName}
${formData.company}
📧 ${formData.email}

╚════════════════════════════════════════════════════════════════════════╝

[Chat to revise • Regenerate to update Magic Patterns]
`;

  return brief;
}

/**
 * Format brief for chat display
 */
function formatBriefForChat(formData) {
  return {
    problem: formData.challenge,
    solution: {
      name: formData.productName,
      brand: formData.brandName,
      unique: formData.uniqueness
    },
    objective: formData.objective,
    cta: formData.cta,
    audience: formData.targetAudience,
    device: formData.primaryDevice,
    channel: formData.channel,
    goLive: formData.goLiveDate,
    branded: formData.branded,
    metrics: formData.successMetrics
  };
}

/**
 * Parse chat input and extract field updates
 * E.g., "Change problem to HCPs don't know about X"
 * E.g., "Update objective to increase awareness"
 */
function parseChartInputForUpdates(chatMessage, currentFormData) {
  const updates = { ...currentFormData };
  const message = chatMessage.toLowerCase();

  // Simple pattern matching for updates
  if (message.includes('change problem') || message.includes('update challenge') || message.includes('problem is')) {
    const pattern = /(?:change problem|update challenge|problem is)\s+(?:to\s+)?(.+?)(?:\.|$)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.challenge = match[1].trim();
    }
  }

  if (message.includes('change cta') || message.includes('update cta') || message.includes('cta:') || message.includes('call to action')) {
    const pattern = /(?:change cta|update cta|cta:?)\s+(?:to\s+)?["']?(.+?)["']?(?:\.|$)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.cta = match[1].trim();
    }
  }

  if (message.includes('update objective') || message.includes('objective')) {
    const pattern = /(?:update objective|objective)\s+(?:to\s+)?(.+?)(?:\.|$)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.objective = match[1].trim();
    }
  }

  if (message.includes('audience') || message.includes('target')) {
    const pattern = /(?:audience|target)\s+(?:to|as|is)?\s+(.+?)(?:\.|$)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.targetAudience = match[1].trim();
    }
  }

  if (message.includes('channel') || message.includes('delivery')) {
    const pattern = /(?:channel|delivery)\s+(?:to|as|is)?\s+(.+?)(?:\.|$)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.channel = match[1].trim();
    }
  }

  if (message.includes('device') || message.includes('mobile') || message.includes('desktop')) {
    const pattern = /(mobile|desktop|tablet|phone)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.primaryDevice = match[1].trim();
    }
  }

  if (message.includes('metrics') || message.includes('success')) {
    const pattern = /(?:metrics|success)\s+(?:to|as|is)?\s+(.+?)(?:\.|$)/i;
    const match = chatMessage.match(pattern);
    if (match) {
      updates.successMetrics = match[1].trim();
    }
  }

  return updates;
}

module.exports = {
  generateCompactFlashBrief,
  formatBriefForChat,
  parseChartInputForUpdates
};

if (require.main === module) {
  const sampleData = {
    productName: 'GLP-1 Therapy Guide',
    brandName: 'Novo Insights',
    challenge: 'HCPs dont recognize candidates until after complications',
    uniqueness: 'First real-world evidence platform for GLP-1 outcomes',
    objective: 'Drive HCP understanding of patient selection criteria',
    cta: 'Use our patient screening checklist',
    targetAudience: 'Primary Care Physicians',
    primaryDevice: 'Desktop',
    channel: 'Email campaign',
    goLiveDate: '2026-03-01',
    branded: true,
    successMetrics: '15% screening rate adoption, 10% referral increase',
    firstName: 'Sarah',
    lastName: 'Chen',
    company: 'PharmaCorp Inc',
    email: 'sarah@pharmacompany.com'
  };

  console.log(generateCompactFlashBrief(sampleData));
}
