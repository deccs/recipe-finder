#!/usr/bin/env node

/**
 * AWS Amplify Deployment Configuration Test Script
 *
 * This script validates the deployment configuration for AWS Amplify.
 * It will:
 * 1. Check if all required files exist
 * 2. Validate the configuration files
 * 3. Check for common issues
 * 4. Provide recommendations
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Required files for AWS Amplify deployment
const requiredFiles = [
  'amplify.yml',
  'package.json',
  'recipe-app/package.json',
  'next.config.js',
  'recipe-app/next.config.ts',
  'prisma/schema.prisma',
  '.env.amplify.template'
];

// Optional but recommended files
const recommendedFiles = [
  'pnpm-workspace.yaml',
  'turbo.json',
  'scripts/amplify-build.sh',
  'AMPLIFY_DEPLOYMENT.md',
  'MONOREPO.md'
];

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

// Function to read and parse a YAML file
function readYamlFile(filePath) {
  try {
    const fileContent = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    return yaml.load(fileContent);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Function to read and parse a JSON file
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Function to validate amplify.yml
function validateAmplifyYml(config) {
  const issues = [];
  
  if (!config.version) {
    issues.push('Missing version in amplify.yml');
  }
  
  if (!config.frontend) {
    issues.push('Missing frontend configuration in amplify.yml');
  } else {
    if (!config.frontend.phases) {
      issues.push('Missing phases configuration in amplify.yml');
    } else {
      if (!config.frontend.phases.preBuild) {
        issues.push('Missing preBuild phase in amplify.yml');
      }
      if (!config.frontend.phases.build) {
        issues.push('Missing build phase in amplify.yml');
      }
    }
    
    if (!config.frontend.artifacts) {
      issues.push('Missing artifacts configuration in amplify.yml');
    } else {
      if (!config.frontend.artifacts.baseDirectory) {
        issues.push('Missing baseDirectory in artifacts configuration');
      }
      if (!config.frontend.artifacts.files) {
        issues.push('Missing files in artifacts configuration');
      }
    }
  }
  
  return issues;
}

// Function to validate package.json
function validatePackageJson(config, isRoot = true) {
  const issues = [];
  
  if (!config.name) {
    issues.push('Missing name in package.json');
  }
  
  if (!config.scripts) {
    issues.push('Missing scripts in package.json');
  } else {
    if (isRoot) {
      if (!config.scripts.build) {
        issues.push('Missing build script in root package.json');
      }
      if (!config.scripts.dev) {
        issues.push('Missing dev script in root package.json');
      }
    } else {
      if (!config.scripts.build) {
        issues.push('Missing build script in recipe-app package.json');
      }
      if (!config.scripts.dev) {
        issues.push('Missing dev script in recipe-app package.json');
      }
    }
  }
  
  return issues;
}

// Function to validate Prisma schema
function validatePrismaSchema(schemaContent) {
  const issues = [];
  
  if (!schemaContent.includes('datasource db')) {
    issues.push('Missing datasource db configuration in Prisma schema');
  }
  
  if (schemaContent.includes('provider = "sqlite"')) {
    issues.push('Using SQLite in Prisma schema. PostgreSQL is recommended for production.');
  }
  
  return issues;
}

// Main function
function main() {
  console.log('🧪 AWS Amplify Deployment Configuration Test\n');
  
  let allTestsPassed = true;
  
  // Check required files
  console.log('📋 Checking required files:');
  const missingFiles = [];
  for (const file of requiredFiles) {
    if (fileExists(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (MISSING)`);
      missingFiles.push(file);
      allTestsPassed = false;
    }
  }
  
  // Check recommended files
  console.log('\n📋 Checking recommended files:');
  for (const file of recommendedFiles) {
    if (fileExists(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ⚠️  ${file} (RECOMMENDED)`);
    }
  }
  
  if (missingFiles.length > 0) {
    console.log(`\n❌ Missing ${missingFiles.length} required files. Please create them before proceeding.`);
    return;
  }
  
  // Validate amplify.yml
  console.log('\n🔍 Validating amplify.yml:');
  const amplifyConfig = readYamlFile('amplify.yml');
  if (amplifyConfig) {
    const amplifyIssues = validateAmplifyYml(amplifyConfig);
    if (amplifyIssues.length === 0) {
      console.log('   ✅ amplify.yml is valid');
    } else {
      console.log('   ❌ amplify.yml has issues:');
      for (const issue of amplifyIssues) {
        console.log(`      - ${issue}`);
      }
      allTestsPassed = false;
    }
  }
  
  // Validate root package.json
  console.log('\n🔍 Validating root package.json:');
  const rootPackageJson = readJsonFile('package.json');
  if (rootPackageJson) {
    const rootPackageIssues = validatePackageJson(rootPackageJson, true);
    if (rootPackageIssues.length === 0) {
      console.log('   ✅ Root package.json is valid');
    } else {
      console.log('   ❌ Root package.json has issues:');
      for (const issue of rootPackageIssues) {
        console.log(`      - ${issue}`);
      }
      allTestsPassed = false;
    }
  }
  
  // Validate recipe-app package.json
  console.log('\n🔍 Validating recipe-app package.json:');
  const recipePackageJson = readJsonFile('recipe-app/package.json');
  if (recipePackageJson) {
    const recipePackageIssues = validatePackageJson(recipePackageJson, false);
    if (recipePackageIssues.length === 0) {
      console.log('   ✅ Recipe app package.json is valid');
    } else {
      console.log('   ❌ Recipe app package.json has issues:');
      for (const issue of recipePackageIssues) {
        console.log(`      - ${issue}`);
      }
      allTestsPassed = false;
    }
  }
  
  // Validate Prisma schema
  console.log('\n🔍 Validating Prisma schema:');
  try {
    const prismaSchema = fs.readFileSync(path.join(rootDir, 'prisma/schema.prisma'), 'utf8');
    const prismaIssues = validatePrismaSchema(prismaSchema);
    if (prismaIssues.length === 0) {
      console.log('   ✅ Prisma schema is valid');
    } else {
      console.log('   ⚠️  Prisma schema has issues:');
      for (const issue of prismaIssues) {
        console.log(`      - ${issue}`);
      }
      // Prisma issues are warnings, not failures
    }
  } catch (error) {
    console.log('   ❌ Error reading Prisma schema:', error.message);
    allTestsPassed = false;
  }
  
  // Check for port conflicts
  console.log('\n🔍 Checking for port conflicts:');
  const mainAppPort = rootPackageJson?.scripts?.dev?.match(/-p (\d+)/)?.[1] || '3000';
  const recipeAppPort = recipePackageJson?.scripts?.dev?.match(/-p (\d+)/)?.[1] || '3000';
  
  if (mainAppPort === recipeAppPort) {
    console.log(`   ❌ Port conflict: Both apps are configured to use port ${mainAppPort}`);
    allTestsPassed = false;
  } else {
    console.log(`   ✅ No port conflicts: Main app on port ${mainAppPort}, Recipe app on port ${recipeAppPort}`);
  }
  
  // Final result
  console.log('\n📊 Test Results:');
  if (allTestsPassed) {
    console.log('   ✅ All tests passed! Your project is ready for AWS Amplify deployment.');
    console.log('\n📝 Next steps:');
    console.log('   1. Run "npm run setup:amplify" to configure your environment variables');
    console.log('   2. Push your code to GitHub');
    console.log('   3. Connect your GitHub repository to AWS Amplify');
    console.log('   4. Deploy your application');
  } else {
    console.log('   ❌ Some tests failed. Please fix the issues above before deploying.');
  }
}

// Run the main function
(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
  }
})();