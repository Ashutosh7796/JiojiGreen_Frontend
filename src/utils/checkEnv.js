// Utility to check environment variables
// This helps debug environment variable issues

export const checkEnvironment = () => {
  console.log('=== Environment Check ===');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Mode:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('Prod:', import.meta.env.PROD);
  console.log('========================');
};

// Call this in your main.jsx or App.jsx to verify
