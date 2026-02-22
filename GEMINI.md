# Project Context: CodeShare (muyan)

## Project Overview

**CodeShare** is a web-based platform designed for sharing and managing code snippets. It provides a user-friendly interface for developers to store, view, and share their code.

### Core Technologies

*   **Frontend Framework:** Vue 3
*   **Build Tool:** Vite
*   **State Management:** Pinia
*   **Routing:** Vue Router
*   **UI Component Library:** Element Plus
*   **HTTP Client:** Axios
*   **Code Editor:** CodeMirror (via `vue-codemirror`)
*   **Styling:** CSS/Less/Sass (SCSS)

### Backend Architecture (Reference)

The frontend interacts with a backend system built with:
*   SpringCloud
*   Sa-Token (Permission Control)
*   Nacos (Registry & Configuration)
*   Redis (Caching)
*   Sentinel (Flow Control)

## Building and Running

### Prerequisites
*   Node.js (Ensure a compatible version is installed)
*   npm or yarn

### Key Commands

| Action | Command | Description |
| :--- | :--- | :--- |
| **Install Dependencies** | `npm install` | Installs project dependencies defined in `package.json`. |
| **Development Server** | `npm run dev` | Starts the local development server using Vite. |
| **Build for Production** | `npm run build` | Builds the project for production deployment. |
| **Preview Build** | `npm run preview` | Locally previews the production build. |

## Project Structure

```
/src
├── api/            # API request modules (auth, user, share, etc.)
├── assets/         # Static assets (images, icons)
├── components/     # Reusable Vue components
│   ├── CodeEditor/ # CodeMirror editor component
│   └── ...         # various dialogs and UI elements
├── router/         # Vue Router configuration
├── store/          # Pinia stores (user state, dictionary data)
├── utils/          # Utility functions
│   ├── request.js  # Axios instance with interceptors (auth, error handling)
│   └── auth.js     # Token management
├── views/          # Page views
│   ├── index/      # Main layout/container
│   ├── list/       # Code repository list
│   ├── myCode/     # User's code snippets
│   ├── detail/     # Code detail/edit view
│   └── ...         # Login, register, share views
├── App.vue         # Root component
└── main.js         # Application entry point
```

## Development Conventions

*   **API Configuration:**
    *   API requests are managed in `src/utils/request.js` using Axios.
    *   Base URL and Proxy settings are defined in `vite.config.js` and environment files (`.env.development`, `.env.production`).
    *   The `VITE_APP_BASE_API` environment variable controls the API prefix.
*   **Authentication:**
    *   JWT-based authentication is implemented.
    *   `src/utils/request.js` handles token injection (`token` and `refresh-token` headers) and automatic token refreshing on 401 errors.
    *   User state is managed in `src/store/userStore.js`.
*   **Routing:**
    *   Routes are defined in `src/router/index.js`.
    *   Navigation guards (`beforeEach`) are used to check authentication status and redirect to login if necessary.
*   **UI Components:**
    *   Element Plus components are automatically imported via `unplugin-vue-components`.
    *   Icons use `@element-plus/icons-vue` and `vite-plugin-svg-icons`.
*   **Code Formatting:**
    *   Prettier and ESLint are configured for code style enforcement (`.prettierrc`, `.eslintrc.cjs`).
