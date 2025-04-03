const locations = [
    {
        id: 1,
        videoPath: 'Videos/Nespresso.mov',
        storeName: 'Nespresso',
        options: ['LAKRIS by BÜLOW', 'Nespresso', 'Sjokolade Fabrikken']
    },
    {
        id: 2,
        videoPath: 'Videos/Starbucs.mov',
        storeName: 'Starbucks',
        options: ['El Camino', 'EGON', 'Starbucks']
    },
    {
        id: 3,
        videoPath: 'Videos/Urmaker Larson.mov',
        storeName: 'Urmaker Larson',
        options: ['Bjørklund', 'Urmaker Larson', 'David-Anderson']
    }
];

let currentLocation = 0;
let score = 0;
let selectedOption = null;
let correctGuesses = 0;
let wrongGuesses = 0;
let guessHistory = [];
let timerInterval;
let timeLeft = 15;
let startTime;
let highScore = localStorage.getItem('highScore') || 0;

// Update high score display on load
document.getElementById('highScore').textContent = highScore;

function startGame() {
    document.getElementById('startScreen').classList.add('hide');
    document.getElementById('gameContainer').classList.add('show');
    loadLocation();
}

function updateHighScore(newScore) {
    if (newScore > highScore) {
        highScore = newScore;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
        showNotification('New High Score! 🎉', 3000);
    }
}

function startTimer() {
    timeLeft = 15;
    startTime = Date.now();
    updateTimerDisplay();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft = Math.max(0, 15 - ((Date.now() - startTime) / 1000));
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            makeGuess(null, locations[currentLocation].storeName);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = Math.ceil(timeLeft);
    
    if (timeLeft <= 5) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }
}

function calculatePoints() {
    if (timeLeft >= 13) { // First 2 seconds
        return 1000;
    } else {
        // Linear decrease from 1000 to 100 points
        const timeUsed = 15 - timeLeft - 2; // Subtract 2 seconds grace period
        const maxTime = 13; // Maximum time after grace period
        const minPoints = 100;
        const pointsRange = 900; // 1000 - 100
        
        return Math.max(minPoints, Math.round(1000 - (timeUsed / maxTime) * pointsRange));
    }
}

function showNotification(message, duration = 2000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

function showEndScreen() {
    const endScreen = document.getElementById('endScreen');
    const statsContainer = document.getElementById('stats');
    
    // Update high score if needed
    updateHighScore(score);
    
    // Calculate statistics
    const accuracy = Math.round((correctGuesses / (correctGuesses + wrongGuesses)) * 100) || 0;
    
    // Create stats HTML
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Final Score</span>
            <span class="stat-value">${score}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">High Score</span>
            <span class="stat-value">${highScore}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Correct Guesses</span>
            <span class="stat-value">${correctGuesses}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Wrong Guesses</span>
            <span class="stat-value">${wrongGuesses}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value">${accuracy}%</span>
        </div>
    `;
    
    endScreen.classList.add('show');
}

function restartGame() {
    const endScreen = document.getElementById('endScreen');
    endScreen.classList.remove('show');
    
    // Reset game state
    currentLocation = 0;
    score = 0;
    correctGuesses = 0;
    wrongGuesses = 0;
    guessHistory = [];
    document.getElementById('score').textContent = score;
    
    loadLocation();
}

function loadLocation() {
    const location = locations[currentLocation];
    const video = document.getElementById('storeVideo');
    const optionsContainer = document.querySelector('.option-buttons');
    const lockInContainer = document.querySelector('.lock-in-container');
    
    // Set video source and autoplay
    video.src = location.videoPath;
    video.play().catch(error => {
        console.log('Autoplay prevented:', error);
    });
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Shuffle options
    const shuffledOptions = [...location.options].sort(() => Math.random() - 0.5);
    
    // Create option buttons
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectOption(option);
        optionsContainer.appendChild(button);
    });

    // Create lock-in button
    const lockInButton = document.createElement('button');
    lockInButton.className = 'lock-in-btn';
    lockInButton.textContent = 'LOCK IN ANSWER';
    lockInButton.onclick = () => makeGuess(selectedOption, location.storeName);
    lockInButton.style.display = 'none';
    
    lockInContainer.innerHTML = '';
    lockInContainer.appendChild(lockInButton);

    // Start the timer
    startTimer();
}

function selectOption(option) {
    selectedOption = option;
    
    // Update button styles
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        if (btn.textContent === option) {
            btn.style.backgroundColor = '#ffd130';
            btn.style.color = '#1a2825';
        } else {
            btn.style.backgroundColor = '#2d4f4a';
            btn.style.color = 'white';
        }
    });
    
    // Show lock-in button
    document.querySelector('.lock-in-btn').style.display = 'block';
}

function makeGuess(guess, correct) {
    clearInterval(timerInterval);
    
    if (guess === correct) {
        const points = calculatePoints();
        score += points;
        correctGuesses++;
        showNotification(`Correct! +${points} points`);
    } else {
        wrongGuesses++;
        showNotification(`Wrong! The correct answer was ${correct}`);
    }
    
    // Record guess history
    guessHistory.push({
        location: correct,
        guess: guess,
        correct: guess === correct,
        timeLeft: timeLeft
    });
    
    document.getElementById('score').textContent = `Score: ${score}`;
    
    currentLocation++;
    if (currentLocation < locations.length) {
        loadLocation();
    } else {
        showEndScreen();
    }
}

// Remove the window.onload call since we now start the game with the start button  