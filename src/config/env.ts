import dotenv from 'dotenv';

dotenv.config();

export const env = {
    DATABASE_URL: process.env.DATABASE_URL || process.env.MONGODB_URI || '',
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'railway-default-secret-key-2024',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://arwaeduc.enovazoneacadimeca.com',
    PROXY_TARGET: process.env.PROXY_TARGET || 'http://127.0.0.1:3001',
};

// Validate required environment variables
const skipDbCheck = process.env.SKIP_DB_CHECK === 'true';
const isProduction = env.NODE_ENV === 'production';

if (!env.DATABASE_URL && !skipDbCheck) {
    if (isProduction) {
        console.warn('⚠️  WARNING: DATABASE_URL not found in production environment');
    } else {
        console.error('\n❌ ERROR: DATABASE_URL (or MONGODB_URI) is missing!');
        console.error('Please set DATABASE_URL or MONGODB_URI in your environment variables.');
        console.error('Example: DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/school_management"\n');
        throw new Error('DATABASE_URL or MONGODB_URI is required in environment variables. If you want to skip this check (e.g. during build), set SKIP_DB_CHECK=true');
    }
}

if (!env.JWT_SECRET || env.JWT_SECRET === 'your-secret-key') {
    if (isProduction) {
        console.warn('⚠️  WARNING: JWT_SECRET not properly configured in production');
    } else {
        console.warn('\n⚠️  WARNING: JWT_SECRET is not set or using default value!');
        console.warn('Please set JWT_SECRET in your environment variables for better security.\n');
    }
}

console.log('✅ Environment configuration loaded successfully');
