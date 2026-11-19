
/* ==================================
   UROLOGY LAB - INTERACTIONS
================================== */

// 1. PAGE NAVIGATION

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(pageId) {

  pages.forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  navButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.go);
  });
});


// 2. ORGAN EXPLORER

const organData = {

  kidney: {
    title: "Kidney",
    description:
      "The kidneys filter blood through the glomeruli and regulate fluid, electrolyte, and acid-base balance.",
    insight:
      "Urine formation begins with glomerular filtration."
  },

  ureter: {
    title: "Ureter",
    description:
      "The ureters transport urine from the renal pelvis to the urinary bladder through peristaltic contractions.",
    insight:
      "Ureteric obstruction may increase upstream pressure and cause hydronephrosis."
  },

  bladder: {
    title: "Urinary Bladder",
    description:
      "The bladder stores urine until micturition occurs. Its detrusor muscle contracts during voiding.",
    insight:
      "Normal bladder function requires coordinated detrusor contraction and sphincter relaxation."
  },

  urethra: {
    title: "Urethra",
    description:
      "The urethra is the final passage through which urine exits the body.",
    insight:
      "Urinary outflow obstruction can also occur at the bladder outlet or urethra."
  }

};

const organButtons = document.querySelectorAll(".organ");

organButtons.forEach(button => {

  button.addEventListener("click", () => {

    const organ = organData[button.dataset.organ];

    document.getElementById("organTitle").textContent =
      organ.title;

    document.getElementById("organDescription").textContent =
      organ.description;

    document.getElementById("clinicalInsight").textContent =
      organ.insight;

  });

});


// 3. NORMAL VS OBSTRUCTION SIMULATION

const normalBtn = document.getElementById("normalBtn");
const obstructionBtn = document.getElementById("obstructionBtn");

const stone = document.getElementById("stone");
const flowStatus = document.getElementById("flowStatus");

const pathTitle = document.getElementById("pathTitle");
const pathDescription = document.getElementById("pathDescription");

function setMode(mode) {

  const isObstructed = mode === "obstruction";

  normalBtn.classList.toggle("active", !isObstructed);
  obstructionBtn.classList.toggle("active", isObstructed);

  document.querySelector(".anatomy-panel")
    .classList.toggle("obstruction-mode", isObstructed);

  if (isObstructed) {

    stone.textContent = "🪨";
    flowStatus.textContent = "● URINARY OBSTRUCTION";
    flowStatus.classList.add("blocked");

    pathTitle.textContent = "Ureteral Obstruction";

    pathDescription.textContent =
      "A stone obstructing the ureter impairs urine drainage. " +
      "Pressure increases proximal to the obstruction, potentially " +
      "causing hydronephrosis and, if sustained, reduced GFR and renal injury.";

  } else {

    stone.textContent = "│";
    flowStatus.textContent = "● NORMAL URINE FLOW";
    flowStatus.classList.remove("blocked");

    pathTitle.textContent = "Normal Urine Flow";

    pathDescription.textContent =
      "Urine flows from the kidneys through the ureters, " +
      "enters the urinary bladder, and exits through the urethra.";

  }

}

normalBtn.addEventListener("click", () => {
  setMode("normal");
});

obstructionBtn.addEventListener("click", () => {
  setMode("obstruction");
});


// 4. MINI QUIZ DATABASE

const questions = [

  {
    question:
      "Which is the most common type of urinary stone?",

    options: [
      "Struvite",
      "Calcium oxalate",
      "Cystine",
      "Uric acid"
    ],

    answer: 1,

    explanation:
      "Calcium oxalate is the most common type of urinary stone."
  },

  {
    question:
      "Which bacteria are classically associated with struvite stones?",

    options: [
      "Escherichia coli",
      "Staphylococcus epidermidis",
      "Proteus mirabilis",
      "Enterococcus faecalis"
    ],

    answer: 2,

    explanation:
      "Proteus mirabilis produces urease, which promotes alkaline urine and struvite formation."
  },

  {
    question:
      "Which urinary pH favors uric acid stone formation?",

    options: [
      "Acidic urine",
      "Alkaline urine",
      "Neutral urine only",
      "Urine pH has no effect"
    ],

    answer: 0,

    explanation:
      "Acidic urine promotes uric acid precipitation."
  },

  {
    question:
      "What is the characteristic crystal shape of cystine?",

    options: [
      "Envelope",
      "Coffin-lid",
      "Rhomboid",
      "Hexagonal"
    ],

    answer: 3,

    explanation:
      "Cystine crystals classically have a hexagonal shape."
  },

  {
    question:
      "What may develop proximal to a persistent ureteral obstruction?",

    options: [
      "Hydronephrosis",
      "Hypoglycemia",
      "Hyperthyroidism",
      "Splenomegaly"
    ],

    answer: 0,

    explanation:
      "Persistent obstruction may cause dilation of the renal collecting system, known as hydronephrosis."
  }

];


// 5. QUIZ FUNCTION

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");

function loadQuestion() {

  answered = false;

  const q = questions[currentQuestion];

  document.getElementById("questionCounter").textContent =
    `Question ${currentQuestion + 1} / ${questions.length}`;

  document.getElementById("scoreLabel").textContent =
    `Score: ${score}`;

  document.getElementById("progressBar").style.width =
    `${((currentQuestion + 1) / questions.length) * 100}%`;

  questionText.textContent = q.question;

  answerOptions.innerHTML = "";

  feedback.textContent = "";

  nextBtn.disabled = true;

  q.options.forEach((option, index) => {

    const button = document.createElement("button");

    button.className = "answer-option";
    button.textContent = option;

    button.addEventListener("click", () => {
      selectAnswer(index);
    });

    answerOptions.appendChild(button);

  });

}

function selectAnswer(selectedIndex) {

  if (answered) return;

  answered = true;

  const q = questions[currentQuestion];

  const buttons = answerOptions.querySelectorAll("button");

  buttons.forEach((button, index) => {

    button.disabled = true;

    if (index === q.answer) {
      button.classList.add("correct");
    }

    if (index === selectedIndex && index !== q.answer) {
      button.classList.add("wrong");
    }

  });

  if (selectedIndex === q.answer) {

    score++;

    feedback.textContent =
      "✓ Correct! " + q.explanation;

  } else {

    feedback.textContent =
      "✗ Incorrect. " + q.explanation;

  }

  document.getElementById("scoreLabel").textContent =
    `Score: ${score}`;

  nextBtn.disabled = false;

}

nextBtn.addEventListener("click", () => {

  currentQuestion++;

  if (currentQuestion < questions.length) {

    loadQuestion();

  } else {

    showResult();

  }

});

function showResult() {

  document.getElementById("questionCounter").textContent =
    "QUIZ COMPLETED";

  document.getElementById("progressBar").style.width = "100%";

  questionText.textContent =
    `You scored ${score} out of ${questions.length}!`;

  answerOptions.innerHTML = "";

  feedback.textContent =
    score === questions.length
      ? "Excellent! You have mastered this quiz."
      : "Good effort! Review your mini notes and try again.";

  nextBtn.textContent = "Try Again";

  nextBtn.disabled = false;

  nextBtn.onclick = () => {

    currentQuestion = 0;
    score = 0;

    nextBtn.textContent = "Next Question →";

    nextBtn.onclick = null;

    loadQuestion();

  };

}

// INITIALIZE QUIZ

loadQuestion();
