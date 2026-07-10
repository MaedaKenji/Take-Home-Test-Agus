# 💊 Sistem Informasi Farmasi — Pharmacy Order Management System

Aplikasi manajemen pesanan obat dari poli untuk petugas farmasi. Dibangun sebagai **Take-Home Test Full Stack** untuk posisi Full Stack Developer di UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan.

---

## 🚀 Demo Aplikasi

> 🎬 **[Tonton Demo di YouTube »](https://youtu.be/Mnnw9Slg2kw)**  
> 🌐 **Aplikasi Live:** [https://syamrabu.agusfuad.my.id/](https://syamrabu.agusfuad.my.id/)

---

## 📋 Fitur Utama

| Fitur | Keterangan |
|---|---|
| 📋 **Daftar Order Obat** | Tampilkan semua order dengan filter status & tanggal, pagination |
| ➕ **Tambah Order** | Buat order baru dengan memilih obat, jumlah, dan unit poli |
| 🔍 **Detail Order** | Lihat rincian lengkap order beserta item obat |
| ✏️ **Edit Order** | Edit order yang masih berstatus **pending** |
| 🔄 **Ubah Status Order** | Alur status: `pending → processing → completed / cancelled` |
| ✅ **Setujui Jumlah** | Petugas bisa menetapkan jumlah yang disetujui saat status **processing** |
| 🗑️ **Hapus/Batalkan Order** | Hapus (pending) atau batalkan (processing) order |
| 💊 **Manajemen Obat** | CRUD data obat: nama, kode, satuan, stok, kategori |
| 📉 **Monitoring Stok** | Peringatan otomatis untuk obat dengan stok rendah |
| 📊 **Dashboard** | Statistik ringkas (total order, stok kritis, order hari ini) |

---

## 🗂️ Struktur Proyek

```
Take-Home-Test-Agus/
├── backend/               # Express.js + Sequelize + PostgreSQL
│   ├── src/
│   │   ├── config/        # Konfigurasi database
│   │   ├── controllers/   # Logic handler API
│   │   ├── middleware/    # Error handler, validator
│   │   ├── models/        # Model Sequelize (Medicine, Order, OrderItem)
│   │   ├── routes/        # Routing API
│   │   ├── seeders/       # Data awal (seed)
│   │   └── utils/         # Helper (AppError, order number generator)
│   ├── app.js             # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React + Vite + Material UI
│   ├── src/
│   │   ├── components/    # Layout, Medicine, Order, common components
│   │   ├── context/       # ColorMode (dark/light)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Dashboard, Orders, Medicines, Forms
│   │   ├── services/      # Axios API service layer
│   │   └── utils/         # Helper functions
│   ├── nginx.conf         # Nginx reverse proxy config
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Orkestrasi seluruh service
├── .env.example           # Template environment variables
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 24 LTS (v24.18.0)
- **Framework:** Express.js 5
- **ORM:** Sequelize 6
- **Database:** PostgreSQL 17
- **Validation:** express-validator
- **Security:** Helmet, CORS

### Frontend
- **Framework:** React 19 + Vite 8
- **UI Library:** Material UI (MUI) v9
- **HTTP Client:** Axios
- **Routing:** React Router DOM v7
- **Notifications:** React Hot Toast
- **Server:** Nginx (production)

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (deploy via SSH + git pull)
- **Proxy:** Nginx (reverse proxy untuk API dan static files)

---

## ⚙️ Menjalankan Secara Lokal (Tanpa Docker)

### Prasyarat
- Node.js >= 20
- PostgreSQL >= 14 berjalan di lokal

### 1. Clone Repository

```bash
git clone https://github.com/MaedaKenji/Take-Home-Test-Agus.git
cd Take-Home-Test-Agus
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi PostgreSQL lokal Anda
npm install
npm start
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Pastikan VITE_API_URL mengarah ke http://localhost:5000
npm install
npm run dev
```

Akses aplikasi di: `http://localhost:5173`

### 4. Seed Data Awal (Opsional)

```bash
cd backend
npm run seed
```

---

## 🐳 Menjalankan dengan Docker Compose

Docker Compose memungkinkan Anda menjalankan seluruh stack aplikasi (Frontend, Backend, Database, Redis) dengan satu perintah, baik untuk pengujian di komputer lokal (device Anda sendiri) maupun deployment di VM.

### Prasyarat
- Docker >= 24.x
- Docker Compose >= 2.x

### Langkah-langkah

#### 1. Persiapan Direktori
* **Di Lokal (Device Sendiri):** Buka terminal pada folder project Anda.
* **Di VM:** Clone repository terlebih dahulu dan masuk ke foldernya:
  ```bash
  git clone https://github.com/<username>/Take-Home-Test-Agus.git
  cd Take-Home-Test-Agus
  ```

#### 2. Buat file `.env` dari template
```bash
cp .env.example .env
```

#### 3. Edit `.env` sesuai target environment
Buka file `.env` dan sesuaikan variabel `CORS_ORIGIN`:

* **Opsi A: Jika dijalankan di Lokal (Device Sendiri)**
  ```env
  DB_NAME=pharmacy_db
  DB_USER=pharmacy_user
  DB_PASSWORD=ganti_dengan_password_aman
  CORS_ORIGIN=http://localhost
  ```

* **Opsi B: Jika dijalankan di VM (Production Server)**
  ```env
  DB_NAME=pharmacy_db
  DB_USER=pharmacy_user
  DB_PASSWORD=ganti_dengan_password_aman
  CORS_ORIGIN=https://syamrabu.agusfuad.my.id
  ```

#### 4. Jalankan dengan Docker Compose
```bash
docker compose up -d --build
```

Docker Compose akan secara otomatis:
- Membangun image frontend (React + Nginx) dan backend (Express.js)
- Menjalankan container PostgreSQL & Redis dengan healthcheck
- Menunggu database siap sebelum menjalankan backend

#### 5. Seed Data Awal (Opsional)
```bash
docker compose exec backend npm run seed
```

#### 6. Akses Aplikasi
* **Di Lokal:** Buka browser ke [http://localhost](http://localhost)
* **Di VM:** Buka browser ke [https://syamrabu.agusfuad.my.id/](https://syamrabu.agusfuad.my.id/)

---

## 🚀 Deployment Otomatis (CI/CD via GitHub Actions)

Repositori ini telah dikonfigurasi dengan GitHub Actions untuk mendeploy aplikasi secara otomatis ke VM setiap kali ada push ke branch `main`, `staging`, atau `uji-coba-merge`. 

Agar workflow deployment di [.github/workflows/deploy.yml](file:///.github/workflows/deploy.yml) dapat berjalan dengan sukses, Anda harus menambahkan **GitHub Secrets** berikut di repositori Anda (`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`):

### 🔑 Daftar GitHub Secrets yang Diperlukan

| Nama Secret | Deskripsi / Nilai |
|-------------|-------------------|
| `DOCKER_USERNAME` | Username akun Docker Hub Anda. |
| `DOCKER_PASSWORD` | Password atau Personal Access Token Docker Hub Anda. |
| `VM_HOST` | IP Address VM target deployment. |
| `VM_USER` | Username untuk koneksi SSH ke VM (misal: `root` atau `ubuntu`). |
| `VM_SSH_KEY` | SSH Private Key untuk autentikasi ke VM Anda (biasanya isi dari `~/.ssh/id_rsa`). |
| `VM_PORT` | Port SSH VM (default: `22`). |
| `DB_NAME` | Nama database PostgreSQL yang akan digunakan di VM (misal: `pharmacy_db`). |
| `DB_USER` | Username database PostgreSQL (misal: `pharmacy_user`). |
| `DB_PASSWORD` | Password database PostgreSQL yang aman. |
| `CORS_ORIGIN` | URL frontend yang diperbolehkan mengakses API (misal: `https://syamrabu.agusfuad.my.id`). |
| `JWT_SECRET` | Secret key unik untuk kebutuhan enkripsi JWT token di backend. |
| `CLOUDFLARE_TUNNEL_TOKEN` | Token Cloudflare Tunnel untuk env `production` (jika menggunakan Cloudflare Tunnel). |
| `CLOUDFLARE_TUNNEL_TOKEN_STAGING` | Token Cloudflare Tunnel untuk env `staging` (jika menggunakan Cloudflare Tunnel). |

### 🔄 Alur Kerja CI/CD
1. **Push Kode**: Setiap kali Anda melakukan `git push` ke branch `main` atau `staging`.
2. **Build & Push**: GitHub Actions akan mem-build Docker image untuk backend & frontend dan meng-upload-nya ke Docker Hub.
3. **Deploy via SSH**: GitHub Actions akan login ke VM menggunakan SSH, mengunduh image terbaru dari Docker Hub, memperbarui konfigurasi `.env`, dan merestart container menggunakan Docker Compose.
4. **Health Check**: Melakukan uji koneksi ke port aplikasi untuk memastikan aplikasi berjalan dengan baik setelah deployment.

---

## 🔧 Manajemen Docker

```bash
# Lihat status container
docker compose ps

# Lihat log semua service
docker compose logs -f

# Lihat log service tertentu
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Stop semua container
docker compose down

# Stop dan hapus volume (data database akan terhapus!)
docker compose down -v

# Rebuild image setelah ada perubahan kode
docker compose up -d --build
```

---

## 🌐 Arsitektur Docker

```
Browser
  │
  ▼
[Frontend: Nginx :80]
  ├── /          → Serve React SPA (static files)
  └── /api/      → Proxy ke [Backend: Express :5000]
                         │
                         ▼
                  [Database: PostgreSQL :5432]
```

Semua service terhubung dalam Docker network bernama `pharmacy_network`.

---

## 📡 API Endpoints

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://syamrabu.agusfuad.my.id/api`

### 💊 Obat (Medicines)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/medicines` | Daftar semua obat (support: `search`, `category`, `page`, `limit`) |
| `GET` | `/api/medicines/:id` | Detail satu obat |
| `GET` | `/api/medicines/low-stock` | Daftar obat stok rendah |
| `POST` | `/api/medicines` | Tambah obat baru |
| `PUT` | `/api/medicines/:id` | Update data obat |
| `DELETE` | `/api/medicines/:id` | Hapus obat |

#### Contoh Body POST/PUT `/api/medicines`

```json
{
  "code": "MED-001",
  "name": "Paracetamol 500mg",
  "unit": "tablet",
  "stock": 500,
  "minStock": 50,
  "category": "Analgesik"
}
```

### 📦 Order Obat (Orders)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/orders` | Daftar semua order (support: `status`, `date`, `page`, `limit`, `sort`) |
| `GET` | `/api/orders/:id` | Detail order beserta item |
| `POST` | `/api/orders` | Buat order baru |
| `PUT` | `/api/orders/:id` | Edit order (hanya status `pending`) |
| `PATCH` | `/api/orders/:id/status` | Ubah status order |
| `PATCH` | `/api/orders/:id/items` | Update jumlah yang disetujui |
| `DELETE` | `/api/orders/:id` | Hapus order (hanya status `pending`) |

#### Contoh Body POST `/api/orders`

```json
{
  "polyclinic": "Poli Umum",
  "orderDate": "2026-07-08",
  "notes": "Kebutuhan mendesak",
  "requestedBy": "Dr. Budi",
  "items": [
    {
      "medicineId": "uuid-obat-1",
      "quantityRequested": 100
    },
    {
      "medicineId": "uuid-obat-2",
      "quantityRequested": 50
    }
  ]
}
```

#### Contoh Body PATCH `/api/orders/:id/status`

```json
{
  "status": "processing"
}
```

#### Contoh Body PATCH `/api/orders/:id/items`

```json
{
  "items": [
    {
      "itemId": "uuid-item-1",
      "quantityApproved": 80
    }
  ]
}
```

### 📊 Dashboard

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard/stats` | Statistik ringkas (total order, stok kritis, dll) |

### Health Check

```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"..."}
```

---

## 🗄️ Skema Database

### Tabel `medicines`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | Identitas unik |
| `code` | VARCHAR(20) UNIQUE | Kode obat |
| `name` | VARCHAR(255) | Nama obat |
| `unit` | VARCHAR(50) | Satuan (tablet, kapsul, dll) |
| `stock` | INTEGER | Stok tersedia |
| `min_stock` | INTEGER | Batas stok minimum (default: 10) |
| `category` | VARCHAR(100) | Kategori obat |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

### Tabel `orders`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | Identitas unik |
| `order_number` | VARCHAR(50) UNIQUE | Nomor order otomatis (ORD-YYYYMMDD-XXX) |
| `polyclinic` | VARCHAR(100) | Unit/poliklinik pemesan |
| `order_date` | DATE | Tanggal order |
| `notes` | TEXT | Catatan tambahan |
| `status` | ENUM | `pending`, `processing`, `completed`, `cancelled` |
| `requested_by` | VARCHAR(100) | Nama petugas pemesan |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

### Tabel `order_items`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | Identitas unik |
| `order_id` | UUID FK | Referensi ke `orders` (CASCADE DELETE) |
| `medicine_id` | UUID FK | Referensi ke `medicines` |
| `quantity_requested` | INTEGER | Jumlah yang dipesan |
| `quantity_approved` | INTEGER (nullable) | Jumlah yang disetujui/dipenuhi |
| `notes` | TEXT | Catatan per item |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

---

## 🔄 Alur Status Order

```
[pending] ──→ [processing] ──→ [completed]
    │               │
    └──→ [cancelled] ←──┘
```

| Transisi | Kondisi | Efek Samping |
|----------|---------|--------------|
| `pending → processing` | Bebas | — |
| `processing → completed` | Bebas | Stok obat dikurangi otomatis |
| `pending → cancelled` | Bebas | — |
| `processing → cancelled` | Bebas | — |
| `completed → *` | ❌ Tidak bisa | — |
| `cancelled → *` | ❌ Tidak bisa | — |

> **Catatan:** Ketika status berubah ke `completed`, stok obat di database otomatis dikurangi sesuai `quantity_approved` (atau `quantity_requested` jika belum ditetapkan). Proses ini menggunakan transaksi SERIALIZABLE untuk mencegah race condition.

---

## 📁 File Konfigurasi

### `.env.example`

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_db
DB_USER=pharmacy_user
DB_PASSWORD=securepassword123

# App
NODE_ENV=development
PORT=5000

# CORS (URL frontend)
CORS_ORIGIN=http://localhost:3000
```

---

## 🔍 Troubleshooting

### Container backend terus restart / gagal connect ke database

Kemungkinan database belum siap. Cek log:

```bash
docker compose logs db
docker compose logs backend
```

Restart manual setelah database sepenuhnya up:

```bash
docker compose restart backend
```

### Port 80 sudah dipakai di VM

Edit `docker-compose.yml`, ubah baris `"80:80"` menjadi port lain:

```yaml
ports:
  - "8080:80"
```

### Data database terhapus

Gunakan `docker compose down` (**tanpa** flag `-v`) agar data di volume `postgres_data` tetap terjaga.

### Melihat isi database

```bash
docker compose exec db psql -U pharmacy_user -d pharmacy_db
```

---

## 👨‍💻 Pengembang

**Agus Fuad Mudhofar**  
Take-Home Test — Full Stack Developer  

