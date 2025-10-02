// ===== GAME STATE =====
let gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true,
    themes: ['Matematika', 'Tebak Bendera', 'Bahasa Inggris', 'IPA', 'Bahasa Indonesia', 'Tebak Ibukota', 'General', 'General', 'Tebak Bendera', 'General', 'Tebak Bendera'],
    cellThemes: [],
    skillCells: [],
    playerSkills: { X: { count: 0, turnsLeft: 0 }, O: { count: 0, turnsLeft: 0 } },
    pendingSkillValidation: { X: false, O: false }, // ← new: apakah skill baru didapat dan perlu dipantau
    currentCell: null,
    timerInterval: null,
    timeLeft: 0,
    timerRunning: false,
    waitingForSkillTarget: false,
    turnCount: { X: 0, O: 0 }
};

// ===== SOUND EFFECTS =====
// existing sounds
const sounds = {
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    skill: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'),
    zonk: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
    win: new Audio('https://raw.githubusercontent.com/altschmerzsiuu/tic-tac-toe/main/tenxi.mp3'),
    timer: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
};
// placeholder for countdown (you'll replace with your github raw url)
const countdownSound = new Audio('https://raw.githubusercontent.com/altschmerzsiuu/tic-tac-toe/main/new.mp3'); // <-- replace this path with your GitHub URL
countdownSound.volume = 1.0;

document.addEventListener('click', () => {
    try {
        sounds.win.play().then(() => {
            sounds.win.pause();
            sounds.win.currentTime = 0;
        }).catch(()=>{});
    } catch(e){}
}, { once: true });

sounds.win.loop = true;
Object.values(sounds).forEach(sound => sound.volume = 1.0);

// ===== DOM ELEMENTS =====
const cells = document.querySelectorAll('.cell');
const teamXDisplay = document.getElementById('teamX');
const teamODisplay = document.getElementById('teamO');
const skillXDisplay = document.getElementById('skillX');
const skillODisplay = document.getElementById('skillO');
const restartBtn = document.getElementById('restartBtn');
const prompterText = document.getElementById('prompterText');
const prompterIcon = document.querySelector('.prompter-icon');
const currentTurnDisplay = document.getElementById('currentTurn');
const skillActionButtons = document.getElementById('skillActionButtons');
const useSkillNowBtn = document.getElementById('useSkillNowBtn');
const useSkillLaterBtn = document.getElementById('useSkillLaterBtn');

// Modals
const blindboxModal = document.getElementById("blindboxModal");
const blindboxes = document.querySelectorAll(".blindbox");
const themeModal = document.getElementById('themeModal');
const timesUpModal = document.getElementById('timesUpModal');
const gameOverModal = document.getElementById('gameOverModal');

// Timer
const timerDisplay = document.getElementById('timerDisplay');
const timerInput = document.getElementById('timerInput');
const startTimerBtn = document.getElementById('startTimer');
const pauseTimerBtn = document.getElementById('pauseTimer');
const resetTimerBtn = document.getElementById('resetTimer');

// ===== INITIALIZATION =====
function init() {
    stopWinMusic();
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    gameState.playerSkills = { X: { count: 0, turnsLeft: 0 }, O: { count: 0, turnsLeft: 0 } };
    gameState.pendingSkillValidation = { X: false, O: false };
    gameState.waitingForSkillTarget = false;
    gameState.turnCount = { X: 0, O: 0 };
    
    gameState.cellThemes = shuffleArray([...gameState.themes, ...gameState.themes.slice(0, 4)]);
    gameState.skillCells = getRandomSkillCells();
    
    cells.forEach((cell) => {
        cell.classList.remove('filled', 'blocked', 'winning', 'x', 'o', 'selecting');
        cell.dataset.index = cell.dataset.index; // keep
        cell.removeEventListener('click', handleCellClick); // safe remove
        cell.addEventListener('click', handleCellClick);
    });
    
    renderCells(); // <-- draw numbering or marks
    updateDisplay();
    updatePrompter('🎯', 'Tim X memulai permainan! Klik kolom untuk bermain...');
    hideAllModals();
    skillActionButtons.style.display = 'none';
    restartBtn.style.display = 'none';
    stopTimer();
}

// ===== RENDER CELLS (numbering + X/O) =====
function renderCells() {
    cells.forEach((cell, index) => {
        const mark = gameState.board[index];
        cell.classList.remove('filled', 'x', 'o');
        cell.classList.remove('winning'); // keep cleared outside if needed
        
        if (mark === '') {
            // show numbering (1-9) centered
            cell.innerHTML = `<span class="cell-number">${index + 1}</span>`;
        } else {
            // show X or O (remove number)
            cell.textContent = mark;
            cell.classList.add('filled', mark.toLowerCase());
        }
    });
}

// ===== UTILITIES =====
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomSkillCells() {
    const indices = [0,1,2,3,4,5,6,7,8];
    const shuffled = shuffleArray(indices);
    return shuffled.slice(0, 2);
}

// ===== DISPLAY / UI =====
function updateDisplay() {
    teamXDisplay.classList.toggle('active', gameState.currentPlayer === 'X');
    teamODisplay.classList.toggle('active', gameState.currentPlayer === 'O');
    currentTurnDisplay.textContent = `Giliran: Tim ${gameState.currentPlayer}`;
    
    updateSkillDisplay('X');
    updateSkillDisplay('O');
    
    // Show/hide skill action buttons
    const currentSkill = gameState.playerSkills[gameState.currentPlayer];
    if (currentSkill.count > 0 && currentSkill.turnsLeft > 0 && !gameState.waitingForSkillTarget) {
        skillActionButtons.style.display = 'flex';
    } else {
        skillActionButtons.style.display = 'none';
    }
}

function updateSkillDisplay(player) {
    const skillDisplay = player === 'X' ? skillXDisplay : skillODisplay;
    const skill = gameState.playerSkills[player];
    
    if (skill.count > 0 && skill.turnsLeft > 0) {
        skillDisplay.className = 'skill-display has-skill';
        skillDisplay.innerHTML = `
            <div class="skill-icon-display">🗑️</div>
            <div class="skill-name-display">Hapus Tanda</div>
            <div class="skill-count-display">x${skill.count}</div>
            <div class="skill-turns-left">${skill.turnsLeft} giliran tersisa</div>
        `;
    } else {
        skillDisplay.className = 'skill-display';
        skillDisplay.innerHTML = '<div class="no-skill">Belum ada skill</div>';
    }
}

function updatePrompter(icon, message) {
    prompterIcon.textContent = icon;
    prompterText.textContent = message;
}

// ===== CELL CLICK HANDLER =====
function handleCellClick(e) {
    if (!gameState.gameActive || gameState.waitingForSkillTarget) return;
    
    const index = parseInt(e.currentTarget.dataset.index, 10);
    
    if (gameState.board[index] !== '' || e.currentTarget.classList.contains('blocked')) {
        return;
    }
    
    gameState.currentCell = index;
    playSound('click');
    
    if (gameState.skillCells.includes(index)) {
        updatePrompter('🎁', `Tim ${gameState.currentPlayer} menemukan kotak misteri! Pilih dengan hati-hati...`);
        showBlindboxModal();
    } else {
        showThemeModal(index);
    }
}

// ===== BLINDBOX (skill / zonk) =====
function showBlindboxModal() {
    const boxes = document.querySelectorAll('.blindbox');
    boxes.forEach(box => {
        box.classList.remove('flipped', 'zonk', 'skill');
        box.style.pointerEvents = 'auto';
    });

    const results = shuffleArray(['skill','zonk', 'zonk']);

    boxes.forEach((box, i) => {
        box.dataset.result = results[i];

        const back = box.querySelector('.box-back');
        if (results[i] === 'skill') {
            back.innerHTML = `
                <div class="skill-icon">🗑️</div>
                <div class="skill-name">Hapus Tanda!</div>
                <div class="skill-desc">Hapus 1 tanda lawan</div>
            `;
        } else {
            back.innerHTML = `
                <div class="skill-icon">💥</div>
                <div class="skill-name">ZONK!</div>
                <div class="skill-desc">Tidak dapat apa-apa</div>
            `;
        }
    });

    boxes.forEach(box => {
        box.onclick = () => {
            const result = box.dataset.result;

            if (result === 'skill') {
                const p = gameState.currentPlayer;
                gameState.playerSkills[p].count++;
                gameState.playerSkills[p].turnsLeft += 2;
                // mark that this player just got a skill and we must validate in their next answer
                gameState.pendingSkillValidation[p] = true;
                updatePrompter('🎯', `Tim ${p} mendapat skill Hapus Tanda! 🗑️ (Jika jawaban selanjutnya salah, skill dibatalkan)`);
                playSound('skill');
                box.classList.add('skill');
            } else {
                updatePrompter('💥', `Tim ${gameState.currentPlayer} mendapat ZONK! 😵`);
                playSound('zonk');
                box.classList.add('zonk');
            }

            box.classList.add('flipped');
            boxes.forEach(b => (b.style.pointerEvents = 'none'));

            setTimeout(() => {
                hideModal(blindboxModal);
                showThemeModal(gameState.currentCell);
            }, 1400);
        };
    });

    showModal(blindboxModal);
}

function handleBlindboxClick(box) {
    // kept for backward compatibility if used; primary flow handled in showBlindboxModal
    const result = box.dataset.result;
    
    box.classList.add('flipped');
    document.querySelectorAll('.blindbox').forEach(b => b.style.pointerEvents = 'none');
    
    setTimeout(() => {
        if (result === 'zonk') {
            box.classList.add('zonk');
            playSound('zonk');
            updatePrompter('💥', `Tim ${gameState.currentPlayer} mendapat ZONK! Tidak apa, tetap semangat!`);
        } else if (result === 'erase' || result === 'skill') {
            box.classList.add('skill');
            playSound('skill');
            const p = gameState.currentPlayer;
            gameState.playerSkills[p].count++;
            gameState.playerSkills[p].turnsLeft += 3;
            gameState.pendingSkillValidation[p] = true;
            updatePrompter('⚡', `Tim ${p} mendapat skill Hapus Tanda! Ready to fire! 🔥`);
        }
        
        setTimeout(() => {
            hideModal(blindboxModal);
            showThemeModal(gameState.currentCell);
        }, 900);
    }, 700);
}

// ===== THEME MODAL & ANSWER HANDLING =====
function showThemeModal(index) {
    const theme = gameState.cellThemes[index];
    document.getElementById('themeDisplay').textContent = theme;
    
    showModal(themeModal);
    stopTimer();
}

document.getElementById('correctBtn').onclick = () => { handleAnswer(true); };
document.getElementById('wrongBtn').onclick = () => { handleAnswer(false); };

function handleAnswer(isCorrect) {
    hideModal(themeModal);

    const player = gameState.currentPlayer;

    if (isCorrect) {
        // Place mark
        gameState.board[gameState.currentCell] = player;
        const cell = cells[gameState.currentCell];
        cell.textContent = player;
        cell.classList.add('filled', player.toLowerCase());
        renderCells(); // re-render to remove numbering for filled cells
        
        updatePrompter('✅', `Tim ${player} menjawab benar! Kolom berhasil diisi!`);
        
        // If player had a pendingSkillValidation, clear it (kept skill)
        if (gameState.pendingSkillValidation[player]) {
            gameState.pendingSkillValidation[player] = false;
            // keep skill as-is
        }
        
        // Check win
        if (checkWin()) {
            handleGameEnd(`🎉 TIM ${player} MENANG! 🎉`);
            // Note: handleGameEnd will run the closing gimmick and play win music
            return;
        }
        
        // Check draw
        if (gameState.board.every(cell => cell !== '')) {
            handleGameEnd('🤝 SERI! Kedua tim bermain dengan hebat! 🤝');
            return;
        }
    } else {
        // Wrong answer
        updatePrompter('❌', `Tim ${player} salah menjawab. Giliran berikutnya!`);
        
        // If this cell had been a skill-cell marker, remove that skill cell (original behaviour)
        const cellIndex = gameState.skillCells.indexOf(gameState.currentCell);
        if (cellIndex !== -1) {
            gameState.skillCells.splice(cellIndex, 1);
        }

        // If player had just obtained a skill and is being validated => cancel it
        if (gameState.pendingSkillValidation[player]) {
            gameState.playerSkills[player].count = 0;
            gameState.playerSkills[player].turnsLeft = 0;
            gameState.pendingSkillValidation[player] = false;
            updatePrompter('⚠️', `Skill Tim ${player} dibatalkan karena jawaban salah. Skill dibatalkan.`); 
            playSound('zonk');
            updateDisplay();
        }
    }
    
    // Decrease skill turns only for current player's own turns
    decreaseSkillTurns();
    
    // Switch player
    switchPlayer();
}

// ===== SKILL SYSTEM (erase) =====
useSkillNowBtn.onclick = () => {
    activateEraseSkill();
};

useSkillLaterBtn.onclick = () => {
    skillActionButtons.style.display = 'none';
    updatePrompter('⏳', `Tim ${gameState.currentPlayer} menyimpan skill untuk nanti. Bijak!`);
};

function activateEraseSkill() {
    gameState.waitingForSkillTarget = true;
    skillActionButtons.style.display = 'none';
    
    updatePrompter('🎯', `Tim ${gameState.currentPlayer}: Klik tanda lawan yang ingin dihapus!`);
    
    const opponent = gameState.currentPlayer === 'X' ? 'O' : 'X';
    
    // Highlight opponent cells
    cells.forEach((cell, index) => {
        if (gameState.board[index] === opponent) {
            cell.classList.add('selecting');
            
            const restore = () => {
                cell.classList.remove('selecting');
                cell.removeEventListener('click', eraseClick);
                cell.addEventListener('click', handleCellClick);
            };
            
            const eraseClick = () => {
                // Erase the mark
                gameState.board[index] = '';
                cell.textContent = '';
                cell.classList.remove('filled', 'x', 'o');
                
                // restore event handlers & classes
                cells.forEach(c => {
                    c.classList.remove('selecting');
                    c.removeEventListener('click', eraseClick);
                    c.addEventListener('click', handleCellClick);
                });
                
                // Use one skill
                const p = gameState.currentPlayer;
                gameState.playerSkills[p].count--;
                if (gameState.playerSkills[p].count <= 0) {
                    gameState.playerSkills[p].count = 0;
                    gameState.playerSkills[p].turnsLeft = 0;
                }
                
                gameState.waitingForSkillTarget = false;
                updateDisplay();
                renderCells();
                updatePrompter('🗑️', `Tim ${p} menghapus tanda lawan! Strategi cerdas!`);
                
                playSound('skill');
            };
            
            // replace click
            cell.removeEventListener('click', handleCellClick);
            cell.addEventListener('click', eraseClick);
        }
    });
}

// decrease skill turns for player at end of their turn
function decreaseSkillTurns() {
    const player = gameState.currentPlayer;
    if (gameState.playerSkills[player].turnsLeft > 0) {
        gameState.playerSkills[player].turnsLeft--;
        
        if (gameState.playerSkills[player].turnsLeft === 0) {
            gameState.playerSkills[player].count = 0;
            updatePrompter('⏰', `Skill Tim ${player} expired! Gunakan lebih cepat lain kali!`);
            updateDisplay();
        }
    }
}

// ===== GAME LOGIC =====
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    gameState.turnCount[gameState.currentPlayer]++;
    updateDisplay();
    updatePrompter('🔄', `Giliran Tim ${gameState.currentPlayer}! Waktunya menunjukkan kemampuan!`);
}

function checkWin() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    
    for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (gameState.board[a] &&
            gameState.board[a] === gameState.board[b] &&
            gameState.board[a] === gameState.board[c]) {
            
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            return true;
        }
    }
    return false;
}

// ===== CLOSING GIMMICK (countdown 3..2..1 in modal + play win music) =====
function handleGameEnd(message) {
    gameState.gameActive = false;
    runClosingGimmick(message);
}

let stageTimeouts = []; // simpan semua timeout ID

// closing gimmick: show modal, show celebratory text, run 3-2-1 countdown with sound, then play win music
function runClosingGimmick(originalMessage) {
    const winnerTextEl = document.getElementById('winnerText');
    const isDraw = originalMessage.includes('SERI');
    showModal(gameOverModal);
    stopWinMusic();

    // Reset isi modal dulu
    winnerTextEl.innerHTML = "";
    restartBtn.style.display = "none";

    if (isDraw) {
        // 🎯 SERI - tanpa countdown, tanpa musik kemenangan
        winnerTextEl.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">🤝 SERI!</div>
            <div style="font-size: 1.3rem; line-height: 1.5;">
                Better play one more round – siapa tahu kali ini kalian bisa jadi 🐐<br><br>
                <em>"Tanda kalah? Gak ada. Ini cuma jeda buat comeback 💪"</em>
            </div>
        `;
        restartBtn.style.display = "block";
        return;
    }

    // 🏆 Kalau MENANG — multi-stage animasi
    const player = originalMessage.includes('TIM X') ? 'X' : 'O';
    const stages = [
        () => { // STAGE 1 - Pengumuman
            winnerTextEl.innerHTML = `
                <div style="font-size: 2.2rem; margin-bottom: 8px;">🎉 SELAMAT! 🎉</div>
                <div style="font-size: 2rem; font-weight: bold;">TIM ${player} MENANG!</div>
            `;
        },
        () => { // STAGE 2 - Gimik vibes
            winnerTextEl.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 8px;">🔥 MARI KITA RAYAKAN 🔥</div>
                <div style="font-size: 1.5rem;">Kemenangan ini bukan kaleng-kaleng!</div>
            `;
            
        },
        () => { // STAGE 3 - Countdown
            let count = 3;
            winnerTextEl.innerHTML = `<div style="font-size: 4rem; font-weight: bold;">${count}</div>`;
            const countdownInterval = setInterval(() => {
                count--;
                if (count >= 0) {
                    winnerTextEl.innerHTML = `<div style="font-size: 4rem; font-weight: bold;">${count}</div>`;
                    try { 
                        countdownSound.currentTime = 0; 
                        countdownSound.play().catch(()=>{}); 
                    } catch(e) {}
                } else {
                    clearInterval(countdownInterval);
                    // ✅ setelah selesai countdown, lanjut ke stage 4
                    stages[3]();
                }
            }, 1000);
        },
        () => { // STAGE 4 - Tombol main lagi
            winnerTextEl.innerHTML = `
                <div style="font-size: 1.5rem; margin-bottom: 15px;">🎊 Waktunya bersenang-senang 🎊</div>
                <div style="font-size: 0.7rem;">Klik tombol di bawah buat ronde berikutnya!</div>
            `;
            restartBtn.style.display = "block";
            launchConfettiLoop();
            try { sounds.win.currentTime = 0; sounds.win.play().catch(()=>{}); } catch(e){}
        },
        () => { // STAGE 5 - Tombol main lagi
            winnerTextEl.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 15px;">STANDUP EVERIBADII!!</div>
                <div style="font-size: 0.7rem;">Klik tombol di bawah buat ronde berikutnya!</div>
            `;
        }
    ];

    // Bersihkan dulu timeout sebelumnya
    stageTimeouts.forEach(id => clearTimeout(id));
    stageTimeouts = [];

    // Jalankan stages berurutan
    let delay = 0;
    stages.forEach((stageFn, idx) => {
        let id = setTimeout(stageFn, delay);
        stageTimeouts.push(id);
        delay += idx === 2 ? 4000 : 2500;
    });
}



// 🎉 Efek konfeti (simple, tidak butuh library)
// ===== KONFETI LOOP SAMPAI TOMBOL MAIN LAGI =====
let confettiLoopId = null;
let confettiActive = false; // 👈 status global

function launchConfettiLoop() {
    confettiActive = true; // aktifkan status

    // kalau belum ada canvas, buat satu
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = 9999; // pastikan di atas modal kemenangan
        document.body.appendChild(canvas);
    }

    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

    const frame = () => {
        if (!confettiActive) { // ⛔️ kalau sudah tidak aktif, hentikan
            cancelAnimationFrame(confettiLoopId);
            confettiLoopId = null;
            canvas.remove(); // bersihkan canvas
            return;
        }

        // kalau masih aktif, terus jalankan efeknya
        myConfetti({
            particleCount: 4 + Math.floor(Math.random() * 4),
            angle: 60 + Math.random() * 60,
            spread: 70,
            origin: { x: Math.random(), y: 0 }
        });

        confettiLoopId = requestAnimationFrame(frame);
    };

    frame();
}


// Hentikan konfeti saat tombol main lagi ditekan
document.getElementById('restartBtn').addEventListener('click', () => {
    if (confettiLoopId) cancelAnimationFrame(confettiLoopId);
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) canvas.remove();
});


// ===== TIMER SYSTEM =====
function startTimer() {
    const seconds = parseInt(timerInput.value) || 30;
    
    if (gameState.timerRunning) return;
    
    gameState.timeLeft = seconds;
    gameState.timerRunning = true;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
            timerDisplay.classList.add('warning');
        }
        
        if (gameState.timeLeft <= 0) {
            stopTimer();
            playSound('timer');
            showTimesUpModal();
        }
    }, 1000);
}

function pauseTimer() {
    if (!gameState.timerRunning) return;
    
    clearInterval(gameState.timerInterval);
    gameState.timerRunning = false;
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerRunning = false;
    timerDisplay.classList.remove('warning');
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

startTimerBtn.onclick = startTimer;
pauseTimerBtn.onclick = pauseTimer;
resetTimerBtn.onclick = () => {
    stopTimer();
    gameState.timeLeft = 0;
    updateTimerDisplay();
};

// ===== TIME'S UP MODAL =====
function showTimesUpModal() {
    showModal(timesUpModal);
}

document.getElementById('timesUpOkBtn').onclick = () => {
    hideModal(timesUpModal);
    
    // Auto handle answer as wrong if theme modal is open
    if (themeModal.classList.contains('show')) {
        handleAnswer(false);
    } else {
        // Just switch turn
        updatePrompter('⏰', `Waktu habis untuk Tim ${gameState.currentPlayer}!`);
        switchPlayer();
    }
};

// ===== MODAL HELPERS =====
function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

function hideAllModals() {
    [blindboxModal, themeModal, timesUpModal, gameOverModal].forEach(modal => {
        hideModal(modal);
    });
}

// ===== SOUND HELPER =====
function playSound(soundName) {
    if (soundName === 'win') {
        sounds.win.currentTime = 0;
        sounds.win.play().catch(e => console.log('Audio play failed:', e));
    } else {
        if (!sounds[soundName]) return;
        const sound = sounds[soundName].cloneNode();
        sound.volume = sounds[soundName].volume;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function toggleWinMusic() {
    if (!sounds.win.paused) {
        sounds.win.pause();
        sounds.win.currentTime = 0;
    } else {
        sounds.win.currentTime = 0;
        sounds.win.play().catch(e => console.log('Audio play failed:', e));
    }
}

// ===== RESTART =====
function restartGame() {
    // hentikan semua stage yang belum jalan
    stageTimeouts.forEach(id => clearTimeout(id));
    stageTimeouts = [];

    stopWinMusic();          // stop musik + confetti
    hideModal(gameOverModal); // kalau modal ada
    init();                  // mulai game baru
}

// restartBtn.onclick = () => {
//     stopWinMusic();
//     init();
// };

// document.getElementById('playAgainBtn').onclick = () => {
//     stopWinMusic();
//     hideModal(gameOverModal);
//     init();
// };

restartBtn.onclick = restartGame;
document.getElementById('playAgainBtn').onclick = restartGame;

let winMusicPlaying = false;

// ===== WIN MUSIC CONTROL =====
function playWinMusic() {
    if (!winMusicPlaying) {
        try {
            sounds.win.currentTime = 0;
            sounds.win.play().catch(()=>{});
            winMusicPlaying = true;
        } catch(e){}
    }
}

function stopWinMusic() {
    confettiActive = false;
    winMusicPlaying = false; // reset flag
    try { 
        sounds.win.pause(); 
        sounds.win.currentTime = 0; 
    } catch(e){}
}

// ===== START GAME =====
init();
