const jwt = require('jsonwebtoken');
const { config } = require('dotenv');

// Load environment variables
config();

// Get JWT secret from environment (same as in your app)
const JWT_SECRET = process.env.JWT_SECRET || 'superSecret123';
const JWT_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';

/**
 * Generate JWT token for a user (mimics auth.service.ts generateAccessToken)
 * @param {Object} user - User object with username and role
 * @returns {string} JWT token
 */
function generateJWT(user) {
    return jwt.sign(
        { 
            username: user.username, 
            role: user.role 
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRY
        }
    );
}

// If called directly from command line
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node generate-jwt.js <username> <role>');
        console.log('Example: node generate-jwt.js admin@admin.com ADMIN');
        process.exit(1);
    }
    
    const [username, role] = args;
    
    const user = {
        username: username,
        role: role
    };
    
    const token = generateJWT(user);
    
    console.log('🔑 Generated JWT Token:');
    console.log(token);
    console.log('\n📋 Use in curl:');
    console.log(`curl -X POST http://localhost:3000/admin/sync-products \\`);
    console.log(`  -H "Authorization: Bearer ${token}"`);
}

module.exports = { generateJWT };
