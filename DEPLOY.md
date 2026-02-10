# Deploy to Railway in 2 Minutes

## Steps

### 1. Push to GitHub (or any git repo)

If you don't have the dashboard in git yet:

```bash
cd /root/.openclaw/workspace/dashboard
git init
git add .
git commit -m "Initial dashboard commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/snakker-dashboard.git
git push -u origin main
```

### 2. Deploy to Railway

1. Go to **https://railway.app**
2. Sign up / Log in (use GitHub for fastest auth)
3. Click **"Create New Project"**
4. Select **"Deploy from GitHub repo"**
5. Connect your GitHub account
6. Select the **snakker-dashboard** repo
7. Click **"Deploy Now"**

**That's it!** Railway will:
- Build the Docker image
- Deploy your app
- Give you a public URL instantly

### 3. Get Your URL

Once deployed, Railway shows you a public URL like:
```
https://snakker-dashboard-production.up.railway.app
```

Copy this URL and share it!

---

## What Railway Provides

✅ Free tier: 500 hours/month (enough for always-on)  
✅ Automatic SSL/HTTPS  
✅ Auto-scaling  
✅ Environment variables support  
✅ GitHub auto-deploy on push  
✅ Logs and monitoring  

---

## If You Don't Have GitHub

Use GitLab, Bitbucket, or Gitea instead — Railway supports all of them.

Or email me and I can set up a GitHub account for you.

---

**Questions?** Check your deployment logs in Railway's dashboard if anything fails.
