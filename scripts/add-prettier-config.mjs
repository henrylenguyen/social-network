// scripts/add-prettier-config.js
import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'

// Nội dung cho file .prettierrc.js
const prettierConfigContent = `// .prettierrc.js
module.exports = require('@social-blog/prettier-config');
`

// Kiểm tra xem thư mục gốc có package.json không
function isProjectDir(dirPath) {
  return fs.existsSync(path.join(dirPath, 'package.json'))
}

// Thêm cấu hình Prettier vào một thư mục
function addPrettierConfig(dir) {
  const prettierJsPath = path.join(dir, '.prettierrc.js')
  const prettierJsonPath = path.join(dir, '.prettierrc')
  const prettierJsoncPath = path.join(dir, '.prettierrc.json')

  // Kiểm tra xem đã có file cấu hình Prettier nào chưa
  if (fs.existsSync(prettierJsPath) || fs.existsSync(prettierJsonPath) || fs.existsSync(prettierJsoncPath)) {
    console.log(`Cấu hình Prettier đã tồn tại trong: ${dir}`)

    // Cập nhật file cấu hình nếu đã tồn tại
    if (fs.existsSync(prettierJsPath)) {
      fs.writeFileSync(prettierJsPath, prettierConfigContent)
      console.log(`✅ Đã cập nhật: ${prettierJsPath}`)
    }
  } else {
    // Tạo file .prettierrc.js mới
    fs.writeFileSync(prettierJsPath, prettierConfigContent)
    console.log(`✅ Đã tạo mới: ${prettierJsPath}`)
  }
}

// Hàm chính để thêm cấu hình Prettier vào tất cả các packages và apps
function addPrettierConfigToAllProjects() {
  const rootDir = process.cwd()
  console.log(`🔍 Đang tìm packages và apps trong: ${rootDir}`)

  // Tìm tất cả các thư mục packages
  const packagesPattern = path.join(rootDir, 'packages', '*')
  const uiPackagesPattern = path.join(rootDir, 'packages', 'ui', '*')

  // Tìm tất cả các thư mục apps
  const appsPattern = path.join(rootDir, 'apps', '*')

  // Tìm tất cả các thư mục dựa trên patterns
  const packages = glob.sync(packagesPattern)
  const uiPackages = glob.sync(uiPackagesPattern)
  const apps = glob.sync(appsPattern)

  // Kết hợp tất cả các thư mục để xử lý
  const allDirectories = [...packages, ...uiPackages, ...apps]

  // Thêm cấu hình Prettier vào mỗi thư mục project
  console.log('📝 Đang thêm cấu hình Prettier...')

  // Thêm cấu hình cho thư mục gốc
  addPrettierConfig(rootDir)

  // Đếm số lượng thư mục đã xử lý
  let processedCount = 1 // Đã tính thư mục gốc

  // Thêm cấu hình cho các thư mục con
  allDirectories.forEach(dir => {
    if (isProjectDir(dir)) {
      addPrettierConfig(dir)
      processedCount++
    }
  })

  console.log(`\n✨ Hoàn thành! Đã thêm/cập nhật cấu hình Prettier cho ${processedCount} thư mục.`)
}

// Chạy hàm chính
addPrettierConfigToAllProjects()