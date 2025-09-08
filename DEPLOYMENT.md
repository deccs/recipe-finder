# Recipe Finder Deployment Guide

This guide provides instructions for deploying the Recipe Finder application to various platforms.

## Prerequisites

Before deploying, make sure you have:

1. A PostgreSQL database instance
2. All environment variables set up (see `.env.example`)
3. Node.js 18.x or higher installed
4. npm or yarn package manager

## Environment Variables

Create a `.env.local` file with the following environment variables:

```
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Deployment Platforms

### Vercel (Recommended)

1. Push your code to a GitHub repository
2. Connect your GitHub account to Vercel
3. Import the repository
4. Add environment variables in the Vercel dashboard
5. Deploy

Vercel will automatically detect that it's a Next.js application and configure the deployment settings.

### Netlify

1. Push your code to a GitHub repository
2. Connect your GitHub account to Netlify
3. Import the repository
4. Set the build command to `npm run build`
5. Set the publish directory to `.next`
6. Add environment variables in the Netlify dashboard
7. Deploy

### AWS Amplify

1. Push your code to a GitHub repository
2. Connect your GitHub account to AWS Amplify
3. Choose "Next.js" as the framework preset
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables in the Amplify console
6. Deploy

### DigitalOcean App Platform

1. Push your code to a GitHub repository
2. Connect your GitHub account to DigitalOcean
3. Create a new app and select your repository
4. Configure the app:
   - Build command: `npm run build`
   - Run command: `npm start`
   - Output directory: `.next`
5. Add environment variables
6. Deploy

### Docker

1. Create a `Dockerfile` in the root of your project:

```Dockerfile
# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
```

2. Build the Docker image:
   ```
   docker build -t recipe-finder .
   ```

3. Run the container:
   ```
   docker run -p 3000:3000 -e DATABASE_URL=your-db-url recipe-finder
   ```

## Database Migration

After deployment, you'll need to run the database migrations:

1. Connect to your deployment environment
2. Install dependencies: `npm ci`
3. Run Prisma migrations: `npx prisma migrate deploy`
4. Generate Prisma client: `npx prisma generate`

## Post-Deployment Checks

After deployment, perform the following checks:

1. Verify the application loads correctly
2. Test user registration and login
3. Create a recipe and verify it displays correctly
4. Test adding a recipe to favorites
5. Create a shopping list and add items to it
6. Test the timer functionality
7. Check that all pages are responsive on different device sizes

## Monitoring and Maintenance

1. Set up monitoring for your application (e.g., Vercel Analytics, AWS CloudWatch)
2. Configure error tracking (e.g., Sentry, LogRocket)
3. Set up automated backups for your database
4. Regularly update dependencies and run security audits
5. Monitor application performance and optimize as needed

## Troubleshooting

If you encounter issues during deployment:

1. Check the deployment logs for error messages
2. Verify all environment variables are correctly set
3. Ensure the database is accessible and migrations have been run
4. Check that all dependencies are installed correctly
5. Verify the build process completes without errors

For more detailed troubleshooting, refer to the documentation of your chosen deployment platform.