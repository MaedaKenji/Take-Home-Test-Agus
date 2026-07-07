# 🏥 Planning — Sistem Informasi Order Obat Farmasi
> Take-Home Test | Full Stack Developer | UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan
> **Deadline:** Sabtu, 11 Juli 2026 pukul 12.00 WIB

---

## 📋 Overview

Aplikasi web untuk membantu **petugas farmasi** mencatat dan memantau pesanan obat dari poliklinik. Sistem ini mengelola alur dari pencatatan order obat dari poli hingga pemenuhan oleh farmasi.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐        ┌──────────────────────┐        ┌──────────────┐
│   React (SPA)   │◄──────►│  Express.js REST API  │◄──────►│  PostgreSQL  │
│   Port: 3000    │  HTTP  │     Port: 5000        │  ORM   │  Port: 5432  │
└─────────────────┘        └──────────────────────┘  Seq.  └──────────────┘
         │                           │
         └───────────── Docker Network ──────────────┘
```

**Tech Stack Wajib:**
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Deployment:** Docker + Docker Compose

---

## 🗄️ Database Schema

### Tabel `medicines` (Obat)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Primary Key |
| `code` | VARCHAR(20) | Kode obat (unik) |
| `name` | VARCHAR(255) | Nama obat |
| `unit` | VARCHAR(50) | Satuan (tablet, kapsul, ml, dll) |
| `stock` | INTEGER | Stok tersedia |
| `min_stock` | INTEGER | Stok minimum (alert threshold) |
| `category` | VARCHAR(50) | Kategori obat |
| `created_at` | TIMESTAMP | - |
| `updated_at` | TIMESTAMP | - |

### Tabel `orders` (Order Obat)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Primary Key |
| `order_number` | VARCHAR(50) | Nomor order (auto-generate) |
| `polyclinic` | VARCHAR(100) | Unit/poliklinik pemesan |
| `order_date` | DATE | Tanggal order |
| `notes` | TEXT | Catatan tambahan |
| `status` | ENUM | `pending`, `processing`, `completed`, `cancelled` |
| `requested_by` | VARCHAR(100) | Nama petugas poli yang memesan |
| `created_at` | TIMESTAMP | - |
| `updated_at` | TIMESTAMP | - |

### Tabel `order_items` (Detail Order)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Primary Key |
| `order_id` | UUID (FK) | Relasi ke `orders` |
| `medicine_id` | UUID (FK) | Relasi ke `medicines` |
| `quantity_requested` | INTEGER | Jumlah yang dipesan |
| `quantity_approved` | INTEGER | Jumlah yang disetujui/dipenuhi |
| `notes` | TEXT | Catatan per item |
| `created_at` | TIMESTAMP | - |
| `updated_at` | TIMESTAMP | - |

---

## 🔌 REST API Endpoints

### Medicines (Obat)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/medicines` | List semua obat |
| `GET` | `/api/medicines/:id` | Detail obat |
| `POST` | `/api/medicines` | Tambah obat baru |
| `PUT` | `/api/medicines/:id` | Edit data obat |
| `DELETE` | `/api/medicines/:id` | Hapus obat |

### Orders (Order Obat)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/orders` | List semua order (dengan filter & pagination) |
| `GET` | `/api/orders/:id` | Detail order + item detail |
| `POST` | `/api/orders` | Buat order baru |
| `PUT` | `/api/orders/:id` | Edit order (hanya status `pending`) |
| `PATCH` | `/api/orders/:id/status` | Ubah status order |
| `DELETE` | `/api/orders/:id` | Hapus/batalkan order |

---

## 📁 Struktur Folder Proyek

```
Take-Home-Test-Agus/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── Medicine.js
│   │   │   ├── Order.js
│   │   │   └── OrderItem.js
│   │   ├── controllers/
│   │   │   ├── medicineController.js
│   │   │   └── orderController.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── medicineRoutes.js
│   │   │   └── orderRoutes.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   └── seeders/
│   │       └── seed.js
│   ├── app.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   ├── common/
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── Medicine/
│   │   │   │   ├── MedicineTable.jsx
│   │   │   │   └── MedicineForm.jsx
│   │   │   └── Order/
│   │   │       ├── OrderTable.jsx
│   │   │       ├── OrderForm.jsx
│   │   │       └── OrderDetail.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MedicinesPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetailPage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── medicineService.js
│   │   │   └── orderService.js
│   │   ├── hooks/
│   │   │   ├── useMedicines.js
│   │   │   └── useOrders.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🎨 UI/UX Design Plan

**Design System:**
- **Color Palette:**
  - Primary: `#0EA5E9` (Sky Blue — health/medis)
  - Secondary: `#6366F1` (Indigo)
  - Success: `#22C55E` | Warning: `#F59E0B` | Danger: `#EF4444`
  - Background: `#0F172A` (Dark Navy) | Surface: `#1E293B`
- **Typography:** Google Fonts — `Inter`
- **Style:** Dark mode + glassmorphism effect pada cards

**Halaman-Halaman:**

| Halaman | Route | Fitur Utama |
|---|---|---|
| Dashboard | `/` | Statistik ringkasan, order terbaru, alert stok |
| Manajemen Obat | `/medicines` | Tabel + CRUD obat, indikator stok |
| Daftar Order | `/orders` | Tabel order + filter status/tanggal |
| Detail Order | `/orders/:id` | Info lengkap + item list + ubah status |
| Buat/Edit Order | `/orders/new`, `/orders/:id/edit` | Form multi-item dinamis |

**Status Order Flow:**
```
[PENDING] ──→ [PROCESSING] ──→ [COMPLETED]
    │
    └──────────────────────────→ [CANCELLED]
```

---

## ✅ Feature Checklist

### Backend
- [ ] Setup Express.js + Sequelize + PostgreSQL
- [ ] Models: Medicine, Order, OrderItem + associations
- [ ] CRUD API Obat
- [ ] CRUD API Order + ubah status
- [ ] Auto-generate nomor order (`ORD-YYYYMMDD-XXXX`)
- [ ] Validasi input (express-validator)
- [ ] Error handling middleware (400, 404, 500)
- [ ] Seeder data sample obat
- [ ] CORS + Helmet security headers

### Frontend
- [ ] Setup React + Vite + React Router v6
- [ ] Axios service layer (interceptors, error handling)
- [ ] Global design system (CSS variables + animations)
- [ ] Dashboard dengan statistik cards
- [ ] Halaman manajemen obat (CRUD + modal form)
- [ ] Halaman daftar order (tabel + filter)
- [ ] Halaman detail order
- [ ] Form order multi-item (add/remove rows)
- [ ] Ubah status order (dropdown/buttons)
- [ ] Konfirmasi dialog hapus/batalkan
- [ ] Toast notifications (success/error)
- [ ] Loading spinner & skeleton states
- [ ] Responsive (mobile-friendly)

### DevOps & Deployment
- [ ] Dockerfile backend (Node 20 Alpine)
- [ ] Dockerfile frontend (Nginx)
- [ ] docker-compose.yml (db + backend + frontend)
- [ ] .env.example
- [ ] README.md dengan panduan deployment lengkap

---

## 🐳 Docker Configuration

```yaml
# docker-compose.yml outline
services:
  db:
    image: postgres:15-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment: [POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD]
  
  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [db]
    environment: [DB_HOST=db, PORT=5000, ...]
  
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```

---

## 📅 Timeline 3 Hari

### Hari 1 — Backend Foundation
- Init monorepo (backend + frontend scaffold)
- Database config & Sequelize models
- Semua API endpoints (CRUD medicine + order)
- Validasi & error handling
- Seeder data sample

### Hari 2 — Frontend Development
- Setup React + routing + Axios
- Global design system & CSS
- Dashboard, Medicines, Orders pages
- Order detail & form multi-item
- Testing integrasi frontend ↔ backend

### Hari 3 — Polish, Docker & Deploy
- Bug fixing & UI polish
- Dockerfile & docker-compose.yml
- Deploy ke VM + testing production
- README deployment guide
- Record video demo & submit email

---

## 📬 Pengumpulan

| Item | Status |
|---|---|
| Link Repository GitHub (public) | ⬜ |
| Link Video Demo YouTube | ⬜ |
| URL Aplikasi di VM | ⬜ |
| Email ke `itsyamrabu@gmail.com` | ⬜ |

**Subject email:** `Pengumpulan Take-Home Test posisi Full Stack UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan`
**Deadline:** Sabtu, 11 Juli 2026, pukul 12.00 WIB
