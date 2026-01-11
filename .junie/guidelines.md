### Project Guidelines

#### Build and Configuration
- **Prerequisites**: Node.js (v20+ or v22+ recommended), npm.
- **Setup**: Run `npm install` to install dependencies.
- **Development**: Use `npm run dev` to start the Vite development server.
- **Build**: Use `npm run build` for production builds. The output will be in the `dist/` directory.
- **Linting**: Run `npm run lint` to execute ESLint.

#### Testing
- **Framework**: [Vitest](https://vitest.dev/) is used for unit testing.
- **Running Tests**: Execute `npm test` to run tests once, or `npm run test:watch` (if configured) for watch mode.
- **Test Structure**: Tests should be co-located with the code they test or placed in a dedicated `__tests__` or `.test.ts` file next to the source.
- **Adding Tests**:
  - Create a file named `*.test.ts` (for utilities) or `*.test.tsx` (for components).
  - Use `describe`, `it`, and `expect` from `vitest`.
  - For UI-heavy components, consider mocking complex dependencies if they cause ESM/CJS compatibility issues (as seen with `react-syntax-highlighter`).
- **Example Test**:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { compactParenthesesFormat } from './sql-utils';

  describe('compactParenthesesFormat', () => {
    it('should remove newlines and spaces after opening parenthesis', () => {
      const input = 'SELECT * FROM users WHERE id IN (\n  1, 2, 3\n)';
      const expected = 'SELECT * FROM users WHERE id IN (1, 2, 3)';
      expect(compactParenthesesFormat(input)).toBe(expected);
    });
  });
  ```

#### Development Guidelines
- **Code Style**: 
  - Follow the existing TypeScript and React patterns.
  - Use [Shadcn UI](https://ui.shadcn.com/) components for consistent UI elements.
  - Core logic should be extracted to `src/utils/` to facilitate testing and reuse.
- **Localization**: I18n is handled via `react-i18next`. Translation files are located in `src/locales/`.
- **Styling**: Tailwind CSS is used for all styling. Use the `cn` utility from `src/lib/utils.ts` for conditional classes.
- **SQL Formatting**: The project uses `sql-formatter`. Custom formatting logic (like compacting parentheses) should be implemented as post-processing steps in `src/utils/sql-utils.ts`.
