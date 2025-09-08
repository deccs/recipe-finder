# Monorepo Configuration

This project is configured as a monorepo using both pnpm workspaces and Turborepo for optimal development and deployment.

## Structure

```
proj16/
├── recipe-app/          # Recipe application (Next.js)
├── packages/           # Shared packages (if any)
├── scripts/            # Build and utility scripts
├── amplify.yml         # AWS Amplify configuration
├── turbo.json          # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json        # Root package with workspace scripts
```

## Workspace Configuration

### pnpm Workspaces

The `pnpm-workspace.yaml` file defines the workspace packages:

```yaml
packages:
  - 'recipe-app'
  - 'packages/*'
```

### Turborepo

The `turbo.json` file configures the build pipeline:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

## Available Scripts

### Root Scripts

- `npm run dev` - Start main application on port 3001
- `npm run dev:all` - Start both applications concurrently (main on 3001, recipe-app on 3000)
- `npm run build` - Build main application
- `npm run build:all` - Build both applications
- `npm run lint` - Lint main application
- `npm run lint:all` - Lint both applications
- `npm run test` - Run tests for main application
- `npm run clean` - Clean build artifacts
- `npm run install:all` - Install dependencies for all packages

### Recipe App Scripts

- `npm run dev` - Start recipe application on port 3000
- `npm run build` - Build recipe application
- `npm run lint` - Lint recipe application
- `npm run type-check` - Type check recipe application

## Development Workflow

### Setting Up the Monorepo

1. Install dependencies for all packages:
   ```bash
   npm run install:all
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

### Running Applications

#### Option 1: Run Both Applications Concurrently

```bash
npm run dev:all
```

This will start:
- Main application on http://localhost:3001
- Recipe application on http://localhost:3000

#### Option 2: Run Individual Applications

```bash
# Main application
npm run dev

# Recipe application (in a separate terminal)
cd recipe-app && npm run dev
```

### Building Applications

```bash
# Build both applications
npm run build:all

# Build individual applications
npm run build              # Main application
cd recipe-app && npm run build  # Recipe application
```

### Linting and Testing

```bash
# Lint all applications
npm run lint:all

# Run tests (main application only)
npm run test
```

## AWS Amplify Deployment

The monorepo is configured for AWS Amplify deployment with the following files:

- `amplify.yml` - Main Amplify configuration
- `scripts/amplify-build.sh` - Custom build script for monorepo
- `AMPLIFY_DEPLOYMENT.md` - Deployment documentation

### Deployment Process

1. AWS Amplify runs the preBuild phase:
   - Installs dependencies for all packages
   - Generates Prisma client

2. AWS Amplify runs the build phase:
   - Builds both applications
   - Deploys the main application by default

### Deploying the Recipe App Instead

To deploy the recipe-app instead of the main application, modify the `amplify.yml` file:

```yaml
artifacts:
  baseDirectory: recipe-app/.next
  files:
    - '**/*'
```

## Port Configuration

- Main application: Port 3001
- Recipe application: Port 3000

These ports are configured in the respective `next.config.js` and `next.config.ts` files.

## Shared Dependencies

Shared dependencies should be defined in the root `package.json` and can be used across all workspace packages.

## Adding New Packages

To add a new package to the monorepo:

1. Create the package directory under `packages/`
2. Add the package to `pnpm-workspace.yaml`
3. Configure the package in `turbo.json` if needed
4. Add any shared scripts to the root `package.json`

## Best Practices

1. Use the root scripts for operations that affect multiple packages
2. Keep shared dependencies in the root `package.json`
3. Use Turborepo for efficient caching and parallel execution
4. Test changes across all affected packages
5. Use the monorepo structure to share code and configuration where appropriate

## Troubleshooting

### Dependency Issues

If you encounter dependency issues:

1. Run `npm run install:all` to ensure all dependencies are installed
2. Check that dependencies are correctly hoisted to the root
3. Verify that workspace packages are correctly configured

### Build Issues

If you encounter build issues:

1. Run `npm run clean` to remove build artifacts
2. Run `npm run build:all` to rebuild all packages
3. Check that all dependencies are installed correctly

### Port Conflicts

If you encounter port conflicts:

1. Ensure no other processes are using ports 3000 or 3001
2. Modify the port configuration in the respective Next.js config files
3. Update any documentation or scripts that reference the ports