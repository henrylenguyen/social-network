#!/usr/bin/env node

import blessed from 'blessed'
import chalk from 'chalk'
import { spawn } from 'child_process'
import fs from 'fs'
import net from 'net'
import path from 'path'
import { fileURLToPath } from 'url'

// Lấy đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Đường dẫn đến thư mục apps
const appsDir = path.join(__dirname, '..', 'apps')

// Các thông báo lỗi cần bỏ qua
const ERROR_PATTERNS = [
  // Bỏ qua thông báo về NextJS TypeScript plugin
  "Your tsconfig.json extends another configuration, which means we cannot add the Next.js TypeScript plugin",
  "add the Next.js plugin",
  "Learn more: https://nextjs.org/docs/app/building-your-application/configuring/typescript",
  // Bỏ qua thông báo về packageManager
  "This project's package.json defines \"packageManager\"",
  "Presence of the \"packageManager\" field indicates",
  "Corepack must currently be enabled",
  "For more information, check out https://yarnpkg.com/corepack"
]

// Hàm kiểm tra xem dòng output có chứa thông báo lỗi cần bỏ qua không
function shouldFilterLine(line) {
  return ERROR_PATTERNS.some(pattern => line.includes(pattern))
}

// Kiểm tra port đã được sử dụng chưa
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close()
        resolve(false)
      })
      .listen(port)
  })
}

// Tìm port khả dụng
async function findAvailablePort(startPort) {
  let port = startPort
  while (await isPortInUse(port)) {
    port++
  }
  return port
}

async function startUI() {
  try {
    // Kiểm tra xem thư mục apps có tồn tại không
    if (!fs.existsSync(appsDir)) {
      console.error(chalk.red(`Thư mục ${appsDir} không tồn tại`))
      process.exit(1)
    }

    // Đọc danh sách các package từ thư mục apps
    const apps = fs.readdirSync(appsDir).filter(dir =>
      fs.statSync(path.join(appsDir, dir)).isDirectory()
    )

    // Lưu trữ processes và logs
    const processes = {}
    const logs = {}
    const appPorts = {}

    // Khởi tạo screen
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Social Blog Dev UI',
      fullUnicode: true,
      dockBorders: true
    })

    // Tạo header
    const header = blessed.box({
      parent: screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 1,
      content: '{bold}Social Blog Dev Dashboard{/bold}',
      tags: true,
      style: {
        bg: 'blue',
        fg: 'white'
      }
    })

    // Tạo sidebar menu
    const sidebar = blessed.list({
      parent: screen,
      width: '20%',
      height: '100%-2',
      left: 0,
      top: 1,
      border: {
        type: 'line'
      },
      style: {
        selected: {
          bg: 'blue',
          fg: 'white',
          bold: true
        },
        border: {
          fg: 'white'
        },
        item: {
          fg: 'white'
        }
      },
      keys: true,
      vi: true,
      mouse: true,
      tags: true,
      items: [
        'Tasks',
        ...apps.map(app => `${app}#dev »`),
        ...apps.map(app => `${app}#build »`)
      ]
    })

    // Tạo log box
    const logBox = blessed.log({
      parent: screen,
      width: '80%',
      height: '100%-2',
      left: '20%',
      top: 1,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█',
        track: {
          bg: 'black'
        },
        style: {
          fg: 'blue'
        }
      },
      border: {
        type: 'line'
      },
      tags: true,
      padding: 1,
      keys: true,
      vi: true,
      mouse: true,
      input: true,     // Cho phép nhận input
      keyable: true    // Cho phép nhận keyboard events
    })

    // Tạo status bar
    const statusBar = blessed.box({
      parent: screen,
      bottom: 0,
      width: '100%',
      height: 1,
      tags: true,
      content: '{green-fg}ESC{/green-fg}: Thoát | {green-fg}R{/green-fg}: Khởi động lại | {green-fg}K{/green-fg}: Dừng | {green-fg}↑/↓{/green-fg}: Di chuyển | {green-fg}Tab{/green-fg}: Đến log'
    })

    // Bắt sự kiện khi focus vào logBox hoặc sidebar
    logBox.on('focus', () => {
      statusBar.setContent('{green-fg}↑/↓{/green-fg}: Cuộn | {green-fg}PgUp/PgDn{/green-fg}: Cuộn nhanh | {green-fg}Home/End{/green-fg}: Đầu/Cuối | {green-fg}ESC{/green-fg}: Quay về sidebar')
      screen.render()
    })

    sidebar.on('focus', () => {
      statusBar.setContent('{green-fg}ESC{/green-fg}: Thoát | {green-fg}R{/green-fg}: Khởi động lại | {green-fg}K{/green-fg}: Dừng | {green-fg}↑/↓{/green-fg}: Di chuyển | {green-fg}Tab{/green-fg}: Đến log')
      screen.render()
    })

    // Thêm phím tắt Tab để chuyển focus giữa sidebar và logBox
    screen.key(['tab'], () => {
      if (screen.focused === sidebar) {
        logBox.focus()
      } else {
        sidebar.focus()
      }
    })

    // Thêm các phím tắt cuộn cho logBox
    logBox.key(['up'], () => {
      logBox.scroll(-1)
      screen.render()
    })

    logBox.key(['down'], () => {
      logBox.scroll(1)
      screen.render()
    })

    logBox.key(['pageup'], () => {
      logBox.scroll(-(logBox.height - 2))
      screen.render()
    })

    logBox.key(['pagedown'], () => {
      logBox.scroll(logBox.height - 2)
      screen.render()
    })

    logBox.key(['home'], () => {
      logBox.scrollTo(0)
      screen.render()
    })

    logBox.key(['end'], () => {
      logBox.scrollTo(logBox.getScrollHeight())
      screen.render()
    })

    // Thêm phím Esc để quay về sidebar khi đang ở logBox
    logBox.key(['escape'], () => {
      sidebar.focus()
      screen.render()
    })

    // Xử lý khi chọn một mục trong menu
    sidebar.on('select', function (item, index) {
      if (!item) return

      // Lấy text thực tế bỏ ký hiệu »
      const displayText = sidebar.items[index].content || sidebar.items[index]
      const text = displayText.replace(/ »$/, '')

      if (text === 'Tasks') {
        logBox.setContent('{bold}Chọn một ứng dụng để bắt đầu{/bold}')
        return
      }

      const [app, command] = text.split('#')

      // Hiển thị tên ứng dụng đã chọn ở phía trên
      logBox.setLabel(`{bold}${app} - ${command}{/bold}`)

      // Nếu có log đã lưu, hiển thị chúng
      if (logs[text]) {
        logBox.setContent(logs[text].join(''))
        return
      }

      // Nếu process đã tồn tại, chỉ hiển thị log
      if (processes[text]) {
        return
      }

      // Khởi tạo log array nếu chưa có
      if (!logs[text]) {
        logs[text] = []
      }

      // Thêm thông báo khởi động
      logs[text].push(`{yellow-fg}Đang khởi động ${app}...{/yellow-fg}\n`)
      logBox.setContent(logs[text].join(''))

      startApp(app, command, text)

      screen.render()
    })

    // Hàm khởi động ứng dụng
    async function startApp(app, command, text) {
      // Xử lý lệnh chạy
      let cmd, args
      if (process.platform === 'win32') {
        cmd = 'cmd.exe'
        args = ['/c', command === 'dev' ? 'npm run dev' : 'npm run build']
      } else {
        cmd = 'npm'
        args = ['run', command]
      }

      try {
        // Tạo môi trường với các biến môi trường tùy chỉnh
        const env = {
          ...process.env,
          FORCE_COLOR: 'true',
          // Thêm biến môi trường để tắt các cảnh báo NextJS
          NEXT_TELEMETRY_DISABLED: '1'
        }

        // Nếu là ứng dụng web, kiểm tra và cấu hình port
        if (['web', 'admin', 'dating', 'api'].includes(app)) {
          if (!appPorts[app]) {
            // Xác định port mặc định
            let defaultPort
            switch (app) {
              case 'web': defaultPort = 3000; break
              case 'admin': defaultPort = 3001; break
              case 'dating': defaultPort = 3002; break
              case 'api': defaultPort = 3003; break
              default: defaultPort = 3000
            }

            // Tìm port khả dụng
            const availablePort = await findAvailablePort(defaultPort)
            appPorts[app] = availablePort

            if (availablePort !== defaultPort) {
              logs[text].push(`{yellow-fg}Port ${defaultPort} đã được sử dụng, chuyển sang port ${availablePort}{/yellow-fg}\n`)
              logBox.log(`{yellow-fg}Port ${defaultPort} đã được sử dụng, chuyển sang port ${availablePort}{/yellow-fg}\n`)

              // Thiết lập port mới
              env.PORT = availablePort.toString()
            }
          } else {
            // Sử dụng port đã lưu
            env.PORT = appPorts[app].toString()
          }
        }

        const proc = spawn(cmd, args, {
          cwd: path.join(appsDir, app),
          env
        })

        processes[text] = proc

        // Hiển thị stdout
        proc.stdout.on('data', (data) => {
          // Chia dữ liệu thành các dòng và lọc bỏ thông báo lỗi không cần thiết
          const lines = data.toString().split('\n')
          const filteredLines = lines
            .filter(line => !shouldFilterLine(line))
            .join('\n')

          if (filteredLines.trim()) {
            const output = `{green-fg}${filteredLines}{/green-fg}`
            logs[text].push(output)

            // Kiểm tra xem đây có phải là mục đang được chọn không
            const selectedText = sidebar.items[sidebar.selected].content || sidebar.items[sidebar.selected]
            if (selectedText.replace(/ »$/, '') === text) {
              logBox.log(output)
              screen.render()
            }
          }
        })

        // Hiển thị stderr
        proc.stderr.on('data', (data) => {
          // Chia dữ liệu thành các dòng và lọc bỏ thông báo lỗi không cần thiết
          const lines = data.toString().split('\n')
          const filteredLines = lines
            .filter(line => !shouldFilterLine(line))
            .join('\n')

          if (filteredLines.trim()) {
            const output = `{red-fg}${filteredLines}{/red-fg}`
            logs[text].push(output)

            // Kiểm tra xem đây có phải là mục đang được chọn không
            const selectedText = sidebar.items[sidebar.selected].content || sidebar.items[sidebar.selected]
            if (selectedText.replace(/ »$/, '') === text) {
              logBox.log(output)
              screen.render()
            }
          }
        })

        // Xử lý khi process kết thúc
        proc.on('close', (code) => {
          const output = `\n{yellow-fg}Process kết thúc với mã ${code}{/yellow-fg}`
          logs[text].push(output)
          delete processes[text]

          // Kiểm tra xem đây có phải là mục đang được chọn không
          const selectedText = sidebar.items[sidebar.selected].content || sidebar.items[sidebar.selected]
          if (selectedText.replace(/ »$/, '') === text) {
            logBox.log(output)
            screen.render()
          }
        })

      } catch (error) {
        const output = `\n{red-fg}Lỗi khi khởi động process: ${error.message}{/red-fg}`
        logs[text].push(output)
        logBox.log(output)
        screen.render()
      }
    }

    // Thêm phím tắt để restart
    screen.key('r', function () {
      if (sidebar.selected !== undefined) {
        const displayText = sidebar.items[sidebar.selected].content || sidebar.items[sidebar.selected]
        const text = displayText.replace(/ »$/, '')

        if (text !== 'Tasks' && processes[text]) {
          const [app, command] = text.split('#')

          logBox.log(`{yellow-fg}Đang khởi động lại ${app}...{/yellow-fg}\n`)
          logs[text].push(`{yellow-fg}Đang khởi động lại ${app}...{/yellow-fg}\n`)

          processes[text].kill()
          delete processes[text]

          // Đợi một chút để process kết thúc hoàn toàn
          setTimeout(() => {
            startApp(app, command, text)
          }, 500)
        }
      }
    })

    // Thêm phím tắt để dừng (kill)
    screen.key('k', function () {
      if (sidebar.selected !== undefined) {
        const displayText = sidebar.items[sidebar.selected].content || sidebar.items[sidebar.selected]
        const text = displayText.replace(/ »$/, '')

        if (text !== 'Tasks' && processes[text]) {
          logBox.log(`{yellow-fg}Đang dừng ${text}...{/yellow-fg}\n`)
          logs[text].push(`{yellow-fg}Đang dừng ${text}...{/yellow-fg}\n`)

          processes[text].kill()
          delete processes[text]
          screen.render()
        }
      }
    })

    // Phím tắt để thoát
    screen.key(['escape', 'q', 'C-c'], function () {
      if (screen.focused === logBox) {
        // Nếu đang ở logBox, quay về sidebar
        sidebar.focus()
        screen.render()
      } else {
        // Nếu đang ở sidebar, thoát ứng dụng
        // Dừng tất cả các processes
        Object.values(processes).forEach(proc => {
          try {
            proc.kill()
          } catch (e) {
            // Bỏ qua lỗi
          }
        })
        return process.exit(0)
      }
    })

    // Focus vào sidebar ban đầu
    sidebar.focus()

    // Render UI
    screen.render()

    // Hiển thị hướng dẫn ban đầu
    logBox.setContent('{bold}Hướng dẫn:{/bold}\n\n' +
      '- Sử dụng phím mũi tên ↑↓ để di chuyển trong menu\n' +
      '- Enter để chọn ứng dụng\n' +
      '- R để khởi động lại ứng dụng đang chọn\n' +
      '- K để dừng ứng dụng đang chọn\n' +
      '- Tab để chuyển sang vùng log\n' +
      '- Khi ở vùng log:\n' +
      '  + ↑/↓: Cuộn lên/xuống từng dòng\n' +
      '  + PgUp/PgDn: Cuộn nhanh lên/xuống\n' +
      '  + Home/End: Đi đến đầu/cuối log\n' +
      '  + ESC: Quay về sidebar\n' +
      '- ESC hoặc q (khi ở sidebar) để thoát\n\n' +
      '{bold}Chọn một ứng dụng từ sidebar để bắt đầu{/bold}'
    )

    screen.render()

  } catch (error) {
    console.error('Lỗi:', error)
    process.exit(1)
  }
}

// Khởi động UI
startUI().catch(error => {
  console.error('Lỗi không xử lý được:', error)
  process.exit(1)
})