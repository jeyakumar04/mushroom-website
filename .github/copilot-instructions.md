# Mushroom Website - AI Agent Instructions

## Project Overview
This is a React-based website for a mushroom farm, built with Create React App. The app uses React Router for client-side navigation between pages like Home, About, Blog, etc. Most pages are currently minimal or empty, awaiting content development.

## Architecture
- **SPA Structure**: Single-page application with routing handled by `react-router-dom`.
- **Component Organization**: Pages are located in `src/pages/` as functional React components. Shared components should go in `src/Component/` (note: folder named singular).
- **Routing**: All routes defined in `src/App.js`. Example:
  ```jsx
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
  ```
- **Navigation**: Navbar component is planned but not yet implemented (commented in App.js: "Navbar inga thaan varum").

## Key Patterns
- **Page Components**: Each page exports a default functional component. Example from `src/pages/Home.jsx`:
  ```jsx
  const Home = () => {
    return <div><h1>🍄 Welcome to Mushroom Farm!</h1></div>;
  };
  ```
- **Imports**: Use relative imports for local components/pages.
- **Styling**: CSS files accompany components (e.g., `App.css`), but no global styling framework yet.

## Developer Workflows
- **Development**: Run `npm start` to start dev server on localhost:3000.
- **Build**: Use `npm run build` for production build in `build/` folder.
- **Testing**: `npm test` runs Jest tests (testing libraries included but no tests written yet).
- **No custom scripts**: All workflows use standard CRA commands.

## Conventions
- **Language**: Primarily English, with occasional Tamil comments (e.g., "work aaguthu" meaning "is working").
- **File Naming**: PascalCase for component files (e.g., `Home.jsx`).
- **Folder Structure**: Keep pages in `src/pages/`, components in `src/Component/`.
- **Dependencies**: Stick to included libraries; add new ones via `npm install` and update `package.json`.

## Integration Points
- No external APIs or services integrated yet.
- PWA-ready with `manifest.json` in `public/`.

Focus on populating empty pages and adding the navbar for navigation.</content>
<parameter name="filePath">f:\TJP\mushroom-website\.github\copilot-instructions.md