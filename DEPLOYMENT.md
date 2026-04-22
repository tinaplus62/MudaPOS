# MUDA POS - Deployment Guide

Panduan lengkap untuk deployment MUDA POS ke production environment.

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All critical bugs fixed
- [ ] All console errors/warnings resolved
- [ ] Code review completed
- [ ] Tests passed (manual QA at minimum)
- [ ] No hardcoded credentials/secrets
- [ ] All .env variables properly configured

### Security
- [ ] Firebase security rules reviewed
- [ ] API endpoints validated
- [ ] XSS prevention verified
- [ ] Input validation complete
- [ ] Authentication guards in place
- [ ] Password hashing implemented
- [ ] HTTPS configured

### Performance
- [ ] Page load time acceptable (< 3s)
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] CSS/JS minified
- [ ] Caching configured

### Documentation
- [ ] README updated
- [ ] Setup guide complete
- [ ] API documentation done (if applicable)
- [ ] Deployment guide available
- [ ] Known issues documented

### Database
- [ ] Database schema finalized
- [ ] Backup strategy in place
- [ ] Migration scripts tested
- [ ] Data integrity verified

---

## Deployment Environments

### Development
- **URL**: `http://localhost:5173` atau local development server
- **Database**: Firebase/Firestore dev project
- **Auth**: Firebase dev authentication
- **Purpose**: Local development dan testing

### Staging
- **URL**: `https://staging.mudapos.com` atau staging server
- **Database**: Firebase/Firestore staging project
- **Auth**: Firebase staging authentication
- **Purpose**: Pre-production testing
- **Access**: Development team only

### Production
- **URL**: `https://mudapos.com` atau production server
- **Database**: Firebase/Firestore production project
- **Auth**: Firebase production authentication
- **Purpose**: Live application
- **Access**: End users

---

## Environment Configuration

### .env Variables per Environment

**Development** (`.env` atau `.env.development`)
```env
VITE_ENVIRONMENT=development
VITE_FIREBASE_PROJECT_ID=mudapos-dev
VITE_FIREBASE_API_KEY=dev_key_here
VITE_APP_NAME=MUDA POS DEV
VITE_DEBUG=true
```

**Staging** (`.env.staging`)
```env
VITE_ENVIRONMENT=staging
VITE_FIREBASE_PROJECT_ID=mudapos-staging
VITE_FIREBASE_API_KEY=staging_key_here
VITE_APP_NAME=MUDA POS STAGING
VITE_DEBUG=false
```

**Production** (`.env.production`)
```env
VITE_ENVIRONMENT=production
VITE_FIREBASE_PROJECT_ID=mudapos-prod
VITE_FIREBASE_API_KEY=prod_key_here
VITE_APP_NAME=MUDA POS
VITE_DEBUG=false
```

**PENTING**: 
- Jangan commit `.env` ke git
- Setiap environment harus memiliki `.env` file sendiri
- API keys harus berbeda per environment
- Production keys harus disimpan aman (bukan di repo)

---

## Build Process

### 1. Local Build
```bash
# Ensure latest dependencies
npm install

# Run tests (if available)
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Verify Build
```bash
# Check build output
ls -la dist/

# Should contain:
# - index.html
# - assets/index-*.js
# - assets/index-*.css
```

### 3. Build Artifacts
```
dist/
├── index.html           (~10 KB)
├── assets/
│   ├── index-*.js      (~2 KB gzip)
│   └── index-*.css     (~5 KB gzip)
└── (other assets)
```

---

## Deployment Methods

### Option 1: Firebase Hosting (Recommended)

**Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# Build project
npm run build

# Deploy
firebase deploy
```

**Firebase.json Configuration**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "redirects": [
      {
        "source": "/**",
        "destination": "/index.html",
        "type": 200
      }
    ],
    "headers": [
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "/css/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/js/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Option 2: Netlify

**Setup**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**netlify.toml Configuration**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: Docker Container

**Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build & Run**
```bash
# Build image
docker build -t mudapos:1.0.0 .

# Run container
docker run -p 3000:3000 mudapos:1.0.0

# Push to registry (if using)
docker tag mudapos:1.0.0 username/mudapos:1.0.0
docker push username/mudapos:1.0.0
```

### Option 4: Traditional Web Server (Apache/Nginx)

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name mudapos.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mudapos.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/mudapos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mudapos.com/privkey.pem;

    # Root directory
    root /var/www/mudapos;
    index index.html;

    # SPA routing - redirect 404 to index.html
    error_page 404 =200 /index.html;

    # Static assets caching
    location ~* \.(js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML caching (no cache)
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # GZIP compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1024;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**Apache Configuration** (.htaccess)
```apache
# Enable mod_rewrite
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files and directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Caching
<IfModule mod_headers.c>
  # Cache assets
  <FilesMatch "\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Don't cache HTML
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>

# GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE application/javascript
</IfModule>
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set correctly
- [ ] Firebase project credentials ready
- [ ] SSL certificate valid (if HTTPS)
- [ ] Domain/DNS configured
- [ ] Database backup created
- [ ] Rollback plan prepared

### Build & Test
- [ ] Production build completed successfully
- [ ] Build artifacts verified
- [ ] Static files generated
- [ ] No build errors/warnings
- [ ] File size acceptable

### Deployment
- [ ] Static files uploaded to server
- [ ] .env variables deployed to server
- [ ] Build artifacts on correct path
- [ ] Server restart/reload completed
- [ ] Health check passed

### Post-Deployment
- [ ] Application loads without errors
- [ ] All pages accessible
- [ ] API connections working
- [ ] SSL certificate valid
- [ ] Performance acceptable
- [ ] Monitoring alerts active

### Verification
- [ ] All features work as expected
- [ ] Database connections stable
- [ ] Authentication working
- [ ] No console errors
- [ ] Load time acceptable
- [ ] Mobile responsive
- [ ] All pages accessible

---

## Monitoring & Logging

### Setup Monitoring

**Google Analytics** (atau service lainnya)
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

**Error Tracking** (Sentry, Rollbar, atau service lainnya)
```html
<script src="https://browser.sentry-cdn.com/..."></script>
<script>
  Sentry.init({
    dsn: "https://...@sentry.io/...",
    environment: "production"
  });
</script>
```

### Server Logs
- Keep access logs untuk troubleshooting
- Monitor error logs reguler
- Setup log rotation jika perlu
- Archive old logs untuk compliance

### Performance Monitoring
- Monitor page load times
- Check API response times
- Monitor database performance
- Track error rates
- Monitor uptime/availability

---

## Rollback Plan

### Quick Rollback (Firebase Hosting)

```bash
# View deployment history
firebase hosting:channel:list

# Deploy to specific version
firebase deploy --only hosting:production
```

### Full Rollback

1. **Backup Current Database** (sebelum rollback)
   ```bash
   # Export database
   # Firebase Console → Firestore → Export Collection
   ```

2. **Revert Code**
   ```bash
   git checkout <previous-commit>
   npm run build
   firebase deploy
   ```

3. **Verify Rollback**
   - Test all major features
   - Check database integrity
   - Monitor error rates
   - Confirm performance

---

## Backup & Recovery

### Database Backup

**Firebase Backups**
1. Go to Firebase Console
2. Firestore Database → Backups
3. Create backup atau enable scheduled backups
4. Verify backup created successfully

**Manual Backup Export**
```bash
# Export Firestore
gcloud firestore export gs://bucket-name/backups/$(date +%Y%m%d)

# Restore from backup
gcloud firestore import gs://bucket-name/backups/20240115
```

### Code Backup

```bash
# Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Branch for hotfix (if needed)
git checkout -b hotfix/critical-issue
# ... fix ...
git push origin hotfix/critical-issue
```

---

## Maintenance Window

### Schedule Maintenance
- Announce maintenance window in advance
- Schedule at low-traffic time
- Plan maintenance for < 1 hour
- Prepare communication for users

### During Maintenance
- Display maintenance page (optional)
- Stop automated tasks
- Backup database
- Deploy updates
- Run tests
- Monitor logs

### After Maintenance
- Verify all services running
- Test critical paths
- Monitor performance
- Re-enable automated tasks
- Notify users maintenance complete

---

## Post-Deployment Support

### First 24 Hours
- [ ] Monitor error rates closely
- [ ] Check performance metrics
- [ ] Verify all users can access
- [ ] Test on various devices
- [ ] Have team on standby for issues

### First Week
- [ ] Collect user feedback
- [ ] Monitor usage patterns
- [ ] Check for performance issues
- [ ] Fix any critical bugs
- [ ] Make performance optimizations

### Ongoing
- [ ] Regular monitoring
- [ ] Monthly security updates
- [ ] Performance optimization
- [ ] User feedback implementation
- [ ] Documentation updates

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate valid)
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if needed)
- [ ] Input validation active
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Sensitive data encrypted
- [ ] API keys secured (.env)
- [ ] Database access controlled
- [ ] Backup encryption enabled
- [ ] Regular security audits scheduled

---

## Performance Optimization

### Before Deployment
```bash
# Check bundle size
npm run build
ls -lh dist/assets/

# Optimize images (if any)
# Minify CSS/JS (Vite handles automatically)
# Enable compression (GZIP)
```

### After Deployment
- Monitor Core Web Vitals
- Track page load times
- Monitor API response times
- Optimize slow endpoints
- Implement caching strategies
- CDN setup (if needed)

---

## Disaster Recovery

### Incident Response
1. **Detect Issue**: Monitor alerts
2. **Notify Team**: Alert on-call engineer
3. **Assess Damage**: Determine impact
4. **Mitigate**: Stop bleeding (e.g., disable feature)
5. **Fix**: Apply fix or rollback
6. **Verify**: Test solution
7. **Document**: Post-mortem analysis

### Data Recovery
- Restore from latest backup
- Verify data integrity
- Sync with any external systems
- Test recovery process regularly

---

## Deployment Automation

### CI/CD Pipeline (GitHub Actions example)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Documentation After Deployment

- [ ] Update deployment logs
- [ ] Document any issues encountered
- [ ] Update runbooks/troubleshooting
- [ ] Create post-mortem if needed
- [ ] Share learnings with team
- [ ] Update deployment guide

---

## Questions?

Lihat file:
- `SETUP.md` - Setup dan development
- `IMPROVEMENTS.md` - Feature documentation
- `QA_CHECKLIST.md` - Testing guide
- `README.md` - Project overview

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Ready for Production
