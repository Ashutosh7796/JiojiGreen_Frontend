# Quick Start Guide - Jioji Frontend

## Changing Backend URL

### For Development
Edit `.env` file and uncomment the URL you want:

```env
# Local Development
VITE_API_BASE_URL=http://localhost:8080

# Production
# VITE_API_BASE_URL=https://api3.dostenterprises.com
```

Then restart the dev server:
```bash
npm run dev
```

### For Production Deployment

#### Netlify
Add environment variable in Netlify dashboard:
- Key: `VITE_API_BASE_URL`
- Value: `https://api3.dostenterprises.com`

#### Vercel
Add environment variable in Vercel dashboard:
- Key: `VITE_API_BASE_URL`
- Value: `https://api3.dostenterprises.com`

## Important Files

### API Configuration
- `src/config/api.js` - Central API configuration
- `.env` - Environment variables (not committed to git)

### API Services (Already using centralized config)
- `src/api/adminApi.js` - Admin operations
- `src/api/authApi.js` - Authentication
- `src/api/farmerApi.js` - Farmer management
- `src/api/productApi.js` - Product operations
- `src/api/orderApi.js` - Order management
- `src/api/labReportApi.js` - Lab reports

## Build & Deploy

### Local Build
```bash
npm run build
```

### Test Build Locally
```bash
npm run preview
```

### Deploy to Netlify
```bash
git push origin master
```
Netlify will automatically build and deploy.

## Troubleshooting

### API calls failing?
1. Check `.env` file has correct `VITE_API_BASE_URL`
2. Restart dev server after changing `.env`
3. Clear browser cache
4. Check browser console for actual URL being called

### Build failing?
1. Run `npm run build` locally first
2. Check for TypeScript/ESLint errors
3. Verify all imports are correct
4. Check Netlify build logs

## Environment Variables

### Required
- `VITE_API_BASE_URL` - Backend API URL

### Optional
Add more as needed in `.env` file with `VITE_` prefix.

## Notes
- All environment variables must start with `VITE_` to be accessible in the app
- `.env` file is gitignored - each developer needs their own
- Production deployments should set environment variables in hosting platform
- Changes to `.env` require dev server restart
