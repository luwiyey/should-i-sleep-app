#!/usr/bin/env node

/**
 * Setup Script for Should I Sleep? App
 * This script helps configure the app for deployment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌙 Should I Sleep? App Setup');
console.log('============================\n');

const config = {
  domain: '',
  googleAnalyticsId: '',
  googleClientId: '',
  authorName: 'Zia Louise D. Mariano',
  authorEmail: '',
  facebookUrl: 'https://www.facebook.com/zia.louise.mariano.2024',
  instagramUrl: 'https://www.instagram.com/ziyuhm/'
};

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupConfiguration() {
  console.log('📝 Let\'s configure your app:\n');

  // Domain configuration
  config.domain = await askQuestion('Enter your domain (e.g., shouldisleep.app): ');
  if (!config.domain) {
    config.domain = 'shouldisleep.app';
    console.log('Using default domain: shouldisleep.app\n');
  }

  // Google Analytics
  const useAnalytics = await askQuestion('Do you want to set up Google Analytics? (y/n): ');
  if (useAnalytics.toLowerCase() === 'y') {
    config.googleAnalyticsId = await askQuestion('Enter your Google Analytics Measurement ID (GA_MEASUREMENT_ID): ');
  }

  // Google Sign-In
  const useGoogleAuth = await askQuestion('Do you want to set up Google Sign-In? (y/n): ');
  if (useGoogleAuth.toLowerCase() === 'y') {
    config.googleClientId = await askQuestion('Enter your Google OAuth Client ID: ');
  }

  // Author information
  const customizeAuthor = await askQuestion('Do you want to customize author information? (y/n): ');
  if (customizeAuthor.toLowerCase() === 'y') {
    config.authorName = await askQuestion(`Author name (${config.authorName}): `) || config.authorName;
    config.authorEmail = await askQuestion('Author email: ');
    config.facebookUrl = await askQuestion(`Facebook URL (${config.facebookUrl}): `) || config.facebookUrl;
    config.instagramUrl = await askQuestion(`Instagram URL (${config.instagramUrl}): `) || config.instagramUrl;
  }

  console.log('\n🔧 Applying configuration...\n');
  await applyConfiguration();
  
  console.log('✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Run "npm start" to start the development server');
  console.log('2. Open http://localhost:8000 in your browser');
  console.log('3. Test all functionality');
  console.log('4. Deploy using one of the deployment scripts\n');
  
  rl.close();
}

async function applyConfiguration() {
  try {
    // Update domain references
    await updateDomainReferences();
    
    // Update Google Analytics
    if (config.googleAnalyticsId) {
      await updateGoogleAnalytics();
    }
    
    // Update Google Client ID
    if (config.googleClientId) {
      await updateGoogleClientId();
    }
    
    // Update author information
    await updateAuthorInfo();
    
    // Update sitemap and robots.txt
    await updateSEOFiles();
    
    console.log('Configuration applied successfully!');
    
  } catch (error) {
    console.error('Error applying configuration:', error.message);
  }
}

async function updateDomainReferences() {
  const files = [
    'index.html',
    'blog.html',
    'privacy.html',
    'terms.html',
    'sitemap.xml',
    'robots.txt'
  ];
  
  const domain = config.domain.startsWith('http') ? config.domain : `https://${config.domain}`;
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      content = content.replace(/https:\/\/shouldisleep\.app/g, domain);
      fs.writeFileSync(file, content);
      console.log(`✓ Updated domain references in ${file}`);
    }
  }
}

async function updateGoogleAnalytics() {
  const files = ['index.html', 'js/analytics.js'];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      content = content.replace(/GA_MEASUREMENT_ID/g, config.googleAnalyticsId);
      fs.writeFileSync(file, content);
      console.log(`✓ Updated Google Analytics ID in ${file}`);
    }
  }
}

async function updateGoogleClientId() {
  const file = 'js/auth.js';
  
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/YOUR_GOOGLE_CLIENT_ID/g, config.googleClientId);
    fs.writeFileSync(file, content);
    console.log(`✓ Updated Google Client ID in ${file}`);
  }
}

async function updateAuthorInfo() {
  const files = [
    'index.html',
    'blog.html',
    'privacy.html',
    'terms.html',
    'package.json'
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Update author name
      content = content.replace(/Zia Louise D\. Mariano/g, config.authorName);
      
      // Update social media links
      if (config.facebookUrl) {
        content = content.replace(/https:\/\/www\.facebook\.com\/zia\.louise\.mariano\.2024/g, config.facebookUrl);
      }
      if (config.instagramUrl) {
        content = content.replace(/https:\/\/www\.instagram\.com\/ziyuhm\//g, config.instagramUrl);
      }
      
      // Update email if provided
      if (config.authorEmail) {
        content = content.replace(/contact@shouldisleep\.app/g, config.authorEmail);
        content = content.replace(/support@shouldisleep\.app/g, config.authorEmail);
        content = content.replace(/privacy@shouldisleep\.app/g, config.authorEmail);
        content = content.replace(/legal@shouldisleep\.app/g, config.authorEmail);
      }
      
      fs.writeFileSync(file, content);
      console.log(`✓ Updated author information in ${file}`);
    }
  }
}

async function updateSEOFiles() {
  // Update sitemap.xml
  if (fs.existsSync('sitemap.xml')) {
    let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const today = new Date().toISOString().split('T')[0];
    sitemap = sitemap.replace(/2024-12-15/g, today);
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log('✓ Updated sitemap.xml with current date');
  }
  
  // Update robots.txt
  if (fs.existsSync('robots.txt')) {
    let robots = fs.readFileSync('robots.txt', 'utf8');
    const domain = config.domain.startsWith('http') ? config.domain : `https://${config.domain}`;
    robots = robots.replace(/https:\/\/shouldisleep\.app/g, domain);
    fs.writeFileSync('robots.txt', robots);
    console.log('✓ Updated robots.txt with your domain');
  }
}

// Create placeholder images directory and files
async function createPlaceholderImages() {
  const imagesDir = 'images';
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
    console.log('✓ Created images directory');
  }
  
  // Create a simple SVG placeholder for missing images
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4f46e5"/>
  <text x="256" y="256" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="24">Should I Sleep?</text>
  <text x="256" y="300" text-anchor="middle" dy=".3em" fill="#e0e7ff" font-family="Arial" font-size="16">🌙</text>
</svg>`;
  
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  for (const size of iconSizes) {
    const filename = `${imagesDir}/icon-${size}x${size}.png`;
    if (!fs.existsSync(filename)) {
      // Create SVG placeholder (in production, you'd convert to PNG)
      const sizedSvg = svgPlaceholder.replace(/512/g, size.toString());
      fs.writeFileSync(`${imagesDir}/icon-${size}x${size}.svg`, sizedSvg);
    }
  }
  
  console.log('✓ Created placeholder icons (replace with actual PNG files)');
}

// Main setup function
async function main() {
  try {
    await setupConfiguration();
    await createPlaceholderImages();
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = { setupConfiguration, applyConfiguration };
