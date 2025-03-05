# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Environment Configuration

The application can run in different modes based on the domain or port it's running on:

### Domain-based Configuration

- **hiverarchy.com**: Full functionality, including user profile creation
- **golfergeek.com**: Limited functionality (no user profile creation)
- **localhost**: Development mode with limited functionality similar to golfergeek.com

### Local Development with Hierarchy Functionality

To test the full hiverarchy.com functionality locally, you can use:

```
npm run dev:hierarchy-local
```

This runs the application on `localhost:4021` and mimics the behavior of hiverarchy.com, allowing you to test features like user profile creation locally before deploying to production.

### Available Scripts

- `npm run dev`: Start regular development server on port 3000
- `npm run dev:5174`: Start development server on port 5174
- `npm run dev:5175`: Start development server on port 5175
- `npm run dev:testing`: Start development server in testing mode
- `npm run dev:hierarchy`: Start development server in hierarchy mode
- `npm run dev:hierarchy-local`: Start development server on port 4021 mimicking hiverarchy.com
