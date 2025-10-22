# Should I Sleep? - Smart Sleep Calculator & Wellness App

A comprehensive web application that helps users optimize their sleep schedule based on 90-minute sleep cycles, with personalized mood-based recommendations and advanced features for better sleep wellness.

![Should I Sleep? App](./images/app-preview.png)

## 🌟 Features

### Core Functionality
- **Smart Sleep Calculator**: Calculate optimal sleep and wake times based on 90-minute sleep cycles
- **Mood-Based Recommendations**: Personalized sleep tips based on your current mood
- **Input Validation**: Comprehensive validation for time inputs and user data
- **Real-time Calculations**: Instant results with loading indicators for better UX

### User Experience
- **Mobile-First Design**: Fully responsive design optimized for all devices
- **Accessibility**: WCAG 2.1 compliant with screen reader support and keyboard navigation
- **Progressive Web App (PWA)**: Installable app with offline functionality
- **Animations**: Smooth transitions and micro-interactions for enhanced UX

### User Management
- **Google Sign-In**: Secure authentication using Google OAuth
- **User Profiles**: Personal profiles with avatar and preferences
- **Sleep History**: Track and view your sleep calculation history
- **Data Export**: Export your sleep data in JSON format
- **Privacy Controls**: Full control over your data with deletion options

### Advanced Features
- **Local Storage**: Persistent data storage with automatic cleanup
- **Analytics Integration**: Google Analytics for usage insights
- **Feedback System**: Built-in feedback collection with modal interface
- **SEO Optimized**: Complete SEO setup with meta tags, structured data, and sitemap
- **Performance Optimized**: Service worker caching and lazy loading

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for external resources
- Google account (optional, for sign-in features)

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/should-i-sleep.git
   cd should-i-sleep
   ```

2. **Serve the Application**
   
   **Option A: Using Python (recommended)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npx serve .
   ```
   
   **Option C: Using PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000` in your web browser

### Configuration

1. **Google Analytics** (Optional)
   - Replace `GA_MEASUREMENT_ID` in `index.html` and `js/analytics.js` with your Google Analytics ID
   
2. **Google Sign-In** (Optional)
   - Replace `YOUR_GOOGLE_CLIENT_ID` in `js/auth.js` with your Google OAuth Client ID
   - Configure your Google Cloud Console project

3. **Domain Configuration**
   - Update all instances of `https://shouldisleep.app` with your actual domain
   - Update sitemap.xml and robots.txt with your domain

## 📱 PWA Installation

The app can be installed as a Progressive Web App:

1. **Desktop**: Click the install button in your browser's address bar
2. **Mobile**: Use "Add to Home Screen" option in your browser menu
3. **Features**: Works offline, app-like experience, push notifications

## 🏗️ Project Structure

```
sleep-app/
├── index.html              # Main application page
├── blog.html              # Sleep tips and wellness blog
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker for PWA
├── robots.txt             # SEO robots file
├── sitemap.xml            # SEO sitemap
├── README.md              # This file
├── css/
│   └── styles.css         # Custom styles and animations
├── js/
│   ├── app.js            # Main application logic
│   ├── auth.js           # Authentication management
│   ├── storage.js        # Local storage management
│   └── analytics.js      # Analytics and tracking
└── images/               # App icons and images
    ├── icon-*.png        # Various sized icons
    ├── favicon.ico       # Favicon
    └── *.jpg/*.png       # Blog and content images
```

## 🔧 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Authentication**: Google OAuth 2.0
- **Storage**: Browser LocalStorage and SessionStorage
- **Analytics**: Google Analytics 4
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features
- **Lazy Loading**: Images and non-critical resources
- **Caching**: Service worker caching for offline functionality
- **Compression**: Minified CSS and optimized images
- **CDN**: External resources served from CDN

## 🎨 Customization

### Themes and Colors
The app uses a consistent color scheme based on Indigo and Purple gradients. To customize:

1. **CSS Variables**: Modify color variables in `css/styles.css`
2. **Tailwind Classes**: Update Tailwind color classes throughout HTML files
3. **Manifest**: Update theme colors in `manifest.json`

### Content Customization
1. **Blog Content**: Edit `blog.html` to add your own sleep tips and articles
2. **Branding**: Replace logo, icons, and branding elements
3. **Copy**: Update text content throughout the application

## 📊 Analytics and Tracking

The app includes comprehensive analytics tracking:

### Events Tracked
- Sleep calculations
- Mood selections
- User interactions
- Feature usage
- Performance metrics
- Error tracking

### Privacy Compliant
- GDPR compliant
- CCPA compliant
- User consent management
- Data anonymization options

## 🔒 Security and Privacy

### Data Protection
- **Local Storage**: Most data stored locally on user's device
- **Encryption**: HTTPS encryption for all communications
- **Authentication**: Secure Google OAuth implementation
- **Privacy Controls**: User can delete all data at any time

### Compliance
- GDPR compliant with user rights implementation
- CCPA compliant with privacy controls
- Comprehensive privacy policy and terms of service

## 🚀 Deployment

### Static Hosting (Recommended)
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for public repositories
- **Firebase Hosting**: Google's hosting platform

### Traditional Hosting
- Upload all files to your web server
- Ensure HTTPS is enabled
- Configure proper MIME types for PWA files

### Domain Configuration
1. Update all domain references in the code
2. Configure DNS settings
3. Set up SSL certificate
4. Update Google OAuth settings
5. Update Google Analytics configuration

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sleep calculation accuracy
- [ ] Mood selection functionality
- [ ] Google sign-in flow
- [ ] Data persistence
- [ ] Mobile responsiveness
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Accessibility features

### Browser Testing
Test across different browsers and devices to ensure compatibility.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex functionality
- Test across multiple browsers
- Ensure accessibility compliance
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Zia Louise D. Mariano**
- Website: [shouldisleep.app](https://shouldisleep.app)
- Facebook: [@zia.louise.mariano.2024](https://www.facebook.com/zia.louise.mariano.2024)
- Instagram: [@ziyuhm](https://www.instagram.com/ziyuhm/)

## 🙏 Acknowledgments

- Sleep research and 90-minute cycle methodology
- Google for authentication and analytics services
- Tailwind CSS for the utility-first CSS framework
- Font Awesome for the comprehensive icon library
- The open-source community for inspiration and resources

## 📞 Support

If you encounter any issues or have questions:

1. Check the [FAQ section](#faq) below
2. Search existing [GitHub Issues](https://github.com/yourusername/should-i-sleep/issues)
3. Create a new issue with detailed information
4. Contact us at support@shouldisleep.app

## ❓ FAQ

### Q: How accurate are the sleep calculations?
A: The calculations are based on the scientifically-backed 90-minute sleep cycle methodology. However, individual sleep needs may vary.

### Q: Is my data secure?
A: Yes, most data is stored locally on your device. We use secure authentication and follow privacy best practices.

### Q: Can I use the app offline?
A: Yes, the app works offline as a Progressive Web App (PWA) after the initial load.

### Q: Do I need to sign in to use the app?
A: No, the basic sleep calculator works without signing in. Sign-in is only required for saving history and preferences.

### Q: Is the app free to use?
A: Yes, the app is completely free to use with no hidden costs or premium features.

### Q: Can I export my sleep data?
A: Yes, signed-in users can export their data in JSON format through their profile settings.

---

**Made with ❤️ for better sleep and wellness**
