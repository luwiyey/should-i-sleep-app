# Deployment Guide - Should I Sleep? App

This guide covers various deployment options for the Should I Sleep? app, from simple static hosting to advanced cloud deployments.

## 🚀 Quick Deployment Options

### 1. Netlify (Recommended for beginners)

**Drag & Drop Deployment:**
1. Go to [netlify.com](https://netlify.com)
2. Drag the entire `sleep-app` folder to the deploy area
3. Your app will be live instantly with a random URL
4. Optional: Configure custom domain in site settings

**Git-based Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project directory
cd sleep-app
netlify deploy --prod --dir=.
```

### 2. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
cd sleep-app
vercel --prod
```

### 3. GitHub Pages

1. Create a new GitHub repository
2. Upload all files from `sleep-app` folder
3. Go to repository Settings > Pages
4. Select source branch (usually `main`)
5. Your app will be available at `https://username.github.io/repository-name`

### 4. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd sleep-app
firebase init hosting

# Deploy
firebase deploy
```

### 5. Surge.sh (Simple and fast)

```bash
# Install Surge
npm install -g surge

# Deploy from project directory
cd sleep-app
surge . shouldisleep.surge.sh
```

## 🔧 Pre-Deployment Configuration

### 1. Run Setup Script
```bash
cd sleep-app
node setup.js
```

This will help you configure:
- Domain name
- Google Analytics ID
- Google OAuth Client ID
- Author information
- Social media links

### 2. Manual Configuration

If you prefer manual setup, update these files:

**Google Analytics:**
- Replace `GA_MEASUREMENT_ID` in `index.html` and `js/analytics.js`

**Google Sign-In:**
- Replace `YOUR_GOOGLE_CLIENT_ID` in `js/auth.js`
- Configure OAuth consent screen in Google Cloud Console

**Domain References:**
- Update all instances of `https://shouldisleep.app` with your domain
- Files to update: `index.html`, `blog.html`, `privacy.html`, `terms.html`, `sitemap.xml`, `robots.txt`

### 3. Create Required Images

The app needs these icon files in the `images/` directory:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `favicon.ico`
- `apple-touch-icon.png`

You can use tools like:
- [Favicon Generator](https://favicon.io/)
- [PWA Asset Generator](https://github.com/pwa-builder/PWABuilder)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## 🌐 Custom Domain Setup

### 1. DNS Configuration
Point your domain to your hosting provider:

**For Netlify:**
- Add CNAME record: `www` → `your-site.netlify.app`
- Add A record: `@` → `75.2.60.5`

**For Vercel:**
- Add CNAME record: `www` → `cname.vercel-dns.com`
- Add A record: `@` → `76.76.19.61`

**For GitHub Pages:**
- Add CNAME record: `www` → `username.github.io`
- Add A records for apex domain to GitHub's IPs

### 2. SSL Certificate
Most hosting providers offer free SSL certificates:
- Netlify: Automatic with Let's Encrypt
- Vercel: Automatic SSL
- GitHub Pages: Automatic for custom domains
- Firebase: Free SSL certificates

## 🔒 Security Configuration

### 1. Content Security Policy (CSP)
Add CSP headers through your hosting provider:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://accounts.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com https://www.google-analytics.com;
```

### 2. Security Headers
Configure these headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## 📊 Analytics Setup

### 1. Google Analytics 4
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Replace `GA_MEASUREMENT_ID` in your code
4. Verify tracking is working

### 2. Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain
3. Verify ownership
4. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

## 🔐 Google OAuth Setup

### 1. Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add redirect URIs

### 2. OAuth Consent Screen
1. Configure OAuth consent screen
2. Add your app information
3. Add authorized domains
4. Set up privacy policy and terms of service URLs

## 🧪 Testing Before Deployment

### 1. Local Testing
```bash
cd sleep-app
npm start
# or
python -m http.server 8000
```

### 2. Performance Testing
```bash
# Install Lighthouse
npm install -g lighthouse

# Run Lighthouse audit
lighthouse http://localhost:8000 --output=html --output-path=./lighthouse-report.html
```

### 3. PWA Testing
- Test offline functionality
- Test "Add to Home Screen"
- Verify service worker registration
- Check manifest.json validity

### 4. Cross-browser Testing
Test on:
- Chrome (desktop & mobile)
- Firefox
- Safari (desktop & mobile)
- Edge

## 📱 PWA Deployment Considerations

### 1. HTTPS Requirement
PWAs require HTTPS. All recommended hosting providers offer free SSL.

### 2. Service Worker Scope
Ensure service worker is served from the root domain for full app coverage.

### 3. Manifest Validation
Use [Web App Manifest Validator](https://manifest-validator.appspot.com/) to check your manifest.json.

## 🚨 Troubleshooting

### Common Issues:

**1. Google Sign-In not working:**
- Check OAuth client ID configuration
- Verify authorized domains in Google Cloud Console
- Ensure HTTPS is enabled

**2. Service Worker not registering:**
- Check browser console for errors
- Verify service worker file is accessible
- Ensure HTTPS is enabled

**3. Icons not displaying:**
- Verify all icon files exist in images/ directory
- Check file paths in manifest.json
- Ensure proper MIME types are set

**4. Analytics not tracking:**
- Verify Google Analytics ID is correct
- Check for ad blockers
- Verify gtag is loading properly

## 📈 Post-Deployment Optimization

### 1. Performance Monitoring
- Set up Google Analytics goals
- Monitor Core Web Vitals
- Use Google PageSpeed Insights

### 2. SEO Optimization
- Submit sitemap to search engines
- Monitor search console for issues
- Optimize meta descriptions and titles

### 3. User Feedback
- Monitor feedback submissions
- Track user behavior with analytics
- A/B test different features

## 🔄 Continuous Deployment

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './sleep-app'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review hosting provider documentation
3. Check browser console for errors
4. Create an issue on GitHub
5. Contact support@shouldisleep.app

---

**Happy Deploying! 🚀**
