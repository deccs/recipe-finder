#!/usr/bin/env node

/**
 * AWS Amplify Environment Variables Setup Script
 *
 * This script helps you set up the required environment variables for AWS Amplify deployment.
 * It will:
 * 1. Check if .env.amplify exists
 * 2. If not, create it from the template
 * 3. Guide you through setting up the required variables
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const templatePath = path.join(__dirname, '..', '.env.amplify.template');
const envPath = path.join(__dirname, '..', '.env.amplify');

// Questions for environment variables
const questions = [
  {
    key: 'DATABASE_URL',
    message: 'Enter your PostgreSQL database URL:',
    required: true,
    example: 'postgresql://username:password@host:port/database'
  },
  {
    key: 'NEXTAUTH_SECRET',
    message: 'Enter your NextAuth secret:',
    required: true,
    example: 'a-super-secret-random-string'
  },
  {
    key: 'NEXTAUTH_URL',
    message: 'Enter your NextAuth URL (leave blank to generate later):',
    required: false,
    example: 'https://your-app-name.amplifyapp.com'
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    message: 'Enter your Google Client ID (optional, leave blank if not using):',
    required: false
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    message: 'Enter your Google Client Secret (optional, leave blank if not using):',
    required: false
  },
  {
    key: 'GITHUB_CLIENT_ID',
    message: 'Enter your GitHub Client ID (optional, leave blank if not using):',
    required: false
  },
  {
    key: 'GITHUB_CLIENT_SECRET',
    message: 'Enter your GitHub Client Secret (optional, leave blank if not using):',
    required: false
  },
  {
    key: 'AWS_ACCESS_KEY_ID',
    message: 'Enter your AWS Access Key ID:',
    required: true
  },
  {
    key: 'AWS_SECRET_ACCESS_KEY',
    message: 'Enter your AWS Secret Access Key:',
    required: true
  },
  {
    key: 'AWS_REGION',
    message: 'Enter your AWS Region:',
    required: true,
    example: 'us-east-1'
  },
  {
    key: 'AMPLIFY_APP_ID_STAGING',
    message: 'Enter your AWS Amplify Staging App ID:',
    required: true
  },
  {
    key: 'AMPLIFY_APP_ID_PROD',
    message: 'Enter your AWS Amplify Production App ID:',
    required: true
  }
];

// Function to ask a question
function askQuestion(question) {
  return new Promise((resolve) => {
    const prompt = question.message + (question.example ? ` (Example: ${question.example})` : '') + ': ';
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function main() {
  console.log('🚀 AWS Amplify Environment Variables Setup\n');
  
  // Check if .env.amplify already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.amplify already exists. Do you want to overwrite it? (y/n)');
    const overwrite = await askQuestion({ message: 'Overwrite existing .env.amplify?' });
    
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled. Existing .env.amplify file was not modified.');
      rl.close();
      return;
    }
  }
  
  // Read the template file
  let templateContent;
  try {
    templateContent = fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('❌ Error reading template file:', error.message);
    rl.close();
    return;
  }
  
  // Ask questions and collect answers
  const answers = {};
  for (const question of questions) {
    let answer;
    do {
      answer = await askQuestion(question);
      
      if (question.required && !answer) {
        console.log(`❌ ${question.key} is required. Please provide a value.`);
      }
    } while (question.required && !answer);
    
    answers[question.key] = answer;
  }
  
  // Replace placeholders in template
  let envContent = templateContent;
  for (const [key, value] of Object.entries(answers)) {
    const regex = new RegExp(`${key}="[^"]*"`, 'g');
    envContent = envContent.replace(regex, `${key}="${value}"`);
  }
  
  // Generate URLs if not provided
  if (!answers.NEXTAUTH_URL) {
    const stagingUrl = `https://staging-${answers.AMPLIFY_APP_ID_STAGING}.amplifyapp.com`;
    const prodUrl = `https://prod-${answers.AMPLIFY_APP_ID_PROD}.amplifyapp.com`;
    
    envContent = envContent.replace(/NEXTAUTH_URL="[^"]*"/, `NEXTAUTH_URL="${prodUrl}"`);
    envContent = envContent.replace(/NEXTAUTH_URL_STAGING="[^"]*"/, `NEXTAUTH_URL_STAGING="${stagingUrl}"`);
    envContent = envContent.replace(/NEXTAUTH_URL_PROD="[^"]*"/, `NEXTAUTH_URL_PROD="${prodUrl}"`);
    
    console.log(`\n📝 Generated URLs:`);
    console.log(`   Staging: ${stagingUrl}`);
    console.log(`   Production: ${prodUrl}`);
  }
  
  // Generate secrets if not provided
  if (!answers.NEXTAUTH_SECRET) {
    const crypto = require('crypto');
    const stagingSecret = crypto.randomBytes(32).toString('hex');
    const prodSecret = crypto.randomBytes(32).toString('hex');
    
    envContent = envContent.replace(/NEXTAUTH_SECRET="[^"]*"/, `NEXTAUTH_SECRET="${prodSecret}"`);
    envContent = envContent.replace(/NEXTAUTH_SECRET_STAGING="[^"]*"/, `NEXTAUTH_SECRET_STAGING="${stagingSecret}"`);
    envContent = envContent.replace(/NEXTAUTH_SECRET_PROD="[^"]*"/, `NEXTAUTH_SECRET_PROD="${prodSecret}"`);
    
    console.log(`\n🔐 Generated secrets:`);
    console.log(`   Staging: ${stagingSecret}`);
    console.log(`   Production: ${prodSecret}`);
  }
  
  // Write the .env.amplify file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`\n✅ .env.amplify file created successfully at ${envPath}`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Add the environment variables from .env.amplify to your GitHub repository secrets`);
    console.log(`   2. Add the environment variables to your AWS Amplify console`);
    console.log(`   3. Connect your GitHub repository to AWS Amplify`);
    console.log(`   4. Deploy your application`);
  } catch (error) {
    console.error('❌ Error writing .env.amplify file:', error.message);
  }
  
  rl.close();
}

// Run the main function
main().catch(console.error);