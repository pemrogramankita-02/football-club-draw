# FOOTBALL CLUB DRAW v2.0 — Full Local Edition

Aplikasi pengelolaan turnamen sepak bola berbasis HTML, CSS, dan JavaScript. Tidak membutuhkan backend untuk penggunaan lokal.

## Menjalankan
1. Ekstrak ZIP.
2. Buka folder `FOOTBALL-CLUB-DRAW-FULL` di VS Code.
3. Jalankan `index.html` melalui ekstensi Live Server.
4. Untuk PWA/service worker, gunakan `localhost` atau hosting HTTPS (jangan buka langsung dengan `file://`).
5. Di Chrome Android, buka alamat HTTPS lalu pilih **Instal aplikasi** atau **Tambahkan ke layar utama**.

## Fitur
- Turnamen: tambah, edit, pilih turnamen aktif, hapus.
- Klub: tambah, edit, hapus, upload logo, pencarian thumbnail Wikipedia sebagai bantuan logo.
- Pengundian Free Draw: acak seluruh peserta dan bagi seimbang ke grup.
- Snapshot peserta, seed acak, SHA-256 commitment dan audit lokal.
- Klasemen grup otomatis: MP, W, D, L, GF, GA, GD, PTS.
- Jadwal: buat fixture manual, tanggal, waktu, venue, input skor.
- Knockout: membuat pasangan awal dari tim teratas grup sesuai konfigurasi kualifikasi.
- WhatsApp: membuat pesan dan membuka `wa.me` untuk nomor klub atau pemilih kontak WhatsApp.
- Studio media: komposisi visual portrait 9:16 / landscape 16:9, rekaman WebM via Canvas + MediaRecorder.
- Ekspor hasil grup / klasemen PNG atau JPG.
- Backup dan restore JSON.
- PWA cache inti untuk akses offline setelah pertama kali dibuka.

## Catatan operasional penting
- **Penyimpanan:** LocalStorage pada browser/perangkat yang sedang dipakai. Backup JSON secara berkala. Data tidak otomatis tersinkron ke perangkat lain.
- **Logo otomatis:** pencarian thumbnail Wikipedia membutuhkan internet dan hasilnya harus diperiksa. Logo klub lokal atau logo resmi yang tidak ditemukan perlu diunggah manual.
- **WhatsApp:** `wa.me` hanya menyiapkan pesan. Admin harus menekan tombol Kirim di WhatsApp. Pengiriman otomatis terjadwal ke grup memerlukan WhatsApp Business Platform/API dan backend resmi.
- **Video:** output rekaman adalah WebM jika browser mendukung MediaRecorder. MP4 tidak disediakan karena tidak tersedia native secara konsisten di browser.
- **Audit:** hash membantu mendeteksi perubahan pada data yang dibandingkan dengan commitment. Karena seed dan data berada di browser yang sama, ini bukan bukti independen anti-kecurangan dan bukan pengganti audit pihak ketiga.
- **Knockout:** versi ini membuat babak pertama dari tim yang lolos. Pemenang ke babak berikutnya perlu dikelola/ditambahkan sesuai hasil; penjadwalan bracket multi-putaran otomatis penuh belum disediakan.
- **PWA:** ikon SVG dapat dipakai oleh browser modern, tetapi dukungan instalasi dapat berbeda. Untuk cakupan instalasi paling luas, tambahkan ikon PNG 192×192 dan 512×512.
- Aplikasi ini merupakan edisi local-first yang siap dicoba, bukan sistem multi-admin atau layanan produksi tersentralisasi.

## Struktur
- `index.html` — shell aplikasi
- `css/style.css` — tampilan responsif
- `js/app.js` — logika aplikasi
- `manifest.json` — metadata PWA
- `service-worker.js` — cache offline
- `assets/icons/icon.svg` — ikon aplikasi

## Pembaruan tema Soft Blue
Tema diganti menjadi biru langit dan putih. Berkas logika `js/app.js` tidak diubah; fitur versi sebelumnya tetap dipertahankan. Service worker cache menggunakan versi baru agar CSS baru termuat.

## Mobile-first
Antarmuka diprioritaskan untuk ponsel lebar 320–430 px: navigasi bawah tetap, konten satu kolom, kontrol sentuh besar, tabel dapat digeser, dan formulir disusun vertikal. Tampilan tablet/desktop tetap responsif.

## Perbaikan animasi
Tombol MULAI PENGUNDIAN sekarang berpindah ke Ruang Pengundian setelah data disimpan dan menjalankan animasi reveal klub satu per satu. Tombol Putar Animasi Hasil dapat memutar ulang hasil yang sama. Jalankan melalui Live Server/HTTPS untuk dukungan hash SHA-256 penuh; fallback lokal hanya untuk penggunaan browser tanpa Web Crypto.

## Animasi undian sinematik
Ruang undian menampilkan arena bercahaya, bola berputar, efek roulette logo/nama klub yang melambat, kartu reveal klub, label grup tujuan, serta progress ceremony. Hasil yang ditampilkan tetap berasal dari undian tersimpan dan tidak berubah saat animasi diputar ulang.


## Tambah klub massal
Di menu **Data Klub**, pilih **Tambah Berdasarkan Jumlah**, masukkan jumlah klub (1–128), lalu buat. Aplikasi membuat nama sementara “Klub Baru 01”, dan seterusnya. Tekan **Edit** pada setiap baris untuk mengganti nama, kota/negara, nomor WhatsApp, atau mengunggah logo. Jika ada turnamen aktif, klub baru otomatis dimasukkan ke daftar peserta turnamen tersebut.


## Animasi pengundian 3 detik per klub
Saat pengundian berjalan, nama klub dan grup tujuan ditampilkan selama 3 detik untuk setiap klub sebelum klub berikutnya muncul. Putar ulang animasi menampilkan hasil yang sama tanpa mengacak ulang pembagian grup.


## Perubahan versi ini
- Menu Studio Media dihapus dari navigasi dan halaman aplikasi.
- Bagan knockout dibuat lengkap sampai final, termasuk slot lawan yang menunggu hasil babak sebelumnya.
- Pemenang otomatis diteruskan ke pertandingan berikutnya setelah skor disimpan.
- Jika jumlah peserta bukan pangkat dua, slot bye otomatis meloloskan tim tanpa pertandingan.
- Jika skor knockout imbang, admin wajib memilih pemenang adu penalti.


## Animasi pengundian mengikuti referensi
- Papan grup ditampilkan selama proses undian; setiap slot awalnya menunggu.
- Nama klub muncul satu per satu pada slot grup yang benar, dengan sorotan pada slot yang sedang terisi.
- Nama klub dan grup tujuan tetap terlihat selama 2 detik sebelum klub berikutnya ditampilkan.
- Setelah selesai, seluruh hasil tetap terlihat di papan dan rekap hasil.


## Video hasil undian & berbagi WhatsApp
Pada halaman Ruang Pengundian, tombol **Video & WhatsApp** membuat video vertikal dengan tampilan nama klub dan grup tujuan (2 detik per klub). Pada perangkat yang mendukung berbagi file, pilih WhatsApp dari menu berbagi Android. Jika berbagi file tidak didukung, video diunduh dan WhatsApp dibuka dengan pesan; lampirkan file video secara manual. Format video mengikuti dukungan browser (MP4 bila tersedia, selain itu WebM).

## Mode kompetisi Liga
Saat membuat turnamen, pilih **Liga penuh (round-robin)**. Buat jadwal liga untuk menghasilkan pertandingan semua klub saling bertemu. Pilih satu putaran atau dua putaran (kandang dan tandang). Menu Hasil & Klasemen menampilkan klasemen liga dengan poin 3/1/0 dan statistik main, menang, seri, kalah, gol, selisih gol. Input skor melalui menu Jadwal & Skor akan memperbarui klasemen.


## Struktur multi-turnamen dan navigasi per turnamen
- Menu Riwayat & Audit dihapus dari antarmuka.
- Daftar turnamen menjadi halaman pengelolaan utama. Pilih **Kelola** untuk masuk ke ruang kerja turnamen tersebut.
- Setelah masuk, sidebar hanya menampilkan menu yang relevan untuk turnamen aktif: Data Klub, Sistem Pengundian (jika format grup), Jadwal & Skor, Hasil & Klasemen, dan Babak Knockout sesuai jenis kompetisi.
- Data klub yang ditampilkan dibatasi pada peserta turnamen aktif. Klub baru yang ditambahkan dari ruang kerja otomatis menjadi peserta turnamen tersebut.
- Format kompetisi: Fase Grup, Babak Knockout, Fase Grup + Knockout, atau Liga.
- Berpindah turnamen melalui menu **Ganti Turnamen**. Jadwal, hasil, dan klasemen difilter berdasarkan ID turnamen.
- Navigasi sidebar disesuaikan untuk layar HP; menu turnamen aktif ditampilkan di bagian atas.


## Revisi 01–05
- Video Live Draw vertikal 9:16 dengan papan penempatan grup yang muncul bertahap.
- Gambar jadwal Matchday menggunakan kartu pertandingan bergaya aplikasi.
- Gambar klasemen liga menggunakan tabel vertikal yang mudah dibaca.
- Ukuran tipografi antarmuka diperbesar untuk aksesibilitas.
- Tombol Instal Aplikasi di header dihilangkan; manifest dan service worker PWA tetap dipertahankan.


## Revisi 06
- Gambar klasemen liga menggunakan kanvas lebih lebar dan tinggi dinamis, menampilkan seluruh klub serta seluruh kolom: #, Klub, MP, M, S, K, GM, GK, SG, PTS.
- Jadwal fase grup disusun round-robin per grup dan dikelompokkan lintas grup berdasarkan Matchday (misalnya Matchday 1 memuat Grup A, B, C, dan D).
- Pertandingan fase grup lama yang belum memiliki indeks Matchday dipetakan otomatis ke urutan round-robin saat halaman jadwal dibuka.
- Cache service worker diperbarui agar browser mengambil file revisi terbaru.


## Revisi 07 — Full Screen Share & tema baru
- Gambar klasemen liga, fase grup, knockout, dan jadwal memakai format portrait Full HD 1080 × 1920. Data panjang dipisah otomatis menjadi beberapa halaman; setiap halaman diberi nomor.
- Jadwal Match Day dapat dibagikan sebagai teks WhatsApp yang memuat setiap pasangan klub, nomor HP kedua klub (atau keterangan belum ditambahkan), serta ucapan “Selamat bertanding, hubungi lawan main, good luck!”.
- Nomor WhatsApp klub fleksibel: dapat diisi ketika klub dibuat atau diedit setelah klub tersimpan. Kolom nomor tetap opsional.
- Tema aplikasi: Black Charcoal, Sky Blue, dan Soft Yellow. Font antarmuka Roboto, ukuran teks dan area sentuh diperbesar, dengan prioritas mobile-first.
- Berbagi beberapa gambar sekaligus memerlukan dukungan Web Share API pada browser. Jika tidak didukung, gambar diunduh satu per satu dan pesan WhatsApp dibuka agar gambar dapat dilampirkan manual.


## Ikon aplikasi
Ikon aplikasi menggunakan lambang sepak bola yang diberikan pengguna. Berkas PNG 192×192 dan 512×512 digunakan untuk PWA, Android, dan favicon. Setelah pembaruan di-host, perbarui/instal ulang shortcut PWA jika ikon lama masih tersimpan oleh launcher.
