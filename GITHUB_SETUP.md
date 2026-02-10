# Push Dashboard to GitHub & Deploy on Railway

Your code is ready to push! Follow these steps:

## Step 1: Create a Personal Access Token (PAT) on GitHub

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `Railway Deploy Token`
4. Check these scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token** — you won't see it again!

## Step 2: Push Code to GitHub (from your machine)

You have the code locally at:
```
/root/.openclaw/workspace/dashboard
```

On your machine (laptop/desktop), run:

```bash
cd /root/.openclaw/workspace/dashboard

# Configure git
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Add GitHub remote
git remote add origin https://github.com/rdssnakker-hub/snakker-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

When prompted for password, paste your **Personal Access Token** (not your GitHub password).

## Step 3: Deploy on Railway

1. Go to https://railway.app
2. Sign in with GitHub (authorize Railway)
3. Click **"Create New Project"**
4. Select **"Deploy from GitHub repo"**
5. Find and select **snakker-dashboard**
6. Click **"Deploy Now"**

Railway will automatically:
- Build the Docker image
- Deploy your app
- Generate a public URL

Your dashboard will be live in ~2-3 minutes!

---

### Troubleshooting

**"Repository not found"** when pushing?
- Make sure the PAT has `repo` scope
- Verify you used the correct token (paste, don't retype)

**Railway deployment fails?**
- Check Railway logs (they show exact errors)
- Ensure Dockerfile is at root of repo

**Need help?**
Email me the error or screenshot!
