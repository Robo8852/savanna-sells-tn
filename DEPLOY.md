# Deploy to GitHub & Vercel

## Prerequisites
- GitHub CLI authenticated (`gh auth status`)
- Vercel CLI authenticated (`vercel login`)

## Steps

### 1. Create Private GitHub Repo
```bash
gh repo create savanna-sells-tn --private --source=. --remote=origin
```

### 2. Push to GitHub
```bash
git push -u origin main
```

### 3. Link Vercel to GitHub Repo
Go to [Vercel Dashboard](https://vercel.com) > savanna-sells-tn project > Settings > Git > Connect to the new `savanna-sells-tn` GitHub repo.

This will enable auto-deployments on every push to `main`.

### 4. Verify
- Check the Vercel deployment at: https://savanna-sells-tn.vercel.app
- Confirm the About section says "Now calling Franklin, TN home" (not "Born and raised in Tennessee")

## Current Vercel Project
- **Production URL:** https://savanna-sells-tn.vercel.app
- **Vercel Account:** leo-reyes-projects
- **GitHub Account:** Robo8852
