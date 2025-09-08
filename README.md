# Recipe Finder

A modern recipe management application built with Next.js 15, TypeScript, and Tailwind CSS. Browse, create, and manage your favorite recipes with ease.

## Features

- 🔐 User Authentication: Secure login and registration system
- 🍳 Recipe Management: Browse, search, create, and edit recipes
- ⭐ Favorites System: Save your favorite recipes for quick access
- 🛒 Shopping Lists: Create and manage shopping lists with ingredients from recipes
- ⏱️ Cooking Timers: Set multiple timers for different cooking steps with notifications
- 📱 Responsive Design: Works seamlessly on all device sizes
- 🚀 Performance Optimized: Fast loading and search engine friendly

## Tech Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- Backend: Next.js API routes, Prisma ORM, PostgreSQL
- Authentication: NextAuth.js
- State Management: React Context and useReducer
- Testing: Jest, React Testing Library
- CI/CD: GitHub Actions
- Code Quality: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/deccs/recipe-finder.git
cd recipe-finder
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Then fill in your environment variables in `.env.local`:

```txt
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests

## ESLint Setup

This project uses ESLint with TypeScript support to maintain code quality and consistency. The setup has been migrated from the deprecated next lint to the modern ESLint CLI.

### Setting up ESLint for Your Project

1. Install ESLint dependencies:

```bash
npm install eslint @eslint/eslintrc eslint-config-next --save-dev
```

2. Migrate from next lint to ESLint CLI (if upgrading from an older Next.js version):

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

This command will:
- Create a new eslint.config.mjs file with proper configuration
- Update the package.json lint script from "next lint" to "eslint ."
- Add necessary dependencies

3. Configure ESLint:

The `eslint.config.mjs` file extends Next.js's recommended configurations for TypeScript and web vitals:

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
```

4. Run ESLint:

```bash
npm run lint
```

### Fix ESLint issues

The project includes a comprehensive list of ESLint rules to catch common issues. Run the lint command regularly to identify and fix:
- TypeScript type errors
- Unused variables and imports
- Code style inconsistencies
- Potential security issues
- Accessibility concerns

### Integrating ESLint with CI/CD

The GitHub Actions workflow in `.github/workflows/ci.yml` includes ESLint as part of the CI pipeline:

```yaml
- name: Run linter
  run: npm run lint
```

This ensures that all code pushed to the repository meets the project's code quality standards.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The CI/CD pipeline is defined in `.github/workflows/ci.yml` and automates the testing, building, and deployment process.

### Pipeline Triggers

The CI/CD pipeline is triggered by:
- Pushes to the `main` and `develop` branches
- Pull requests targeting the `main` branch

### Pipeline Stages

#### 1. Test Stage

The test stage runs on multiple Node.js versions (18.x and 20.x) to ensure compatibility:

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      node-version: [18.x, 20.x]
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run tests
      run: npm run test
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
```

This stage includes:
- **Linting**: Runs ESLint to check code quality and consistency
- **Type Checking**: Runs TypeScript compiler to verify type safety
- **Testing**: Executes Jest tests to verify functionality

#### 2. Build Stage

The build stage creates a production-ready build of the application:

```yaml
build:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: |
          .next
          public
```

This stage:
- Depends on the successful completion of the test stage
- Builds the Next.js application for production
- Uploads build artifacts for deployment stages

#### 3. Deployment Stages

The pipeline includes two deployment environments:

##### Staging Deployment

Triggered on pushes to the `develop` branch:

```yaml
deploy-staging:
  needs: build
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/develop'
  environment: staging
  steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # Add your deployment commands here
        # For example, using Vercel, AWS, etc.
```

##### Production Deployment

Triggered on pushes to the `main` branch:

```yaml
deploy-production:
  needs: build
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  environment: production
  steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
    
    - name: Deploy to production
      run: |
        echo "Deploying to production environment..."
        # Add your deployment commands here
        # For example, using Vercel, AWS, etc.
```

### Required Environment Variables and Secrets

The CI/CD pipeline requires the following GitHub secrets to be configured:

- `DATABASE_URL`: Connection string for the database
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: URL for the NextAuth.js application

To configure these secrets:
1. Go to your GitHub repository
2. Click on Settings > Secrets and variables > Actions
3. Add each secret with its corresponding value

### Current Pipeline Status

**Note**: As of the latest analysis, the CI/CD pipeline has several issues that need to be resolved:

1. **Type Checking**: Multiple TypeScript errors need to be fixed
2. **Testing**: Jest configuration issues need to be addressed
3. **Build**: Missing dependencies and configuration issues need to be resolved

See the project issues for a detailed list of required fixes.

### Pipeline Best Practices

- **Sequential Execution**: The pipeline follows a sequential approach where each stage depends on the successful completion of the previous stage
- **Matrix Testing**: The test stage runs on multiple Node.js versions to ensure compatibility
- **Environment-Specific Deployments**: Separate deployment stages for staging and production environments
- **Artifact Management**: Build artifacts are uploaded and reused in deployment stages to improve efficiency
- **Secret Management**: Sensitive information is stored as GitHub secrets and not hardcoded in the pipeline

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── favorites/      # Favorites pages
│   ├── recipes/        # Recipe pages
│   ├── shopping-lists/ # Shopping list pages
│   ├── timers/         # Timer pages
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/             # Base UI components
│   └── __tests__/      # Component tests
├── lib/                # Utility libraries
│   ├── auth/           # Authentication utilities
│   ├── db/             # Database utilities
│   └── utils/          # General utilities
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - gbuffat@gmail.com

Project Link: https://github.com/deccs/recipe-finder

## SSH Setup

This repository is now configured to use SSH for secure Git operations. SSH keys were generated on 2025-09-08 to enable secure communication with GitHub.
