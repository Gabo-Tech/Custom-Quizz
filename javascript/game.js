//Get all HTML elements needed.
const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById('loader');
const game = document.getElementById('game');
//Create needed variables for game logic
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];
let questions = [];
//Fetching data from Open Trivia API
fetch('https://opentdb.com/api.php?amount=50&category=18&type=multiple')
    .then((res) => {
        return res.json();
    })
    .then((loadedQuestions) => {            //Map the received questions to reformat them
        questions = loadedQuestions.results.map((loadedQuestion) => {
            //Formatting questions
            const formattedQuestion = {
                question: loadedQuestion.question,
            };
            //Formatting answers
            //Getting all incorrect answers
            const answerChoices = [...loadedQuestion.incorrect_answers];
            //Randomizing their order
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            //Adding the right answer
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            );
            //Adding an index
            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });
            //Giving back the format we need
            return formattedQuestion;
        });
        startGame();
    })
    .catch((err) => {
        console.error(err);
    });
//Local API retrieving data from JSON file
    // fetch('questions.json')
    // .then((res) => {
    //     return res.json();
    // })
    // .then((loadedQuestions) => {
    //     questions = loadedQuestions;
    //     startGame();
    // })
    // .catch((err) => {
    //     console.error(err);
    // });
//Constants to limit the amount of questions and add points if you get the right answer
const correct_bonus = 10;
const max_questions = 50;
//Function to restart the game, so it resets all parameters
startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

getNewQuestion = () => {
    if (/*availableQuesions.length === 0 || */questionCounter >= max_questions) {
        localStorage.setItem('mostRecentScore', score);
        //go to the end page
        return window.location.assign('/Custom-Quizz/html/end.html');
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${max_questions}`;
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / max_questions) * 100}%`;
    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;
    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });
    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};
//Check the chosen answer.
choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;
        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
        const classToApply = selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
        if (classToApply === "correct") {
            incrementScore(correct_bonus);
          }      
        selectedChoice.parentElement.classList.add(classToApply);
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
          }, 1000);
    });
});
incrementScore = num => {
    score += num;
    scoreText.innerText = score;
  };
startGame();