# AWS Amplify Deployment Guide

This guide provides instructions for deploying the Recipe Finder application to AWS Amplify via GitHub.

## Prerequisites

Before deploying, make sure you have:

1. An AWS account with Amplify access
2. A GitHub repository with your code
3. A production database (PostgreSQL recommended)
4. All environment variables set up (see Environment Variables section)

## AWS Amplify Setup

### 1. Connect GitHub Repository

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "Get started" or "New app"
3. Select "GitHub" as the repository service
4. Authenticate with GitHub and select the repository
5. Choose the branch to deploy (main or develop)

### 2. Configure Build Settings

AWS Amplify will automatically detect the Next.js framework, but we need to customize the build settings:

1. In the "Build settings" section, click "Edit"
2. Under "Build and test settings", select "Custom"
3. Copy the contents of `amplify.yml` into the build settings editor
4. Save the build settings

### 3. Configure Environment Variables

Add the following environment variables in the AWS Amplify console:

```
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.amplifyapp.com"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 4. Database Migration

After deployment, you'll need to run the database migrations:

1. Go to the AWS Amplify console
2. Navigate to your app
3. Click on "Backend environments" > "Backend"
4. In the "Build settings" section, add a post-build script:

```bash
npx prisma migrate deploy
```

## Monorepo Configuration

This project is structured as a monorepo with two Next.js applications:

1. **Main Application** (root directory) - Runs on port 3001
2. **Recipe App** (recipe-app directory) - Runs on port 3000

The AWS Amplify configuration is set up to build both applications but deploy the main application by default.

### Deploying the Recipe App Instead

If you want to deploy the recipe-app instead of the main application:

1. Modify the `amplify.yml` file:
   ```yaml
   artifacts:
     baseDirectory: recipe-app/.next
     files:
       - '**/*'
   ```

2. Update the build script in `scripts/amplify-build.sh` to only build the recipe-app

## Custom Domains

To use a custom domain with AWS Amplify:

1. Go to the AWS Amplify console
2. Navigate to your app
3. Click on "Domain management"
4. Add your custom domain
5. Follow the DNS configuration instructions

## Monitoring and Logging

AWS Amplify provides built-in monitoring and logging:

1. **Build Logs**: View build output and errors in the Amplify console
2. **Application Logs**: Access application logs through CloudWatch
3. **Monitoring**: Set up alarms and notifications in CloudWatch

## Troubleshooting

### Build Failures

If your build fails:

1. Check the build logs in the AWS Amplify console
2. Verify all environment variables are correctly set
3. Ensure the database is accessible
4. Check that all dependencies are installed correctly

### Database Connection Issues

If you encounter database connection issues:

1. Verify the DATABASE_URL is correct
2. Ensure your database allows connections from AWS Amplify
3. Check that database migrations have been run

### Port Configuration

If you encounter port-related issues:

1. The main application is configured to run on port 3001
2. The recipe-app is configured to run on port 3000
3. AWS Amplify will automatically route to the correct port

## Rollbacks

If you need to rollback to a previous deployment:

1. Go to the AWS Amplify console
2. Navigate to your app
3. Click on "Deployments"
4. Select the deployment you want to rollback to
5. Click "Rollback"

## Continuous Deployment

The project is configured with GitHub Actions for CI/CD:

1. Pushes to the `main` branch trigger production deployment
2. Pushes to the `develop` branch trigger staging deployment
3. Pull requests trigger CI tests

The GitHub Actions workflow is located in `.github/workflows/ci.yml`.

## Cost Optimization

To optimize costs with AWS Amplify:

1. Enable auto-scaling to handle traffic spikes
2. Use environment variables for different deployment stages
3. Monitor usage and adjust instance sizes accordingly
4. Set up budget alerts in AWS

## Security Considerations

1. Store sensitive data in environment variables, not in code
2. Use HTTPS for all connections
3. Regularly update dependencies
4. Implement proper authentication and authorization
5. Monitor for security vulnerabilities

## Support

If you encounter issues not covered in this guide:

1. Check the [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Check the project's GitHub issues
4. Contact AWS Support for platform-specific issues