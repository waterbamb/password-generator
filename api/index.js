// SkillPay Billing Integration
const BILLING_URL = 'https://skillpay.me/api/v1/billing';
const API_KEY = process.env.SKILLPAY_API_KEY;
let SKILL_ID = '06e166ee-1aa8-4fe3-b066-54e972efc89d';
const PRICE_PER_CALL = 0.02;

// Charge user
async function chargeUser(userId) {
  if (!userId) return { ok: true };
  
  try {
    const response = await fetch(BILLING_URL + '/charge', {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        skill_id: SKILL_ID,
        amount: PRICE_PER_CALL,
      })
    });
    const data = await response.json();
    
    if (data.success) {
      return { ok: true, balance: data.balance };
    }
    return { ok: false, balance: data.balance, payment_url: data.payment_url };
  } catch (error) {
    console.error('Billing error:', error.message);
    return { ok: false, error: error.message };
  }
}

// Character sets
const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Cryptographically secure random number generator
function secureRandom(max) {
  const array = new Uint32Array(1);
  const crypto = require('crypto');
  crypto.webcrypto.getRandomValues(array);
  return array[0] % max;
}

// Generate password
function generatePassword(options) {
  const {
    length = 16,
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = true,
    excludeSimilar = false,
    excludeAmbiguous = false
  } = options;

  // Build character pool
  let pool = '';
  if (lowercase) pool += CHAR_SETS.lowercase;
  if (uppercase) pool += CHAR_SETS.uppercase;
  if (numbers) pool += CHAR_SETS.numbers;
  if (symbols) pool += CHAR_SETS.symbols;

  // Exclude similar characters (i, l, 1, L, o, 0, O)
  if (excludeSimilar) {
    pool = pool.replace(/[il1Lo0O]/g, '');
  }

  // Exclude ambiguous symbols
  if (excludeAmbiguous) {
    pool = pool.replace(/[{}[\]()<>`'"/\\|]/g, '');
  }

  if (pool.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  // Generate password
  let password = '';
  for (let i = 0; i < length; i++) {
    password += pool[secureRandom(pool.length)];
  }

  return password;
}

// Calculate password strength
function calculateStrength(password) {
  let score = 0;
  
  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  
  // Character variety score
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Entropy calculation
  const charsetSize = 
    (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/[0-9]/.test(password) ? 10 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 32 : 0);
  
  const entropy = Math.log2(Math.pow(charsetSize, password.length));
  
  let level;
  if (score < 4) level = 'weak';
  else if (score < 6) level = 'medium';
  else if (score < 8) level = 'strong';
  else level = 'very-strong';
  
  return {
    score,
    level,
    entropy: Math.round(entropy),
    charsetSize
  };
}

// Generate multiple passwords
function generateMultiplePasswords(count, options) {
  const passwords = [];
  for (let i = 0; i < count; i++) {
    passwords.push(generatePassword(options));
  }
  return passwords;
}

// Generate passphrase (word-based password)
function generatePassphrase(wordCount = 4, separator = '-') {
  const words = [
    'apple', 'brave', 'cloud', 'delta', 'eagle', 'focus', 'globe', 'house',
    'input', 'jolly', 'kite', 'lemon', 'mango', 'noble', 'ocean', 'pilot',
    'quest', 'river', 'stone', 'tiger', 'unity', 'vivid', 'world', 'xenon',
    'yield', 'zebra', 'amber', 'blaze', 'coral', 'drift', 'ember', 'flora',
    'glide', 'haven', 'ivory', 'jewel', 'karma', 'lunar', 'mirth', 'nova',
    'orbit', 'pulse', 'quartz', 'radar', 'solar', 'terra', 'ultra', 'vapor',
    'whim', 'xerox', 'yonder', 'zenith', 'alpha', 'bravo', 'chrome', 'dynamo'
  ];
  
  const passphrase = [];
  for (let i = 0; i < wordCount; i++) {
    const word = words[secureRandom(words.length)];
    passphrase.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  
  return passphrase.join(separator);
}

// Main API handler
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const {
      userId,
      demo = 'false',
      length = '16',
      lowercase = 'true',
      uppercase = 'true',
      numbers = 'true',
      symbols = 'true',
      excludeSimilar = 'false',
      excludeAmbiguous = 'false',
      count = '1',
      type = 'password' // password or passphrase
    } = req.query;
    
    // Billing (skip for demo mode)
    if (demo !== 'true' && userId) {
      const charge = await chargeUser(userId);
      if (!charge.ok) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient balance',
          balance: charge.balance,
          paymentUrl: charge.payment_url,
          message: 'Please top up your balance to use this skill'
        });
      }
    }
    
    const passwordLength = parseInt(length) || 16;
    const passwordCount = Math.min(parseInt(count) || 1, 10); // Max 10 at a time
    
    let passwords = [];
    
    if (type === 'passphrase') {
      // Generate passphrase
      for (let i = 0; i < passwordCount; i++) {
        passwords.push(generatePassphrase(passwordLength, excludeSimilar ? '_' : '-'));
      }
    } else {
      // Generate regular password
      const options = {
        length: passwordLength,
        lowercase: lowercase === 'true',
        uppercase: uppercase === 'true',
        numbers: numbers === 'true',
        symbols: symbols === 'true',
        excludeSimilar: excludeSimilar === 'true',
        excludeAmbiguous: excludeAmbiguous === 'true'
      };
      
      passwords = generateMultiplePasswords(passwordCount, options);
    }
    
    // Calculate strength for first password
    const strength = calculateStrength(passwords[0]);
    
    res.json({
      success: true,
      type,
      passwords,
      count: passwords.length,
      strength,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
