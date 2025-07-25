# Railway Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
- Railway account (sign up at railway.app)
- GitHub repository with your code

### Option 1: Deploy via GitHub (Recommended)

1. **Connect Repository:**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy Now"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect it as a Node.js project

3. **Set Environment Variables:**
   In Railway dashboard → Variables tab, add:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NODE_ENV=production
   ```

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

### Build Process
Railway will automatically:
1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Start the server: `npm run start:prod`

### Custom Domain (Optional)
1. Go to Railway dashboard → Settings
2. Add your custom domain
3. Update DNS records as shown

### Monitoring
- View logs in Railway dashboard
- Monitor build and deploy status
- Set up alerts for failures

## 🔧 Configuration Files Created

- `railway.json` - Railway configuration
- `.railwayignore` - Files to exclude from deployment
- `.env.example` - Environment variables template
- Updated `package.json` with production scripts

## 📊 Expected Build Output
```
Creating an optimized production build...
Compiled successfully.
File sizes after gzip:
  356.73 kB  build/static/js/main.[hash].js
  1.77 kB    build/static/js/[hash].chunk.js
  513 B      build/static/css/main.[hash].css
```

## 🚨 Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Verify all dependencies are installed
- Check Railway build logs

### App Doesn't Start
- Verify environment variables are set
- Check Firebase configuration
- Review Railway service logs

### 404 Errors on Refresh
- Railway automatically handles SPA routing
- No additional configuration needed

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] Firebase project setup
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

Your grocery list app will be live at: `https://your-app-name.up.railway.app`
