process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'loginapp';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.DB_PORT = process.env.DB_PORT || '5432';
