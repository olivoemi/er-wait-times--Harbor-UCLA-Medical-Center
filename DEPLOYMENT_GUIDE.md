# Deployment Guide for ER Wait Times Website

To make your site accessib

2. Make sure it's public (required for GitHub Pages on free accounts)

```bash
git init
# Add all files


# Add remote repository

git push -u origin main


1. **Install gh
   npm in

   ```json
     "homepage": "https://olivoemi.github.io/er-wait-time

     }
   ```

   export defaul
     // ... other confi
   

# Build and deploy
```

2. Click Settings
4. Select 
6. Save
### 6.

## Important Notes
### Vite C

Make sure all asset imports use relative paths or the Vite asset handling system.
### Environment V

To update your site:
2. Com



```yaml

  push:

  deploy:
    s
    - 

    - run: npm run build
      w
        publish_di





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