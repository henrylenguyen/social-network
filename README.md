# Hướng dẫn sử dụng công cụ tự động tạo component và ứng dụng

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Tạo ứng dụng mới (`folder`)](#tạo-ứng-dụng-mới-folder)
- [Tạo component cho ứng dụng (`gen:app`)](#tạo-component-cho-ứng-dụng-genapp)
- [Tạo component cho thư viện UI (`gen:ui`)](#tạo-component-cho-thư-viện-ui-genui)
- [Tùy chỉnh và mở rộng](#tùy-chỉnh-và-mở-rộng)
- [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

## Giới thiệu

Bộ công cụ này bao gồm 3 script tự động hóa các tác vụ phổ biến trong dự án monorepo:

1. **create-app-folder.mjs**: Tạo thư mục ứng dụng mới với cấu trúc chuẩn
2. **app-component.mjs**: Tạo component cho ứng dụng (trong thư mục `apps/`)
3. **package-component.mjs**: Tạo component cho thư viện UI (trong thư mục `packages/ui/`)

Các công cụ này giúp tiết kiệm thời gian và đảm bảo tính nhất quán trong toàn bộ codebase.

## Cài đặt

Các script được cài đặt sẵn trong dự án thông qua các lệnh trong `package.json`. Đối với các dự án mới, thêm các dòng sau vào `package.json` ở thư mục gốc:

```json
"scripts": {
  "gen:folder": "node scripts/create-app-folder.mjs",
  "gen:app": "node scripts/app-component.mjs",
  "gen:ui": "node scripts/package-component.mjs"
},
"bin": {
  "gen-folder": "./scripts/create-app-folder.mjs",
  "gen-app": "./scripts/app-component.mjs",
  "gen-ui": "./scripts/package-component.mjs"
}
```

Sau đó, chạy lệnh sau để liên kết các lệnh toàn cục (tùy chọn):

```bash
npm link
```

## Tạo ứng dụng mới (`folder`)

Lệnh `folder` dùng để tạo một ứng dụng mới trong thư mục `apps/`.

### Cách sử dụng

```bash
npm run gen:folder <tên-ứng-dụng>
```

Hoặc nếu đã liên kết toàn cục:

```bash
gen-folder <tên-ứng-dụng>
```

### Quy trình tạo ứng dụng

1. **Chọn loại ứng dụng**

   - Framework (Next.js, Nuxt, SvelteKit)
   - Library (React, Vue, Svelte)

2. **Xác nhận ghi đè** (nếu thư mục đã tồn tại)

3. **Cài đặt dependencies** (tùy chọn)

### Ví dụ

```bash
npm run gen:folder dating
```

hoặc
```bash
gen-folder dating
```

Lệnh trên sẽ khởi động wizard để tạo ứng dụng "dating" với các lựa chọn:

```
? Do you want to use a framework or a library? (Use arrow keys)
  Framework
  Library (Vanilla)

? Select the framework for your app: (Use arrow keys)
  Next.js (React)
  Nuxt (Vue)
  SvelteKit (Svelte)

? Do you want to install dependencies after setup? (Use arrow keys)
  Yes
  No
```

Sau khi hoàn thành, một ứng dụng mới sẽ được tạo với cấu trúc chuẩn và các cấu hình cần thiết:

- Package.json
- Cấu hình TypeScript
- ESLint
- Cấu trúc thư mục
- Các file mẫu cơ bản

## Tạo component cho ứng dụng (`gen:app`)

Lệnh `gen:app` dùng để tạo component cho ứng dụng trong thư mục `apps/`.

### Điều kiện sử dụng

- Bạn phải đang ở trong thư mục của một ứng dụng (trong `apps/`)

### Cách sử dụng

```bash
cd apps/<tên-ứng-dụng>
npm run gen:app <tên-component>
```

Hoặc nếu đã liên kết toàn cục:

```bash
cd apps/<tên-ứng-dụng>
gen-app <tên-component>
```

### Quy trình tạo component

1. **Xác định framework** (tự động phát hiện từ package.json)

2. **Chọn TypeScript** (Yes/No)

3. **Nhập tên thư mục** (mặc định là tên component)

4. **Nhập tên file** (mặc định là "index")

5. **Chọn file cần tạo**

   - File component (`.tsx/.jsx/.vue/.svelte`)
   - File index
   - File test
   - File stories (cho Storybook)
   - File styles
   - File hooks (cho React)
   - File constants
   - File utils

6. **Xác nhận export tự động** vào file index của thư mục cha

7. **Nhập tên hook** (nếu tạo file hooks)

8. **Xác nhận ghi đè** (nếu component đã tồn tại)

9. **Quản lý Git** (tùy chọn)

### Ví dụ

```bash
cd apps/dating
npm run gen:app Profile
```

Kết quả là một component Profile được tạo với cấu trúc:

```
Profile/
├── index.tsx
├── styles.module.scss
├── index.test.tsx
└── index.stories.tsx
```

## Tạo component cho thư viện UI (`gen:ui`)

Lệnh `gen:ui` dùng để tạo component cho thư viện UI trong thư mục `packages/ui/`.

### Điều kiện sử dụng

- Bạn phải đang ở trong thư mục UI package (trong `packages/ui/react`, `packages/ui/vue`, hoặc `packages/ui/svelte`)

### Cách sử dụng

```bash
cd packages/ui/<framework>
npm run gen:ui <tên-component>
```

Hoặc nếu đã liên kết toàn cục:

```bash
cd packages/ui/<framework>
gen-ui <tên-component>
```

### Quy trình tạo component

1. **Xác định framework** (tự động phát hiện từ thư mục hiện tại)

2. **Chọn TypeScript** (Yes/No)

3. **Chọn loại component** (theo Atomic Design)

   - atoms: Các component cơ bản
   - molecules: Kết hợp từ nhiều atoms
   - organisms: Phức tạp hơn, kết hợp nhiều molecules
   - templates: Bố cục trang
   - shared: Components dùng chung

4. **Nhập tên file** (mặc định là "index")

5. **Xác nhận ghi đè** (nếu component đã tồn tại)

6. **Quản lý Git** (tùy chọn)

### Ví dụ

```bash
cd packages/ui/react
npm run gen:ui Button
```

Kết quả là một component Button được tạo với cấu trúc theo Atomic Design:

```
src/atoms/Button/
├── index.tsx
├── styles.module.scss
├── index.test.tsx
└── index.stories.tsx
```

Đồng thời, file `src/atoms/index.ts` sẽ được cập nhật để export component mới.

## Tùy chỉnh và mở rộng

### Thêm framework mới

Để thêm hỗ trợ cho một framework mới:

1. Mở file `create-app-folder.mjs`
2. Thêm framework vào danh sách lựa chọn
3. Tạo hàm `setup<FrameworkName>` mới
4. Cập nhật switch case trong hàm chính

### Tùy chỉnh template

Mỗi script có các hàm tạo template riêng cho từng loại file:

- Trong `app-component.mjs`: Các hàm `generate*File()`
- Trong `package-component.mjs`: Các hàm `generate<Framework>Component()`
- Trong `create-app-folder.mjs`: Các hàm `setup<Framework>()`

Bạn có thể điều chỉnh nội dung các template này để phù hợp với dự án của mình.

## Câu hỏi thường gặp

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

### Các file sinh ra không có định dạng đúng

**Nguyên nhân**: Prettier không được cài đặt hoặc cấu hình không đúng.

**Giải pháp**: Kiểm tra cài đặt Prettier và cấu hình liên quan:

```bash
npm install --save-dev prettier
```

### Tôi muốn thay đổi cấu trúc sinh ra cho một framework cụ thể

**Giải pháp**: Chỉnh sửa hàm tương ứng trong script:

- Cho Next.js: Sửa hàm `setupNextJs()` trong `create-app-folder.mjs`
- Cho component React: Sửa hàm `generateReactComponent()` trong `package-component.mjs`

### Làm thế nào để chia sẻ các script này giữa các dự án?

Bạn có thể:

1. Đóng gói các script thành một npm package
2. Hoặc sử dụng symlink để liên kết chúng giữa các dự án
3. Hoặc sao chép scripts vào mỗi dự án và tùy chỉnh nếu cần

---
