# Database Seeding Guide

To fix the login error (401), you must seed the database with the admin user.

## Prerequisites

Ensure your `DATABASE_URL` is correctly set in your environment variables (in `.env` locally or in Coolify for production).

## How to Seed

### Option 1: Using NPM Script (Recommended)

Run the following command in your terminal:

```bash
npx prisma db seed
```

### Option 2: Running the Script Directly

If the above command fails, try:

```bash
npx ts-node prisma/seed.ts
```

## Expected Output

You should see output similar to this:

```
Starting database seed...
✅ Admin account created: { ... }
✅ Secretary account created: { ... }

📋 Login Credentials:

🔐 ADMIN:
Email: enovazone@arwaeduc.com
Password: abdessamade123
...
✅ Database seed completed!
```

## Troubleshooting

-   **Error: "P1001: Can't reach database server"**: Check your `DATABASE_URL`.
-   **Error: "MODULE_NOT_FOUND"**: Ensure you have installed dependencies with `npm install`.
