# 🎓 Sistem Pendukung Keputusan Pemilihan Siswa Berprestasi  
## Menggunakan Metode **Analytical Hierarchy Process (AHP)**

Proyek ini merupakan implementasi **Sistem Pendukung Keputusan (SPK)** untuk membantu proses pemilihan siswa berprestasi di **SDIT Insantama Leuwiliang** secara objektif, terukur, dan terstruktur. Sistem ini menggunakan metode **AHP (Analytical Hierarchy Process)** untuk menghitung bobot kriteria dan menentukan peringkat siswa terbaik.

---

## 📌 Tujuan Proyek
- Membantu pihak sekolah dalam melakukan seleksi siswa berprestasi secara lebih akurat dan objektif.
- Mengurangi subjektivitas penilaian guru.
- Menyediakan sistem otomatis untuk perhitungan bobot dan perangkingan siswa.
- Mempermudah proses dokumentasi hasil seleksi.

---

## 🧠 Metode yang Digunakan: **AHP (Analytical Hierarchy Process)**

AHP adalah metode pengambilan keputusan multikriteria yang bekerja melalui langkah-langkah berikut:

1. **Menentukan tujuan** – yaitu memilih siswa berprestasi.
2. **Menentukan kriteria penilaian**, misalnya:
   - Prestasi akademik  
   - Prestasi non-akademik  
   - Sikap/akhlak  
   - Kehadiran  
   - Kedisiplinan
3. **Membuat matriks perbandingan berpasangan** untuk setiap kriteria.
4. **Menghitung bobot prioritas** untuk menentukan tingkat kepentingan tiap kriteria.
5. **Mengukur konsistensi keputusan** menggunakan *Consistency Ratio (CR)*.
6. **Menghasilkan perangkingan alternatif** (siswa) berdasarkan bobot kriteria.

---

## 🏫 Ruang Lingkup Sistem
- Input data siswa
- Input nilai/penilaian guru berdasarkan setiap kriteria
- Penghitungan matriks perbandingan berpasangan kriteria
- Penghitungan bobot prioritas dengan metode AHP
- Validasi konsistensi (CI & CR)
- Penghitungan skor akhir siswa
- Output ranking siswa berprestasi

---

## ✨ Fitur Utama
- **Manajemen Data Siswa**
- **Manajemen Kriteria & Bobot**
- **Perbandingan Berpasangan (Pairwise Comparison)**
- **Perhitungan Otomatis AHP + Konsistensi**
- **Perankingan Siswa**
- **Export Hasil (PDF/Excel) – opsional**
- **Antarmuka modern dan responsif** (jika berbasis web)

---


---

## ⚙️ Teknologi yang Digunakan
- **Frontend:** HTML, CSS, JavaScript, Bootstrap / Tailwind  
- **Backend:** Node.js / PHP / Laravel / CodeIgniter  
- **Database:** MySQL  
- **Metode SPK:** AHP

---

## 🚀 Cara Menjalankan Proyek (Contoh Node.js)
1. Clone repository:
   ```bash
   git clone https://github.com/username/spk-ahp-siswa-berprestasi.git

## Install Depidencies 
- npm install

## Jalankan Server 
- npm run dev (client)
- node app.js (server)

  

