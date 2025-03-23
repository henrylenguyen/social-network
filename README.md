# Hướng dẫn sử dụng công cụ tạo component tự động

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Cách sử dụng app-component.mjs](#cách-sử-dụng-app-componentmjs)
- [Cách sử dụng package-component.mjs](#cách-sử-dụng-package-componentmjs)
- [Cấu trúc file được tạo](#cấu-trúc-file-được-tạo)
- [Tùy chọn nâng cao](#tùy-chọn-nâng-cao)
- [Các vấn đề thường gặp](#các-vấn-đề-thường-gặp)

## Giới thiệu

Công cụ tạo component tự động là một tập hợp các script giúp tạo ra cấu trúc component chuẩn hóa cho dự án của bạn. Chúng bao gồm hai script chính:

1. **app-component.mjs**: Dùng để tạo component cho ứng dụng (trong thư mục `apps/`)
2. **package-component.mjs**: Dùng để tạo component cho các package UI (trong thư mục `packages/ui/`)

Các công cụ này hỗ trợ nhiều framework khác nhau:

- ReactJS
- VueJS
- Svelte

## Cài đặt

Để sử dụng các công cụ này, bạn cần thêm chúng vào phần scripts trong file `package.json` của dự án:

```json
"scripts": {
  "gen:app": "node scripts/app-component.mjs",
  "gen:ui": "node scripts/package-component.mjs"
}
```

Sau đó, sao chép các file `app-component.mjs` và `package-component.mjs` vào thư mục `scripts/` trong dự án của bạn.

## Cách sử dụng app-component.mjs

Công cụ `app-component.mjs` dùng để tạo component cho ứng dụng của bạn.

### Điều kiện sử dụng

- Bạn phải đang ở trong thư mục của một ứng dụng (thư mục có đường dẫn chứa `/apps/` hoặc `\apps\`)
- Môi trường phải được cài đặt NodeJS

### Các bước sử dụng

1. Di chuyển vào thư mục ứng dụng của bạn:

```bash
cd apps/your-app-name
```

2. Chạy lệnh sau để tạo component (thay `ComponentName` bằng tên component bạn muốn tạo):

```bash
npm run gen:app ComponentName
```

3. Thực hiện các bước theo hướng dẫn:

   a. **Chọn TypeScript**: Chọn "Yes" để sử dụng TypeScript, "No" để sử dụng JavaScript

   b. **Nhập tên thư mục**: Nhập tên thư mục chứa component (mặc định là tên component)

   c. **Nhập tên file**: Nhập tên file chính của component (mặc định là "index")

   d. **Chọn các file cần tạo**: Lựa chọn các file bạn muốn tạo từ danh sách sau:

   - File component (`.tsx/.jsx/.vue/.svelte`)
   - File index (để export component)
   - File test
   - File stories (cho Storybook)
   - File styles (CSS/SCSS)
   - File hooks (cho React)
   - File constants
   - File utils

   e. **Tự động export**: Chọn có tự động thêm export vào file index.ts/js của thư mục cha hay không

   f. **Nhập tên hook** (nếu bạn chọn tạo file hooks): Nhập tên cho custom hook (phải bắt đầu bằng "use")

   g. **Xác nhận ghi đè** (nếu component đã tồn tại): Chọn có ghi đè hay không

   h. **Quản lý Git** (nếu dự án sử dụng Git): Chọn có staged và commit thay đổi hay không

4. Sau khi hoàn tất, component mới sẽ được tạo với cấu trúc đã chọn.

### Đường dẫn mặc định

- **React/Vue**: `src/components/[directory-name]/`
- **Svelte**: `lib/[directory-name]/`

## Cách sử dụng package-component.mjs

Công cụ `package-component.mjs` dùng để tạo component cho thư viện UI của bạn.

### Điều kiện sử dụng

- Bạn phải đang ở trong thư mục UI package (có đường dẫn chứa `packages/ui/` hoặc `packages\ui\`)
- Môi trường phải được cài đặt NodeJS

### Các bước sử dụng

1. Di chuyển vào thư mục package UI của bạn:

```bash
cd packages/ui/[framework]
```

2. Chạy lệnh sau để tạo component (thay `ComponentName` bằng tên component bạn muốn tạo):

```bash
npm run gen:ui ComponentName
```

3. Thực hiện các bước theo hướng dẫn:

   a. **Chọn TypeScript**: Chọn "Yes" để sử dụng TypeScript, "No" để sử dụng JavaScript

   b. **Chọn loại component** (theo Atomic Design):

   - atoms: Các component cơ bản nhỏ nhất
   - molecules: Các component được tạo từ nhiều atoms
   - organisms: Các component phức tạp hơn, tạo từ nhiều molecules
   - templates: Các bố cục trang
   - shared: Các component dùng chung

   c. **Nhập tên file**: Nhập tên file chính của component (mặc định là "index")

   d. **Xác nhận ghi đè** (nếu component đã tồn tại): Chọn có ghi đè hay không

   e. **Quản lý Git** (nếu dự án sử dụng Git): Chọn có staged và commit thay đổi hay không

4. Sau khi hoàn tất, component mới sẽ được tạo với cấu trúc đã chọn, và file index của thư mục cha sẽ được cập nhật để export component này.

### Đường dẫn mặc định

- `src/[component-type]/[component-name]/`

Ví dụ: `src/atoms/Button/`

## Cấu trúc file được tạo

### Cho React

```
ComponentName/
├── index.ts|js           # File export
├── [filename].tsx|jsx    # File component chính
├── [filename].test.tsx|jsx # File test
├── [filename].stories.tsx|jsx # File Storybook
├── styles.module.scss    # File styles
├── hooks.tsx|jsx         # (Tùy chọn) Custom hooks
├── constants.ts          # (Tùy chọn) Constants
└── utils.ts              # (Tùy chọn) Utility functions
```

### Cho Vue

```
ComponentName/
├── index.ts|js           # File export
├── [filename].vue        # File component chính
├── [filename].test.ts|js # File test
├── [filename].stories.ts|js # File Storybook
└── (Các file tùy chọn khác)
```

### Cho Svelte

```
ComponentName/
├── index.ts|js             # File export
├── [filename].svelte       # File component chính
├── [filename].test.ts|js   # File test
├── [filename].stories.ts|js # File Storybook
└── (Các file tùy chọn khác)
```

## Tùy chọn nâng cao

### Tùy chỉnh template

Bạn có thể tùy chỉnh template của các file được tạo bằng cách sửa các hàm trong script. Mỗi loại file có một hàm riêng:

- `generateComponentFile()`: File component chính
- `generateIndexFile()`: File index
- `generateTestFile()`: File test
- `generateStoriesFile()`: File Storybook
- `generateStylesFile()`: File styles
- `generateHooksFile()`: File hooks
- `generateConstantsFile()`: File constants
- `generateUtilsFile()`: File utils

### Auto-formatting và linting

Các script hỗ trợ tự động format code với Prettier và kiểm tra lỗi với ESLint (nếu có sẵn trong dự án). Nếu gặp lỗi trong quá trình này, script sẽ hiển thị cảnh báo nhưng vẫn tiếp tục.

### Tích hợp Git

Nếu dự án của bạn sử dụng Git, các script sẽ tự động phát hiện và cung cấp tùy chọn để staged và commit các file mới. Điều này giúp quản lý phiên bản ngay từ khi tạo component.

## Các vấn đề thường gặp

### Lỗi "You are not in an apps directory"

**Nguyên nhân**: Bạn không đang ở trong thư mục của một ứng dụng khi chạy `gen:app`.

**Giải pháp**: Di chuyển vào thư mục ứng dụng đúng:

```bash
cd apps/your-app-name
```

### Lỗi "You are not in a UI package directory"

**Nguyên nhân**: Bạn không đang ở trong thư mục package UI khi chạy `gen:ui`.

**Giải pháp**: Di chuyển vào thư mục package UI đúng:

```bash
cd packages/ui/react # hoặc vue, svelte
```

### Lỗi khi đặt tên hook

**Nguyên nhân**: Tên hook không bắt đầu bằng "use".

**Giải pháp**: Đảm bảo tên hook luôn bắt đầu bằng "use" (ví dụ: "useCounter").

### Lỗi khi chạy Prettier hoặc ESLint

**Nguyên nhân**: Prettier hoặc ESLint không được cài đặt hoặc cấu hình không đúng.

**Giải pháp**: Cài đặt và cấu hình đúng Prettier và ESLint, hoặc bỏ qua lỗi này nếu không cần thiết.

---

Chúc bạn sử dụng công cụ tạo component tự động một cách hiệu quả cho dự án của mình!
