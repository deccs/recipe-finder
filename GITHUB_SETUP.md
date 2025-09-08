# GitHub Setup Guide

This guide will walk you through the process of pushing the Recipe Finder application to GitHub.

## Prerequisites

- Git installed on your machine
- A GitHub account (gbuffat@gmail.com)
- GitHub username: deccs

## Steps

### 1. Initialize Git Repository

If you haven't already initialized a Git repository, run these commands in your project root:

```bash
git init
git add .
git commit -m "Initial commit: Recipe Finder application"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in with your account (gbuffat@gmail.com)
2. Click the "+" icon in the top-right corner and select "New repository"
3. Fill in the repository details:
   - Repository name: `recipe-finder`
   - Description: `A modern recipe management application built with Next.js 15, TypeScript, and Tailwind CSS`
   - Set to Public or Private (your preference)
   - Don't initialize with README (we already have one)
   - Add .gitignore for Node (optional, we already have one)
   - Choose a license (MIT recommended)
4. Click "Create repository"

### 3. Link Local Repository to GitHub

After creating the repository, GitHub will show you a page with commands. You'll need the ones under "...or push an existing repository from the command line". Copy and run these commands in your terminal:

```bash
git remote add origin https://github.com/deccs/recipe-finder.git
git branch -M main
git push -u origin main
```

### 4. Verify the Push

Go to your GitHub repository page (https://github.com/deccs/recipe-finder) to verify that all files have been pushed successfully.

### 5. Set Up GitHub Pages (Optional)

If you want to host a documentation site for your project:

1. Go to your repository's Settings
2. Navigate to the "Pages" section in the left sidebar
3. Under "Source", select the "Deploy from a branch" option
4. Choose the branch: `main`
5. Choose the folder: `/root`
6. Click "Save"

Your documentation will be available at: https://deccs.github.io/recipe-finder

### 6. Enable GitHub Actions (Optional)

If you want to enable continuous integration and deployment:

1. Go to the "Actions" tab in your repository
2. You'll see a message about GitHub Actions being enabled
3. The CI/CD pipeline we've set up in `.github/workflows/ci.yml` will automatically run on pushes and pull requests

### 7. Configure Repository Settings (Optional)

To enhance your repository:

1. Go to Settings > Options
   - Add a description if you haven't already
   - Set up your website URL (if applicable)
   - Enable or disable features as needed

2. Go to Settings > Branches
   - Set up branch protection rules for the main branch
   - Require pull request reviews before merging
   - Require status checks to pass before merging (e.g., tests, lint)

3. Go to Settings > Secrets and variables > Actions
   - Add any necessary secrets for your CI/CD pipeline (e.g., DATABASE_URL, NEXTAUTH_SECRET)

### 8. Add Collaborators (Optional)

If you want to work with others:

1. Go to Settings > Collaborators and teams
2. Click "Add people"
3. Enter the GitHub username or email address of the person you want to add
4. Choose their permission level
5. Click "Add collaborator"

## Troubleshooting

### Authentication Issues

If you're prompted for a username and password when pushing:

1. Make sure you're using HTTPS URLs
2. If you have two-factor authentication enabled, you'll need to use a personal access token instead of your password
3. Consider setting up SSH keys for a more secure connection

### Push Rejected

If your push is rejected with "non-fast-forward" error:

```bash
git pull origin main --rebase
git push origin main
```

### Large Files

If you have large files that are causing issues:

1. Consider using Git LFS (Large File Storage)
2. Or add them to your .gitignore file if they're not necessary for the repository

## Next Steps

After successfully pushing to GitHub, you can:

1. Set up deployment to platforms like Vercel, Netlify, or AWS Amplify
2. Enable issue tracking for bug reports and feature requests
3. Set up project boards for task management
4. Create releases for different versions of your application

Congratulations! Your Recipe Finder application is now on GitHub.