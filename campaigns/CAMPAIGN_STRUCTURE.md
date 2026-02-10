# Campaign Structure Guide

## Directory Organization

All campaign files are organized by:
```
campaigns/
├── COMPANY_NAME/
│   ├── COUNTRY/
│   │   ├── 001/  (Campaign #1)
│   │   ├── 002/  (Campaign #2)
│   │   └── 003/  (Campaign #3)
```

### Example: ROCHE Vabysmo Campaign
```
campaigns/
└── ROCHE/
    └── United_States/
        └── 001/
            ├── docs/                    (Documentation files)
            │   ├── STORYBOARD_WITH_BRANDING.md
            │   ├── VABYSMO_SELECTED_STRATEGY.md
            │   └── ...
            ├── assets/                  (Brand assets, images, files)
            │   ├── branding-guidelines.pdf
            │   ├── product-doc.pdf
            │   └── logos/
            ├── mockups/                 (Design mockups)
            │   ├── preview-images/
            │   └── editor-exports/
            ├── responses/               (API responses)
            │   ├── magic-patterns-response.json
            │   ├── hubspot-submission.json
            │   └── ...
            └── campaign.json            (Campaign metadata)
```

---

## Campaign ID Format

Each campaign has a canonical ID:
```
{COMPANY}-{COUNTRY}-{CAMPAIGN_NUM}
```

**Example:** `ROCHE-United_States-001`

- **COMPANY:** Uppercase, spaces replaced with underscores
- **COUNTRY:** Spaces replaced with underscores  
- **CAMPAIGN_NUM:** Zero-padded 3-digit number (001, 002, 003, etc.)

---

## Campaign Metadata

Each campaign root contains `campaign.json`:

```json
{
  "created": "2026-02-09T21:37:06.891Z",
  "company": "ROCHE",
  "country": "United States",
  "campaignNumber": 1,
  "designId": "<magic-patterns-id>",
  "editorUrl": "https://www.magicpatterns.com/c/<id>",
  "previewUrl": "https://<id>-preview.magicpatterns.app",
  "generatedAt": "2026-02-09T21:37:45.123Z"
}
```

---

## File Organization by Type

### `/docs/` — Documentation
- Storyboards
- Strategic briefs
- Campaign briefs
- Analysis documents
- All .md files

### `/assets/` — Source Materials
- Uploaded brand guidelines (PDF)
- Uploaded product documentation (PDF)
- Logo files
- Brand-approved imagery
- Color palettes
- Typography references

### `/mockups/` — Design Output
- High-fidelity mockup images (PNG/JPG)
- Responsive preview screenshots
- Interactive prototype captures
- HTML/CSS exports

### `/responses/` — API Responses
- Magic Patterns API response (JSON)
- HubSpot form submission data (JSON)
- Other integration responses
- Processing logs

---

## Campaign Workflow

```
1. Form Submission
   └─ Extract: Company, Country
   
2. Initialize Campaign
   └─ Create: campaigns/COMPANY/COUNTRY/NNN/
   
3. Process Form + Files
   └─ Save: /docs/, /assets/
   
4. Generate Strategy
   └─ Save: /docs/STORYBOARD_*
   
5. Call Magic Patterns
   └─ Save: /responses/magic-patterns-response.json
   
6. Capture Mockup URLs
   └─ Update: campaign.json with editorUrl, previewUrl
   
7. Archive Complete
   └─ All deliverables in /campaigns/COMPANY/COUNTRY/NNN/
```

---

## Auto-Increment Behavior

Campaign numbers auto-increment per Company/Country combination:

```
ROCHE, United States:
  Campaign 1: campaigns/ROCHE/United_States/001/
  Campaign 2: campaigns/ROCHE/United_States/002/
  Campaign 3: campaigns/ROCHE/United_States/003/

ROCHE, Canada:
  Campaign 1: campaigns/ROCHE/Canada/001/
  Campaign 2: campaigns/ROCHE/Canada/002/

Novartis, United States:
  Campaign 1: campaigns/NOVARTIS/United_States/001/
```

Each Company/Country pair has independent numbering.

---

## Usage Examples

### Initialize Campaign (Python-style pseudo-code)

```javascript
const campaign = initializeCampaign('ROCHE', 'United States');
// Returns:
// {
//   campaignId: "ROCHE-United_States-001",
//   rootPath: "/root/.openclaw/workspace/campaigns/ROCHE/United_States/001",
//   paths: {
//     docs: ".../.../docs",
//     assets: ".../.../assets",
//     mockups: ".../.../mockups",
//     responses: ".../.../responses"
//   }
// }
```

### Save Campaign File

```javascript
saveCampaignFile(campaign, 'STORYBOARD.md', content, 'docs');
// Saves to: campaigns/ROCHE/United_States/001/docs/STORYBOARD.md
```

### List All Campaigns

```javascript
const campaigns = listCampaigns();
// Returns array of all campaign directories and metadata
```

---

## Retrieval & Access

To access an existing campaign:

```javascript
const campaign = getCampaignInfo('ROCHE', 'United States', 1);
// Or by ID:
const campaign = getCampaignInfo('ROCHE', 'United States', 1);
```

---

## Benefits

✅ **Organized:** Clean separation by company, country, campaign number  
✅ **Scalable:** Supports unlimited campaigns per company/country  
✅ **Trackable:** Campaign metadata for auditing  
✅ **Retrievable:** Easy to find historical campaigns  
✅ **Archivable:** Complete campaign history preserved  
✅ **Automated:** Auto-increment prevents collisions  

---

## Integration with Automation

When form submissions arrive:
1. Extract `company`, `country` from form
2. Call `initializeCampaign(company, country)`
3. Campaign directory auto-created with all subdirectories
4. All outputs (storyboard, mockups, responses) saved to campaign folder
5. Campaign metadata updated with all deliverable URLs

Result: Every campaign fully organized and retrievable.
