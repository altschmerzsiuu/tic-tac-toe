// ===== GAME STATE =====
let gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true,
    themes: ['Matematika', 'Tebak Bendera', 'Bahasa Inggris', 'IPA', 'Bahasa Indonesia'],
    cellThemes: [],
    skillCells: [],
    playerSkills: { X: null, O: null },
    skillTurnsLeft: { X: 0, O: 0 },
    currentCell: null,
    timerInterval: null,
    timeLeft: 0,
    timerRunning: false
};

// ===== SOUND EFFECTS (Ganti URL sesuai file sound kamu) =====
const sounds = {
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Suara klik
    skill: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'), // Suara dapat skill
    zonk: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'), // Suara zonk
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'), // Suara menang
    timer: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Suara timer habis
};

// Atur volume (0.0 - 1.0)
Object.values(sounds).forEach(sound => sound.volume = 0.2);

// ===== DOM ELEMENTS =====
const cells = document.querySelectorAll('.cell');
const teamXDisplay = document.getElementById('teamX');
const teamODisplay = document.getElementById('teamO');
const skillXIndicator = document.getElementById('skillX');
const skillOIndicator = document.getElementById('skillO');
const skillButtons = document.getElementById('skillButtons');
const useSkillBtn = document.getElementById('useSkillBtn');
const skipSkillBtn = document.getElementById('skipSkillBtn');
const restartBtn = document.getElementById('restartBtn');
const statusMsg = document.getElementById('statusMsg');

// Modals
const blindboxModal = document.getElementById('blindboxModal');
const themeModal = document.getElementById('themeModal');
const skillModal = document.getElementById('skillModal');
const gameOverModal = document.getElementById('gameOverModal');

// Timer
const timerDisplay = document.getElementById('timerDisplay');
const timerInput = document.getElementById('timerInput');
const startTimerBtn = document.getElementById('startTimer');
const pauseTimerBtn = document.getElementById('pauseTimer');
const resetTimerBtn = document.getElementById('resetTimer');

// ===== INITIALIZATION =====
function init() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    gameState.playerSkills = { X: null, O: null };
    gameState.skillTurnsLeft = { X: 0, O: 0 };
    
    // Acak tema untuk setiap kolom
    gameState.cellThemes = shuffleArray([...gameState.themes, ...gameState.themes.slice(0, 4)]);
    gameState.skillCells = getRandomSkillCells();
    
    // Reset board UI
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'blocked', 'winning', 'x', 'o');
        cell.addEventListener('click', handleCellClick);
    });
    
    updateDisplay();
    hideAllModals();
    restartBtn.style.display = 'none';
    statusMsg.textContent = '';
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
    
    // Update skill indicators
    updateSkillIndicator('X');
    updateSkillIndicator('O');
    
    // Show skill buttons if current player has skill
    if (gameState.playerSkills[gameState.currentPlayer] && gameState.skillTurnsLeft[gameState.currentPlayer] > 0) {
        skillButtons.style.display = 'flex';
    } else {
        skillButtons.style.display = 'none';
    }
}

function updateSkillIndicator(player) {
    const indicator = player === 'X' ? skillXIndicator : skillOIndicator;
    const skill = gameState.playerSkills[player];
    const turnsLeft = gameState.skillTurnsLeft[player];

    if (skill && turnsLeft > 0) {
        // Hanya tampilkan erase
        const skillName = skill === 'erase' ? '🗑️ Hapus' : '';
        indicator.textContent = skillName ? `${skillName} (${turnsLeft} giliran)` : '';
    } else {
        indicator.textContent = '';
    }
}

// ===== CELL CLICK HANDLER =====
function handleCellClick(e) {
    if (!gameState.gameActive) return;
    
    const index = parseInt(e.target.dataset.index);
    
    // Check if cell is already filled or blocked
    if (gameState.board[index] !== '' || e.target.classList.contains('blocked')) {
        return;
    }
    
    gameState.currentCell = index;
    playSound('click');
    
    // Check if this cell has skill
    if (gameState.skillCells.includes(index)) {
        showBlindboxModal();
    } else {
        showThemeModal(index);
    }
}

// ===== BLINDBOX MODAL =====
function showBlindboxModal() {
    const boxes = document.querySelectorAll('.blindbox');

    // Reset boxes
    boxes.forEach(box => {
        box.classList.remove('flipped', 'zonk', 'skill');
        box.style.pointerEvents = 'auto';
        box.dataset.skill = ''; // Reset skill
    });

    // Acak skill dan assign ke box (pastikan jumlah box dan skill sama)
    const skillPool = ['erase', 'zonk'];
    const skills = shuffleArray(skillPool).slice(0, boxes.length);
    boxes.forEach((box, i) => {
        box.dataset.skill = skills[i];
    });

    // Add click handlers
    boxes.forEach(box => {
        box.onclick = () => handleBlindboxClick(box);
    });

    showModal(blindboxModal);
}

function handleBlindboxClick(box) {
    const skill = box.dataset.skill;

    // Flip animation
    box.classList.add('flipped');

    // Disable other boxes
    document.querySelectorAll('.blindbox').forEach(b => {
        b.style.pointerEvents = 'none';
    });

    setTimeout(() => {
        if (skill === 'zonk') {
            box.classList.add('zonk');
            playSound('zonk');
            gameState.playerSkills[gameState.currentPlayer] = null;
            gameState.skillTurnsLeft[gameState.currentPlayer] = 0;
            statusMsg.textContent = '💥 ZONK! Tidak dapat skill';
        } else if (skill === 'erase') {
            box.classList.add('skill');
            playSound('skill');
            gameState.playerSkills[gameState.currentPlayer] = skill;
            gameState.skillTurnsLeft[gameState.currentPlayer] = 3;
            statusMsg.textContent = `⚡ Tim ${gameState.currentPlayer} dapat skill: Hapus Tanda!`;
        }

        setTimeout(() => {
            hideModal(blindboxModal);
            showThemeModal(gameState.currentCell);
            updateDisplay(); // Pastikan indikator skill update
        }, 1500);
    }, 600);
}

// ===== THEME MODAL =====
function showThemeModal(index) {
    const theme = gameState.cellThemes[index];
    document.getElementById('themeDisplay').textContent = theme;
    
    showModal(themeModal);
    
    // Reset timer saat modal muncul
    stopTimer();
}

document.getElementById('correctBtn').onclick = () => {
    handleAnswer(true);
};

document.getElementById('wrongBtn').onclick = () => {
    handleAnswer(false);
};

function handleAnswer(isCorrect) {
    hideModal(themeModal);
    
    if (isCorrect) {
        // Place mark
        gameState.board[gameState.currentCell] = gameState.currentPlayer;
        const cell = cells[gameState.currentCell];
        cell.textContent = gameState.currentPlayer;
        cell.classList.add('filled', gameState.currentPlayer.toLowerCase());
        
        // Check win
        if (checkWin()) {
            handleGameEnd(`🎉 TIM ${gameState.currentPlayer} MENANG! 🎉`);
            playSound('win');
            return;
        }
        
        // Check draw
        if (gameState.board.every(cell => cell !== '')) {
            handleGameEnd('🤝 SERI! 🤝');
            return;
        }
    }
    
    // Decrease skill turns
    decreaseSkillTurns();
    
    // Switch player
    switchPlayer();
}

// ===== SKILL SYSTEM =====
useSkillBtn.onclick = () => {
    const skill = gameState.playerSkills[gameState.currentPlayer];

    if (skill === 'erase') {
        activateEraseSkill();
    }
};

skipSkillBtn.onclick = () => {
    skillButtons.style.display = 'none';
};

function activateBlockSkill() {
    document.getElementById('skillModalTitle').textContent = '🚫 BLOCK KOLOM';
    document.getElementById('skillModalText').textContent = 'Klik kolom kosong yang ingin diblokir:';
    
    showModal(skillModal);
    
    // Add temporary click handlers to empty cells
    cells.forEach(cell => {
        if (!cell.classList.contains('filled') && !cell.classList.contains('blocked')) {
            cell.style.cursor = 'pointer';
            cell.style.border = '3px solid #ff6b6b';
            
            const handler = () => {
                cell.classList.add('blocked');
                cell.style.border = '';
                cells.forEach(c => {
                    c.style.border = '';
                    c.style.cursor = '';
                    c.onclick = handleCellClick;
                });
                
                gameState.playerSkills[gameState.currentPlayer] = null;
                gameState.skillTurnsLeft[gameState.currentPlayer] = 0;
                
                hideModal(skillModal);
                updateDisplay();
                statusMsg.textContent = `🚫 Tim ${gameState.currentPlayer} memblokir kolom!`;
            };
            
            cell.onclick = handler;
        }
    });
}

function activateEraseSkill() {
    document.getElementById('skillModalTitle').textContent = '🗑️ HAPUS TANDA LAWAN';
    document.getElementById('skillModalText').textContent = 'Klik tanda lawan yang ingin dihapus:';
    
    showModal(skillModal);
    
    const opponent = gameState.currentPlayer === 'X' ? 'O' : 'X';
    
    // Add temporary click handlers to opponent cells
    cells.forEach((cell, index) => {
        if (gameState.board[index] === opponent) {
            cell.style.cursor = 'pointer';
            cell.style.border = '3px solid #51cf66';
            
            const handler = () => {
                gameState.board[index] = '';
                cell.textContent = '';
                cell.classList.remove('filled', 'x', 'o');
                cell.style.border = '';
                
                cells.forEach(c => {
                    c.style.border = '';
                    c.style.cursor = '';
                    c.onclick = handleCellClick;
                });
                
                gameState.playerSkills[gameState.currentPlayer] = null;
                gameState.skillTurnsLeft[gameState.currentPlayer] = 0;
                
                hideModal(skillModal);
                updateDisplay();
                statusMsg.textContent = `🗑️ Tim ${gameState.currentPlayer} menghapus tanda lawan!`;
            };
            
            cell.onclick = handler;
        }
    });
}

document.getElementById('cancelSkillBtn').onclick = () => {
    hideModal(skillModal);
    cells.forEach(cell => {
        cell.style.border = '';
        cell.style.cursor = '';
        cell.onclick = handleCellClick;
    });
};

function decreaseSkillTurns() {
    ['X', 'O'].forEach(player => {
        if (gameState.playerSkills[player] && gameState.skillTurnsLeft[player] > 0) {
            gameState.skillTurnsLeft[player]--;
            if (gameState.skillTurnsLeft[player] === 0) {
                gameState.playerSkills[player] = null;
            }
        }
    });
}


// ===== GAME LOGIC =====
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            
            // Highlight winning cells
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
    }, 1000);
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
        
        // Warning di 5 detik terakhir
        if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
            timerDisplay.classList.add('warning');
        }
        
        if (gameState.timeLeft <= 0) {
            stopTimer();
            playSound('timer');
            
            // Auto switch turn jika ada modal terbuka
            if (themeModal.classList.contains('show')) {
                handleAnswer(false);
            }
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
    gameState.timeLeft = 0;
    timerDisplay.classList.remove('warning');
    updateTimerDisplay();
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
    gameState.timeLeft = parseInt(timerInput.value) || 30;
    updateTimerDisplay();
};

// ===== MODAL HELPERS =====
function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

function hideAllModals() {
    [blindboxModal, themeModal, skillModal, gameOverModal].forEach(modal => {
        hideModal(modal);
    });
}

// ===== SOUND HELPER =====
function playSound(soundName) {
    // Clone audio untuk bisa play multiple times
    const sound = sounds[soundName].cloneNode();
    sound.play().catch(e => console.log('Audio play failed:', e));
}

// ===== RESTART =====
restartBtn.onclick = init;
document.getElementById('playAgainBtn').onclick = () => {
    hideModal(gameOverModal);
    init();
};

// ===== START GAME =====
init();