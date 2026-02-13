# Troubleshooting Guide

## Environment Variables Not Working

### Problem: App still uses localhost even though .env has production URL

**Root Cause:** Vite caches environment variables when the dev server starts.

### Solution:

#### Step 1: Verify .env file
Make sure your `.env` file has the correct variable name:
```env
VITE_API_BASE_URL=https://api3.dostenterprises.com
```

**Important:** 
- Variable must be named `VITE_API_BASE_URL` (not `VITE_API_URL`)
- No spaces around the `=` sign
- No quotes needed around the URL

#### Step 2: Stop the dev server
Press `Ctrl+C` in the terminal where `npm run dev` is running.

#### Step 3: Clear Vite cache
**Windows:**
```bash
rmdir /s /q node_modules\.vite
```

**Mac/Linux:**
```bash
rm -rf node_modules/.vite
```

#### Step 4: Restart dev server
```bash
npm run dev
```

#### Step 5: Check browser console
Open browser DevTools (F12) and look for these logs:
```
🔧 API BASE_URL: https://api3.dostenterprises.com
🔧 Environment Variable: https://api3.dostenterprises.com
```

If you see `http://localhost:8080`, the environment variable is not loaded.

### Common Mistakes

1. **Wrong variable name**
   - ❌ `VITE_API_URL`
   - ✅ `VITE_API_BASE_URL`

2. **Forgot to restart dev server**
   - Changes to `.env` require server restart

3. **Spaces in .env file**
   - ❌ `VITE_API_BASE_URL = https://...`
   - ✅ `VITE_API_BASE_URL=https://...`

4. **Quotes around URL**
   - ❌ `VITE_API_BASE_URL="https://..."`
   - ✅ `VITE_API_BASE_URL=https://...`

5. **Wrong .env file location**
   - Must be in project root (same level as `package.json`)

### Still Not Working?

1. **Check if .env file exists in project root:**
   ```bash
   dir .env    # Windows
   ls -la .env # Mac/Linux
   ```

2. **Verify file content:**
   ```bash
   type .env   # Windows
   cat .env    # Mac/Linux
   ```

3. **Check for multiple .env files:**
   - `.env.local` overrides `.env`
   - `.env.development` overrides `.env` in dev mode
   - `.env.production` overrides `.env` in production

4. **Hard refresh browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

5. **Check Network tab in DevTools:**
   - Open DevTools (F12)
   - Go to Network tab
   - Look at the actual URLs being called

## Build Issues

### Problem: Build works locally but fails on Netlify

**Solution:**
1. Add environment variable in Netlify dashboard
2. Go to: Site settings → Environment variables
3. Add: `VITE_API_BASE_URL` = `https://api3.dostenterprises.com`
4. Trigger new deploy

### Problem: API calls work in dev but not in production build

**Solution:**
1. Test production build locally:
   ```bash
   npm run build
   npm run preview
   ```
2. Check browser console for errors
3. Verify environment variable is set in hosting platform

## CORS Issues

### Problem: API calls blocked by CORS

**Symptoms:**
- Error: "Access to fetch has been blocked by CORS policy"
- Network tab shows failed requests

**Solution:**
Backend must allow your frontend domain in CORS settings.

## Authentication Issues

### Problem: Token not being sent with requests

**Check:**
1. Token exists in localStorage: `localStorage.getItem('token')`
2. Check Network tab → Headers → Authorization header
3. Verify token format: `Bearer <token>`

## Need More Help?

1. Check browser console for error messages
2. Check Network tab in DevTools
3. Verify backend is running and accessible
4. Test API directly with Postman/curl
