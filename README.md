# Recipe Finder

A modern recipe management application built with Next.js 15, TypeScript, and Tailwind CSS. Browse, create, and manage your favorite recipes with ease.

## Features

- 🔐 **User Authentication**: Secure login and registration system
- 🍳 **Recipe Management**: Browse, search, create, and edit recipes
- ⭐ **Favorites System**: Save your favorite recipes for quick access
- 🛒 **Shopping Lists**: Create and manage shopping lists with ingredients from recipes
- ⏱️ **Cooking Timers**: Set multiple timers for different cooking steps with notifications
- 📱 **Responsive Design**: Works seamlessly on all device sizes
- 🚀 **Performance Optimized**: Fast loading and search engine friendly

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js
- **State Management**: React Context and useReducer
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

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
   ```
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

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - gbuffat@gmail.com

Project Link: [https://github.com/deccs/recipe-finder](https://github.com/deccs/recipe-finder)