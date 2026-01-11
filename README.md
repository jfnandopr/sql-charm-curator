# SQL Charm Curator

A professional, feature-rich SQL formatter application built with React, Vite, and TypeScript. SQL Charm Curator helps developers format their SQL queries according to best practices and custom preferences.

## 🚀 Features

- **Multi-Dialect Support**: Format SQL for PostgreSQL, MySQL, Oracle (PL/SQL), SQL Server (T-SQL), and BigQuery.
- **Customizable Formatting**:
  - Keyword, Data Type, and Function casing (Upper, Lower, Preserve).
  - Indentation styles and width.
  - Logical operator placement.
  - Compact parentheses for WHERE clauses.
- **Syntax Highlighting**: Beautifully highlighted SQL code for better readability.
- **Localization**: Supports multiple languages including English, Portuguese, German, Spanish, Japanese, French, and Chinese.
- **Responsive Design**: Built with Tailwind CSS and Shadcn UI for a modern, responsive experience.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Core Logic**: [SQL Formatter](https://github.com/sql-formatter-org/sql-formatter)
- **Localization**: [i18next](https://www.i18next.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

- **Node.js**: v20+ or v22+ recommended.
- **npm**: (comes with Node.js).

## ⚙️ Getting Started

### 1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
cd sql-charm-curator
```

### 2. Install dependencies
```sh
npm install
```

### 3. Start development server
```sh
npm run dev
```

The application will be available at `http://localhost:8080` (or the port specified by Vite).

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Creates a production build in the `dist/` directory.
- `npm run build:dev`: Creates a development build.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm test`: Executes unit tests using Vitest.
- `npm run preview`: Locally previews the production build.

## 📂 Project Structure

```text
src/
├── components/     # UI and application components
│   ├── ui/         # Shadcn UI base components
│   └── ...
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and shared libraries
├── locales/        # I18n translation files (JSON)
├── pages/          # Application pages (Index, NotFound)
├── utils/          # Core utility logic (SQL post-processing)
├── App.tsx         # Main App component & Routing
└── main.tsx        # Application entry point
```

## 🌍 Localization

Translation files are located in `src/locales/`. To add a new language:
1. Create a new JSON file in `src/locales/` (e.g., `it-IT.json`).
2. Update `src/i18n.ts` to include the new locale.

## 🧪 Testing

Unit tests are co-located with the source files or placed in `__tests__` folders.
Run tests with:
```sh
npm test
```

## 🐳 Docker

To run the application using Docker:

### 1. Build the image
```sh
docker build -t sql-charm-curator .
```

### 2. Run the container
```sh
docker run -p 8080:80 sql-charm-curator
```

The application will be available at `http://localhost:8080`.

## 📄 License

TODO: Add license information.
