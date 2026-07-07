# 🏥 Sistem Order Obat Farmasi

> **Take-Home Test — Full Stack Developer**
> UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan

Aplikasi web untuk membantu petugas farmasi mencatat dan memantau pesanan obat dari poliklinik.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 📊 Dashboard | Statistik ringkasan, order terbaru, alert stok rendah |
| 📋 Order Obat | CRUD order, filter status/tanggal, paginasi |
| 💊 Manajemen Obat | CRUD data obat, indikator stok, filter kategori |
| 🔄 Alur Status | pending → processing → completed / cancelled |
| ✅ Persetujuan | Input jumlah yang disetujui saat status processing |
| 🐳 Docker Ready | Deploy dengan `docker compose up` |

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + Vite + React Router v6
- **Backend:** Node.js + Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL 15
- **Deployment:** Docker + Docker Compose + Nginx

---

## 🚀 Cara Menjalankan

### A. Lokal (Development)

**Prasyarat:** Node.js >= 18, PostgreSQL 15 terinstall

#### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi database lokal Anda
npm install
npm start
```

#### 2. Jalankan Seeder (Data Sample Obat)

```bash
cd backend
npm run seed
```

#### 3. Setup & Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka browser: `http://localhost:3000`

---

### B. Docker Compose (Recommended)

**Prasyarat:** Docker & Docker Compose terinstall

#### 1. Setup Environment

```bash
cp .env.example .env
# Edit .env jika perlu mengubah password database
```

#### 2. Build & Jalankan

```bash
docker compose up --build -d
```

#### 3. Jalankan Seeder (Opsional — Data Sample)

```bash
docker compose exec backend node src/seeders/seed.js
```

#### 4. Akses Aplikasi

- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

#### 5. Hentikan Aplikasi

```bash
docker compose down
# Untuk menghapus juga data database:
docker compose down -v
```

---

## 📡 API Endpoints

### Base URL: `/api`

#### Obat (Medicines)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/medicines` | List semua obat (search, category filter) |
| GET | `/medicines/low-stock` | Obat dengan stok di bawah minimum |
| GET | `/medicines/:id` | Detail obat |
| POST | `/medicines` | Tambah obat baru |
| PUT | `/medicines/:id` | Edit obat |
| DELETE | `/medicines/:id` | Hapus obat |

#### Order Obat (Orders)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/orders` | List order (filter: status, date, page, limit) |
| GET | `/orders/:id` | Detail order + item detail |
| POST | `/orders` | Buat order baru |
| PUT | `/orders/:id` | Edit order (hanya status pending) |
| PATCH | `/orders/:id/status` | Ubah status order |
| PATCH | `/orders/:id/items` | Update jumlah yang disetujui (status processing) |
| DELETE | `/orders/:id` | Hapus order (hanya status pending) |

#### Dashboard
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/dashboard/stats` | Statistik ringkasan order & obat |

---

## 🔄 Alur Status Order

```
[PENDING] ──→ [PROCESSING] ──→ [COMPLETED]
    │               │
    └───────────────┴──────────→ [CANCELLED]
```

- **PENDING:** Order baru dibuat, belum diproses farmasi
- **PROCESSING:** Farmasi sedang memproses (bisa isi jumlah yang disetujui)
- **COMPLETED:** Order selesai — stok otomatis dikurangi
- **CANCELLED:** Dibatalkan (stok tidak berubah)

> ⚠️ Stok hanya dikurangi saat status berubah ke **COMPLETED**, menggunakan serializable transaction untuk mencegah race condition.

---

## 🐳 Deployment ke VM

### SSH ke VM

```bash
ssh user@<VM_IP>
```

### Clone Repository

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

### Setup Environment

```bash
cp .env.example .env
nano .env  # Isi dengan konfigurasi production
```

### Build & Deploy

```bash
docker compose up --build -d
docker compose exec backend node src/seeders/seed.js
```

### Cek Status

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

---

## 📁 Struktur Folder

```
.
├── backend/
│   ├── src/
│   │   ├── config/       # Konfigurasi Sequelize
│   │   ├── controllers/  # Business logic handler
│   │   ├── middleware/   # Error handler & validator
│   │   ├── models/       # Sequelize models & associations
│   │   ├── routes/       # Express route definitions
│   │   ├── seeders/      # Data awal
│   │   └── utils/        # Helper functions
│   ├── app.js            # Entry point Express
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page components
│   │   └── services/     # API service layer (Axios)
│   ├── nginx.conf        # Nginx config (reverse proxy + SPA)
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 👨‍💻 Developer

Dibuat sebagai bagian dari Take-Home Test posisi **Full Stack Developer**
UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan — Juli 2026
