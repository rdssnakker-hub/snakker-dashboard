# ROCHE Vabysmo Campaign - Complete Specification
## Including: Snak™ Experience + Traffic-Driving Assets

**Campaign:** ROCHE-Ivory_Coast-Vabysmo-001  
**Customer:** Arnaud ADJA-GNAMIEN (ROCHE, Ivory Coast)  
**Product:** Vabysmo (bispecific antibody)  
**Timeline:** Q1 2026  
**Status:** Ready for design generation  

---

## Campaign Structure

This campaign generates **TWO layers**:

### Layer 1: Traffic-Driving Assets (HOOKS)
These pull HCPs into the Snak™ experience
- Banner (website header/sidebar)
- Email banner
- LinkedIn post image
- WhatsApp CTA image

### Layer 2: Interactive Snak™ Experience (FLOW)
The 4-section experience that educates and captures leads
- The Clinical Hook
- The Mechanism Reveal
- The Clinical Evidence
- The Training CTA

---

## Part A: TRAFFIC-DRIVING ASSETS (Static Images/HTML)

These assets drive traffic TO the Snak™ experience. Each should include a clear CTA like "Learn More," "See How It Works," or "Discover the Difference."

### Asset 1: Website Banner (300x600px & 728x90px)

**Purpose:** Sidebar or header ad on healthcare websites/journals

**Content:**
- Headline: "The Patient You See Every Week..."
- Subheading: "Discover why one pathway isn't enough"
- CTA Button: "See the Mechanism" (links to Snak™)
- Color scheme: Blue + teal gradient
- Design: Professional, clinical aesthetic

**Formats needed:**
- 300x600px (sidebar ad)
- 728x90px (leaderboard ad)
- HTML version with click tracking

---

### Asset 2: Email Banner (600x300px HTML)

**Purpose:** Header/CTA section in promotional email

**Content:**
- Headline: "Master the Mechanism That Changes Everything"
- Hero image: Dual-pathway mechanism (simplified)
- CTA Button: "Launch Interactive Training" (links to Snak™)
- Responsive (works in all email clients)

**Specs:**
- 600px wide (standard email width)
- HTML + inline CSS (no external stylesheets)
- Alt text for all images
- Click-tracked CTA link

---

### Asset 3: LinkedIn Post Image (1200x628px)

**Purpose:** Drive engagement on LinkedIn (HCP network)

**Content:**
- Headline: "Why One Pathway Isn't Enough (For Your Patient)"
- Key stat: "2x duration | 2.3x response rate"
- Visual: Mechanism comparison (simplified)
- CTA Text: "Tap to explore the interactive experience"

**Specs:**
- 1200x628px (LinkedIn optimal size)
- Bold typography (readable in feed)
- Brand colors (ROCHE + Vabysmo)
- High contrast for mobile viewing

---

### Asset 4: WhatsApp CTA Image (1080x1350px)

**Purpose:** Drive clicks via messaging/mobile-first

**Content:**
- Headline: "The Patient You See Every Week..."
- Visual: Patient + mechanism split image
- Key message: "Learn what changes everything"
- CTA: "Tap here for interactive guide"

**Specs:**
- 1080x1350px (mobile story format)
- Optimized for small screens
- Clear, bold CTA button
- QR code or short URL linking to Snak™

---

## Part B: INTERACTIVE SNAK™ EXPERIENCE (4 Sections)

Once HCPs click the traffic assets, they land on the interactive Snak™.

### Section 1: The Clinical Hook
**Objective:** Establish problem awareness

- Headline: "The Patient You See Every Week"
- Hero: Ophthalmologist with patient (warm, professional)
- Story: Real scenario about disease plateau
- CTA: "See What Changes Everything" → advances to Section 2
- Length: 30 seconds read + interaction
- Psychology: **Problem First** (never sell solution before patient recognizes problem)

---

### Section 2: The Mechanism Reveal
**Objective:** Educate on mechanism advantage

- Headline: "Why One Pathway Isn't Enough"
- Interactive animation:
  - Left side: Monotherapy (1 pathway blocked → incomplete)
  - Right side: Vabysmo (2 pathways → complete control)
- Key insight text: "Single pathway = temporary | Dual pathway = sustained"
- Visual: Clean, animated comparison
- CTA: "Let's See the Data" → advances to Section 3
- Length: 60+ seconds (engaging animation)
- Psychology: **Mechanism Advantage** (education > selling)

---

### Section 3: The Clinical Evidence
**Objective:** Validate with data

- Headline: "The Data Backs It Up"
- Two key metrics presented as bar charts:
  - Duration: 18.4 months (Vabysmo) vs 9.6 months (comparator) = 2x
  - Response: 58.4% (Vabysmo) vs 25% (comparator) = 2.3x
- Visual: Professional, publication-style charts
- Context: Trial name, timeframe, patient population
- CTA: "Ready to Master This?" → advances to Section 4
- Length: 30 seconds (data scanning)
- Psychology: **Evidence Based** (authority + specificity)

---

### Section 4: The Training CTA
**Objective:** Capture lead + collect training request

- Headline: "Ready to Master This Mechanism?"
- Value props (3-column grid):
  1. 🧬 **Mechanism Mastery** - Understand dual-pathway advantage
  2. 👥 **Patient Selection** - Identify ideal treatment candidates
  3. 📚 **Early Adopter Stories** - Real clinic implementation examples
- Lead capture form:
  - Name (required)
  - Email (required)
  - Phone (required)
  - Timezone (dropdown)
  - Preferred training time (time picker)
- CTA Button: "[SCHEDULE TRAINING]" (blue, prominent, high-contrast)
- Confirmation page: "Training session scheduled! Check your email."
- Length: 45 seconds (form fill)
- Psychology: **Action Trigger** (time-sensitive, exclusive, value-driven)

---

## Design Specifications (Both Layers)

### Color Palette
- Primary: Professional blue (#0052CC or ROCHE brand blue)
- Secondary: Teal accent (#1B9E8F or equivalent)
- Neutral: Dark gray (#333333), light gray (#F5F5F5)
- Text: Dark gray on white, white on blue backgrounds

### Typography
- Headline font: Clean, modern sans-serif (Inter, Helvetica Neue, or system default)
- Body font: Same for consistency (max 2 font families)
- Sizes: H1 (32px), H2 (24px), Body (16px), Caption (14px)

### Responsive Design
- Mobile-first approach
- Works on iPhone 12 Mini (375px) to desktop (1920px)
- Touch targets: 44px minimum
- Form fields: Full-width on mobile, 2-column on desktop

### Accessibility (WCAG AA)
- Color contrast: 4.5:1 on text
- Alt text on all images
- Form labels associated with inputs
- Keyboard navigation throughout
- Focus states visible
- Error messages clear

### Animation & Motion
- Smooth transitions (300ms cubic-bezier easing)
- No auto-play - user-triggered
- Reduced motion preference respected
- Delightful but not distracting

---

## Delivery Checklist (Magic Patterns Generation)

When generating with Magic Patterns, include ALL of these:

### Part A: Traffic Assets
- [ ] Website banner (300x600px + 728x90px)
- [ ] Email banner HTML (600x300px)
- [ ] LinkedIn post image (1200x628px)
- [ ] WhatsApp CTA image (1080x1350px)
- [ ] QR code linking to Snak™ URL

### Part B: Snak™ Experience
- [ ] 4-section interactive experience
- [ ] All animations working smoothly
- [ ] Form validation + confirmation
- [ ] Mobile (375px) to desktop (1920px) responsive
- [ ] All WCAG AA accessibility requirements met
- [ ] Production-ready HTML/CSS/JS

### Part C: Integration Files
- [ ] Preview URLs saved to campaign.json
- [ ] Source code exported to /campaign/code
- [ ] Deployment instructions documented
- [ ] Customer email template ready

---

## Magic Patterns Generation Prompt

**Use this prompt when generating in Magic Patterns studio:**

```
Create a complete Vabysmo (bispecific antibody) awareness and training campaign with TWO layers:

LAYER 1: TRAFFIC-DRIVING ASSETS (4 variations to pull people INTO the experience)

Asset 1 - Website Banner (300x600px & 728x90px)
- Headline: "The Patient You See Every Week..."
- Subheading: "Discover why one pathway isn't enough"
- CTA: "See the Mechanism"
- Professional blue + teal colors
- Clinical aesthetic

Asset 2 - Email Banner (600px wide HTML)
- Headline: "Master the Mechanism That Changes Everything"
- Hero image showing dual-pathway mechanism
- CTA: "Launch Interactive Training"
- Works in all email clients
- Responsive HTML + inline CSS

Asset 3 - LinkedIn Post Image (1200x628px)
- Headline: "Why One Pathway Isn't Enough (For Your Patient)"
- Stats: "2x duration | 2.3x response rate"
- Simplified mechanism visual
- Bold, high-contrast typography
- Mobile-readable in LinkedIn feed

Asset 4 - WhatsApp CTA Image (1080x1350px)
- Headline: "The Patient You See Every Week..."
- Patient + mechanism split visual
- Message: "Learn what changes everything"
- Clear CTA button with QR code
- Mobile-optimized

LAYER 2: INTERACTIVE SNAK™ EXPERIENCE (4-section educational flow)

SECTION 1: "The Patient You See Every Week"
- Ophthalmologist + patient image (warm, professional)
- Patient story about disease plateau
- Problem-first messaging (no solution mentioned yet)
- CTA: "See What Changes Everything"

SECTION 2: "Why One Pathway Isn't Enough"
- Animated side-by-side comparison:
  - Left: Monotherapy (1 pathway, incomplete)
  - Right: Vabysmo (2 pathways, complete)
- Key insight: "Single pathway = temporary | Dual pathway = sustained"
- Smooth 300ms animations
- CTA: "Let's See the Data"

SECTION 3: "The Data Backs It Up"
- Two key metrics as professional bar charts:
  - Duration: 18.4 mo vs 9.6 mo (2x)
  - Response: 58.4% vs 25% (2.3x)
- Publication-style visualization
- CTA: "Ready to Master This?"

SECTION 4: "Ready to Master This Mechanism?"
- 3-column value grid:
  1. Mechanism Mastery
  2. Patient Selection
  3. Early Adopter Stories
- Lead capture form (Name, Email, Phone, Timezone, Preferred Time)
- [SCHEDULE TRAINING] CTA button (blue, prominent)
- Confirmation page with next steps

OVERALL REQUIREMENTS:
- Professional healthcare tone throughout
- Fully responsive (mobile 375px to desktop 1920px)
- All animations smooth (300ms) and delightful
- Form validation + confirmation
- Production-ready HTML/CSS/JS
- WCAG AA accessible
- Blue + teal professional color scheme
- Modern, clean design aesthetic
- All assets linked with QR codes and deep URLs
```

---

## Customer Delivery Package

Send to: arnaud.adja-gnamien@roche.com

**Email Subject:** Vabysmo Campaign - Snak™ Experience + Traffic Assets Ready

**Email Body:**
```
Hi Arnaud,

Your complete Vabysmo awareness and training campaign is ready!

🎯 TWO LAYERS DELIVERED:

LAYER 1: TRAFFIC-DRIVING ASSETS
✓ Website banner (300x600px + 728x90px)
✓ Email banner (HTML, responsive)
✓ LinkedIn post image (1200x628px)
✓ WhatsApp CTA image with QR code (1080x1350px)

These assets drive HCPs TO the interactive experience.

LAYER 2: INTERACTIVE SNAK™ EXPERIENCE
✓ Section 1: "The Patient You See Every Week" (Problem Awareness)
✓ Section 2: "Why One Pathway Isn't Enough" (Mechanism Education)
✓ Section 3: "The Data Backs It Up" (Clinical Evidence)
✓ Section 4: "Ready to Master This?" (Lead Capture)

👉 PREVIEW LINK: [Insert preview URL from Magic Patterns]

FEATURES:
✓ Fully responsive (mobile to desktop)
✓ Smooth animations throughout
✓ Lead capture form with validation
✓ Professional healthcare aesthetic
✓ WCAG AA accessible
✓ Production-ready code available

TRAFFIC FLOW:
1. HCP sees banner/email/LinkedIn/WhatsApp asset
2. Clicks CTA or scans QR code
3. Lands on Snak™ Section 1 (problem awareness)
4. Flows through 4 sections
5. Completes training request form
6. Lead data captured + confirmation sent

NEXT STEPS:
1. Review preview & traffic assets
2. Request any changes (quick to update)
3. Download production source code
4. Deploy to your platform
5. Set up email/banner placements
6. Launch campaign

TIMELINE: Ready for Q1 2026 launch

Questions? Let me know!

Best,
Klaus
```

---

## Files & Storage

**Location:** `/campaigns/ROCHE/Ivory_Coast/Vabysmo/001/`

```
├── README.md .......................... Campaign overview
├── campaign.json ....................... Metadata + URLs
├── docs/
│   ├── STORYBOARD_WITH_BRANDING.md ... Original Snak™ spec
│   ├── MANUAL_WORKFLOW.md ............ Manual generation guide
│   └── COMPLETE_CAMPAIGN_SPEC.md .... This file
├── assets/
│   ├── branding_guidelines.pdf
│   ├── approved_logos_assets.pdf
│   └── product_documentation.pdf
├── mockups/
│   ├── traffic-assets/ ............. Banner, email, LinkedIn, WhatsApp
│   └── snak-experience/ ............ 4-section interactive
├── code/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── form.js
└── responses/
    └── magic-patterns-response.json ... API response with all assets
```

---

## Summary

**What Gets Generated:**
- 1 website banner (2 sizes)
- 1 email banner (HTML)
- 1 LinkedIn image
- 1 WhatsApp image
- 1 QR code
- 1 interactive 4-section Snak™ experience
- 1 confirmation page
- All source code (HTML/CSS/JS)

**What Gets Delivered:**
- 4 preview URLs (one per traffic asset)
- 1 Snak™ preview URL
- 1 QR code linking to Snak™
- Production source code
- Setup + deployment instructions

**Customer Value:**
✓ Complete awareness campaign (not just landing page)
✓ Multiple traffic channels (banner, email, social, messaging)
✓ Educational 4-section experience
✓ Lead capture pipeline
✓ Ready to launch Q1 2026

---

**Status:** Ready for Magic Patterns generation  
**Next:** Use COMPLETE_CAMPAIGN_SPEC.md prompt in Magic Patterns studio  
