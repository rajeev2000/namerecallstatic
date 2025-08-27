class MathSprintGame {
    constructor() {
        // Game configuration
        this.config = {
            questionsTotal: 30,
            timePerQuestion: 2000,
            feedbackDuration: 500,
            totalGameTime: 60000,
            minNumber: 0,
            maxNumber: 9
        };
        // Performance ratings
        this.performanceRatings = [
            {min: 90, rating: "Excellent! You're a math genius!", color: "#27ae60"},
            {min: 75, rating: "Great job! Keep it up!", color: "#f39c12"},
            {min: 60, rating: "Good work! Practice makes perfect!", color: "#3498db"},
            {min: 0, rating: "Keep practicing! You'll get better!", color: "#e74c3c"}
        ];
        // Game state
        this.gameState = {
            currentQuestion: 1,
            score: 0,
            timeRemaining: this.config.timePerQuestion,
            gameActive: false,
            currentNum1: 0,
            currentNum2: 0,
            correctAnswer: 0,
            selectedOption: null,
            optionsGenerated: [],
            questionTimer: null,
            gameTimer: null,
            startTime: 0,
            autoEvalTimer: null
        };
        // Mistake tracking
        this.mistakes = [];
        // Initialize immediately
        this.init();
    }
    init() {
        this.loadBestScore();
        this.bindEvents();
        this.showWelcomeScreen();
        this.addRippleEffect();
        this.initializeTheme();
        console.log('Game initialized successfully');
    }
    // Theme functionality
    initializeTheme() {
        const savedTheme = localStorage.getItem('mathSprintTheme') || 'light';
        this.setTheme(savedTheme);
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Theme toggle clicked');
                this.toggleTheme();
            });
            console.log('Theme toggle event bound successfully');
        }
    }
    setTheme(theme) {
        console.log('Setting theme to:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mathSprintTheme', theme);
    }
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        console.log('Toggling theme from', currentTheme, 'to', newTheme);
        this.setTheme(newTheme);
    }
    bindEvents() {
        console.log('Binding events...');
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start button clicked');
                this.startGame();
            });
            console.log('Start button event bound successfully');
        } else {
            console.error('Start button not found');
        }
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Play again button clicked');
                this.resetGame();
            });
            console.log('Play again button event bound successfully');
        }
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
        });
        console.log('All events bound successfully');
    }
    addRippleEffect() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = button.querySelector('.btn-ripple');
                if (ripple) {
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.style.animation = 'none';
                    ripple.offsetHeight; // Trigger reflow
                    ripple.style.animation = 'ripple 0.6s linear';
                }
            });
        });
    }
    loadBestScore() {
        const bestScore = localStorage.getItem('mathSprintBestScore') || '0';
        const bestScoreElement = document.getElementById('best-score-value');
        if (bestScoreElement) {
            bestScoreElement.textContent = bestScore;
        }
    }
    saveBestScore(score) {
        const currentBest = parseInt(localStorage.getItem('mathSprintBestScore') || '0');
        if (score > currentBest) {
            localStorage.setItem('mathSprintBestScore', score.toString());
            const bestScoreElement = document.getElementById('best-score-value');
            if (bestScoreElement) {
                bestScoreElement.textContent = score.toString();
            }
            return true;
        }
        return false;
    }
    showWelcomeScreen() {
        console.log('Showing welcome screen');
        this.hideAllScreens();
        setTimeout(() => {
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.classList.add('active');
                console.log('Welcome screen is now active');
            }
        }, 100);
    }
    showGameScreen() {
        console.log('Showing game screen');
        this.hideAllScreens();
        setTimeout(() => {
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.classList.add('active');
                console.log('Game screen is now active');
            }
        }, 100);
    }
    showResultsScreen() {
        console.log('Showing results screen');
        this.hideAllScreens();
        setTimeout(() => {
            const resultsScreen = document.getElementById('results-screen');
            if (resultsScreen) {
                resultsScreen.classList.add('active');
                console.log('Results screen is now active');
            }
        }, 100);
    }
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
    startGame() {
        console.log('Starting game...');
        this.resetGameState();
        this.showGameScreen();
        setTimeout(() => {
            this.generateQuestion();
            this.startGameTimer();
            this.gameState.gameActive = true;
            console.log('Game is now active');
        }, 600);
    }
    resetGameState() {
        console.log('Resetting game state');
        this.gameState.currentQuestion = 1;
        this.gameState.score = 0;
        this.gameState.timeRemaining = this.config.timePerQuestion;
        this.gameState.gameActive = false;
        this.gameState.selectedOption = null;
        this.gameState.optionsGenerated = [];
        this.gameState.startTime = Date.now();
        // Reset mistakes array
        this.mistakes = [];
        // Clear any existing timers
        this.clearAllTimers();
        // Reset UI
        this.updateScore();
        this.updateQuestionCounter();
        this.hideFeedback();
    }
    clearAllTimers() {
        if (this.gameState.questionTimer) {
            clearInterval(this.gameState.questionTimer);
        }
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
        }
        if (this.gameState.autoEvalTimer) {
            clearTimeout(this.gameState.autoEvalTimer);
        }
    }
    generateMultipleChoiceOptions(correctAnswer) {
        const options = [correctAnswer];
        const wrongOffsets = [1, 2, 3];
        // Generate 3 wrong answers
        for (let i = 0; i < 3; i++) {
            let wrongAnswer;
            let attempts = 0;
            do {
                const offset = wrongOffsets[i];
                wrongAnswer = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
                attempts++;
                if (wrongAnswer < 0) wrongAnswer = correctAnswer + offset;
                if (wrongAnswer > 18) wrongAnswer = correctAnswer - offset;
            } while (options.includes(wrongAnswer) && attempts < 10);
            if (options.includes(wrongAnswer)) {
                wrongAnswer = correctAnswer + Math.pow(-1, i) * (i + 1);
                if (wrongAnswer < 0) wrongAnswer = 0;
                if (wrongAnswer > 18) wrongAnswer = 18;
            }
            options.push(wrongAnswer);
        }
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options;
    }
    generateQuestion() {
        console.log(`Generating question ${this.gameState.currentQuestion} of ${this.config.questionsTotal}`);
        this.gameState.currentNum1 = Math.floor(Math.random() * (this.config.maxNumber + 1));
        this.gameState.currentNum2 = Math.floor(Math.random() * (this.config.maxNumber + 1));
        this.gameState.correctAnswer = this.gameState.currentNum1 + this.gameState.currentNum2;
        this.gameState.selectedOption = null;
        // Generate multiple choice options
        this.gameState.optionsGenerated = this.generateMultipleChoiceOptions(this.gameState.correctAnswer);
        console.log(`Question: ${this.gameState.currentNum1} + ${this.gameState.currentNum2} = ${this.gameState.correctAnswer}`);
        console.log('Options:', this.gameState.optionsGenerated);
        // Update display
        this.animateNewQuestion();
        // Start auto-evaluation countdown
        this.startAutoEvaluation();
    }
    animateNewQuestion() {
        const num1Element = document.getElementById('num1');
        const num2Element = document.getElementById('num2');
        if (num1Element && num2Element) {
            num1Element.textContent = this.gameState.currentNum1;
            num2Element.textContent = this.gameState.currentNum2;
        }
        // Update multiple choice options
        this.updateMultipleChoiceOptions();
        this.hideFeedback();
    }
    updateMultipleChoiceOptions() {
        const optionsContainer = document.getElementById('multiple-choice-options');
        if (!optionsContainer) return;
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        optionButtons.forEach((button, index) => {
            if (index < this.gameState.optionsGenerated.length) {
                button.textContent = this.gameState.optionsGenerated[index];
                button.setAttribute('data-value', this.gameState.optionsGenerated[index]);
                button.classList.remove('selected', 'correct', 'incorrect', 'disabled');
                button.style.display = 'flex';
                button.style.borderColor = '';
                button.style.animation = '';
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectOption(parseInt(e.target.getAttribute('data-value')));
                });
            } else {
                button.style.display = 'none';
            }
        });
    }
    selectOption(selectedValue) {
        if (!this.gameState.gameActive || this.gameState.selectedOption !== null) return;
        console.log('Option selected:', selectedValue);
        this.gameState.selectedOption = selectedValue;
        clearInterval(this.gameState.questionTimer);
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            const buttonValue = parseInt(button.getAttribute('data-value'));
            if (buttonValue === selectedValue) {
                button.classList.add('selected');
            }
            button.classList.add('disabled');
        });
        setTimeout(() => {
            this.evaluateAnswer();
        }, 200);
    }
    startAutoEvaluation() {
        this.gameState.timeRemaining = this.config.timePerQuestion;
        this.gameState.questionTimer = setInterval(() => {
            this.gameState.timeRemaining -= 100;
            if (this.gameState.timeRemaining <= 0) {
                this.autoEvaluateAnswer();
            } else {
                this.updateTimerDisplay();
            }
        }, 100);
    }
    updateTimerDisplay() {
        const seconds = (this.gameState.timeRemaining / 1000).toFixed(1);
        const percentage = (this.gameState.timeRemaining / this.config.timePerQuestion) * 100;
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = `${seconds}s`;
        }
        const countdownText = document.getElementById('countdown-text');
        if (countdownText) {
            countdownText.textContent = seconds;
        }
        const timerProgress = document.getElementById('timer-progress');
        if (timerProgress) {
            timerProgress.style.width = `${percentage}%`;
            if (percentage < 30) {
                timerProgress.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            } else if (percentage < 60) {
                timerProgress.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                timerProgress.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
            }
        }
        if (this.gameState.timeRemaining <= 500 && this.gameState.timeRemaining > 400) {
            const optionButtons = document.querySelectorAll('.option-btn:not(.disabled)');
            optionButtons.forEach(button => {
                button.style.borderColor = 'var(--color-error)';
                button.style.animation = 'shake 0.5s ease-out';
            });
        }
    }
    autoEvaluateAnswer() {
        if (!this.gameState.gameActive) return;
        clearInterval(this.gameState.questionTimer);
        console.log(`Auto-evaluation: Selected: ${this.gameState.selectedOption}, Correct: ${this.gameState.correctAnswer}`);
        this.evaluateAnswer();
    }
    evaluateAnswer() {
        if (!this.gameState.gameActive) return;
        const isCorrect = this.gameState.selectedOption === this.gameState.correctAnswer;
        if (!isCorrect) {
            this.mistakes.push({
                question: `${this.gameState.currentNum1} + ${this.gameState.currentNum2}`,
                selectedOption: this.gameState.selectedOption === null ? 'No selection' : this.gameState.selectedOption,
                correctAnswer: this.gameState.correctAnswer,
                isCorrect: false
            });
        }
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            const buttonValue = parseInt(button.getAttribute('data-value'));
            button.classList.add('disabled');
            if (buttonValue === this.gameState.correctAnswer) {
                button.classList.add('correct');
            } else if (buttonValue === this.gameState.selectedOption && !isCorrect) {
                button.classList.add('incorrect');
            }
        });
        if (isCorrect) {
            this.gameState.score++;
            this.showFeedback(true, 'Correct! Well done!');
            this.animateScoreIncrease();
        } else {
            const message = this.gameState.selectedOption === null ?
                `Time's up! ${this.gameState.currentNum1} + ${this.gameState.currentNum2} = ${this.gameState.correctAnswer}` :
                `Wrong! ${this.gameState.currentNum1} + ${this.gameState.currentNum2} = ${this.gameState.correctAnswer}`;
            this.showFeedback(false, message);
        }
        setTimeout(() => {
            this.nextQuestion();
        }, this.config.feedbackDuration);
    }
    startGameTimer() {
        this.gameState.gameTimer = setTimeout(() => {
            console.log('Game timer expired, ending game');
            this.endGame();
        }, this.config.totalGameTime);
    }
    nextQuestion() {
        if (!this.gameState.gameActive) return;
        this.gameState.currentQuestion++;
        this.updateQuestionCounter();
        console.log(`Moving to question ${this.gameState.currentQuestion} of ${this.config.questionsTotal}`);
        // Fix: Ensure exactly 30 questions are asked
        if (this.gameState.currentQuestion <= this.config.questionsTotal) {
            this.generateQuestion();
        } else {
            console.log('Reached question limit of 30, ending game');
            this.endGame();
        }
    }
    endGame() {
        console.log(`Ending game - Answered ${this.gameState.currentQuestion - 1} questions, Score: ${this.gameState.score}`);
        this.gameState.gameActive = false;
        this.clearAllTimers();
        this.showResults();
    }
    showResults() {
        // Fix: Questions answered should never exceed the total
        const questionsAnswered = Math.min(this.gameState.currentQuestion - 1, this.config.questionsTotal);
        const accuracy = Math.round((this.gameState.score / questionsAnswered) * 100);
        const previousBest = parseInt(localStorage.getItem('mathSprintBestScore') || '0');
        const isNewBest = this.saveBestScore(this.gameState.score);
        // Update results display
        const finalScoreValue = document.getElementById('final-score-value');
        if (finalScoreValue) {
            finalScoreValue.textContent = this.gameState.score;
        }
        const accuracyValue = document.getElementById('accuracy-value');
        if (accuracyValue) {
            accuracyValue.textContent = `${accuracy}%`;
        }
        const previousBestElement = document.getElementById('previous-best');
        if (previousBestElement) {
            previousBestElement.textContent = previousBest;
        }
        const currentGameScore = document.getElementById('current-game-score');
        if (currentGameScore) {
            currentGameScore.textContent = this.gameState.score;
        }
        this.updatePerformanceRating(accuracy);
        this.displayMistakes();
        this.animateScoreCounting();
        if (isNewBest) {
            this.showCelebration();
        }
        this.showResultsScreen();
    }
    displayMistakes() {
        const mistakesList = document.getElementById('mistakes-list');
        if (!mistakesList) return;
        mistakesList.innerHTML = '';
        if (this.mistakes.length === 0) {
            const noMistakes = document.createElement('div');
            noMistakes.className = 'no-mistakes';
            noMistakes.textContent = 'Perfect! No mistakes made! 🎉';
            mistakesList.appendChild(noMistakes);
        } else {
            this.mistakes.forEach((mistake, index) => {
                const mistakeItem = document.createElement('div');
                mistakeItem.className = 'mistake-item';
                mistakeItem.innerHTML = `
                    <span class="mistake-question">${index + 1}. ${mistake.question}</span>
                    <span class="mistake-answers">
                        <span class="user-answer">Your answer: ${mistake.selectedOption}</span>
                        <span class="correct-answer">Correct: ${mistake.correctAnswer}</span>
                    </span>
                `;
                mistakesList.appendChild(mistakeItem);
            });
        }
    }
    showFeedback(isCorrect, message) {
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            feedback.style.display = 'flex';
        }
    }
    hideFeedback() {
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }
    updateScore() {
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = this.gameState.score;
        }
    }
    updateQuestionCounter() {
        const questionCounter = document.getElementById('question-counter');
        if (questionCounter) {
            questionCounter.textContent = `${Math.min(this.gameState.currentQuestion, this.config.questionsTotal)} / ${this.config.questionsTotal}`;
        }
    }
    updatePerformanceRating(accuracy) {
        const ratingObj = this.performanceRatings.find(r => accuracy >= r.min) || this.performanceRatings[3];
        const ratingText = document.getElementById('rating-text');
        if (ratingText) {
            ratingText.textContent = ratingObj.rating;
            ratingText.style.color = ratingObj.color;
        }
    }
    animateScoreIncrease() {
        // Animate score increment (optional, implement as needed)
    }
    animateScoreCounting() {
        // Animate score counting (optional, implement as needed)
    }
    showCelebration() {
        // Celebration animation (optional, implement as needed)
    }
    resetGame() {
        this.hideAllScreens();
        this.startGame();
    }
}

// Run the game when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    new MathSprintGame();
});
