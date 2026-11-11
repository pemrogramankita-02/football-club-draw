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


## Revisi 07 — Share, klasemen, tema dan ikon
- Jadwal Match Day diekspor menjadi gambar portrait 1080×1920. Maksimal empat pertandingan per gambar; jumlah halaman mengikuti jumlah pertandingan.
- Teks WhatsApp disiapkan satu kali untuk seluruh Match Day, memuat nama kedua klub dan nomor WhatsApp masing-masing, lalu satu pesan penutup.
- Tombol berbagi memakai satu lembar berbagi dengan seluruh file gambar jika browser mendukung berbagi banyak file. Jika tidak, gambar diunduh berurutan dan satu pesan WhatsApp dibuka; lampirkan seluruh gambar secara manual.
- Klasemen fase grup menampilkan semua grup dengan kolom peringkat, tim, T, M, S, K, SG, dan Poin. Ekspor klasemen grup membagi dua grup per gambar portrait.
- Klasemen liga dibagi menjadi maksimal 12 klub per gambar; bagan knockout dibagi maksimal empat pertandingan per gambar.
- Tema Black Charcoal, Sky Blue, dan Soft Yellow; font Roboto; kontrol sentuh diperbesar dan layout tetap mobile-first.
- Ikon PWA menggunakan emblem PNG 192×192 dan 512×512.

### Catatan pengujian
- `node --check js/app.js` berhasil.
- Belum dilakukan pengujian visual lintas browser atau uji pengiriman WhatsApp langsung pada perangkat. Browser/OS dapat membatasi jumlah file yang dapat dibagikan sekaligus.


## Revisi 08 — Penyempurnaan aturan kompetisi dan penghargaan
- Klasemen grup menghitung menang 3, seri 1, kalah 0; urutan memakai poin, selisih gol, gol memasukkan, head-to-head, lalu fair play berdasarkan kartu.
- Form input skor fase grup menyediakan pencatatan kartu kuning/merah untuk tie-breaker fair play.
- Liga menggunakan home-away (dua putaran) sebagai default; satu putaran tetap dapat dipilih. Pengaturan jumlah klub degradasi disediakan untuk administrasi akhir musim.
- Knockout menampilkan bracket horizontal yang dapat digeser di HP. Skor penalti disimpan terpisah dari gol pertandingan agar tidak menambah total gol klub.
- Penghargaan Klub Tersubur menghitung total gol dari semua pertandingan turnamen. Jika seri, semua klub dengan total tertinggi ditampilkan sebagai pemenang bersama.
- Data lama tetap memakai key LocalStorage yang sama (`fcd_full_v2`).

Catatan: implementasi ini belum mencakup kalkulasi agregat dua leg otomatis atau modul promosi antar-turnamen yang memindahkan klub ke kasta lain. Pencatatan extra time menggunakan skor akhir pertandingan; pencatatan detail durasi 2x15 dan sudden-death penalti masih perlu diuji/ditambahkan pada iterasi berikutnya.


## Revisi 09 — Visual Contrast & Typography
- Tema visual diseragamkan menjadi Dark Charcoal, Sky Blue, dan Soft Yellow.
- Tipografi menggunakan Roboto dengan ukuran yang diperbesar, khususnya pada tampilan HP.
- Kontras judul, nama turnamen, nama klub, label, tombol, tabel, formulir, dan status diperjelas.
- Perubahan dibatasi pada CSS, pemanggilan font di HTML, warna tema browser, dan versi cache PWA.
- Tidak ada perubahan pada logika aplikasi, perhitungan turnamen, fitur, ikon, maupun struktur penyimpanan data.


## Revisi 10 — Aturan Kompetisi & Validasi Jadwal

- Format kompetisi baru dibatasi menjadi tiga: Liga, Fase Grup + Knock-out, dan Knock-out.
- Data turnamen lama dengan format `groups` dibaca sebagai `hybrid` (Fase Grup + Knock-out) agar hasil undian dan data lamanya tetap dikenali.
- Generator round-robin fase grup dan liga diperbaiki menggunakan rotasi lingkaran yang benar.
- Jadwal liga satu putaran menghasilkan N×(N−1)/2 pertandingan; dua putaran menghasilkan N×(N−1) pertandingan.
- Klasemen liga dan fase grup menggunakan urutan Poin → GM → SG → GK paling sedikit.
- Kolom GM dan GK ditampilkan pada klasemen fase grup.
- Pengundian babak Knock-out mengacak ulang klub yang lolos dan mendistribusikan slot bye secara acak. Hasil bagan tersimpan di data turnamen.
- Cache PWA dinaikkan agar file terbaru diambil setelah deploy.

Catatan validasi: algoritma round-robin diuji secara terpisah untuk jumlah klub 2–20; setiap pasangan muncul tepat satu kali pada putaran tunggal dan tidak ada klub bermain dua kali pada Matchday yang sama. Pemeriksaan sintaks JavaScript menggunakan `node --check`. Pengujian browser langsung belum dilakukan.

## Revisi 11 — SUPER HD+ capture tampilan asli
- Tombol berbagi Jadwal & Skor dan Hasil & Klasemen kini mengambil gambar langsung dari elemen halaman web aktif, bukan menggambar ulang kartu/tabel dengan Canvas khusus.
- Capture menggunakan skala 3x dan PNG; halaman panjang dibagi otomatis menjadi beberapa gambar berurutan.
- Tombol/aksi interaktif disembunyikan pada salinan capture agar gambar fokus pada isi halaman.
- Satu caption WhatsApp disertakan untuk seluruh rangkaian gambar.
- Capture memuat html2canvas dari CDN saat tombol berbagi ditekan; koneksi internet diperlukan saat pertama kali memuat pustaka.
- Jika perangkat/browser tidak mendukung berbagi beberapa file sekaligus, semua gambar diunduh dan WhatsApp dibuka dengan satu caption; lampiran perlu dipilih manual.
- Cache service worker diperbarui ke Revisi 11.

## Revisi 12 – penyelarasan berbagi visual
- Capture jadwal per Matchday dari elemen halaman yang tampil, bukan membuat ulang kartu melalui Canvas.
- Gambar hasil capture menggunakan PNG skala 3x dan otomatis dipotong menjadi beberapa bagian jika panjang.
- Tombol bagikan MD ditambahkan pada jadwal Liga dan Fase Grup.
- Pesan WhatsApp/catatan hanya disertakan pada berbagi jadwal; berbagi hasil/klasemen tidak menambahkan catatan.
- Tema hasil capture mengikuti CSS halaman aplikasi (Dark Charcoal, Sky Blue, Soft Yellow).
- Cache service worker diperbarui ke revisi 12.
- Pengujian: `node --check js/app.js` lulus. Uji browser/WhatsApp langsung belum dilakukan.


## Revisi 13 — Grafis Share
- Poster jadwal per Matchday menggunakan template grafis Dark Charcoal, Sky Blue, dan Soft Yellow.
- Caption WhatsApp jadwal memuat pasangan klub dan nomor HP A/B satu kali untuk seluruh rangkaian gambar.
- Template hasil/klasemen dan bracket menggunakan palet grafis yang diselaraskan.
- Fitur inti dan struktur penyimpanan turnamen tidak diubah.
- Catatan pengujian: validasi sintaks JavaScript dilakukan; pengujian browser/WhatsApp langsung tetap diperlukan.


## Revisi 14 – Poster hasil dan bracket
- Catatan jadwal memakai format per pertandingan: nama klub VS nama klub, lalu nomor HP masing-masing klub; nomor kosong tidak ditulis sebagai “Belum tersedia”.
- Poster bracket Knock-out menggunakan tema Dark Charcoal, Sky Blue, dan Soft Yellow.
- Poster klasemen grup menggunakan baris gelap dengan aksen biru.
- Cache PWA diperbarui ke Revisi 14.
- Pemeriksaan sintaks JavaScript dilakukan; pengujian browser/WhatsApp tetap perlu dilakukan pada perangkat pengguna.


## Revisi 14 — Poster hasil dan klasemen

- Jadwal per Matchday tetap memakai poster jadwal yang sudah ada.
- Format catatan WhatsApp jadwal menggunakan satu blok per pertandingan: `\\ PERTANDINGAN n//`, `Klub A VS Klub B`, lalu nomor HP masing-masing klub; nomor kosong dibiarkan kosong.
- Tombol `Hasil + Klasemen MD` tersedia pada setiap Matchday untuk Liga dan Fase Grup.
- Liga membagikan hasil MD terpilih beserta klasemen kumulatif sampai MD tersebut.
- Fase Grup membagikan hasil MD terpilih dan klasemen kumulatif tiap grup sampai MD tersebut.
- Knock-out membagikan hasil per babak dan status kelolosan dalam poster grafis.
- Poster hasil memakai Dark Charcoal, Sky Blue, Soft Yellow, font Roboto, serta logo klub dari data aplikasi.
- Hasil, klasemen, dan bracket dibagikan tanpa catatan WhatsApp.

Pemeriksaan yang dilakukan: `node --check js/app.js`. Pengujian browser/WhatsApp langsung tetap perlu dilakukan pada perangkat pengguna.


## Revisi 1 + Revisi 2 (Share Poster)
- Seluruh poster berbagi memakai tema poster vertikal Dark Charcoal, Sky Blue, Soft Yellow, identitas turnamen, logo klub, dan footer resmi.
- Poster klasemen Liga/Fase Grup hanya memuat tabel klasemen; tidak menyertakan hasil pertandingan maupun penghargaan Klub Tersubur.
- Tombol Bagikan Seluruh Jadwal dihapus; berbagi jadwal tetap tersedia per Matchday/babak.
- Catatan jadwal memakai format pertandingan ringkas dengan bullet nama klub dan nomor HP; nomor HP dinormalisasi untuk mencegah pengulangan angka identik.


## Revisi 1-2 + Catatan Saya
- Menu Catatan Saya tersedia di bagian Aplikasi pada sidebar.
- Mendukung banyak catatan: buat, edit, hapus, cari, dan bagikan ke WhatsApp.
- Catatan disimpan terpisah di LocalStorage (`fcd_user_notes_v1`) agar tidak mengubah struktur data turnamen.
- Data catatan tetap ada saat web ditutup dan dibuka kembali pada browser/perangkat yang sama. Data tidak otomatis tersinkron ke perangkat lain dan tidak termasuk backup turnamen JSON.
