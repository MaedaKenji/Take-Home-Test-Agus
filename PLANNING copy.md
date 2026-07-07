# 🤖 Execution Plan — Sistem Informasi Order Obat Farmasi
> Untuk dieksekusi oleh coding agent (Claude Sonnet 4.6 / Claude Code)
> Base reference: `PLANNING.md`
> Deadline: Sabtu, 11 Juli 2026, 12.00 WIB

Dokumen ini menutup gap yang ditemukan di `PLANNING.md` (stock deduction, race condition,
approval flow, dashboard endpoint) dan memecah pekerjaan jadi task-task kecil yang bisa
dieksekusi berurutan oleh agent, satu task = satu unit kerja yang bisa diverifikasi.

---

## 0. Keputusan Desain yang Mengunci Ambiguitas

Sebelum coding, ini aturan final yang HARUS diikuti (menutup gap dari review sebelumnya):

1. **Stock deduction terjadi saat status berubah ke `completed`**, bukan saat order dibuat.
   Dilakukan dalam 1 DB transaction: update `order_items.quantity_approved` (jika belum di-set)
   → kurangi `medicines.stock` → update `order.status`. Jika stok tidak cukup, transaction
   di-rollback dan API return `409 Conflict`.
2. **Row locking**: gunakan `transaction({ isolationLevel: SERIALIZABLE })` atau
   `medicine.findOne({ lock: true, transaction })` saat mengurangi stok, untuk mencegah race
   condition saat 2 order diproses bersamaan.
3. **Nomor order** di-generate di dalam transaction yang sama dengan `COUNT` + `LOCK`, format
   `ORD-YYYYMMDD-XXXX` (reset counter per hari). Alternatif lebih aman: pakai
   `sequelize.query` dengan `SELECT ... FOR UPDATE` pada tabel counter terpisah, atau retry-on-conflict
   sederhana (catch unique constraint error → retry dengan angka berikutnya).
4. **`quantity_approved` diisi/diedit lewat endpoint terpisah**:
   `PATCH /api/orders/:id/items` (body: array `{item_id, quantity_approved}`), hanya bisa
   dipanggil saat status order `processing`. Validasi: `quantity_approved <= quantity_requested`
   dan `quantity_approved <= medicine.stock` (kecuali saat completed, di situ baru dikurangi).
5. **DELETE vs CANCELLED**: `DELETE /api/orders/:id` hanya diizinkan jika status masih
   `pending` (order belum disentuh sama sekali) → hard delete. Untuk order yang sudah
   `processing`, gunakan `PATCH /api/orders/:id/status` dengan value `cancelled` (soft, tidak
   menyentuh stok karena stok baru dikurangi saat `completed`).
6. **Endpoint tambahan untuk Dashboard**:
   - `GET /api/dashboard/stats` → total order per status, total obat, jumlah obat low-stock
   - `GET /api/medicines/low-stock` → obat dengan `stock <= min_stock`
   - `GET /api/orders?limit=5&sort=created_at:desc` → order terbaru (reuse endpoint list yang sudah ada, tambahkan query param)
7. **Status transition yang valid** (ditegakkan di backend, bukan cuma di frontend):
   `pending → processing → completed`, `pending → cancelled`, `processing → cancelled`.
   Transisi lain ditolak dengan `400 Bad Request`.

---

## 1. Urutan Eksekusi (Task List untuk Agent)

Kerjakan berurutan. Setiap task punya "Definition of Done" (DoD) agar agent bisa
self-verify sebelum lanjut ke task berikutnya.

### Fase A — Project Scaffold
- [ ] **A1.** Buat struktur folder sesuai `PLANNING.md` (`backend/`, `frontend/`, root configs).
  DoD: `tree` folder cocok dengan struktur di planning.
- [ ] **A2.** Init `backend` (`npm init`, install express, sequelize, pg, cors, helmet,
  express-validator, dotenv, uuid, morgan). Init `frontend` (`npm create vite@latest -- --template react`,
  install axios, react-router-dom).
  DoD: `npm install` sukses di kedua folder tanpa error.
- [ ] **A3.** Buat `.env.example` (root + backend) dan `docker-compose.yml` skeleton
  (db healthcheck wajib ada — lihat §2).
  DoD: file ada, format valid YAML.

### Fase B — Backend: Database & Models
- [ ] **B1.** `backend/src/config/database.js` — koneksi Sequelize dari env vars.
- [ ] **B2.** Models: `Medicine.js`, `Order.js`, `OrderItem.js` + associations
  (`Order.hasMany(OrderItem)`, `OrderItem.belongsTo(Medicine)`), UUID default via
  `DataTypes.UUIDV4`, enum status di `Order`.
  DoD: `npx sequelize-cli db:migrate` (atau `sequelize.sync()`) jalan tanpa error, tabel
  ter-create sesuai schema di `PLANNING.md`.
- [ ] **B3.** Seeder `seed.js` — minimal 15 obat sample dengan variasi stock (termasuk
  beberapa di bawah `min_stock` untuk testing alert).
  DoD: seeder jalan, data muncul di query manual.

### Fase C — Backend: Business Logic Inti (paling kritis, kerjakan dengan hati-hati)
- [ ] **C1.** Service layer `orderNumberGenerator.js` — generate `ORD-YYYYMMDD-XXXX` dengan
  retry-on-conflict (unique constraint catch).
  DoD: generate 20 order berurutan tanpa collision (test manual dengan loop).
- [ ] **C2.** `orderController.createOrder` — transaction: create order + order_items sekaligus,
  validasi `medicine_id` exist dan `quantity_requested > 0`.
  DoD: POST order dengan 3 item sukses, semua row muncul di 2 tabel.
- [ ] **C3.** `orderController.updateOrderItems` (endpoint §0.4) — validasi status `processing`,
  validasi `quantity_approved` batas atas.
  DoD: reject dengan 400 jika status bukan processing atau quantity melebihi batas.
- [ ] **C4.** `orderController.updateStatus` — implementasi state machine (§0.7) + stock
  deduction transaction (§0.1-0.2) saat masuk `completed`.
  DoD: test manual — order completed dengan stok cukup → stok berkurang benar; order
  completed dengan stok kurang → 409, stok tidak berubah, status tidak berubah (verifikasi
  rollback dengan query ulang setelah request gagal).
- [ ] **C5.** CRUD Medicine standar (`GET/POST/PUT/DELETE /api/medicines`).
- [ ] **C6.** Dashboard endpoints (§0.6).
- [ ] **C7.** Middleware: `errorHandler.js` (400/404/409/500 konsisten), `validator.js`
  (express-validator rules per endpoint), CORS + Helmet di `app.js`.
  DoD: hit endpoint dengan payload invalid → response format error konsisten
  `{ success: false, message, errors? }`.

### Fase D — Frontend
- [ ] **D1.** `services/api.js` — axios instance + interceptor error handling (toast on 4xx/5xx).
- [ ] **D2.** `medicineService.js`, `orderService.js` — wrapper semua endpoint termasuk yang
  baru (`updateOrderItems`, `dashboard/stats`, `medicines/low-stock`).
- [ ] **D3.** Layout (`Sidebar`, `Navbar`) + routing skeleton (`App.jsx` dengan React Router v6).
- [ ] **D4.** `Dashboard.jsx` — stat cards + recent orders + low-stock alert (pakai endpoint C6).
- [ ] **D5.** `MedicinesPage.jsx` — tabel + modal form CRUD, indikator warna jika `stock <= min_stock`.
- [ ] **D6.** `OrdersPage.jsx` — tabel + filter status/tanggal + pagination.
- [ ] **D7.** `OrderForm.jsx` — multi-item dinamis (add/remove row), dropdown medicine dengan
  search, validasi quantity di client sebelum submit.
- [ ] **D8.** `OrderDetailPage.jsx` — info order + item list + tombol ubah status (disable
  tombol untuk transisi yang tidak valid sesuai §0.7) + form approve quantity (khusus status
  `processing`, memanggil endpoint C3).
- [ ] **D9.** `ConfirmDialog`, `LoadingSpinner`, `StatusBadge`, toast notification global.
- [ ] **D10.** Responsive check (mobile breakpoint minimal untuk tabel → card view).

### Fase E — Docker & Deploy
- [ ] **E1.** `backend/Dockerfile` (Node 20 Alpine, multi-stage jika perlu).
- [ ] **E2.** `frontend/Dockerfile` (build stage + Nginx serve, termasuk **nginx.conf** dengan
  reverse proxy `/api` → `backend:5000` — ini item yang hilang di planning awal).
- [ ] **E3.** `docker-compose.yml` final dengan `healthcheck` di service `db`
  (`pg_isready`) dan `depends_on.condition: service_healthy` di backend.
  DoD: `docker compose up` dari kondisi bersih (`docker compose down -v`) sampai semua
  service healthy tanpa manual restart.
- [ ] **E4.** Smoke test end-to-end di lingkungan Docker: create medicine → create order →
  approve → complete → verify stock berkurang.
- [ ] **E5.** Deploy ke VM, test akses dari luar.
- [ ] **E6.** `README.md` — setup lokal, setup Docker, daftar endpoint, screenshot/GIF alur utama.

### Fase F — Submission
- [ ] **F1.** Push ke GitHub (public repo).
- [ ] **F2.** Record video demo (alur: login flow kalau ada → CRUD obat → buat order →
  approve → complete → lihat stok berkurang → dashboard).
- [ ] **F3.** Kirim email ke `itsyamrabu@gmail.com` dengan subject persis:
  `Pengumpulan Take-Home Test posisi Full Stack UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan`

---

## 2. Snippet Referensi (agar agent tidak salah asumsi)

**Docker Compose healthcheck (menutup gap race condition startup):**
```yaml
services:
  db:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5
  backend:
    depends_on:
      db:
        condition: service_healthy
```

**Transaction pattern untuk stock deduction (Sequelize):**
```js
await sequelize.transaction(async (t) => {
  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem, include: [Medicine] }],
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  for (const item of order.OrderItems) {
    const medicine = await Medicine.findByPk(item.medicineId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (medicine.stock < item.quantityApproved) {
      throw new AppError(409, `Stok ${medicine.name} tidak cukup`);
    }
    medicine.stock -= item.quantityApproved;
    await medicine.save({ transaction: t });
  }
  order.status = 'completed';
  await order.save({ transaction: t });
});
```

---

## 3. Timeline Realistis (disesuaikan, mulai hari ini Selasa 7 Juli)

| Hari | Tanggal | Fokus |
|---|---|---|
| Selasa (malam ini) | 7 Jul | Fase A + B (scaffold, models, seeder) |
| Rabu | 8 Jul | Fase C penuh (business logic backend) — jangan mulai frontend sebelum C4 selesai & tervalidasi |
| Kamis | 9 Jul | Fase D penuh (frontend) |
| Jumat | 10 Jul | Fase E (Docker + deploy) + bug fixing lintas hari |
| Sabtu pagi | 11 Jul (sebelum 12.00) | Fase F (video, push, email) — buffer 3-4 jam sebelum deadline |

Prinsip: **Dockerfile ditulis paralel dari Hari 1** (draft awal, tidak perlu sempurna),
supaya Fase E di hari terakhir tinggal debugging, bukan menulis dari nol.

---

## 4. Checklist Verifikasi Sebelum Submit

- [ ] Test skenario stok tidak cukup saat complete order → benar-benar reject, tidak silent fail
- [ ] Test 2 order dibuat bersamaan → nomor order tidak collision
- [ ] Test transisi status invalid (misal `completed → pending`) → ditolak backend
- [ ] `docker compose up` dari clean state jalan tanpa intervensi manual
- [ ] README bisa diikuti orang lain dari nol sampai aplikasi jalan
- [ ] Semua endpoint di §0.6 (dashboard) mengembalikan data benar, bukan hardcoded