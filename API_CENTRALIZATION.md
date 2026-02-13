# API Configuration Centralization

## Overview
All API base URLs have been centralized to use a single configuration file, making it easy to change the backend URL without modifying multiple files.

## Configuration Location

### Primary Configuration
**File:** `src/config/api.js`
- Exports `BASE_URL` constant
- Uses environment variable: `VITE_API_BASE_URL`
- Fallback: `http://localhost:8080`

### Environment Variables
**File:** `.env`
```env
# Backend API Base URL
# Uncomment the one you want to use:

# Production
VITE_API_BASE_URL=https://api3.dostenterprises.com

# Railway (backup)
# VITE_API_BASE_URL=https://jiojibackendv1-production.up.railway.app

# Local Development
# VITE_API_BASE_URL=http://localhost:8080
```

## How to Change Backend URL

### Method 1: Update .env file (Recommended)
Simply uncomment the URL you want to use in `.env`:
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

### Method 2: Update config/api.js
Modify the fallback URL in `src/config/api.js`:
```javascript
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://your-default-url.com";
```

## Files Updated

### API Service Files (Already Centralized)
- ✅ `src/api/adminApi.js`
- ✅ `src/api/authApi.js`
- ✅ `src/api/farmerApi.js`
- ✅ `src/api/productApi.js`
- ✅ `src/api/orderApi.js`
- ✅ `src/api/labReportApi.js`
- ✅ `src/api/apiSlice.js` (Redux Toolkit Query)

### Component Files (Updated to use BASE_URL)
- ✅ `src/pages/employees/MyLeaves.jsx`
- ✅ `src/pages/employees/LeaveManagement.jsx`
- ✅ `src/pages/employees/AttendanceManagement.jsx`
- ✅ `src/pages/employees/EmployeeLocationHistory.jsx`
- ✅ `src/pages/employees/EmployeeList.jsx`
- ✅ `src/pages/farmers/FarmerList.jsx`
- ✅ `src/pages/farmers/FarmerDetail.jsx`
- ✅ `src/pages/lab-reports/LabReports.jsx`
- ✅ `src/pages/dashboard/LabDashboard.jsx`
- ✅ `src/pages/dashboard/EmployeeDashboard.jsx`
- ✅ `src/pages/Attendence/Attendence.jsx`
- ✅ `src/pages/EmployeeModule/FarmerRegistration/FarmerRegistration.jsx`
- ✅ `src/pages/EmployeeModule/PreviousHistoryFarmers/PreviousHistory.jsx`
- ✅ `src/pages/EmployeeModule/HistoryOverview/HistoryOverview.jsx`

## Usage Pattern

### Import BASE_URL
```javascript
import { BASE_URL } from '../../config/api';
```

### Use in API Calls
```javascript
const response = await fetch(`${BASE_URL}/api/v1/endpoint`, {
  headers: getAuthHeaders()
});
```

## Benefits
1. **Single Source of Truth**: Change URL in one place (`.env` or `config/api.js`)
2. **Environment-Specific**: Different URLs for dev, staging, production
3. **No Code Changes**: Switch environments by changing `.env` only
4. **Type Safety**: Consistent import pattern across all files
5. **Easy Maintenance**: No need to search/replace URLs across multiple files

## Testing
After changing the backend URL:
1. Update `.env` file
2. Restart dev server: `npm run dev`
3. Or rebuild: `npm run build`
4. Verify API calls are hitting the correct URL

## Notes
- The `.env` file is gitignored for security
- Each developer can have their own `.env` configuration
- Production deployments should set `VITE_API_BASE_URL` in their environment variables
- Vite requires `VITE_` prefix for environment variables to be exposed to the client
