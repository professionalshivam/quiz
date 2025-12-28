const questions = [
    {
        id: 1,
        question: "What is the correct way to declare a variable in JavaScript (ES6+)?",
        options: ["var myVar;", "variable myVar;", "let myVar;", "dim myVar;"],
        correct: 2
    },
    {
        id: 2,
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "unshift()", "shift()"],
        correct: 0
    },
    {
        id: 3,
        question: "How do you start a `setTimeout` function?",
        options: ["setTimeout(callback, delay)", "setInterval(callback, delay)", "setDelay(callback)", "doLater(callback)"],
        correct: 0
    },
    {
        id: 4,
        question: "What does DOM stand for?",
        options: ["Data Object Model", "Document Object Model", "Digital Order Module", "Document Oriented Mode"],
        correct: 1
    },
    {
        id: 5,
        question: "Which of these is NOT a valid JavaScript data type?",
        options: ["Undefined", "Boolean", "Float", "Object"],
        correct: 2
    }
];

// State
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
let timerInterval;
const userAnswers = new Array(questions.length).fill(null); // Track user answers

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timeLeftEl = document.getElementById('time-left');
const scoreEl = document.getElementById('current-score');
const finalScoreEl = document.getElementById('final-score');
const resultMessage = document.getElementById('result-message');
const progressBar = document.getElementById('progress-bar');
const homeHighScoreEl = document.getElementById('home-high-score');
const timerCircle = document.querySelector('.timer-circle-progress');

// Constants
const TIME_PER_QUESTION = 15;
const CIRCLE_CIRCUMFERENCE = 283;

// Initialize
function init() {
    const highScore = localStorage.getItem('quizHighScore') || 0;
    homeHighScoreEl.textContent = highScore;

    // Add Event Listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    restartBtn.addEventListener('click', restartQuiz);
}

function startQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    userAnswers.fill(null); // Reset answers
    scoreEl.textContent = score;

    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    quizScreen.classList.add('active');

    // Optional: Randomize questions here
    // questions.sort(() => Math.random() - 0.5);

    loadQuestion(currentQuestionIndex);
}

function loadQuestion(index) {
    clearInterval(timerInterval);
    resetTimerUI();

    const question = questions[index];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';

    const existingAnswer = userAnswers[index];

    // Create Options
    question.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;

        // If already answered, show state
        if (existingAnswer !== null) {
            btn.disabled = true;
            if (i === question.correct) btn.classList.add('correct');
            if (existingAnswer === i && i !== question.correct) btn.classList.add('wrong');
        } else {
            btn.addEventListener('click', () => selectOption(i, btn));
        }

        optionsContainer.appendChild(btn);
    });

    // Update UI controls
    updateProgressBar();
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === questions.length - 1 ? 'Finish' : 'Next';

    // Only start timer if not already answered
    if (existingAnswer === null) {
        startTimer();
    } else {
        timeLeftEl.textContent = 0; // Or keep it at 0 to show it's done
        timerCircle.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE; // Empty
    }
}

function selectOption(selectedIndex, btn) {
    // Disable all options
    const options = document.querySelectorAll('.option-btn');
    options.forEach(opt => opt.disabled = true);

    clearInterval(timerInterval);

    // Store answer
    userAnswers[currentQuestionIndex] = selectedIndex;

    const correctIndex = questions[currentQuestionIndex].correct;

    if (selectedIndex === correctIndex) {
        btn.classList.add('correct');
        score += 10;
        scoreEl.textContent = score;
    } else {
        btn.classList.add('wrong');
        // Show correct answer
        options[correctIndex].classList.add('correct');
    }
}

function nextQuestion() {
    // If time ran out or user didn't answer, mark as skipped/wrong internally if we want forced answers
    // But for now, we just move on. If we want to prevent moving without answering:
    // if (userAnswers[currentQuestionIndex] === null && timeLeft > 0) return alert("Please answer!");

    // The previous logic allowed moving freely. Let's keep it but ensure timer stops if we move away.
    clearInterval(timerInterval);

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex);
    } else {
        showResult();
    }
}

function prevQuestion() {
    clearInterval(timerInterval);
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

function startTimer() {
    timeLeft = TIME_PER_QUESTION;
    timeLeftEl.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft;

        // Update circle progress
        const offset = CIRCLE_CIRCUMFERENCE - (timeLeft / TIME_PER_QUESTION) * CIRCLE_CIRCUMFERENCE;
        timerCircle.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function resetTimerUI() {
    timerCircle.style.strokeDashoffset = 0;
}

function handleTimeOut() {
    // Mark as wrong if no answer selected yet
    if (userAnswers[currentQuestionIndex] === null) {
        userAnswers[currentQuestionIndex] = -1; // -1 for timeout/no answer

        const options = document.querySelectorAll('.option-btn');
        options.forEach(opt => opt.disabled = true);

        const correctIndex = questions[currentQuestionIndex].correct;
        options[correctIndex].classList.add('correct');
    }
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function showResult() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');

    finalScoreEl.textContent = score;

    const maxScore = questions.length * 10;
    if (score === maxScore) {
        resultMessage.textContent = "Perfect Score! You're a Master!";
    } else if (score >= maxScore * 0.7) {
        resultMessage.textContent = "Great job! You know your stuff.";
    } else {
        resultMessage.textContent = "Keep practicing!";
    }

    // Save High Score
    const currentHigh = localStorage.getItem('quizHighScore') || 0;
    if (score > currentHigh) {
        localStorage.setItem('quizHighScore', score);
        resultMessage.textContent += " New High Score!";
    }
}

function restartQuiz() {
    init(); // Refresh high score display
    startQuiz();
}

// Run init
init();
