# Contributing to React CLI

Thank you for your interest in contributing to React CLI! This document provides guidelines and standards for contributing to the project.

## Code Organization

### File Structure
```
src/
├── utils/           # Utility modules (each file max 150 lines)
│   ├── file/       # File operation utilities
│   ├── config/     # Configuration management
│   ├── cli/        # CLI interaction utilities
│   ├── build/      # Build tool utilities
│   └── types/      # Shared type definitions
├── commands/        # CLI commands
└── operations/      # Complex operations
```

### Code Standards

1. **File Size Limit**
   - Each file must not exceed 150 lines
   - If a module grows beyond 150 lines, split it into sub-modules
   - Use meaningful file names that describe the module's purpose

2. **Code Style**
   - Use TypeScript for type safety
   - Follow functional programming principles
   - Use meaningful variable and function names
   - Add JSDoc comments for all public functions and types

3. **Module Organization**
   - Each utility module should have a single responsibility
   - Export interfaces and types from separate files
   - Keep related functionality together
   - Use index files to expose public API

## Documentation Standards

1. **JSDoc Comments**
   ```typescript
   /**
    * Brief description of the function
    * @param {string} param1 - Description of param1
    * @param {number} param2 - Description of param2
    * @returns {Promise<boolean>} Description of return value
    * @throws {Error} Description of potential errors
    * @example
    * ```typescript
    * const result = await someFunction('test', 123);
    * ```
    */
   ```

2. **README Files**
   - Each major module should have its own README.md
   - Include purpose, installation, and usage examples
   - Document any configuration options

3. **Code Examples**
   - Provide practical examples for each utility
   - Include error handling examples
   - Show common use cases

## Development Workflow

1. **Setting Up Development Environment**
   ```bash
   npm install           # Install dependencies
   npm run build        # Build the project
   npm run test         # Run tests
   ```

2. **Making Changes**
   - Create a new branch for your feature/fix
   - Keep commits small and focused
   - Follow commit message conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Testing**
   - Write unit tests for new functionality
   - Ensure all tests pass before submitting PR
   - Add integration tests for complex features

4. **Pull Request Process**
   - Create PR with clear description
   - Reference any related issues
   - Ensure CI checks pass
   - Request review from maintainers

## Utility Module Guidelines

### File Operations (`utils/file/`)
- Handle file system operations
- Implement proper error handling
- Use async/await for file operations
- Validate file paths and permissions

### Configuration (`utils/config/`)
- Handle configuration management
- Implement type-safe config options
- Validate configuration values
- Provide default configurations

### CLI Interaction (`utils/cli/`)
- Handle user input/output
- Implement consistent prompts
- Support different input types
- Clean up resources properly

### Build Tools (`utils/build/`)
- Handle build-related operations
- Support multiple build tools
- Implement proper validation
- Provide helper functions

### Error Handling
- Use custom error classes
- Implement proper error recovery
- Log errors consistently
- Provide helpful error messages

## Need Help?

- Check existing issues and PRs
- Join our community discussions
- Read the documentation
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's license. 