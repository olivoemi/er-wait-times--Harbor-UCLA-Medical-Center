# ER Wait Times - Deployment Guide

This document explains how to deploy your ER Wait Times website to make it publicly accessible.

## Quick Start

1. **Build the project for production:**
   ```bash
   npm run build
   ```

2. **The built files will be in the `dist/` folder** - this is what you need to deploy.

## Deployment Options

### Option 1: Netlify (Recommended - Free & Easy)

1. Go to [netlify.com](https://netlify.com) and sign up for a free account
2. Drag and drop your `dist/` folder onto the Netlify deployment area
3. Your site will be live at a netlify.app URL within minutes
4. Optional: Connect a custom domain in Netlify settings

### Option 2: Vercel (Free & Easy)

1. Go to [vercel.com](https://vercel.com) and sign up for a free account
2. Click "Add New Project"
3. Upload your project or connect your GitHub repository
4. Set build command to `npm run build` and output directory to `dist`
5. Deploy

### Option 3: GitHub Pages (Free)

1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Set source to "GitHub Actions"
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Option 4: Firebase Hosting (Free)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login` and `firebase init hosting`
3. Set public directory to `dist`
4. Run `firebase deploy`

### Option 5: Traditional Web Hosting

1. Build the project: `npm run build`
2. Upload the entire `dist/` folder to your web hosting provider
3. Point your domain to the uploaded folder

## Custom Domain Setup

After deploying to any of these platforms, you can usually add a custom domain in the platform's settings:

- **Netlify**: Domain settings > Add custom domain
- **Vercel**: Project settings > Domains
- **GitHub Pages**: Repository settings > Pages > Custom domain
- **Firebase**: Firebase console > Hosting > Add custom domain

## Environment Variables

Since this is now a standalone application, all data is stored locally in the browser. No server-side environment variables are needed.

## Features Available in Public Version

✅ **Available:**
- Full ER wait times interface
- Care guide with symptom checker
- Visit preparation guide
- Multi-language support (English/Spanish)
- All interactive features
- Data persistence (localStorage)

❌ **Not Available (GitHub Spark specific):**
- AI/LLM integration for dynamic responses
- GitHub user authentication
- Server-side data synchronization

## Support

If you need help with deployment, most hosting providers offer excellent documentation and support for static React applications.

## Performance Tips

- The built site is optimized and should load quickly
- All assets are optimized and minified
- The site works offline after first load
- Mobile-responsive design works on all devices

Your ER Wait Times site is now ready to help people make informed healthcare decisions!