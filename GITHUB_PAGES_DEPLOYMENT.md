# 🚀 GitHub Pages Deployment Guide

## Overview
This guide will help you deploy the My-Grocery application to GitHub Pages for free hosting.

## 📋 Prerequisites

### 1. Repository Setup
- Ensure your repository is public (GitHub Pages requires public repos for free accounts)
- Repository name: `My-Grocery`
- Owner: `MWANGAZA-LAB`

### 2. Firebase Environment Variables
You need to set up the following GitHub Secrets for Firebase configuration:

1. Go to your GitHub repository: `https://github.com/MWANGAZA-LAB/My-Grocery`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each of the following:

```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID
```

**Important**: Use the values from your local `.env` file for each secret.

## 🔧 Deployment Steps

### Step 1: Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. This will allow the automated workflow to deploy your site

### Step 2: Configure Repository Settings
The following files have been configured for you:

- ✅ `package.json` - Added homepage URL and deploy scripts
- ✅ `.github/workflows/deploy-pages.yml` - GitHub Actions workflow
- ✅ `public/404.html` - SPA routing support
- ✅ `public/index.html` - Updated with SPA routing script

### Step 3: Deploy
Once you push changes to the `main` branch:

1. The GitHub Actions workflow will automatically trigger
2. It will build the React application
3. Deploy to GitHub Pages
4. Your site will be available at: `https://MWANGAZA-LAB.github.io/My-Grocery`

## 🛠️ Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Navigate to the grocery-list directory
cd grocery-list

# Install dependencies (if not already done)
npm install

# Build the application
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🔍 Verification

### Check Deployment Status
1. Go to **Actions** tab in your GitHub repository
2. Look for "Deploy to GitHub Pages" workflow
3. Ensure it completes successfully (green checkmark)

### Test Your Site
1. Visit: `https://MWANGAZA-LAB.github.io/My-Grocery`
2. Test all functionality:
   - ✅ App loads without errors
   - ✅ Firebase authentication works
   - ✅ Grocery lists can be created/edited
   - ✅ QR code sharing functions
   - ✅ Real-time sync operates correctly

## 🚨 Troubleshooting

### Common Issues

#### 1. "Page Not Found" Error
- **Cause**: GitHub Pages not enabled or wrong source selected
- **Solution**: Go to Settings → Pages → Select "GitHub Actions" as source

#### 2. Blank White Page
- **Cause**: Missing environment variables or build errors
- **Solution**: 
  - Check GitHub Secrets are set correctly
  - Review Actions tab for build errors
  - Ensure Firebase project is properly configured

#### 3. Routing Issues (404 on page refresh)
- **Cause**: SPA routing not properly configured
- **Solution**: The `404.html` and routing scripts should handle this automatically

#### 4. Firebase Connection Issues
- **Cause**: Environment variables not set or incorrect
- **Solution**:
  - Verify all Firebase secrets are added to GitHub Secrets
  - Ensure Firebase project allows your GitHub Pages domain
  - Check Firebase console for any domain restrictions

### Debug Steps
1. **Check build logs**: Go to Actions → latest workflow → build step
2. **Verify secrets**: Ensure all 7 Firebase secrets are set
3. **Test locally**: Run `npm run build` locally to check for errors
4. **Firebase rules**: Ensure Firestore security rules allow your domain

## 🔐 Security Considerations

### Domain Configuration
Add your GitHub Pages domain to Firebase authorized domains:
1. Go to Firebase Console → Authentication → Settings
2. Add `MWANGAZA-LAB.github.io` to authorized domains

### Environment Variables
- Never commit `.env` files to the repository
- All secrets are safely stored in GitHub Secrets
- Build process only uses environment variables during compilation

## 📱 Post-Deployment

### Performance Monitoring
- GitHub Pages automatically serves your site with HTTPS
- Performance monitoring will track Core Web Vitals
- Error boundaries will catch and handle any runtime errors

### Updates
- Any push to `main` branch will automatically redeploy
- Development changes can be tested locally before pushing
- The CI/CD pipeline ensures only tested code is deployed

## 🎉 Success!

Once deployed, your My-Grocery app will be available at:
**https://MWANGAZA-LAB.github.io/My-Grocery**

Features available on GitHub Pages:
- ✅ Real-time grocery list management
- ✅ QR code sharing between devices
- ✅ Offline sync capabilities
- ✅ Mobile-responsive design
- ✅ Firebase authentication and database
- ✅ Performance monitoring
- ✅ Error boundaries for stability

Your application is now live and accessible to users worldwide! 🌍
