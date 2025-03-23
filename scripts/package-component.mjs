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

// Helper function to determine current directory type
function getCurrentFramework() {
  // Normalize path for cross-platform compatibility
  const cwd = process.cwd().replace(/\\/g, '/');
  console.log(`Normalized path: ${cwd}`);

  // Check if we're in a UI package directory
  if (cwd.includes('packages/ui/') || cwd.includes('packages\\ui\\')) {
    const frameworkMatch = cwd.match(/packages[\\/]ui[\\/]([^\\/]+)/);
    if (frameworkMatch) {
      console.log(`Detected UI package, framework: ${frameworkMatch[1]}`);
      return frameworkMatch[1]; // 'react', 'vue', or 'svelte'
    }
  }

  // Not in a UI package
  return null;
}

// Generate React component files
function generateReactComponent(componentDir, componentName, fileName, componentType, useTypeScript) {
  const extension = useTypeScript ? 'tsx' : 'jsx';
  const styleExtension = 'scss';
  const testExtension = useTypeScript ? 'tsx' : 'jsx';
  const storyExtension = useTypeScript ? 'tsx' : 'jsx';
  const indexExtension = useTypeScript ? 'ts' : 'js'; // Use appropriate extension for index file

  // Capitalize component name for React component
  const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  // Determine import path for test and storybook files
  const importPath = fileName === 'index' ? './' : `./${fileName}`;

  // Component file
  const componentCode = useTypeScript
    ? `import React from 'react';
import styles from './styles.module.${styleExtension}';

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
import styles from './styles.module.${styleExtension}';

export const ${capitalizedComponentName} = (props) => {
  const { className = '', ...otherProps } = props;

  return (
    <div className={\`\${styles.container} \${className}\`} {...otherProps}>
      ${capitalizedComponentName} Component
    </div>
  );
};
`;

  // Ensure there's an index file exporting the component if fileName is not index
  if (fileName !== 'index') {
    fs.writeFileSync(
      path.join(componentDir, `index.${indexExtension}`),
      `export * from './${fileName}';\n`
    );
  }

  // Create component file
  fs.writeFileSync(path.join(componentDir, `${fileName}.${extension}`), componentCode);

  // Styles file
  const stylesCode = `.container {
  // Your styles here
}
`;
  fs.writeFileSync(path.join(componentDir, `styles.module.${styleExtension}`), stylesCode);

  // Test file (fixed TypeScript issues)
  const testCode = useTypeScript
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
  fs.writeFileSync(path.join(componentDir, `${fileName}.test.${testExtension}`), testCode);

  // Storybook file (fixed TypeScript issues)
  const storybookCode = useTypeScript
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
  fs.writeFileSync(path.join(componentDir, `${fileName}.stories.${storyExtension}`), storybookCode);
}

// Generate Vue component files
function generateVueComponent(componentDir, componentName, fileName, componentType, useTypeScript) {
  const extension = 'vue'; // Vue files are always .vue
  const styleExtension = 'scss';
  const testExtension = useTypeScript ? 'ts' : 'js';
  const storyExtension = useTypeScript ? 'ts' : 'js';
  const indexExtension = useTypeScript ? 'ts' : 'js'; // Use appropriate extension for index file

  // Capitalize component name for component
  const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  // Component file with TypeScript proper setup
  const componentCode = `<template>
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

<style scoped lang="${styleExtension}">
.container {
  // Your styles here
}
</style>
`;

  // Create component file
  fs.writeFileSync(path.join(componentDir, `${fileName}.${extension}`), componentCode);

  // Ensure there's an index file exporting the component if fileName is not index
  if (fileName !== 'index') {
    fs.writeFileSync(
      path.join(componentDir, `index.${indexExtension}`),
      `export { default } from './${fileName}.vue';\n`
    );
  }

  // Test file
  const testCode = useTypeScript
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
  fs.writeFileSync(path.join(componentDir, `${fileName}.test.${testExtension}`), testCode);

  // Storybook file
  const storybookCode = useTypeScript
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
  fs.writeFileSync(path.join(componentDir, `${fileName}.stories.${storyExtension}`), storybookCode);
}

// Generate Svelte component files
function generateSvelteComponent(componentDir, componentName, fileName, componentType, useTypeScript) {
  const extension = 'svelte'; // Svelte files are always .svelte
  const testExtension = useTypeScript ? 'ts' : 'js';
  const storyExtension = useTypeScript ? 'ts' : 'js';
  const indexExtension = useTypeScript ? 'ts' : 'js'; // Use appropriate extension for index file

  // Capitalize component name for component
  const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  // Component file
  const componentCode = `<script${useTypeScript ? ' lang="ts"' : ''}>
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

  // Create component file
  fs.writeFileSync(path.join(componentDir, `${fileName}.${extension}`), componentCode);

  // Ensure there's an index file exporting the component if fileName is not index
  if (fileName !== 'index') {
    fs.writeFileSync(
      path.join(componentDir, `index.${indexExtension}`),
      `export { default } from './${fileName}.svelte';\n`
    );
  }

  // Test file
  const testCode = useTypeScript
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
  fs.writeFileSync(path.join(componentDir, `${fileName}.test.${testExtension}`), testCode);

  // Storybook file
  const storybookCode = useTypeScript
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
  fs.writeFileSync(path.join(componentDir, `${fileName}.stories.${storyExtension}`), storybookCode);
}

// Function to generate component files based on framework
function generateComponentFiles(componentDir, componentName, fileName, componentType, framework, useTypeScript) {
  console.log(`Generating files for framework: ${framework}`);

  switch (framework) {
    case 'react':
      generateReactComponent(componentDir, componentName, fileName, componentType, useTypeScript);
      break;
    case 'vue':
      generateVueComponent(componentDir, componentName, fileName, componentType, useTypeScript);
      break;
    case 'svelte':
      generateSvelteComponent(componentDir, componentName, fileName, componentType, useTypeScript);
      break;
    default:
      console.error(`Unsupported framework: ${framework}`);
      process.exit(1);
  }
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

    // Ask user if they want to add to Git
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

async function generateComponent() {
  // Get component name from command line
  const componentName = process.argv[2];
  if (!componentName) {
    console.error(chalk.red('Please provide a component name: npm run gen:ui ComponentName'));
    process.exit(1);
  }

  console.log(chalk.green(`\n📦 Generating UI component: ${componentName}\n`));

  // Get current framework
  const framework = getCurrentFramework();
  if (!framework) {
    console.error(chalk.red('You are not in a UI package directory. Please navigate to packages/ui/{react|vue|svelte} directory.'));
    process.exit(1);
  }

  let useTypeScript = false;
  let componentType = '';
  let componentDir = '';

  console.log(chalk.blue(`Detected framework: ${framework}`));

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

  // Ask about component type (Atomic Design)
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select component type:',
      choices: ['atoms', 'molecules', 'organisms', 'templates', 'shared']
    }
  ]);
  componentType = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize

  // Determine component directory
  componentDir = path.join(
    process.cwd(),
    'src',
    type,
    componentName
  );

  // Get filename
  const { fileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Enter filename (without extension):',
      default: 'index'
    }
  ]);

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
    // Create component directory
    ensureDirectoryExists(componentDir);
    console.log(chalk.green(`Created component directory: ${componentDir}`));

    // Generate component files based on framework
    generateComponentFiles(
      componentDir,
      componentName,
      fileName,
      componentType,
      framework,
      useTypeScript
    );

    console.log(chalk.green(`Component files generated successfully.`));

    // Format files with Prettier if available
    formatFilesWithPrettier(componentDir);

    // Run ESLint if available
    lintGeneratedFiles(componentDir, framework);

    // Update index file of the parent directory to export the new component if needed
    const parentDir = path.dirname(componentDir);
    const parentIndexPath = path.join(parentDir, useTypeScript ? 'index.ts' : 'index.js');

    try {
      // Check if parent index exists
      let parentIndexContent = '';
      if (fs.existsSync(parentIndexPath)) {
        parentIndexContent = fs.readFileSync(parentIndexPath, 'utf8');
      }

      // Add export statement if not already there
      const exportStatement = `export * from './${componentName}';\n`;
      if (!parentIndexContent.includes(exportStatement)) {
        fs.writeFileSync(parentIndexPath, parentIndexContent + exportStatement);
        console.log(chalk.green(`Updated parent index file at ${parentIndexPath}`));
      }
    } catch (err) {
      console.warn(chalk.yellow(`Could not update parent index file: ${err.message}`));
    }

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
          if (fs.existsSync(parentIndexPath)) {
            execSync(`git add ${parentIndexPath}`, { stdio: 'inherit' });
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
    console.log(chalk.blue('- Type:'), componentType);
    console.log(chalk.blue('- Location:'), componentDir);
    console.log(chalk.blue('- Files:'));

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
generateComponent().catch(err => {
  console.error(chalk.red('Error generating component:'), err);
  process.exit(1);
});