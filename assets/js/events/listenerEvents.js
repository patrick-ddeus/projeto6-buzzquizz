import { callQuizValidation, stringToBoolean } from "../utils/utils.js";
import { insertEventOnCreateQuizzButton } from "./onClickEvents.js";
import { renders } from "../content/render.js";
import { buscarQuizz } from "../content/render2.js";
import Templates from "../api/generateQuizz.js";
import QuizzApiMethods from "../api/quizzApi.js";
import QuizzDBManipulation from "../db/quizzes.js";
import { reiniciarQuizz } from "../content/render2.js";

// addQuiz.html formValidation
class StartEvents {
    constructor() {
        // Primeira Parte da criação do Quizz
        this.quizzBtn = document.querySelector("#quizzBtn");
        this.quizzForm = document.getElementById("quizzForm");

        // Segunda Parte da criação do Quizz
        this.questionsBtn = document.getElementById("questionsFormBtn");
        this.questionForm = document.getElementById("questionForm");

        // Terceira Parte da criação do Quizz
        this.finishBtn = document.getElementById("levelsBtn");
        this.levelsForm = document.getElementById("levelsForm");

        this.backPageBtn = document.querySelector(".backPageBtn")
        this.doneQuizz = document.querySelector(".doneQuizzBtn")
        this.restartBtn = document.querySelector(".restartBtn");
    }

    listenerEvent() {
        // Adiciona evento no botão Criar Quizz
        insertEventOnCreateQuizzButton();
        this.quizzBtn.addEventListener("click", () => {
            const formIsValid = callQuizValidation(this.quizzForm, 20, 65);

            if (formIsValid) {
                this.quizzForm.classList.add("valid");

                const questionsQtd = this.quizzForm.querySelector("#qtdPerguntas").value;
                const levelQtd = this.quizzForm.querySelector("#qtdNiveis").value;
                const quizzTitle = this.quizzForm.querySelector("#quizzTitle").value;
                const quizzImage = this.quizzForm.querySelector("#quizzImage").value;

                Templates.quizzTemplate.title = quizzTitle;
                Templates.quizzTemplate.image = quizzImage;
                Templates.quizzTemplate.questions = Array(Number(questionsQtd));
                Templates.quizzTemplate.levels = Array(Number(levelQtd));

                if (!(this.questionForm.classList.contains("EditMode"))) {
                    renders.insertQuestionsOnHtml(questionsQtd, this.questionForm);
                    renders.insertLevelsOnHtml(levelQtd, this.levelsForm);
                }
            }
            renders.changeFormModal(this.quizzBtn, formIsValid);
        });

        this.questionsBtn.addEventListener("click", _ => {
            const formIsValid = callQuizValidation(this.questionForm, 20, Number.MAX_VALUE);

            if (formIsValid) {
                let obj = {};

                const questions = this.questionForm.querySelectorAll(`.questions`);
                const questionsToArray = Array.from(questions);

                const newArray = Templates.quizzTemplate.questions.fill().map((_, indice) => {
                    const title = this.questionForm.querySelector(`.questionTitleInput${indice}`);
                    const color = this.questionForm.querySelector(`.questionColor${indice}`);
                    obj = {
                        title: title.value,
                        color: color.value
                    };
                    if (!("answers" in obj)) obj.answers = [];
                    return obj;
                });

                for (let question in questionsToArray) {
                    questionsToArray[question].querySelectorAll(".answerBlock").forEach(answer => {
                        const text = answer.querySelector(".answerText");
                        const image = answer.querySelector(".answerImage");
                        const datatestValidation = text.dataset.correct;

                        if (!text.value || !image.value) return;
                        newArray[question].answers.push({
                            text: text.value,
                            image: image.value,
                            isCorrectAnswer: stringToBoolean(datatestValidation)
                        });
                    });
                }
                Templates.quizzTemplate.questions = newArray;
            }
            renders.changeFormModal(this.questionsBtn, formIsValid);
        });

        this.finishBtn.addEventListener("click", _ => {
            const formIsValid = callQuizValidation(this.levelsForm, 10, Number.MAX_VALUE);
            if (formIsValid) {

                const questions = this.levelsForm.querySelectorAll(`.questions`);
                const questionsToArray = Array.from(questions);

                const levelArray = [];
                for (let question in questionsToArray) {
                    questionsToArray[question].querySelectorAll(".levelBlock").forEach(answer => {
                        const title = answer.querySelector(".levelTitle");
                        const minValue = answer.querySelector(".minStrike");
                        const levelImage = answer.querySelector(".levelImage");
                        const levelDesc = answer.querySelector(".levelDesc");

                        levelArray.push({
                            title: title.value,
                            image: levelImage.value,
                            text: levelDesc.value,
                            minValue: Number(minValue.value)
                        });
                    });
                }
                Templates.quizzTemplate.levels = levelArray;
                if (!(this.levelsForm.classList.contains("EditMode"))) {
                    QuizzApiMethods.createQuizz(Templates.quizzTemplate)
                        .then(QuizzDBManipulation.createQuizz)
                        .then(() => renders.changeFormModal(this.finishBtn, formIsValid));
                }
            }

        });
        this.backPageBtn.addEventListener("click", _ => {
            location.reload()
        })
            this.restartBtn.addEventListener("click", _ => {
            let banner = document.querySelector('.banner');
            const id = banner.id;
            reiniciarQuizz(id);
        });
        this.doneQuizz.onclick = buscarQuizz
    }

}


export default new StartEvents;
