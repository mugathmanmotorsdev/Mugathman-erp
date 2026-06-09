# Project code style and constraints

## Architecture constraints

1. Use prisma for database operations.
2. Use nextauth for authentication.
3. Use nextjs for api routes.
4. Never assume input data is valid.
5. No blocking operations inside request handlers, use background jobs instead.

## TypeScrip constraints

1. never explicitly use type any

## Database Migration constraints

1. No destructive migration without explicit approval.
2. Maintain backward compatibility when possible.

## Code quality constraints

1. Prefer explicit typing (TypeScript strict mode).
2. Avoid overly complex abstractions.
3. No unused code.
4. the code must be well-documented and structured.
5. Break down large functions into smaller, more manageable functions.
6. Break down large components into smaller, reusalbe and more maintainable components, and make sure to create them in separate files where ever possible.
7. use shadcn ui components where ever possible.

## AI Agents

1. Do not modify more files unless strictly necessary.
2. Provide a clear explanation for any extra changes you make.
3. Do not invent APIs, libraries, or functions.
4. If uncertain, state assumptions clearly.
5. Do not refactor unrelated code.
6. Always explain reasoning before major changes.
7. When generating code, list affected files.

## Testing constraints

1. Write tests for any step where it makes sense.
2. Write integration tests for all api routes.