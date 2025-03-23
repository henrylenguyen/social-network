// fix-ui-packages.js - Sử dụng ES Modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const packagesPath = path.join(__dirname, 'packages', 'ui');

console.log('🔍 Bắt đầu sửa các gói UI...');
console.log(`📂 Đường dẫn packages: ${packagesPath}`);

// Hàm tạo thư mục nếu chưa tồn tại
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  ✓ Đã tạo thư mục: ${dirPath}`);
    }
  } catch (error) {
    console.error(`  ❌ Lỗi khi tạo thư mục ${dirPath}:`, error.message);
  }
}

// Hàm đọc package.json
function readPackageJson(packagePath) {
  try {
    if (fs.existsSync(packagePath)) {
      const content = fs.readFileSync(packagePath, 'utf8');
      return JSON.parse(content);
    } else {
      console.warn(`  ⚠️ Không tìm thấy file ${packagePath}`);
      return { name: path.basename(path.dirname(packagePath)), version: "0.0.1", scripts: {} };
    }
  } catch (error) {
    console.error(`  ❌ Lỗi khi đọc package.json từ ${packagePath}:`, error.message);
    return { name: path.basename(path.dirname(packagePath)), version: "0.0.1", scripts: {} };
  }
}

// Hàm ghi package.json
function writePackageJson(packagePath, content) {
  try {
    fs.writeFileSync(packagePath, JSON.stringify(content, null, 2));
    console.log(`  ✓ Đã cập nhật file: ${packagePath}`);
  } catch (error) {
    console.error(`  ❌ Lỗi khi ghi file ${packagePath}:`, error.message);
  }
}

// Hàm tạo file nếu không tồn tại
function ensureFile(filePath, content) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✓ Đã tạo file: ${filePath}`);
    }
  } catch (error) {
    console.error(`  ❌ Lỗi khi tạo file ${filePath}:`, error.message);
  }
}

try {
  // Kiểm tra thư mục packages/ui tồn tại
  if (!fs.existsSync(packagesPath)) {
    fs.mkdirSync(packagesPath, { recursive: true });
    console.log(`✓ Đã tạo thư mục: ${packagesPath}`);
  }

  // Fix Svelte package
  console.log('\n📦 Fixing Svelte package...');
  const sveltePackagePath = path.join(packagesPath, 'svelte');
  ensureDir(sveltePackagePath);

  // Tạo thư mục cấu trúc cho Svelte
  const svelteSrcPath = path.join(sveltePackagePath, 'src');
  ensureDir(svelteSrcPath);

  // Svelte đòi hỏi cấu trúc src/lib
  const svelteSrcLibPath = path.join(svelteSrcPath, 'lib');
  ensureDir(svelteSrcLibPath);

  // Tạo thư mục components
  ['atoms', 'molecules', 'organisms', 'templates', 'shared'].forEach(dir => {
    ensureDir(path.join(svelteSrcLibPath, dir));
  });

  // Tạo file index.js trong lib
  ensureFile(
    path.join(svelteSrcLibPath, 'index.js'),
    '// Svelte UI components exports\n\n// Re-export all components\n'
  );

  // Cập nhật package.json cho Svelte
  const sveltePackageJsonPath = path.join(sveltePackagePath, 'package.json');
  const sveltePackageJson = readPackageJson(sveltePackageJsonPath);
  sveltePackageJson.name = sveltePackageJson.name || '@social-blog/ui-svelte';
  sveltePackageJson.version = sveltePackageJson.version || '0.0.1';
  sveltePackageJson.private = true;
  sveltePackageJson.scripts = {
    ...(sveltePackageJson.scripts || {}),
    build: 'svelte-package',
    dev: 'svelte-package --watch',
    lint: 'eslint \"src/**/*.{ts,svelte}\" --fix',
    clean: 'rm -rf .turbo && rm -rf node_modules && rm -rf dist'
  };
  sveltePackageJson.main = './dist/index.js';
  sveltePackageJson.module = './dist/index.js';
  sveltePackageJson.svelte = './dist/index.js';
  sveltePackageJson.types = './dist/index.d.ts';
  sveltePackageJson.exports = {
    '.': {
      types: './dist/index.d.ts',
      svelte: './dist/index.js',
      default: './dist/index.js'
    }
  };
  writePackageJson(sveltePackageJsonPath, sveltePackageJson);

  // Fix Vue package
  console.log('\n📦 Fixing Vue package...');
  const vuePackagePath = path.join(packagesPath, 'vue');
  ensureDir(vuePackagePath);

  // Tạo thư mục src
  const vueSrcPath = path.join(vuePackagePath, 'src');
  ensureDir(vueSrcPath);

  // Tạo thư mục components
  ['atoms', 'molecules', 'organisms', 'templates', 'shared'].forEach(dir => {
    ensureDir(path.join(vueSrcPath, dir));
  });

  // Tạo file index.ts
  ensureFile(
    path.join(vueSrcPath, 'index.ts'),
    '// Vue UI components exports\n\n// Re-export all components\n'
  );

  // Tạo shims-vue.d.ts
  ensureFile(
    path.join(vueSrcPath, 'shims-vue.d.ts'),
    'declare module \'*.vue\' {\n  import { DefineComponent } from \'vue\';\n  const component: DefineComponent<{}, {}, any>;\n  export default component;\n}\n'
  );

  // Cập nhật package.json cho Vue
  const vuePackageJsonPath = path.join(vuePackagePath, 'package.json');
  const vuePackageJson = readPackageJson(vuePackageJsonPath);
  vuePackageJson.name = vuePackageJson.name || '@social-blog/ui-vue';
  vuePackageJson.version = vuePackageJson.version || '0.0.1';
  vuePackageJson.private = true;
  vuePackageJson.scripts = {
    ...(vuePackageJson.scripts || {}),
    build: 'tsup src/index.ts --format esm,cjs --dts --external vue',
    dev: 'tsup src/index.ts --format esm,cjs --watch --dts --external vue',
    lint: 'eslint \"src/**/*.{ts,vue}\" --fix',
    clean: 'rm -rf .turbo && rm -rf node_modules && rm -rf dist'
  };
  vuePackageJson.main = './dist/index.js';
  vuePackageJson.module = './dist/index.mjs';
  vuePackageJson.types = './dist/index.d.ts';
  writePackageJson(vuePackageJsonPath, vuePackageJson);

  // Fix React package
  console.log('\n📦 Fixing React package...');
  const reactPackagePath = path.join(packagesPath, 'react');
  ensureDir(reactPackagePath);

  // Tạo thư mục src
  const reactSrcPath = path.join(reactPackagePath, 'src');
  ensureDir(reactSrcPath);

  // Tạo thư mục components
  ['atoms', 'molecules', 'organisms', 'templates', 'shared'].forEach(dir => {
    ensureDir(path.join(reactSrcPath, dir));
  });

  // Tạo file index.ts
  ensureFile(
    path.join(reactSrcPath, 'index.ts'),
    '// React UI components exports\n\n// Re-export all components\n'
  );

  // Cập nhật package.json cho React
  const reactPackageJsonPath = path.join(reactPackagePath, 'package.json');
  const reactPackageJson = readPackageJson(reactPackageJsonPath);
  reactPackageJson.name = reactPackageJson.name || '@social-blog/ui-react';
  reactPackageJson.version = reactPackageJson.version || '0.0.1';
  reactPackageJson.private = true;
  reactPackageJson.scripts = {
    ...(reactPackageJson.scripts || {}),
    build: 'tsup src/index.ts --format esm,cjs --dts --external react',
    dev: 'tsup src/index.ts --format esm,cjs --watch --dts --external react',
    lint: 'eslint \"src/**/*.{ts,tsx}\" --fix',
    clean: 'rm -rf .turbo && rm -rf node_modules && rm -rf dist'
  };
  reactPackageJson.main = './dist/index.js';
  reactPackageJson.module = './dist/index.mjs';
  reactPackageJson.types = './dist/index.d.ts';
  writePackageJson(reactPackageJsonPath, reactPackageJson);

  console.log('\n✅ Tất cả các package UI đã được sửa thành công!');
  console.log('🚀 Bạn có thể chạy: npm run build');

} catch (error) {
  console.error(`\n❌ Lỗi: ${error.message}`);
  console.error(error);
}