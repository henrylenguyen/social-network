#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug logs
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);

// Helper function to determine app and framework
function getAppInfo() {
  // Normalize path for cross-platform compatibility
  const cwd = process.cwd().replace(/\\/g, '/');
  console.log(`Normalized path: ${cwd}`);

  // Check if we're in an apps directory
  const isInAppsDir = cwd.includes('/apps/') || cwd.includes('\\apps\\');
  if (!isInAppsDir) {
    return { isInAppsDir: false };
  }

  // Determine framework by checking package.json
  let framework = 'react'; // default
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);

      if (packageJson.dependencies || packageJson.devDependencies) {
        if ((packageJson.dependencies && packageJson.dependencies.vue) ||
          (packageJson.devDependencies && packageJson.devDependencies.vue)) {
          framework = 'vue';
        } else if ((packageJson.dependencies && packageJson.dependencies.svelte) ||
          (packageJson.devDependencies && packageJson.devDependencies.svelte)) {
          framework = 'svelte';
        }
      }
    }
  } catch (err) {
    console.warn(`Could not determine framework from package.json: ${err.message}`);
  }

  return {
    isInAppsDir: true,
    framework
  };
}

// Format files using Prettier if available
function formatFilesWithPrettier(componentDir) {
  try {
    const fileGlob = `"${componentDir}/**/*.{js,jsx,ts,tsx,vue,svelte,scss,css}"`;

    console.log(chalk.blue(`Formatting files with Prettier...`));
    execSync(`npx prettier --write ${fileGlob}`, { stdio: 'ignore' });

    return true;
  } catch (error) {
    console.warn(chalk.yellow(`Could not format files with Prettier: ${error.message}`));
    return false;
  }
}

// Add files to Git if Git is available
function addFilesToGit(componentDir) {
  try {
    // Check if we're in a git repository
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });

    return true;
  } catch (error) {
    // Not in a git repository or git is not available
    return false;
  }
}

// Function to run linting on generated files
function lintGeneratedFiles(componentDir, framework) {
  try {
    let lintCommand;

    switch (framework) {
      case 'react':
        lintCommand = `npx eslint "${componentDir}/**/*.{js,jsx,ts,tsx}" --fix`;
        break;
      case 'vue':
        lintCommand = `npx eslint "${componentDir}/**/*.{js,vue}" --fix`;
        break;
      case 'svelte':
        lintCommand = `npx eslint "${componentDir}/**/*.{js,svelte}" --fix`;
        break;
      default:
        return false;
    }

    console.log(chalk.blue(`Running ESLint on generated files...`));
    execSync(lintCommand, { stdio: 'ignore' });

    return true;
  } catch (error) {
    console.warn(chalk.yellow(`Could not run ESLint: ${error.message}`));
    return false;
  }
}

// Create or ensure directory exists
function ensureDirectoryExists(dir) {
  try {
    fs.ensureDirSync(dir);
    return true;
  } catch (error) {
    console.error(chalk.red(`Error creating directory ${dir}: ${error.message}`));
    return false;
  }
}

// Function to update parent index file
function updateParentIndexFile(componentDir, componentName, useTypeScript, framework) {
  try {
    const parentDir = path.dirname(componentDir);
    const indexExtension = useTypeScript ? 'ts' : 'js';
    const parentIndexPath = path.join(parentDir, `index.${indexExtension}`);
    const dirName = path.basename(componentDir);

    let indexContent = '';
    let exportStatement = '';
    const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

    // Create appropriate export statement based on framework
    if (framework === 'react') {
      exportStatement = `export { ${capitalizedComponentName} } from './${dirName}';\n`;
    } else if (framework === 'vue') {
      exportStatement = `export { default as ${capitalizedComponentName} } from './${dirName}';\n`;
    } else if (framework === 'svelte') {
      exportStatement = `export { default as ${capitalizedComponentName} } from './${dirName}';\n`;
    }

    // Check if parent index file already exists
    if (fs.existsSync(parentIndexPath)) {
      indexContent = fs.readFileSync(parentIndexPath, 'utf8');

      // Check if the export statement is already there
      if (!indexContent.includes(exportStatement.trim())) {
        indexContent += exportStatement;
      }
    } else {
      // Create a new index file
      indexContent = exportStatement;
    }

    // Write the index file
    fs.writeFileSync(parentIndexPath, indexContent);
    console.log(chalk.green(`Updated parent index file at ${parentIndexPath}`));

    // Format the parent index file
    try {
      execSync(`npx prettier --write "${parentIndexPath}"`, { stdio: 'ignore' });
    } catch (err) {
      // Ignore prettier errors
    }

    return true;
  } catch (error) {
    console.warn(chalk.yellow(`Could not update parent index file: ${error.message}`));
    return false;
  }
}

// Individual file generation functions

// Generate component file
function generateComponentFile(componentDir, componentName, fileName, useTypeScript, framework) {
  const extension = useTypeScript ? 'tsx' : 'jsx';
  const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  let componentCode;
  if (framework === 'react') {
    componentCode = useTypeScript
      ? `import React from 'react';
import styles from './styles.module.scss';

interface ${capitalizedComponentName}Props {
  // Define your props here
  className?: string;
}

export const ${capitalizedComponentName}: React.FC<${capitalizedComponentName}Props> = (props) => {
  const { className = '', ...otherProps } = props;

  return (
    <div className={\`\${styles.container} \${className}\`} {...otherProps}>
      ${capitalizedComponentName} Component
    </div>
  );
};
`
      : `import React from 'react';
import styles from './styles.module.scss';

export const ${capitalizedComponentName} = (props) => {
  const { className = '', ...otherProps } = props;

  return (
    <div className={\`\${styles.container} \${className}\`} {...otherProps}>
      ${capitalizedComponentName} Component
    </div>
  );
};
`;
  } else if (framework === 'vue') {
    componentCode = `<template>
  <div :class="['container', className]">
    ${capitalizedComponentName} Component
  </div>
</template>

<script${useTypeScript ? ' lang="ts"' : ''}>
${useTypeScript
        ? `import { defineComponent } from 'vue';

export default defineComponent({
  name: '${capitalizedComponentName}',
});
`
        : `export default {
  name: '${capitalizedComponentName}',
};
`}
</script>

<script setup${useTypeScript ? ' lang="ts"' : ''}>
${useTypeScript
        ? `defineProps<{
  className?: string;
  // Define additional props here
}>();
`
        : `defineProps({
  className: {
    type: String,
    default: '',
  },
  // Define additional props here
});
`}
</script>

<style scoped lang="scss">
.container {
  // Your styles here
}
</style>
`;
  } else if (framework === 'svelte') {
    componentCode = `<script${useTypeScript ? ' lang="ts"' : ''}>
${useTypeScript
        ? `export let className = '';
// Define additional props here
`
        : `export let className = '';
// Define additional props here
`}
</script>

<div class="container {className}">
  ${capitalizedComponentName} Component
</div>

<style>
.container {
  /* Your styles here */
}
</style>
`;
  }

  const fileExtension = framework === 'vue' ? 'vue' : (framework === 'svelte' ? 'svelte' : extension);
  fs.writeFileSync(path.join(componentDir, `${fileName}.${fileExtension}`), componentCode);
}

// Generate index file
function generateIndexFile(componentDir, componentName, fileName, useTypeScript, framework) {
  const extension = useTypeScript ? 'ts' : 'js';
  let indexCode;

  if (framework === 'react') {
    indexCode = `export * from './${fileName}';\n`;
  } else if (framework === 'vue' || framework === 'svelte') {
    const fileExtension = framework === 'vue' ? 'vue' : 'svelte';
    indexCode = `export { default } from './${fileName}.${fileExtension}';\n`;
  }

  fs.writeFileSync(path.join(componentDir, `index.${extension}`), indexCode);
}

// Generate test file
function generateTestFile(componentDir, componentName, fileName, useTypeScript, framework) {
  const testExtension = useTypeScript ? 'tsx' : 'jsx';
  const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  const importPath = fileName === 'index' ? './' : `./${fileName}`;

  let testCode;
  if (framework === 'react') {
    testCode = useTypeScript
      ? `// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${capitalizedComponentName} } from '${importPath}';

describe('${capitalizedComponentName} Component', () => {
  test('renders without crashing', () => {
    render(<${capitalizedComponentName} />);
    const element = screen.getByText('${capitalizedComponentName} Component');
    expect(element).toBeInTheDocument();
  });

  test('applies className prop correctly', () => {
    render(<${capitalizedComponentName} className="test-class" />);
    const element = screen.getByText('${capitalizedComponentName} Component');
    expect(element.className).toContain('test-class');
  });
});
`
      : `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${capitalizedComponentName} } from '${importPath}';

describe('${capitalizedComponentName} Component', () => {
  test('renders without crashing', () => {
    render(<${capitalizedComponentName} />);
    expect(screen.getByText('${capitalizedComponentName} Component')).toBeInTheDocument();
  });

  test('applies className prop correctly', () => {
    render(<${capitalizedComponentName} className="test-class" />);
    const element = screen.getByText('${capitalizedComponentName} Component');
    expect(element.className).toContain('test-class');
  });
});
`;
  } else if (framework === 'vue') {
    const testFileExtension = useTypeScript ? 'ts' : 'js';
    testCode = useTypeScript
      ? `// @ts-nocheck
import { mount } from '@vue/test-utils';
import ${capitalizedComponentName} from './${fileName}.vue';

describe('${capitalizedComponentName} Component', () => {
  test('renders without crashing', () => {
    const wrapper = mount(${capitalizedComponentName});
    expect(wrapper.text()).toContain('${capitalizedComponentName} Component');
  });

  test('applies className prop correctly', () => {
    const wrapper = mount(${capitalizedComponentName}, {
      props: {
        className: 'test-class'
      }
    });
    expect(wrapper.classes()).toContain('test-class');
  });
});
`
      : `import { mount } from '@vue/test-utils';
import ${capitalizedComponentName} from './${fileName}.vue';

describe('${capitalizedComponentName} Component', () => {
  test('renders without crashing', () => {
    const wrapper = mount(${capitalizedComponentName});
    expect(wrapper.text()).toContain('${capitalizedComponentName} Component');
  });

  test('applies className prop correctly', () => {
    const wrapper = mount(${capitalizedComponentName}, {
      props: {
        className: 'test-class'
      }
    });
    expect(wrapper.classes()).toContain('test-class');
  });
});
`;
    fs.writeFileSync(path.join(componentDir, `${fileName}.test.${testFileExtension}`), testCode);
    return;
  } else if (framework === 'svelte') {
    const testFileExtension = useTypeScript ? 'ts' : 'js';
    testCode = useTypeScript
      ? `// @ts-nocheck
import { render } from '@testing-library/svelte';
import ${capitalizedComponentName} from './${fileName}.svelte';

describe('${capitalizedComponentName} Component', () => {
  test('renders without crashing', () => {
    const { getByText } = render(${capitalizedComponentName});
    expect(getByText('${capitalizedComponentName} Component')).toBeInTheDocument();
  });

  test('applies className prop correctly', () => {
    const { container } = render(${capitalizedComponentName}, { props: { className: 'test-class' } });
    const element = container.querySelector('.container');
    expect(element?.classList.contains('test-class')).toBe(true);
  });
});
`
      : `import { render } from '@testing-library/svelte';
import ${capitalizedComponentName} from './${fileName}.svelte';

describe('${capitalizedComponentName} Component', () => {
  test('renders without crashing', () => {
    const { getByText } = render(${capitalizedComponentName});
    expect(getByText('${capitalizedComponentName} Component')).toBeInTheDocument();
  });

  test('applies className prop correctly', () => {
    const { container } = render(${capitalizedComponentName}, { props: { className: 'test-class' } });
    const element = container.querySelector('.container');
    expect(element?.classList.contains('test-class')).toBe(true);
  });
});
`;
    fs.writeFileSync(path.join(componentDir, `${fileName}.test.${testFileExtension}`), testCode);
    return;
  }

  fs.writeFileSync(path.join(componentDir, `${fileName}.test.${testExtension}`), testCode);
}

// Generate stories file
function generateStoriesFile(componentDir, componentName, fileName, componentType, useTypeScript, framework) {
  const storyExtension = useTypeScript ? 'tsx' : 'jsx';
  const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  const importPath = fileName === 'index' ? './' : `./${fileName}`;

  let storiesCode;
  if (framework === 'react') {
    storiesCode = useTypeScript
      ? `// @ts-nocheck
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ${capitalizedComponentName} } from '${importPath}';

const meta = {
  title: '${componentType}/${capitalizedComponentName}',
  component: ${capitalizedComponentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
} as Meta<typeof ${capitalizedComponentName}>;

export default meta;
type Story = StoryObj<typeof ${capitalizedComponentName}>;

export const Default: Story = {
  args: {
    // Your default props here
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
`
      : `import React from 'react';
import { ${capitalizedComponentName} } from '${importPath}';

export default {
  title: '${componentType}/${capitalizedComponentName}',
  component: ${capitalizedComponentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export const Default = {
  args: {
    // Your default props here
  },
};

export const WithCustomClass = {
  args: {
    className: 'custom-class',
  },
};
`;
  } else if (framework === 'vue') {
    const storyFileExtension = useTypeScript ? 'ts' : 'js';
    storiesCode = useTypeScript
      ? `// @ts-nocheck
import ${capitalizedComponentName} from './${fileName}.vue';

export default {
  title: '${componentType}/${capitalizedComponentName}',
  component: ${capitalizedComponentName},
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    // Add more argTypes here
  },
};

export const Default = {
  render: (args) => ({
    components: { ${capitalizedComponentName} },
    setup() {
      return { args };
    },
    template: '<${capitalizedComponentName} v-bind="args" />',
  }),
  args: {
    // Your default props here
  },
};

export const WithCustomClass = {
  render: (args) => ({
    components: { ${capitalizedComponentName} },
    setup() {
      return { args };
    },
    template: '<${capitalizedComponentName} v-bind="args" />',
  }),
  args: {
    className: 'custom-class',
  },
};
`
      : `import ${capitalizedComponentName} from './${fileName}.vue';

export default {
  title: '${componentType}/${capitalizedComponentName}',
  component: ${capitalizedComponentName},
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    // Add more argTypes here
  },
};

export const Default = {
  render: (args) => ({
    components: { ${capitalizedComponentName} },
    setup() {
      return { args };
    },
    template: '<${capitalizedComponentName} v-bind="args" />',
  }),
  args: {
    // Your default props here
  },
};

export const WithCustomClass = {
  render: (args) => ({
    components: { ${capitalizedComponentName} },
    setup() {
      return { args };
    },
    template: '<${capitalizedComponentName} v-bind="args" />',
  }),
  args: {
    className: 'custom-class',
  },
};
`;
    fs.writeFileSync(path.join(componentDir, `${fileName}.stories.${storyFileExtension}`), storiesCode);
    return;
  } else if (framework === 'svelte') {
    const storyFileExtension = useTypeScript ? 'ts' : 'js';
    storiesCode = useTypeScript
      ? `// @ts-nocheck
import ${capitalizedComponentName} from './${fileName}.svelte';

export default {
  title: '${componentType}/${capitalizedComponentName}',
  component: ${capitalizedComponentName},
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    // Add more argTypes here
  },
};

export const Default = {
  args: {
    // Your default props here
  },
};

export const WithCustomClass = {
  args: {
    className: 'custom-class',
  },
};
`
      : `import ${capitalizedComponentName} from './${fileName}.svelte';

export default {
  title: '${componentType}/${capitalizedComponentName}',
  component: ${capitalizedComponentName},
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    // Add more argTypes here
  },
};

export const Default = {
  args: {
    // Your default props here
  },
};

export const WithCustomClass = {
  args: {
    className: 'custom-class',
  },
};
`;
    fs.writeFileSync(path.join(componentDir, `${fileName}.stories.${storyFileExtension}`), storiesCode);
    return;
  }

  fs.writeFileSync(path.join(componentDir, `${fileName}.stories.${storyExtension}`), storiesCode);
}

// Generate styles file
function generateStylesFile(componentDir) {
  const stylesCode = `.container {
  // Your styles here
}
`;
  fs.writeFileSync(path.join(componentDir, 'styles.module.scss'), stylesCode);
}

// Generate hooks file
function generateHooksFile(componentDir, hookName, useTypeScript) {
  const extension = useTypeScript ? 'tsx' : 'jsx';

  const hooksCode = useTypeScript
    ? `import { useState, useEffect } from 'react';

export const ${hookName} = () => {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    // Hook implementation
  }, []);

  return {
    state
  };
};
`
    : `import { useState, useEffect } from 'react';

export const ${hookName} = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Hook implementation
  }, []);

  return {
    state
  };
};
`;

  fs.writeFileSync(path.join(componentDir, `hooks.${extension}`), hooksCode);
}

// Generate constants file
function generateConstantsFile(componentDir, useTypeScript) {
  const extension = 'ts';

  const constantsCode = `// Component-specific constants
export const CONSTANTS = {
  // Add your constants here
};
`;

  fs.writeFileSync(path.join(componentDir, `constants.${extension}`), constantsCode);
}

// Generate utils file
function generateUtilsFile(componentDir, useTypeScript) {
  const extension = 'ts';

  const utilsCode = `// Component-specific utility functions

/**
 * Example utility function
 */
export const exampleUtil = () => {
  // Implementation
};
`;

  fs.writeFileSync(path.join(componentDir, `utils.${extension}`), utilsCode);
}

async function generateAppComponent() {
  // Get component name from command line
  const componentName = process.argv[2];
  if (!componentName) {
    console.error(chalk.red('Please provide a component name: npm run gen:app ComponentName'));
    process.exit(1);
  }

  console.log(chalk.green(`\n📦 Generating app component: ${componentName}\n`));

  // Get app info
  const appInfo = getAppInfo();
  const { isInAppsDir, framework } = appInfo;

  // Check if we're in an apps directory
  if (!isInAppsDir) {
    console.error(chalk.red('You are not in an apps directory. Please navigate to an apps/{app-name} directory.'));
    process.exit(1);
  }

  console.log(chalk.blue(`Framework: ${framework}`));

  let useTypeScript = false;

  // Ask about TypeScript
  const { useTs } = await inquirer.prompt([
    {
      type: 'list',
      name: 'useTs',
      message: 'Do you want to use TypeScript?',
      choices: ['Yes', 'No']
    }
  ]);
  useTypeScript = useTs === 'Yes';

  // Determine file extensions based on TypeScript choice
  const jsExtension = useTypeScript ? 'ts' : 'js';
  const componentExtension = useTypeScript ? 'tsx' : 'jsx';

  // Ask for directory name
  const { directoryName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'directoryName',
      message: 'Enter component directory name:',
      default: componentName,
      validate: (input) => input ? true : 'Directory name is required'
    }
  ]);

  // Determine component directory based on framework
  const basePath = process.cwd();
  let componentDir;
  let componentsDir;

  if (framework === 'svelte') {
    componentsDir = path.join(basePath, 'lib');
    componentDir = path.join(componentsDir, directoryName);
  } else {
    componentsDir = path.join(basePath, 'src', 'components');
    componentDir = path.join(componentsDir, directoryName);
  }

  console.log(chalk.blue(`Component will be created at: ${componentDir}`));

  // Get filename
  const { fileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Enter component filename (without extension):',
      default: 'index'
    }
  ]);

  // Set componentType for storybook
  const componentType = `Components/${componentName}`;

  // Ask which files to generate using checkboxes
  const fileExtension = framework === 'vue' ? 'vue' : (framework === 'svelte' ? 'svelte' : componentExtension);
  const { filesToGenerate } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'filesToGenerate',
      message: 'Select files to generate:',
      choices: [
        { name: `${fileName}.${fileExtension}`, value: 'component', checked: true },
        { name: `index.${jsExtension}`, value: 'index', checked: fileName !== 'index' },
        { name: `${fileName}.test.${jsExtension}`, value: 'test' },
        { name: `${fileName}.stories.${jsExtension}`, value: 'stories' },
        { name: 'styles.module.scss', value: 'styles', checked: true },
        { name: 'hooks.tsx', value: 'hooks' },
        { name: 'constants.ts', value: 'constants' },
        { name: 'utils.ts', value: 'utils' }
      ]
    }
  ]);

  // Ask about parent index file
  const { updateParentIndex } = await inquirer.prompt([
    {
      type: 'list',
      name: 'updateParentIndex',
      message: 'Do you want to automatically export this component in the parent index file?',
      choices: ['Yes', 'No'],
      default: 'Yes'
    }
  ]);

  // Additional information for hooks if selected
  let hookName = '';
  if (filesToGenerate.includes('hooks')) {
    const { hookNameInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'hookNameInput',
        message: 'Enter hook name:',
        default: `use${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`,
        validate: (input) => {
          if (!input) return 'Hook name is required';
          if (!input.startsWith('use')) return 'Hook name must start with "use"';
          return true;
        }
      }
    ]);
    hookName = hookNameInput;
  }

  // Check if directory already exists
  if (fs.existsSync(componentDir)) {
    const { shouldOverwrite } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shouldOverwrite',
        message: `Component ${componentName} already exists at ${componentDir}. Do you want to overwrite it?`,
        choices: ['Yes', 'No']
      }
    ]);

    if (shouldOverwrite === 'No') {
      console.log(chalk.yellow('Operation cancelled. No changes were made.'));
      process.exit(0);
    }

    // Remove existing directory
    fs.removeSync(componentDir);
  }

  try {
    // Ensure parent directories exist
    if (!fs.existsSync(componentsDir)) {
      ensureDirectoryExists(componentsDir);
      console.log(chalk.green(`Created components directory: ${componentsDir}`));
    }

    // Create component directory
    ensureDirectoryExists(componentDir);
    console.log(chalk.green(`Created component directory: ${componentDir}`));

    // Generate selected files
    if (filesToGenerate.includes('component')) {
      generateComponentFile(componentDir, componentName, fileName, useTypeScript, framework);
    }

    if (filesToGenerate.includes('index') && fileName !== 'index') {
      generateIndexFile(componentDir, componentName, fileName, useTypeScript, framework);
    }

    if (filesToGenerate.includes('test')) {
      generateTestFile(componentDir, componentName, fileName, useTypeScript, framework);
    }

    if (filesToGenerate.includes('stories')) {
      generateStoriesFile(componentDir, componentName, fileName, componentType, useTypeScript, framework);
    }

    if (filesToGenerate.includes('styles')) {
      generateStylesFile(componentDir);
    }

    if (filesToGenerate.includes('hooks')) {
      generateHooksFile(componentDir, hookName, useTypeScript);
    }

    if (filesToGenerate.includes('constants')) {
      generateConstantsFile(componentDir, useTypeScript);
    }

    if (filesToGenerate.includes('utils')) {
      generateUtilsFile(componentDir, useTypeScript);
    }

    console.log(chalk.green(`Component files generated successfully.`));

    // Update parent index file if requested
    if (updateParentIndex === 'Yes') {
      updateParentIndexFile(componentDir, componentName, useTypeScript, framework);
    }

    // Format files with Prettier if available
    formatFilesWithPrettier(componentDir);

    // Run ESLint if available
    lintGeneratedFiles(componentDir, framework);

    // Check if Git is available and offer to add files
    if (addFilesToGit(componentDir)) {
      const { shouldCommit } = await inquirer.prompt([
        {
          type: 'list',
          name: 'shouldCommit',
          message: 'Do you want to stage the new component files in git?',
          choices: ['Yes', 'No']
        }
      ]);

      if (shouldCommit === 'Yes') {
        try {
          execSync(`git add ${componentDir}`, { stdio: 'inherit' });

          // Also add parent index file if updated
          if (updateParentIndex === 'Yes') {
            const parentDir = path.dirname(componentDir);
            const indexExtension = useTypeScript ? 'ts' : 'js';
            const parentIndexPath = path.join(parentDir, `index.${indexExtension}`);

            if (fs.existsSync(parentIndexPath)) {
              execSync(`git add ${parentIndexPath}`, { stdio: 'inherit' });
            }
          }

          console.log(chalk.green('Files staged in git.'));

          // Ask for commit message
          const { commitMessage } = await inquirer.prompt([
            {
              type: 'input',
              name: 'commitMessage',
              message: 'Enter commit message (optional, press Enter to skip commit):',
            }
          ]);

          if (commitMessage) {
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            console.log(chalk.green('Changes committed to git.'));
          }
        } catch (error) {
          console.warn(chalk.yellow(`Git operations failed: ${error.message}`));
        }
      }
    }

    console.log(chalk.green(`\n✨ Component ${componentName} successfully generated at ${componentDir}\n`));

    // Print summary
    console.log(chalk.blue('📋 Component Summary:'));
    console.log(chalk.blue('- Name:'), componentName);
    console.log(chalk.blue('- Framework:'), framework);
    console.log(chalk.blue('- TypeScript:'), useTypeScript ? 'Yes' : 'No');
    console.log(chalk.blue('- Directory:'), directoryName);
    console.log(chalk.blue('- Location:'), componentDir);
    console.log(chalk.blue('- Generated Files:'));

    // List generated files
    const files = fs.readdirSync(componentDir);
    files.forEach(file => {
      console.log(chalk.blue(`  - ${file}`));
    });

  } catch (error) {
    console.error(chalk.red(`Error generating component: ${error.message}`));
    console.error(error.stack);
    // Clean up on error
    if (fs.existsSync(componentDir)) {
      fs.removeSync(componentDir);
    }
    process.exit(1);
  }
}

// Run the function
generateAppComponent().catch(err => {
  console.error(chalk.red('Error generating component:'), err);
  process.exit(1);
});