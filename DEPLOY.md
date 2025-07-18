# Deployment Guide for Typetorial Incubator

This guide explains how to deploy the Typetorial Incubator project to GitHub Pages.

## Prerequisites

1. Make sure you have the project dependencies installed:
   ```bash
   npm install
   ```

2. Ensure your repository is pushed to GitHub and you have write access to it.

## Method 1: Automatic Deployment via GitHub Actions (Recommended)

This project is configured with GitHub Actions for automatic deployment.

### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Push your code to the main branch:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

3. **The deployment will automatically start** when you push to the main branch. You can monitor the progress in the "Actions" tab of your repository.

4. **Access your deployed site** at: `https://yourusername.github.io/typetorial_incubator`

## Method 2: Manual Deployment

If you prefer to deploy manually or the automatic deployment doesn't work:

### Setup Steps:

1. **Update the homepage in package.json** (if not already done):
   Replace `yourusername` with your actual GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/typetorial_incubator"
   ```

2. **Build and deploy:**
   ```bash
   npm run deploy
   ```

This command will:
- Build the project (`npm run build`)
- Deploy the `dist` folder to the `gh-pages` branch
- GitHub will automatically serve the content from the `gh-pages` branch

## Method 3: Using gh-pages CLI directly

You can also use the gh-pages package directly:

```bash
# Build the project first
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

## Troubleshooting

### Common Issues:

1. **404 Error on deployed site:**
   - Make sure the `base` configuration in `vite.config.ts` is correct
   - Verify that your repository name matches the base path

2. **Build fails:**
   - Check that all dependencies are installed: `npm install`
   - Ensure TypeScript compilation passes: `npm run lint`

3. **Permission denied during deployment:**
   - Make sure you have write access to the repository
   - Check if GitHub Actions has the necessary permissions (should be automatic)

### Manual GitHub Pages Configuration:

If using Method 2 or 3, configure GitHub Pages:
1. Go to your repository Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Select the `gh-pages` branch
4. Keep the folder as `/ (root)`
5. Save

## Environment Variables

The project uses the following environment variable:
- `NODE_ENV`: Set to "production" during build for proper base URL configuration

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public` folder with your domain name
2. Configure your domain's DNS to point to GitHub Pages
3. Update the `homepage` field in `package.json` to use your custom domain

## Development vs Production

- **Development**: Base URL is `/` (root)
- **Production**: Base URL is `/typetorial_incubator/` (repository name)

This is automatically handled by the Vite configuration based on the `NODE_ENV` variable.
