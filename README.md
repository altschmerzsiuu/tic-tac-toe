# 🎮 THINK-TAC-TOE

**Tic-Tac-Toe meets Quiz Game!** Sebuah game edukatif interaktif yang menggabungkan strategi Tic-Tac-Toe klasik dengan sistem pertanyaan berbasis tema.

![Game Preview](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🌟 Features

### 🎯 Core Gameplay
- **Traditional Tic-Tac-Toe** dengan twist edukatif
- **Theme-Based Questions** - Setiap kotak memiliki tema pertanyaan (Definisi, Sinonim, Antonim, dll)
- **Turn-Based System** - Tim X vs Tim O dengan giliran yang fair
- **Win Detection** - Otomatis deteksi pemenang dengan animasi

### ⚡ Skill System
- **Mystery Boxes** - Kotak misteri dengan 2 kemungkinan:
  - 🗑️ **Hapus Tanda** - Skill untuk menghapus 1 tanda lawan
  - 💥 **ZONK** - Tidak dapat apa-apa
- **Skill Expiration** - Skill berlaku selama 2 giliran
- **Strategic Gameplay** - Pilih kapan menggunakan skill dengan bijak

### 📊 Scoreboard
- **Real-time Score Tracking** - Skor Tim X vs Tim O yang selalu update
- **Persistent Scores** - Skor tetap tersimpan antar ronde
- **Reset Score** - Tombol untuk mereset skor kapan saja

### 🎨 Visual & Audio
- **Modern Glassmorphism Design** - UI yang aesthetic dengan efek blur
- **Smooth Animations** - Transisi halus di setiap interaksi
- **Confetti Effect** - Efek perayaan saat menang menggunakan canvas-confetti
- **Victory Music** - 3 lagu kemenangan random yang diputar saat menang
- **Sound Effects** - SFX untuk setiap aksi (klik, skill, zonk, dll)

### 📱 Responsive Design
- **Mobile Friendly** - Otomatis menyesuaikan layout untuk layar kecil
- **Cross-browser Compatible** - Berjalan lancar di semua browser modern

---

## 🎮 How to Play

1. **Mulai Game** - Tim X selalu memulai terlebih dahulu
2. **Pilih Kotak** - Klik kotak untuk menjawab pertanyaan dengan tema tertentu
3. **Jawab Pertanyaan** - Guru membacakan soal, jawab ✅ Benar atau ❌ Salah
4. **Mystery Box** - Beberapa kotak berisi misteri box:
   - Pilih salah satu kotak
   - Dapatkan skill atau zonk
5. **Gunakan Skill** - Jika dapat skill:
   - ⚡ **Gunakan Skill** - Hapus tanda lawan sekarang
   - ⏳ **Nanti Dulu Deh** - Simpan untuk giliran berikutnya
6. **Menangkan Game** - Susun 3 tanda secara horizontal, vertikal, atau diagonal
7. **Tracking Score** - Skor otomatis bertambah saat menang

---

## 🚀 Installation

### Clone Repository
```bash
git clone https://github.com/username/think-tac-toe.git
cd think-tac-toe
```

### Run Locally
Cukup buka file `index.html` di browser favorit kamu!

```bash
# Atau gunakan live server
npx live-server
```

---

## 📁 Project Structure

```
think-tac-toe/
├── index.html          # Main HTML structure
├── style.css           # Styling & animations
├── script.js           # Game logic & interactions
└── README.md           # Documentation
```

---

## 🎨 Customization

### Ubah Warna Tema
Edit variabel CSS di bagian `:root` dalam `style.css`:

```css
:root {
    --gradient-bg: linear-gradient(135deg, #DE603D 0%, #A95A40 100%);
    --gradient-x: linear-gradient(135deg, #DE603D 0%, #FF9966 100%); 
    --gradient-o: linear-gradient(135deg, #DAA520 0%, #FFCC00 100%);
}
```

### Tambah/Ubah Tema Pertanyaan
Edit array `themes` di `script.js`:

```javascript
themes: ['Definisi', 'Struktur', 'Tujuan', 'Sinonim', 'Antonim', 'General']
```

### Ganti Musik Kemenangan
Upload musik ke GitHub repository kamu dan update di `script.js`:

```javascript
const sounds = {
    win: new Audio('link-musik-1.mp3'),
    win2: new Audio('link-musik-2.mp3'),
    win3: new Audio('link-musik-3.mp3')
};
```

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with animations
  - CSS Grid & Flexbox
  - CSS Variables
  - Glassmorphism effects
  - Keyframe animations
- **Vanilla JavaScript** - Game logic & DOM manipulation
- **Canvas Confetti** - Celebration effects
- **Bootstrap Icons** - Icon library

---

## 🎯 Game Rules

### Winning Conditions
- Susun 3 tanda (X atau O) secara:
  - **Horizontal** - Baris 1, 2, atau 3
  - **Vertikal** - Kolom 1, 2, atau 3
  - **Diagonal** - Kiri-atas ke kanan-bawah atau kanan-atas ke kiri-bawah

### Draw Condition
- Semua kotak terisi tanpa ada pemenang

### Skill Rules
- Skill **Hapus Tanda** berlaku selama **2 giliran**
- Jika tidak digunakan dalam 2 giliran, skill expired
- Skill yang baru didapat akan **dibatalkan** jika jawaban pertanyaan berikutnya **salah**

---

## 🤝 Contributing

Contributions are welcome! Silakan fork repository ini dan buat pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Future Improvements

- [ ] Mode multiplayer online
- [ ] Leaderboard system
- [ ] Lebih banyak variasi skill
- [ ] AI opponent untuk single player
- [ ] Timer per turn (optional)
- [ ] Tema pertanyaan yang bisa dicustom
- [ ] Save game state ke localStorage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Sound effects from [Mixkit](https://mixkit.co/)
- Confetti library from [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/)
- Inspired by classic Tic-Tac-Toe game

---

## 📸 Screenshots

### Main Game
![Main Game](screenshot-1.png)

### Mystery Box
![Mystery Box](screenshot-2.png)

### Victory Screen
![Victory Screen](screenshot-3.png)

---

<div align="center">

**⭐ Star this repo if you like it! ⭐**

Made with ❤️ and ☕

</div>
