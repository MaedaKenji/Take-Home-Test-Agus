# **Full Stack Take-Home Test**

Waktu pengerjaan: 3 hari.  
Buat aplikasi sederhana untuk membantu petugas farmasi mencatat dan memantau pesanan obat dari poli.

## **Fitur Utama**

* Melihat daftar order obat  
* Menambah order obat  
* Melihat detail order  
* Mengedit order yang belum diproses  
* Mengubah status order  
* Menghapus atau membatalkan order

## **Data Minimal**

Kandidat diperbolehkan menambahkan atribut lain pada tabel apabila diperlukan.

1. ### **Obat**

* Nama obat  
* Satuan  
* Stok tersedia

2. ### **Order Obat**

* Nomor order  
* Unit/poliklinik pemesan  
* Tanggal order  
* Catatan

3. ### **Detail Order**

* Obat  
* Jumlah yang dipesan  
* Jumlah yang disetujui/dipenuhi

## **Teknologi Wajib**

* Frontend: React  
* Backend: Express.js  
* ORM: Sequelize  
* Database: PostgreSQL

## **Deployment**

Aplikasi wajib di deploy ke VM yang telah disediakan dan dapat diakses untuk proses review.

Kandidat akan diberikan akses SSH ke VM untuk melakukan deployment.

### **Ketentuan Deployment**

* Wajib menggunakan Docker  
* Aplikasi harus dapat dijalankan menggunakan Docker Compose  
* Sertakan file `Dockerfile`  
* Sertakan file `docker-compose.yml`  
* Sertakan file `.env`  
* Database PostgreSQL juga di deploy di vm  
* Sertakan petunjuk deployment pada README Github

## **Hal yang Dievaluasi**

* Alur bisnis  
* CRUD API dan integrasi frontend  
* Validasi input  
* Penanganan error  
* Kemampuan deployment menggunakan Docker

## **Ketentuan Pengumpulan**

* Buat Video Demo Aplikasi lalu upload di Youtube  
* Kumpulkan Link Repository Git yang berisi source code aplikasi.  
* Repository harus dapat diakses oleh tim evaluator.  
* Pastikan source code sudah mencakup file konfigurasi deployment, seperti `Dockerfile`, `docker-compose.yml`, dan `.env.example`.  
* Sertakan README yang menjelaskan cara menjalankan aplikasi dan melakukan deployment.  
* Sertakan alamat aplikasi yang sudah di deploy pada VM.  
* Pengumpulan dilakukan melalui email ke `itsyamrabu@gmail.com`  
* Subject email: **Pengumpulan Take-Home Test posisi Full Stack UOBK RSUD Syarifah Ambami Rato Ebu Bangkalan**  
* Batas akhir pengumpulan: **Sabtu, 11 Juli 2026 pukul 12.00 WIB.**