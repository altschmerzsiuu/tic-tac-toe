// ===== GAME STATE =====
let gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true,
    themes: ['Matematika', 'Tebak Bendera', 'Bahasa Inggris', 'IPA', 'Bahasa Indonesia', 'Tebak Ibukota', 'General', 'General', 'Tebak Bendera'],
    cellThemes: [],
    skillCells: [],
    playerSkills: { X: { count: 0, turnsLeft: 0 }, O: { count: 0, turnsLeft: 0 } },
    currentCell: null,
    timerInterval: null,
    timeLeft: 0,
    timerRunning: false,
    waitingForSkillTarget: false,
    turnCount: { X: 0, O: 0 }
};

// ===== SOUND EFFECTS =====
const sounds = {
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    skill: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'),
    zonk: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
    win: new Audio('https://raw.githubusercontent.com/altschmerzsiuu/tic-tac-toe/main/tenxi.mp3'),
    timer: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
};

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
    gameState.waitingForSkillTarget = false;
    gameState.turnCount = { X: 0, O: 0 };
    
    gameState.cellThemes = shuffleArray([...gameState.themes, ...gameState.themes.slice(0, 4)]);
    gameState.skillCells = getRandomSkillCells();
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'blocked', 'winning', 'x', 'o', 'selecting');
        cell.onclick = handleCellClick;
    });
    
    updateDisplay();
    updatePrompter('🎯', 'Tim X memulai permainan! Klik kolom untuk bermain...');
    hideAllModals();
    skillActionButtons.style.display = 'none';
    restartBtn.style.display = 'none';
    stopTimer();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomSkillCells() {
    const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray(indices);
    return shuffled.slice(0, 2);
}

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
    
    const index = parseInt(e.target.dataset.index);
    
    if (gameState.board[index] !== '' || e.target.classList.contains('blocked')) {
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

function showBlindboxModal() {
    const boxes = document.querySelectorAll('.blindbox');
    boxes.forEach(box => {
        box.classList.remove('flipped', 'zonk', 'skill');
        box.style.pointerEvents = 'auto';
    });

    const results = shuffleArray(['skill', 'zonk']);

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
                gameState.playerSkills[gameState.currentPlayer].count++;
                gameState.playerSkills[gameState.currentPlayer].turnsLeft += 3;
                updatePrompter('🎯', `Tim ${gameState.currentPlayer} mendapat skill Hapus Tanda! 🗑️`);
                playSound('skill');
                box.classList.add('skill'); // 🌟 highlight hijau (akan kita styling di CSS)
            } else {
                updatePrompter('💥', `Tim ${gameState.currentPlayer} mendapat ZONK! 😵`);
                playSound('zonk');
                box.classList.add('zonk');
            }

            box.classList.add('flipped');
            boxes.forEach(b => (b.style.pointerEvents = 'none'));

            // ⏱️ Delay 2 detik biar penonton sempat melihat hasilnya
            setTimeout(() => {
                hideModal(blindboxModal);
                showThemeModal(gameState.currentCell);
            }, 2000); // ← ubah angka ini kalau mau delay lebih lama/lebih cepat
        };
    });

    showModal(blindboxModal);
}

function handleBlindboxClick(box) {
    const result = box.dataset.result;
    
    box.classList.add('flipped');
    
    document.querySelectorAll('.blindbox').forEach(b => {
        b.style.pointerEvents = 'none';
    });
    
    setTimeout(() => {
        if (result === 'zonk') {
            box.classList.add('zonk');
            playSound('zonk');
            updatePrompter('💥', `Tim ${gameState.currentPlayer} mendapat ZONK! Tidak apa, tetap semangat!`);
        } else if (result === 'erase') {
            box.classList.add('skill');
            playSound('skill');
            // Add skill with 2 turns
            gameState.playerSkills[gameState.currentPlayer].count++;
            gameState.playerSkills[gameState.currentPlayer].turnsLeft += 3;
            updatePrompter('⚡', `Tim ${gameState.currentPlayer} mendapat skill Hapus Tanda! Ready to fire! 🔥`);
        }
        
        setTimeout(() => {
            hideModal(blindboxModal);
            showThemeModal(gameState.currentCell);
        }, 1800);
    }, 700);
}

// ===== THEME MODAL =====
function showThemeModal(index) {
    const theme = gameState.cellThemes[index];
    document.getElementById('themeDisplay').textContent = theme;
    
    showModal(themeModal);
    stopTimer();
}

document.getElementById('correctBtn').onclick = () => {
    handleAnswer(true);
};

document.getElementById('wrongBtn').onclick = () => {
    handleAnswer(false);
}

function handleAnswer(isCorrect) {
    hideModal(themeModal);
    
    if (isCorrect) {
        // Place mark
        gameState.board[gameState.currentCell] = gameState.currentPlayer;
        const cell = cells[gameState.currentCell];
        cell.textContent = gameState.currentPlayer;
        cell.classList.add('filled', gameState.currentPlayer.toLowerCase());
        
        updatePrompter('✅', `Tim ${gameState.currentPlayer} menjawab benar! Kolom berhasil diisi!`);
        
        // Check win
        if (checkWin()) {
            handleGameEnd(`🎉 TIM ${gameState.currentPlayer} MENANG! 🎉`);
            toggleWinMusic();
            return;
        }
        
        // Check draw
        if (gameState.board.every(cell => cell !== '')) {
            handleGameEnd('🤝 SERI! Kedua tim bermain dengan hebat! 🤝');
            return;
        }
    } else {
        updatePrompter('❌', `Tim ${gameState.currentPlayer} salah menjawab. Giliran berikutnya!`);
        
        // Remove skill from this cell if it was a skill cell
        const cellIndex = gameState.skillCells.indexOf(gameState.currentCell);
        if (cellIndex !== -1) {
            gameState.skillCells.splice(cellIndex, 1);
        }
    }
    
    // Decrease skill turns only for current player's own turns
    decreaseSkillTurns();
    
    // Switch player
    switchPlayer();
}

// ===== SKILL SYSTEM =====
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
            
            const originalClick = cell.onclick;
            cell.onclick = () => {
                // Erase the mark
                gameState.board[index] = '';
                cell.textContent = '';
                cell.classList.remove('filled', 'x', 'o');
                
                // Remove selecting class from all cells
                cells.forEach(c => {
                    c.classList.remove('selecting');
                    c.onclick = handleCellClick;
                });
                
                // Use one skill
                gameState.playerSkills[gameState.currentPlayer].count--;
                if (gameState.playerSkills[gameState.currentPlayer].count === 0) {
                    gameState.playerSkills[gameState.currentPlayer].turnsLeft = 0;
                }
                
                gameState.waitingForSkillTarget = false;
                updateDisplay();
                updatePrompter('🗑️', `Tim ${gameState.currentPlayer} menghapus tanda lawan! Strategi cerdas!`);
                
                playSound('skill');
            };
        }
    });
}

function decreaseSkillTurns() {
    // Only decrease for current player
    const player = gameState.currentPlayer;
    if (gameState.playerSkills[player].turnsLeft > 0) {
        gameState.playerSkills[player].turnsLeft--;
        
        if (gameState.playerSkills[player].turnsLeft === 0) {
            gameState.playerSkills[player].count = 0;
            updatePrompter('⏰', `Skill Tim ${player} expired! Gunakan lebih cepat lain kali!`);
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
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
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

function handleGameEnd(message) {
    gameState.gameActive = false;
    document.getElementById('winnerText').textContent = message;
    
    setTimeout(() => {
        showModal(gameOverModal);
        restartBtn.style.display = 'block';
    }, 1200);
}

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
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
        sounds.win.currentTime = 0; // mulai dari awal
        sounds.win.play().catch(e => console.log('Audio play failed:', e));
    } else {
        const sound = sounds[soundName].cloneNode();
        sound.volume = sounds[soundName].volume;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function toggleWinMusic() {
    if (!sounds.win.paused) {
        // Kalau sedang main → stop
        sounds.win.pause();
        sounds.win.currentTime = 0;
    } else {
        // Kalau sedang berhenti → mainkan dari awal
        sounds.win.currentTime = 0;
        sounds.win.play().catch(e => console.log('Audio play failed:', e));
    }
}

// ===== RESTART =====
restartBtn.onclick = () => {
    stopWinMusic();
    init();
};

document.getElementById('playAgainBtn').onclick = () => {
    stopWinMusic();
    hideModal(gameOverModal);
    init();
};

function stopWinMusic() {
    sounds.win.pause();
    sounds.win.currentTime = 0;
}

// ===== START GAME =====
init();