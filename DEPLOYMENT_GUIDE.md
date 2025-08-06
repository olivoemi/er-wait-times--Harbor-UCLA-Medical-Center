# Deployment Guide for ER Wait Times Website

## GitHub Pages Deployment

To make your site accessible at `https://olivoemi.github.io/er-wait-times--Harbor-UCLA-Medical-Center/`, follow these steps:

### 1. Create GitHub Repository
1. Go to GitHub.com and create a new repository named `er-wait-times--Harbor-UCLA-Medical-Center`
2. Make sure it's public (required for GitHub Pages on free accounts)
3. Don't initialize with README, .gitignore, or license since you'll push existing code

### 2. Prepare Your Local Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: ER Wait Times application"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/er-wait-times--Harbor-UCLA-Medical-Center.git

# Push to GitHub
git push -u origin main
```

### 3. Configure for GitHub Pages
Since this is a Vite React application, you need to:

1. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json** with deployment scripts and homepage:
   ```json
   {
     "homepage": "https://olivoemi.github.io/er-wait-times--Harbor-UCLA-Medical-Center",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js** to set the correct base path:
   ```javascript
   export default defineConfig({
     base: '/er-wait-times--Harbor-UCLA-Medical-Center/',
     // ... other config
   })
   ```

### 4. Deploy to GitHub Pages
```bash
# Build and deploy
npm run deploy
```

### 5. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click Settings
3. Scroll to Pages section
4. Select "Deploy from a branch"
5. Choose "gh-pages" branch
6. Save

### 6. Access Your Site
After deployment (usually takes 5-10 minutes), your site will be available at:
`https://olivoemi.github.io/er-wait-times--Harbor-UCLA-Medical-Center/`

## Important Notes

### Vite Configuration
Your Vite app needs proper configuration for GitHub Pages deployment. The base path must match your repository name.

### Asset Paths
Make sure all asset imports use relative paths or the Vite asset handling system.

### Environment Variables
Any environment variables need to be prefixed with `VITE_` to be accessible in the browser.

### Updates
To update your site:
1. Make changes to your code
2. Commit and push to main branch
3. Run `npm run deploy`

## Alternative: Direct GitHub Pages with Actions

You can also use GitHub Actions for automatic deployment:

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

This will automatically deploy whenever you push to the main branch.