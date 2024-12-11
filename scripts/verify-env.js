const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env.local file:', error);
    return null;
  }
}

function verifyEnvVariables() {
  const env = loadEnvFile();
  if (!env) return;

  console.log('\nEnvironment Variables Check:');
  console.log('---------------------------');
  
  const requiredVars = ['D_ID_API_KEY'];
  
  requiredVars.forEach(varName => {
    const value = env[varName];
    if (!value) {
      console.log(`❌ ${varName} is missing`);
    } else {
      console.log(`✓ ${varName} is present (starts with: ${value.substring(0, 10)}...)`);
    }
  });
}

verifyEnvVariables();
