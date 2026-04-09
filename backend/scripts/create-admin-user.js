const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// Database configuration - override via environment variables
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'nestuser',
  password: process.env.DB_PASSWORD || 'nestpassword',
  database: process.env.DB_NAME || 'backend_db',
  synchronize: false,
});

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD || '$ocialLead$123!';

  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Check if admin already exists
    const existing = await AppDataSource.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      console.log('Admin user already exists:', existing[0].email);
      return;
    }

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);

    await AppDataSource.query(
      `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`,
      [email, email, hashedPassword, 'ADMIN']
    );

    console.log(`Admin user created: ${email}`);
    console.log('You can now log in with these credentials.');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

createAdminUser();
