#!/usr/bin/env node

import chalk from 'chalk'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Root directory of the project
const rootDir = path.resolve(__dirname, '..')

async function createAppFolder() {
  // Get app name from command line
  const appName = process.argv[2]
  if (!appName) {
    console.error(chalk.red('Please provide an app name: npm run folder <app-name>'))
    process.exit(1)
  }

  console.log(chalk.green(`\n📂 Creating new app folder: ${appName}\n`))

  // Ask about app type (framework or library)
  const { appType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'appType',
      message: 'Do you want to use a framework or a library?',
      choices: ['Framework', 'Library (Vanilla)']
    }
  ])

  let framework

  if (appType === 'Framework') {
    const { selectedFramework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFramework',
        message: 'Select the framework for your app:',
        choices: ['Next.js (React)', 'Nuxt (Vue)', 'SvelteKit (Svelte)']
      }
    ])
    framework = selectedFramework
  } else {
    const { selectedLibrary } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLibrary',
        message: 'Select the library for your app:',
        choices: ['React', 'Vue', 'Svelte']
      }
    ])
    framework = selectedLibrary
  }

  // Create app directory
  const appDir = path.join(rootDir, 'apps', appName)

  // Check if directory already exists
  if (fs.existsSync(appDir)) {
    const { shouldOverwrite } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shouldOverwrite',
        message: `App directory ${appName} already exists. Do you want to overwrite it?`,
        choices: ['Yes', 'No']
      }
    ])

    if (shouldOverwrite === 'No') {
      console.log(chalk.yellow('Operation cancelled. No changes were made.'))
      process.exit(0)
    }

    // Remove existing directory
    fs.removeSync(appDir)
  }

  // Create app directory
  fs.ensureDirSync(appDir)
  console.log(chalk.green(`Created app directory: ${appDir}`))

  // Ask if user wants to install dependencies
  const { installDeps } = await inquirer.prompt([
    {
      type: 'list',
      name: 'installDeps',
      message: 'Do you want to install dependencies after setup?',
      choices: ['Yes', 'No'],
      default: 'No'
    }
  ])

  // Set up the app based on the chosen framework/library
  switch (framework) {
    case 'Next.js (React)':
      await setupNextJs(appDir, appName)
      break
    case 'Nuxt (Vue)':
      await setupNuxt(appDir, appName)
      break
    case 'SvelteKit (Svelte)':
      await setupSvelteKit(appDir, appName)
      break
    case 'React':
      await setupReact(appDir, appName)
      break
    case 'Vue':
      await setupVue(appDir, appName)
      break
    case 'Svelte':
      await setupSvelte(appDir, appName)
      break
  }

  // Update Turbo pipeline if needed
  updateTurboConfig(appName)

  // Install dependencies if requested
  if (installDeps === 'Yes') {
    try {
      console.log(chalk.blue(`Installing dependencies for ${appName}...`))
      execSync('npm install', { cwd: appDir, stdio: 'inherit' })
      console.log(chalk.green('Dependencies installed successfully!'))
    } catch (error) {
      console.error(chalk.red(`Error installing dependencies: ${error.message}`))
    }
  }

  console.log(chalk.green(`\n✨ App folder ${appName} successfully set up!`))
  console.log(chalk.blue(`To start development, run:`))
  console.log(chalk.yellow(`  cd apps/${appName}`))
  console.log(chalk.yellow(`  npm run dev`))
}

function updateTurboConfig(appName) {
  // Update turbo.json to ensure the new app is included in the pipeline
  try {
    const turboConfigPath = path.join(rootDir, 'turbo.json')
    if (fs.existsSync(turboConfigPath)) {
      const turboConfig = fs.readJsonSync(turboConfigPath)

      // Nothing actually needs to be changed in turbo.json as it's using glob patterns
      // But we can check if the config is as expected

      console.log(chalk.green(`Turbo pipeline config is already set up to include new apps.`))
    }
  } catch (error) {
    console.warn(chalk.yellow(`Could not update Turbo config: ${error.message}`))
  }
}

async function setupReact(appDir, appName) {
  console.log(chalk.blue('Setting up React application with Vite...'))

  // Create src directory and its subdirectories
  const srcDir = path.join(appDir, 'src')
  fs.ensureDirSync(srcDir)
  fs.ensureDirSync(path.join(srcDir, 'components'))
  fs.ensureDirSync(path.join(srcDir, 'assets'))
  fs.ensureDirSync(path.join(srcDir, 'styles'))

  // Create public directory
  fs.ensureDirSync(path.join(appDir, 'public'))

  // Create index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
  fs.writeFileSync(path.join(appDir, 'index.html'), indexHtmlContent)

  // Create vite.config.js
  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
`
  fs.writeFileSync(path.join(appDir, 'vite.config.js'), viteConfigContent)

  // Create main.jsx
  const mainJsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  fs.writeFileSync(path.join(srcDir, 'main.jsx'), mainJsxContent)

  // Create App.jsx
  const appJsxContent = `import { useState } from 'react';
import './styles/App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>${appName}</h1>
        <p>Welcome to your new React app!</p>
      </header>
      <div className="content">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is: {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </div>
  );
}

export default App;
`
  fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsxContent)

  // Create index.css
  fs.ensureDirSync(path.join(srcDir, 'styles'))
  const indexCssContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
  fs.writeFileSync(path.join(srcDir, 'styles', 'index.css'), indexCssContent)

  // Create App.css
  const appCssContent = `.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.app-header {
  margin-bottom: 2rem;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
`
  fs.writeFileSync(path.join(srcDir, 'styles', 'App.css'), appCssContent)

  // Create .eslintrc.js
  const eslintConfigContent = `module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/react'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
`
  fs.writeFileSync(path.join(appDir, '.eslintrc.js'), eslintConfigContent)

  // Create tsconfig.json
  const tsconfigContent = {
    "extends": "@social-blog/typescript-config/react-library.json",
    "compilerOptions": {
      "jsx": "react-jsx",
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["src", "vite.config.js"],
    "exclude": ["node_modules", "dist"]
  }
  fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 })

  // Create .gitignore
  const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
  fs.writeFileSync(path.join(appDir, '.gitignore'), gitignoreContent)

  // Create package.json
  const packageJsonContent = {
    "name": `@social-blog/${appName}`,
    "private": true,
    "version": "0.0.1",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
      "preview": "vite preview",
      "clean": "rm -rf dist node_modules .turbo"
    },
    "dependencies": {
      "@social-blog/ui-react": "*",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "devDependencies": {
      "@social-blog/eslint-config": "*",
      "@social-blog/typescript-config": "*",
      "@types/react": "^18.2.48",
      "@types/react-dom": "^18.2.18",
      "@vitejs/plugin-react": "^4.2.1",
      "eslint": "^8.56.0",
      "typescript": "^5.3.3",
      "vite": "^5.0.0"
    }
  }
  fs.writeJsonSync(path.join(appDir, 'package.json'), packageJsonContent, { spaces: 2 })

  console.log(chalk.green('React application set up successfully!'))
}

async function setupVue(appDir, appName) {
  console.log(chalk.blue('Setting up Vue application with Vite...'))

  // Create src directory and its subdirectories
  const srcDir = path.join(appDir, 'src')
  fs.ensureDirSync(srcDir)
  fs.ensureDirSync(path.join(srcDir, 'components'))
  fs.ensureDirSync(path.join(srcDir, 'assets'))

  // Create public directory
  fs.ensureDirSync(path.join(appDir, 'public'))

  // Create index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`
  fs.writeFileSync(path.join(appDir, 'index.html'), indexHtmlContent)

  // Create vite.config.js
  const viteConfigContent = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
`
  fs.writeFileSync(path.join(appDir, 'vite.config.js'), viteConfigContent)

  // Create main.js
  const mainJsContent = `import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';

createApp(App).mount('#app');
`
  fs.writeFileSync(path.join(srcDir, 'main.js'), mainJsContent)

  // Create App.vue
  const appVueContent = `<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>${appName}</h1>
      <p>Welcome to your new Vue app!</p>
    </header>
    
    <div class="content">
      <button @click="count++">Count is: {{ count }}</button>
      <p>
        Edit <code>src/App.vue</code> and save to test HMR
      </p>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.app-header {
  margin-bottom: 2rem;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
`
  fs.writeFileSync(path.join(srcDir, 'App.vue'), appVueContent)

  // Create main.css
  fs.ensureDirSync(path.join(srcDir, 'assets'))
  const mainCssContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
  fs.writeFileSync(path.join(srcDir, 'assets', 'main.css'), mainCssContent)

  // Create a simple component
  fs.ensureDirSync(path.join(srcDir, 'components'))
  const helloComponentContent = `<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
  </div>
</template>

<style scoped>
.hello {
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}
</style>
`
  fs.writeFileSync(path.join(srcDir, 'components', 'HelloWorld.vue'), helloComponentContent)

  // Create env.d.ts for TypeScript support
  const envDtsContent = `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
`
  fs.writeFileSync(path.join(srcDir, 'env.d.ts'), envDtsContent)

  // Create .eslintrc.js
  const eslintConfigContent = `module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/nuxt'],
};
`
  fs.writeFileSync(path.join(appDir, '.eslintrc.js'), eslintConfigContent)

  // Create tsconfig.json
  const tsconfigContent = {
    "extends": "@social-blog/typescript-config/base.json",
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      },
      "jsx": "preserve",
      "lib": ["ESNext", "DOM"],
      "module": "ESNext",
      "moduleResolution": "node",
      "allowSyntheticDefaultImports": true
    },
    "include": ["src/**/*.ts", "src/**/*.vue", "src/**/*.d.ts", "vite.config.js"],
    "exclude": ["node_modules", "dist"]
  }
  fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 })

  // Create .gitignore
  const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
.DS_Store
dist
dist-ssr
coverage
*.local

/cypress/videos/
/cypress/screenshots/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
  fs.writeFileSync(path.join(appDir, '.gitignore'), gitignoreContent)

  // Create package.json
  const packageJsonContent = {
    "name": `@social-blog/${appName}`,
    "version": "0.0.1",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore",
      "clean": "rm -rf dist node_modules .turbo"
    },
    "dependencies": {
      "@social-blog/ui-vue": "*",
      "vue": "^3.4.15"
    },
    "devDependencies": {
      "@social-blog/eslint-config": "*",
      "@social-blog/typescript-config": "*",
      "@vitejs/plugin-vue": "^4.5.2",
      "eslint": "^8.56.0",
      "eslint-plugin-vue": "^9.20.1",
      "typescript": "^5.3.3",
      "vite": "^5.0.0",
      "vue-tsc": "^1.8.27"
    }
  }
  fs.writeJsonSync(path.join(appDir, 'package.json'), packageJsonContent, { spaces: 2 })

  console.log(chalk.green('Vue application set up successfully!'))
}

async function setupSvelte(appDir, appName) {
  console.log(chalk.blue('Setting up Svelte application with Vite...'))

  // Create src directory and its subdirectories
  const srcDir = path.join(appDir, 'src')
  fs.ensureDirSync(srcDir)
  fs.ensureDirSync(path.join(srcDir, 'lib'))
  fs.ensureDirSync(path.join(srcDir, 'assets'))

  // Create public directory
  fs.ensureDirSync(path.join(appDir, 'public'))

  // Create index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`
  fs.writeFileSync(path.join(appDir, 'index.html'), indexHtmlContent)

  // Create vite.config.js
  const viteConfigContent = `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '$lib': './src/lib'
    }
  }
});
`
  fs.writeFileSync(path.join(appDir, 'vite.config.js'), viteConfigContent)

  // Create main.js
  const mainJsContent = `import App from './App.svelte';
import './assets/global.css';

const app = new App({
  target: document.getElementById('app')
});

export default app;
`
  fs.writeFileSync(path.join(srcDir, 'main.js'), mainJsContent)

  // Create App.svelte
  const appSvelteContent = `<script>
  import { onMount } from 'svelte';
  import Counter from '$lib/Counter.svelte';
  
  let name = '${appName}';
</script>

<main>
  <div class="app">
    <header class="app-header">
      <h1>{name}</h1>
      <p>Welcome to your new Svelte app!</p>
    </header>
    
    <div class="content">
      <Counter />
      
      <p>
        Edit <code>src/App.svelte</code> and save to test HMR
      </p>
    </div>
  </div>
</main>

<style>
  .app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .app-header {
    margin-bottom: 2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }
</style>
`
  fs.writeFileSync(path.join(srcDir, 'App.svelte'), appSvelteContent)

  // Create a simple component
  const counterComponentContent = `<script>
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count is: {count}
</button>

<style>
  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
  }

  button:hover {
    border-color: #646cff;
  }

  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
</style>
`
  fs.writeFileSync(path.join(srcDir, 'lib', 'Counter.svelte'), counterComponentContent)

  // Create global.css
  fs.ensureDirSync(path.join(srcDir, 'assets'))
  const globalCssContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
  fs.writeFileSync(path.join(srcDir, 'assets', 'global.css'), globalCssContent)

  // Create .eslintrc.js
  const eslintConfigContent = `module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/svelte'],
};
`
  fs.writeFileSync(path.join(appDir, '.eslintrc.js'), eslintConfigContent)

  // Create tsconfig.json for TypeScript
  const tsconfigContent = {
    "extends": "@social-blog/typescript-config/svelte.json",
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "$lib/*": ["src/lib/*"]
      },
      "types": ["svelte"]
    },
    "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.svelte"],
    "exclude": ["node_modules"]
  }
  fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 })

  // Create svelte.config.js
  const svelteConfigContent = `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
};
`
  fs.writeFileSync(path.join(appDir, 'svelte.config.js'), svelteConfigContent)

  // Create .gitignore
  const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
  fs.writeFileSync(path.join(appDir, '.gitignore'), gitignoreContent)

  // Create package.json
  const packageJsonContent = {
    "name": `@social-blog/${appName}`,
    "private": true,
    "version": "0.0.1",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "check": "svelte-check --tsconfig ./tsconfig.json",
      "lint": "eslint . --ext .svelte,.js,.ts",
      "clean": "rm -rf dist node_modules .turbo"
    },
    "dependencies": {
      "@social-blog/ui-svelte": "*"
    },
    "devDependencies": {
      "@social-blog/eslint-config": "*",
      "@social-blog/typescript-config": "*",
      "@sveltejs/vite-plugin-svelte": "^3.0.0",
      "eslint": "^8.56.0",
      "eslint-plugin-svelte": "^2.35.1",
      "svelte": "^4.2.9",
      "svelte-check": "^3.6.0",
      "typescript": "^5.3.3",
      "vite": "^5.0.0"
    }
  }
  fs.writeJsonSync(path.join(appDir, 'package.json'), packageJsonContent, { spaces: 2 })

  console.log(chalk.green('Svelte application set up successfully!'))
}

async function setupNextJs(appDir, appName) {
  console.log(chalk.blue('Setting up Next.js application...'))

  // Create src directory and its subdirectories
  const srcDir = path.join(appDir, 'src')
  fs.ensureDirSync(path.join(srcDir, 'app'))
  fs.ensureDirSync(path.join(srcDir, 'components'))
  fs.ensureDirSync(path.join(srcDir, 'styles'))

  // Create public directory
  fs.ensureDirSync(path.join(appDir, 'public'))

  // Copy Next.js specific files from template or existing app
  const webAppDir = path.join(rootDir, 'apps', 'web')

  // Check if web app exists to copy files from
  if (fs.existsSync(webAppDir)) {
    // Copy selected files if they exist
    copyIfExists(
      path.join(webAppDir, 'next.config.mjs'),
      path.join(appDir, 'next.config.mjs')
    )

    copyIfExists(
      path.join(webAppDir, 'tailwind.config.ts'),
      path.join(appDir, 'tailwind.config.ts')
    )

    copyIfExists(
      path.join(webAppDir, 'postcss.config.js'),
      path.join(appDir, 'postcss.config.js')
    )

    // Copy .eslintrc.js and modify if needed
    copyIfExists(
      path.join(webAppDir, '.eslintrc.js'),
      path.join(appDir, '.eslintrc.js')
    )

    // Copy tsconfig.json and modify
    if (fs.existsSync(path.join(webAppDir, 'tsconfig.json'))) {
      const tsconfig = fs.readJsonSync(path.join(webAppDir, 'tsconfig.json'))
      fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfig, { spaces: 2 })
    }

    // Copy global CSS if it exists
    copyIfExists(
      path.join(webAppDir, 'src', 'app', 'globals.css'),
      path.join(srcDir, 'app', 'globals.css')
    )

    // Copy basic app layout if it exists
    copyIfExists(
      path.join(webAppDir, 'src', 'app', 'layout.tsx'),
      path.join(srcDir, 'app', 'layout.tsx')
    )

    // Copy gitignore
    copyIfExists(
      path.join(webAppDir, '.gitignore'),
      path.join(appDir, '.gitignore')
    )
  } else {
    // Create default files if web app doesn't exist
    console.log(chalk.yellow(`Web app template not found. Creating default Next.js files.`))

    // Create default files for Next.js
    createNextJsDefaultFiles(appDir, srcDir, appName)
  }

  // Create package.json
  const packageJsonContent = {
    "name": `@social-blog/${appName}`,
    "version": "0.0.1",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "clean": "rm -rf .next .turbo node_modules"
    },
    "dependencies": {
      "@social-blog/ui-react": "*",
      "next": "14.1.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "socket.io-client": "^4.7.4"
    },
    "devDependencies": {
      "@social-blog/eslint-config": "*",
      "@social-blog/typescript-config": "*",
      "@types/node": "^20.11.5",
      "@types/react": "^18.2.48",
      "@types/react-dom": "^18.2.18",
      "autoprefixer": "^10.4.17",
      "eslint": "^8.56.0",
      "postcss": "^8.4.33",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.3.3"
    }
  }

  fs.writeJsonSync(path.join(appDir, 'package.json'), packageJsonContent, { spaces: 2 })

  // Create a simple page.tsx for the new app
  const pageContent = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">${appName}</h1>
      <p>Welcome to your new Next.js app!</p>
    </main>
  )
}
`
  fs.writeFileSync(path.join(srcDir, 'app', 'page.tsx'), pageContent)

  console.log(chalk.green('Next.js application set up successfully!'))
}

function createNextJsDefaultFiles(appDir, srcDir, appName) {
  // Create next.config.mjs
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
`
  fs.writeFileSync(path.join(appDir, 'next.config.mjs'), nextConfigContent)

  // Create tailwind.config.ts
  const tailwindConfigContent = `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
`
  fs.writeFileSync(path.join(appDir, 'tailwind.config.ts'), tailwindConfigContent)

  // Create postcss.config.js
  const postcssConfigContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
  fs.writeFileSync(path.join(appDir, 'postcss.config.js'), postcssConfigContent)

  // Create .eslintrc.js
  const eslintConfigContent = `module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/next'],
}
`
  fs.writeFileSync(path.join(appDir, '.eslintrc.js'), eslintConfigContent)

  // Create tsconfig.json
  const tsconfigContent = {
    "extends": "@social-blog/typescript-config/nextjs.json",
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 })

  // Create globals.css
  const globalCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`
  fs.writeFileSync(path.join(srcDir, 'app', 'globals.css'), globalCssContent)

  // Create layout.tsx
  const layoutContent = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${appName}',
  description: 'Created with the Social Blog App Generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`
  fs.writeFileSync(path.join(srcDir, 'app', 'layout.tsx'), layoutContent)

  // Create .gitignore
  const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
  fs.writeFileSync(path.join(appDir, '.gitignore'), gitignoreContent)
}

async function setupNuxt(appDir, appName) {
  console.log(chalk.blue('Setting up Nuxt application...'))

  // Create directory structure
  fs.ensureDirSync(path.join(appDir, 'components'))
  fs.ensureDirSync(path.join(appDir, 'pages'))
  fs.ensureDirSync(path.join(appDir, 'layouts'))
  fs.ensureDirSync(path.join(appDir, 'public'))
  fs.ensureDirSync(path.join(appDir, 'server'))

  // Get admin app dir to copy templates
  const adminAppDir = path.join(rootDir, 'apps', 'admin')

  if (fs.existsSync(adminAppDir)) {
    // Copy selected files if they exist
    copyIfExists(
      path.join(adminAppDir, 'nuxt.config.ts'),
      path.join(appDir, 'nuxt.config.ts')
    )

    copyIfExists(
      path.join(adminAppDir, '.eslintrc.js'),
      path.join(appDir, '.eslintrc.js')
    )

    copyIfExists(
      path.join(adminAppDir, 'tsconfig.json'),
      path.join(appDir, 'tsconfig.json')
    )

    copyIfExists(
      path.join(adminAppDir, '.gitignore'),
      path.join(appDir, '.gitignore')
    )

    // Create server/tsconfig.json if it exists in admin
    if (fs.existsSync(path.join(adminAppDir, 'server', 'tsconfig.json'))) {
      fs.copySync(
        path.join(adminAppDir, 'server', 'tsconfig.json'),
        path.join(appDir, 'server', 'tsconfig.json')
      )
    }
  } else {
    console.log(chalk.yellow(`Admin app template not found. Creating default Nuxt files.`))

    // Create default files for Nuxt
    createNuxtDefaultFiles(appDir, appName)
  }

  // Create package.json
  const packageJsonContent = {
    "name": `@social-blog/${appName}`,
    "version": "0.0.1",
    "private": true,
    "scripts": {
      "build": "nuxt build",
      "dev": "nuxt dev",
      "generate": "nuxt generate",
      "preview": "nuxt preview",
      "postinstall": "nuxt prepare",
      "lint": "eslint .",
      "clean": "rm -rf .nuxt .output node_modules .turbo"
    },
    "dependencies": {
      "@social-blog/ui-vue": "*",
      "socket.io-client": "^4.7.4",
      "vue": "^3.4.15"
    },
    "devDependencies": {
      "@nuxt/devtools": "latest",
      "@social-blog/eslint-config": "*",
      "@social-blog/typescript-config": "*",
      "eslint": "^8.56.0",
      "nuxt": "^3.9.3",
      "typescript": "^5.3.3"
    }
  }

  fs.writeJsonSync(path.join(appDir, 'package.json'), packageJsonContent, { spaces: 2 })

  // Create app.vue with custom content for the new app
  const appVueContent = `<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-4">${appName}</h1>
    <p class="mb-4">Welcome to your new Nuxt app!</p>
    <NuxtPage />
  </div>
</template>

<style>
body {
  font-family: 'Inter', sans-serif;
  background-color: #f9fafb;
  color: #111827;
}
</style>
`
  fs.writeFileSync(path.join(appDir, 'app.vue'), appVueContent)

  // Create index.vue page
  const indexPageContent = `<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Home Page</h2>
    <p>This is the homepage of the ${appName} application.</p>
  </div>
</template>
`
  fs.ensureDirSync(path.join(appDir, 'pages'))
  fs.writeFileSync(path.join(appDir, 'pages', 'index.vue'), indexPageContent)

  console.log(chalk.green('Nuxt application set up successfully!'))
}

function createNuxtDefaultFiles(appDir, appName) {
  // Create nuxt.config.ts
  const nuxtConfigContent = `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/tailwindcss'
  ]
})
`
  fs.writeFileSync(path.join(appDir, 'nuxt.config.ts'), nuxtConfigContent)

  // Create .eslintrc.js
  const eslintConfigContent = `module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/nuxt'],
}
`
  fs.writeFileSync(path.join(appDir, '.eslintrc.js'), eslintConfigContent)

  // Create tsconfig.json
  const tsconfigContent = {
    "extends": "@social-blog/typescript-config/nuxtjs.json",
    "exclude": ["node_modules", ".nuxt", "dist"],
    "include": ["src/**/*", "types/**/*.d.ts", "app/**/*"],
    "files": []
  }
  fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 })

  // Create server/tsconfig.json
  fs.ensureDirSync(path.join(appDir, 'server'))
  const serverTsconfigContent = {
    "extends": "../.nuxt/tsconfig.server.json"
  }
  fs.writeJsonSync(path.join(appDir, 'server', 'tsconfig.json'), serverTsconfigContent, { spaces: 2 })

  // Create assets/css/main.css
  fs.ensureDirSync(path.join(appDir, 'assets', 'css'))
  const mainCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #1e40af;
  --secondary: #6b7280;
  --accent: #3b82f6;
}

body {
  font-family: 'Inter', sans-serif;
}
`
  fs.writeFileSync(path.join(appDir, 'assets', 'css', 'main.css'), mainCssContent)

  // Create tailwind.config.js
  const tailwindConfigContent = `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      }
    }
  }
}
`
  fs.writeFileSync(path.join(appDir, 'tailwind.config.js'), tailwindConfigContent)

  // Create .gitignore
  const gitignoreContent = `# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*
!.env.example
`
  fs.writeFileSync(path.join(appDir, '.gitignore'), gitignoreContent)
}

async function setupSvelteKit(appDir, appName) {
  console.log(chalk.blue('Setting up SvelteKit application...'))

  // Create source directory structure
  fs.ensureDirSync(path.join(appDir, 'src'))
  fs.ensureDirSync(path.join(appDir, 'src', 'lib'))
  fs.ensureDirSync(path.join(appDir, 'src', 'routes'))
  fs.ensureDirSync(path.join(appDir, 'static'))

  // Create svelte.config.js
  const svelteConfigContent = `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '$lib': './src/lib'
    }
  }
};

export default config;
`
  fs.writeFileSync(path.join(appDir, 'svelte.config.js'), svelteConfigContent)

  // Create vite.config.js
  const viteConfigContent = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});
`
  fs.writeFileSync(path.join(appDir, 'vite.config.js'), viteConfigContent)

  // Create .eslintrc.js
  const eslintrcContent = `module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/svelte'],
};
`
  fs.writeFileSync(path.join(appDir, '.eslintrc.js'), eslintrcContent)

  // Create tsconfig.json
  const tsconfigContent = {
    "extends": "@social-blog/typescript-config/svelte.json",
    "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.svelte"],
    "exclude": ["node_modules", "build", ".svelte-kit"]
  }
  fs.writeJsonSync(path.join(appDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 })

  // Create .gitignore
  const gitignoreContent = `.DS_Store
node_modules
/build
/.svelte-kit
/package
.env
.env.*
!.env.example
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
`
  fs.writeFileSync(path.join(appDir, '.gitignore'), gitignoreContent)

  // Create app.html
  const appHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`
  fs.writeFileSync(path.join(appDir, 'src', 'app.html'), appHtmlContent)

  // Create app.css
  const appCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
`
  fs.writeFileSync(path.join(appDir, 'src', 'app.css'), appCssContent)

  // Create +layout.svelte
  const layoutContent = `<script>
  import '../app.css';
</script>

<div class="container mx-auto p-8">
  <header class="mb-8">
    <h1 class="text-4xl font-bold">${appName}</h1>
  </header>
  
  <main>
    <slot />
  </main>
  
  <footer class="mt-8 text-sm text-gray-500">
    <p>&copy; ${new Date().getFullYear()} ${appName}</p>
  </footer>
</div>
`
  fs.writeFileSync(path.join(appDir, 'src', 'routes', '+layout.svelte'), layoutContent)

  // Create +page.svelte (home page)
  const pageContent = `<script>
  // Home page component
</script>

<svelte:head>
  <title>${appName}</title>
  <meta name="description" content="Welcome to ${appName}" />
</svelte:head>

<div>
  <h2 class="text-2xl font-semibold mb-4">Welcome to ${appName}</h2>
  <p class="mb-4">This is your new SvelteKit application.</p>
</div>
`
  fs.writeFileSync(path.join(appDir, 'src', 'routes', '+page.svelte'), pageContent)

  // Create package.json
  const packageJsonContent = {
    "name": `@social-blog/${appName}`,
    "version": "0.0.1",
    "private": true,
    "scripts": {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
      "lint": "eslint .",
      "clean": "rm -rf .svelte-kit node_modules build .turbo"
    },
    "dependencies": {
      "@social-blog/ui-svelte": "*"
    },
    "devDependencies": {
      "@social-blog/eslint-config": "*",
      "@social-blog/typescript-config": "*",
      "@sveltejs/adapter-auto": "^3.0.0",
      "@sveltejs/kit": "^2.0.0",
      "@sveltejs/vite-plugin-svelte": "^3.0.0",
      "autoprefixer": "^10.4.17",
      "eslint": "^8.56.0",
      "eslint-plugin-svelte": "^2.35.1",
      "postcss": "^8.4.33",
      "svelte": "^4.2.9",
      "svelte-check": "^3.6.0",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.3.3",
      "vite": "^5.0.0"
    },
    "type": "module"
  }

  fs.writeJsonSync(path.join(appDir, 'package.json'), packageJsonContent, { spaces: 2 })

  // Create tailwind.config.js
  const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: []
};
`
  fs.writeFileSync(path.join(appDir, 'tailwind.config.js'), tailwindConfigContent)

  // Create postcss.config.js
  const postcssConfigContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`
  fs.writeFileSync(path.join(appDir, 'postcss.config.js'), postcssConfigContent)

  // Create app placeholder favicon
  fs.ensureDirSync(path.join(appDir, 'static'))

  console.log(chalk.green('SvelteKit application set up successfully!'))
}

function copyIfExists(sourcePath, destPath) {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    return true
  }
  return false
}

// Run the function
createAppFolder().catch(err => {
  console.error(chalk.red('Error creating app folder:'), err)
  process.exit(1)
})