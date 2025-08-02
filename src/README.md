# React CLI - Advanced Code Generation & Development Tools

A powerful, AI-driven React development CLI that automates code generation, provides intelligent assistance, and streamlines the development workflow for React, Next.js, and TypeScript projects.

## 🚀 Features Overview

### 🤖 AI-Powered Code Generation
- **Intelligent AI Agent**: Autonomous decision-making for project structure and code generation
- **Multi-Provider AI Support**: Google Gemini and Mistral AI integration
- **Smart Code Generation**: Context-aware code generation with best practices
- **Coordinated AI Generation**: Multiple files generated together for better integration

### 📦 Code Generators

#### Page Generation
- **Comprehensive Page Creation**: Full-featured pages with multiple file types
- **Automatic Route Generation**: Smart routing for React projects (excludes Next.js)
- **Page Structure Options**:
  - Custom hooks (`--hooks`)
  - Utility functions (`--utils`) 
  - TypeScript types (`--types`)
  - CSS modules (`--css`)
  - Test files (`--test`)
  - Component libraries (`--lib`)
  - Layout files (`--layout`)
  - Performance monitoring (`--perf-hook`, `--perf-monitoring`)

#### Component Generation
- **React Component Creation**: Functional components with modern patterns
- **Styling Options**:
  - CSS Modules (`--css`)
  - Styled Components (`--styled`)
- **Advanced Features**:
  - React.memo optimization (`--memo`)
  - forwardRef support (`--forward-ref`)
  - Lazy loading (`--lazy`)
  - Named/default exports (`--named-export`)
- **Test Integration**: Jest/RTL test file generation

#### Additional Generators
- **Custom Hooks**: Reusable React hooks with TypeScript
- **Higher-Order Components (HOC)**: Component composition patterns
- **Services**: API service layers with error handling
- **Utilities**: Pure utility functions
- **Types**: TypeScript type definitions
- **Context**: React Context providers
- **Redux**: Redux Toolkit slices and store configuration
- **Guards**: Authentication and route guards
- **Error Boundaries**: React error boundary components
- **Service Workers**: PWA service worker setup

### 🛣️ Smart Routing System
- **Automatic Route Detection**: Identifies React vs Next.js projects
- **Dynamic Route Support**: Handles parameterized routes (`_[id]`)
- **Nested Route Structure**: Intelligent parent-child route relationships
- **Route File Management**: Creates and updates route configurations
- **Import Path Resolution**: Automatic relative import path generation

### 📚 Library Integration
- **Pre-configured Libraries**: Support for popular React libraries
  - **Styling**: Material-UI, Styled Components, Tailwind CSS
  - **State Management**: Redux Toolkit, Zustand
  - **Forms**: Formik + Yup validation
  - **Data Fetching**: TanStack Query, Axios
  - **Icons**: React Icons
  - **Routing**: React Router
- **Smart Detection**: Automatically detects existing library configurations
- **Type Safety**: Full TypeScript support for all integrations

### 🔧 Configuration Management
- **Intelligent Configuration**: Auto-detects project settings
- **Multi-Format Support**: JSON, TypeScript, and JavaScript configs
- **Project Type Detection**: React, Next.js, Vite project identification
- **Build Tool Integration**: Support for various build systems
- **Environment Management**: Development and production configurations

### 📊 Performance Monitoring
- **Performance Auditing**: Lighthouse-based performance analysis
- **Build Analysis**: Bundle size analysis and optimization suggestions
- **Performance Hooks**: Custom hooks for runtime performance monitoring
- **Metrics Collection**: Automatic performance metrics gathering
- **Baseline Comparisons**: Performance regression detection

### ♿ Accessibility Tools
- **A11y Scanning**: Automated accessibility issue detection
- **Component Auditing**: Accessibility analysis for React components
- **Best Practice Enforcement**: WCAG guideline compliance checking

### 📖 Documentation Generation
- **Auto-Documentation**: Generates docs from component props and JSDoc
- **Type Documentation**: TypeScript interface documentation
- **Usage Examples**: Automatic example generation
- **API Reference**: Complete API documentation generation

### 🎨 Template System
- **Custom Templates**: Save and reuse project patterns
- **Template Validation**: Ensures template integrity
- **Dynamic Template Generation**: AI-powered template creation
- **Template Library**: Shareable template configurations

## 📁 Project Structure

```
src/
├── cli.ts                          # Main CLI entry point
├── index.ts                        # Export definitions
├── commands/                       # CLI commands
│   ├── generate/                   # Code generators
│   │   ├── page/                   # Page generation system
│   │   │   ├── core/              # Core page logic
│   │   │   ├── generators/        # Content generators
│   │   │   └── generatePage.ts    # Page command
│   │   ├── component/             # Component generation system
│   │   │   ├── core/              # Core component logic
│   │   │   ├── generators/        # Content generators
│   │   │   └── generateComponent.ts
│   │   └── [other-generators].ts
│   ├── ai.ts                      # AI-related commands
│   ├── aiAgent.ts                 # Intelligent AI agent
│   ├── audit.ts                   # Performance auditing
│   ├── docs.ts                    # Documentation generation
│   └── [other-commands].ts
├── content/                        # Content generation templates
├── features/                       # Feature implementations
│   └── performance/               # Performance monitoring
├── libraries/                      # Library integrations
├── operations/                     # CRUD operations
├── services/                       # Core services
│   ├── ai-service.ts              # AI provider abstraction
│   ├── gemini-service.ts          # Google Gemini integration
│   ├── mistral-service.ts         # Mistral AI integration
│   └── intelligentAIAgent.ts      # Autonomous AI agent
├── types/                          # TypeScript definitions
├── utils/                          # Utility functions
│   ├── ai/                        # AI utilities
│   ├── config/                    # Configuration management
│   ├── createGeneratedFile/       # File creation utilities
│   ├── createRoutes/              # Route generation
│   ├── docs/                      # Documentation utilities
│   ├── shared/                    # Shared utilities
│   └── template/                  # Template system
```

## 🎯 Usage Examples

### Basic Page Generation
```bash
# Generate a simple page
react-cli g page HomePage

# Generate page with full features
react-cli g page UserDashboard --hooks --utils --types --css --test

# Generate with AI assistance
react-cli g page ProductCatalog --ai --hooks --utils
```

### Component Generation
```bash
# Basic component
react-cli g component Button --css

# Advanced component with all features
react-cli g component Modal --css --test --memo --forward-ref

# Styled component
react-cli g component Card --styled --test
```

### AI-Powered Development
```bash
# Intelligent AI agent
react-cli ai-agent
# Input: "Create a user authentication system with login and signup"

# Smart command
react-cli smart "Build a product catalog with search and filters"

# Quick build
react-cli build "Shopping cart with item management"
```

### Performance Monitoring
```bash
# Audit page performance
react-cli audit src/pages/HomePage --url http://localhost:3000

# Bundle analysis
react-cli bundle-check

# A11y scanning
react-cli a11y-scan src/components/
```

## 🔄 Automatic Route Generation

The CLI automatically handles routing based on your project type:

### React Projects
- ✅ **Automatic route generation** for all pages
- ✅ **Dynamic route support** (e.g., `_[id]` → `/:id`)
- ✅ **Nested route handling** with parent-child relationships
- ✅ **Route file creation** when missing
- ✅ **Smart import resolution** for route components

### Next.js Projects
- ℹ️ **File-based routing** - No automatic route generation needed
- ✅ **Layout file generation** for App Router
- ✅ **Dynamic route pattern** support

Example auto-generated route:
```typescript
// Automatically added to routes.tsx
{
  path: '/user-profile',
  element: <UserProfile />,
}
```

## 🤖 AI Integration

### Supported AI Providers
- **Google Gemini**: `gemini-1.5-flash-latest`, `gemini-1.5-pro-latest`
- **Mistral AI**: `mistral-large-latest`, `mistral-medium-latest`, `mistral-small-latest`

### AI Features
- **Context-Aware Generation**: Understands your project structure
- **Best Practice Enforcement**: Follows React and TypeScript conventions
- **Coordinated File Generation**: Creates multiple related files together
- **Intelligent Decision Making**: Autonomous project structure decisions

### Configuration
```json
{
  "aiEnabled": true,
  "aiProvider": "gemini",
  "aiModel": "gemini-1.5-flash-latest"
}
```

## 📋 Command Reference

### Core Commands
- `react-cli g page <name>` - Generate a page
- `react-cli g component <name>` - Generate a component
- `react-cli g hook <name>` - Generate a custom hook
- `react-cli g service <name>` - Generate a service
- `react-cli ai-agent` - Start intelligent AI agent
- `react-cli smart <description>` - Smart AI command
- `react-cli audit <path>` - Performance audit
- `react-cli docs` - Generate documentation

### Generation Options
- `--ai` - Use AI for code generation
- `--interactive` - Interactive mode with prompts
- `--css` - Include CSS modules
- `--styled` - Use styled-components
- `--test` - Generate test files
- `--hooks` - Include custom hooks
- `--utils` - Include utility functions
- `--types` - Include TypeScript types
- `--route` - Enable automatic route generation
- `--no-route` - Disable automatic route generation

## 🔧 Configuration

### Project Configuration (`create.config.json`)
```json
{
  "projectType": "react",
  "baseDir": "src",
  "typescript": true,
  "aiEnabled": true,
  "aiProvider": "gemini",
  "buildTool": "vite",
  "localization": false
}
```

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_key
MISTRAL_API_KEY=your_mistral_key
```

## 🗺️ Development Roadmap

### Phase 1: Foundation ✅ Complete
- [x] Basic code generation (pages, components, hooks)
- [x] TypeScript support
- [x] CSS modules integration
- [x] File organization system
- [x] Configuration management

### Phase 2: AI Integration ✅ Complete
- [x] Google Gemini integration
- [x] Mistral AI integration
- [x] AI-powered code generation
- [x] Intelligent AI agent
- [x] Context-aware generation

### Phase 3: Advanced Features ✅ Complete
- [x] Automatic route generation
- [x] Performance monitoring
- [x] Library integrations
- [x] Template system
- [x] Documentation generation

### Phase 4: Developer Experience 🚧 In Progress
- [x] Interactive CLI modes
- [x] Smart command parsing
- [x] Accessibility tools
- [ ] **VS Code extension**
- [ ] **GUI interface**
- [ ] **Project analytics dashboard**

### Phase 5: Enterprise Features 📋 Planned
- [ ] **Team collaboration tools**
- [ ] **Custom plugin system**
- [ ] **Enterprise security features**
- [ ] **Advanced performance analytics**
- [ ] **Multi-repository support**

### Phase 6: Advanced AI 🔮 Future
- [ ] **Code review AI assistant**
- [ ] **Automated refactoring suggestions**
- [ ] **Performance optimization AI**
- [ ] **Bug detection and fixing**
- [ ] **Natural language to code conversion**

### Phase 7: Platform Integration 🌐 Future
- [ ] **GitHub integration**
- [ ] **CI/CD pipeline generation**
- [ ] **Docker containerization**
- [ ] **Cloud deployment automation**
- [ ] **Monitoring and alerting setup**

## 🛠️ Technical Architecture

### Core Technologies
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **AI Services**: Google Gemini API, Mistral AI API
- **File System**: fs-extra
- **Code Generation**: Template-based with AI enhancement
- **Performance**: Lighthouse, Bundle Analyzer

### Design Principles
- **Modularity**: Each feature is self-contained
- **Extensibility**: Easy to add new generators and features
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized for large projects
- **User Experience**: Intuitive CLI interface

### Code Quality
- **Test Coverage**: Comprehensive test suite
- **Documentation**: Inline JSDoc comments
- **Error Handling**: Graceful error recovery
- **Logging**: Structured logging system
- **Configuration**: Flexible configuration options

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Build project
npm run build

# Run in development
npm run dev
```

### Adding New Features
1. **Generators**: Add to `src/commands/generate/`
2. **AI Services**: Extend `src/services/`
3. **Utilities**: Add to `src/utils/`
4. **Types**: Define in `src/types/`

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **JSDoc**: Documentation required
- **Testing**: Unit tests for all features

## 📈 Performance

### Metrics
- **Generation Speed**: < 2 seconds for complex pages
- **Bundle Size**: Minimal CLI overhead
- **Memory Usage**: Optimized for large projects
- **AI Response Time**: < 5 seconds for most requests

### Optimizations
- **Lazy Loading**: Components loaded on demand
- **Caching**: AI responses and configurations cached
- **Parallel Processing**: Multiple files generated concurrently
- **Smart Imports**: Only import what's needed

## 🔒 Security

### AI Safety
- **Input Validation**: All user inputs validated
- **API Security**: Secure API key management
- **Code Review**: Generated code follows security best practices
- **Sandbox Execution**: Safe code generation environment

### Data Privacy
- **No Data Collection**: User code stays local
- **Secure API Calls**: Encrypted communication with AI services
- **Environment Variables**: Secure key storage
- **Optional Telemetry**: User-controlled usage analytics

## 📞 Support

### Documentation
- **API Reference**: Complete API documentation
- **Examples**: Extensive example library
- **Tutorials**: Step-by-step guides
- **Troubleshooting**: Common issues and solutions

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community Q&A
- **Contributing Guide**: How to contribute
- **Code of Conduct**: Community guidelines

---

**React CLI** - Empowering React developers with intelligent code generation and automation tools.

*Built with ❤️ for the React community*
