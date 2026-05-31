# Prime Property - Web Platform & Internal Agent Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

Prime Property adalah platform web terintegrasi yang menggabungkan Landing Page Publik yang informatif dengan Portal Agen Internal (Dashboard) berbasis *Role-Based Access Control* (RBAC). Aplikasi ini dirancang khusus untuk mempermudah pencarian, penyaringan, dan manajemen portofolio listing properti secara cepat, presisi, dan aman.

---

## 🌟 Fitur Utama

### 🖥️ Halaman Publik (Landing Page)
- **Hero Section**: Tagline dengan tombol CTA responsif menuju daftar properti atau kontak.
- **Properti Unggulan (Featured Properties)**: Menampilkan hingga 6 data properti berstatus *in-stock* yang dinamis.
- **About Us**: Profil perusahaan, visi, misi, dan nilai-nilai Prime Property.
- **Contact Us**: Informasi kontak resmi, integrasi WhatsApp (wa.me), dan formulir kontak interaktif yang dilindungi oleh Google reCAPTCHA dan pembatasan laju kirim (*rate limit*).

### 🔐 Portal Agen Internal (Dashboard)
- **Otentikasi Aman**: Login khusus agen di rute `/agent/login` dengan keamanan *lockout* otomatis setelah 5 kali gagal login.
- **Dashboard AG-Grid**: Tabel data properti yang ringkas, responsif, dan kaya fitur (pencarian teks bebas, multi-select filter, sorting, dan pagination).
- **Manajemen Properti (CRUD)**:
  - **Admin**: Akses *Read-Only* untuk melihat dan memfilter detail properti.
  - **Superadmin**: Akses penuh untuk menambahkan, memperbarui, dan menghapus properti (*Soft Delete*).
- **Log Audit**: Pencatatan otomatis yang tidak dapat diubah (append-only) untuk setiap aktivitas penambahan atau perubahan data properti.
- **Manajemen Pengguna**: Khusus Superadmin untuk mengelola akun administrator internal.

---

## 🎨 Sistem Desain & Antarmuka

Antarmuka Prime Property mengikuti panduan *branding* yang konsisten dengan skema warna logo:
- **Primary Black** (`#1A1A1A`): Warna latar utama header dan teks dominan.
- **Accent Gold** (`#C9A961`): Aksen tombol CTA, *badge*, dan *highlight*.
- **Accent Red** (`#B33A3A`): Warna status penting, *hover*, dan pesan kesalahan.
- **Neutral White** (`#FFFFFF`): Latar belakang utama.
- **Soft Gray** (`#F5F5F5`): Latar belakang kartu (*card*) dan komponen sekunder.
- **Tipografi**: Menggunakan font sans-serif modern (Inter / Geist).

---

## 🏗️ Arsitektur Sistem

Aplikasi ini menggunakan arsitektur hybrid **Server-Side Rendering (SSR)** untuk kecepatan rendering awal dan SEO halaman publik, serta **Client-Side Rendering (CSR)** untuk interaktivitas dinamis pada portal internal.

```mermaid
graph TD
    subgraph Client ["Client Side (Browser)"]
        PublicUI["Halaman Publik (Landing, About, Contact)"]
        DashboardUI["Dashboard Agent (AG-Grid, Detail Panel)"]
        LoginUI["Halaman Login (/agent/login)"]
    end

    subgraph Server ["Server Side (Next.js Node.js Server)"]
        Middleware["Auth & Rate Limit Middleware"]
        PublicRoutes["Public Pages / Server Components"]
        APIRoutes["Secure API Routes (/api/properties, etc.)"]
        PrismaClient["Prisma ORM Client"]
    end

    subgraph DatabaseLayer ["Database Layer"]
        PostgresDB[("Supabase PostgreSQL Database")]
    end

    %% Alur data
    PublicUI --> |Request Halaman| PublicRoutes
    LoginUI --> |Kirim Kredensial| Middleware
    DashboardUI --> |Mutasi/Kueri API| Middleware
    Middleware --> APIRoutes
    PublicRoutes --> PrismaClient
    APIRoutes --> PrismaClient
    PrismaClient --> PostgresDB
```

---

## 🗄️ Skema Database

Skema database dimodelkan menggunakan PostgreSQL. Berikut ringkasan entitas utama:

- **`User`**: Menyimpan data akun internal (Admin & Superadmin) lengkap dengan enkripsi password (bcrypt) dan data lockout keamanan.
- **`Session`**: Mengelola sesi login agen menggunakan token unik dan cookie aman (`HttpOnly`, `SameSite=Lax`).
- **`Property`**: Menyimpan detail properti (ukuran lebar/panjang, hadap, tingkat, harga, status huni, dsb.). Mendukung *Soft Delete* dengan kolom `deleted_at`.
- **`AuditLog`**: Log append-only untuk merekam jejak audit mutasi data properti.
- **`ContactSubmission`**: Menyimpan pesan masuk dari formulir kontak.
- **`RateLimit`**: Melacak batasan request API per IP.
- **`RolePermission`**: Mengelola matriks hak akses berbasis peran (RBAC Matrix).
- **`Testimonial`**: Menyimpan ulasan pengguna yang akan ditampilkan setelah disetujui.

Rincian file konfigurasi database dapat dilihat pada berkas [schema.prisma](file:///D:/Website%20Restu%20Satrio%20Pinanggih/PropertyAgent/prisma/schema.prisma).

---

## 🛠️ Panduan Instalasi Lokal

### Prasyarat
Sebelum memulai, pastikan perangkat Anda sudah terinstal:
- [Node.js](https://nodejs.org/) (versi 18.x atau yang terbaru)
- [PostgreSQL](https://www.postgresql.org/) (atau akses ke kluster Supabase)
- [Git](https://git-scm.com/)

### Langkah-langkah
1. **Kloning Repositori**:
   ```bash
   git clone https://github.com/restusatrio11/AgentProperty.git
   cd AgentProperty
   ```

2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Salin berkas `.env.example` menjadi `.env` lalu sesuaikan isinya:
   ```bash
   cp .env.example .env
   ```
   Isi konfigurasi database PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   DIRECT_URL="postgresql://user:password@host:port/database?schema=public"
   ```

4. **Migrasi Database & Seeding**:
   Jalankan perintah berikut untuk membuat tabel dan memasukkan data sampel default (seperti akun superadmin awal):
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di browser pada alamat [http://localhost:3000](http://localhost:3000).

---

## 🚦 Alur Penggunaan (Workflows)

```mermaid
graph TD
    UserSession["Verifikasi Sesi User (Cookie)"]
    UserSession --> CheckRole{"Apa Role Pengguna?"}
    
    CheckRole -->|ADMIN| AdminFlow["Akses Read-Only Dashboard"]
    AdminFlow --> ViewGrid["Tabel Properti & Filter"]
    AdminFlow --> ReadDetail["Buka Panel Detail Properti"]
    AdminFlow --> |Coba Akses API Mutasi| RejectAPI["Middleware: HTTP 403 Forbidden"]
    
    CheckRole -->|SUPERADMIN| SuperadminFlow["Akses Full CRUD Dashboard"]
    SuperadminFlow --> ViewGridSA["Tabel Properti & Filter"]
    SuperadminFlow --> AddProperty["Tambah Properti (Create)"]
    SuperadminFlow --> EditProperty["Ubah Properti + Tulis Audit Log (Update)"]
    SuperadminFlow --> DeleteProperty["Soft Delete Properti (deleted_at)"]
    SuperadminFlow --> ManageUsers["Buat/Kelola Akun Admin"]
    SuperadminFlow --> ViewAudit["Lihat Tabel Audit Log Sistem"]
```

1. **Akses Publik**: Pengunjung dapat menjelajahi halaman landing dan mengirim pesan formulir kontak.
2. **Login Agen**: Agen masuk melalui rute `/agent/login`.
3. **Penggunaan Dashboard**:
   - **Admin** menyaring data properti menggunakan filter multi-select AG-Grid untuk kebutuhan presentasi ke klien.
   - **Superadmin** mengelola data listing (tambah, edit, hapus) serta memantau log audit dan akun agen lainnya.
