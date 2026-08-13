// --- BIBLIOTHÈQUE COMPLÈTE DES 16 EXERCICES ---
const ALL_EXERCISES = [
  { id: 'squat', name: 'Squat', desc: 'Fléchis les genoux en gardant le dos droit.', img: 'assets/exercises/01-squat.jpg' },
  { id: 'pompes', name: 'Pompes', desc: 'Corps gainé, descends la poitrine vers le sol.', img: 'assets/exercises/02-pompes.jpg' },
  { id: 'fentes', name: 'Fentes', desc: 'Pas en avant, fléchis les deux genoux à 90°.', img: 'assets/exercises/03-fentes.jpg' },
  { id: 'gainage', name: 'Planche / Gainage', desc: 'Appuis sur les avant-bras et pointes de pieds, corps aligné.', img: 'assets/exercises/04-gainage.jpg' },
  { id: 'burpees', name: 'Burpees', desc: 'Squat, planche, pompes, puis saut vertical.', img: 'assets/exercises/05-burpees.jpg' },
  { id: 'ciseaux', name: 'Ciseaux abdos', desc: 'Allongé sur le dos, bats des jambes en gardant les abdos serrés.', img: 'assets/exercises/06-ciseaux.jpg' },
  { id: 'dips', name: 'Dips chaise', desc: 'Mains sur un support stable, fléchis et tends les bras.', img: 'assets/exercises/07-dips.jpg' },
  { id: 'mtn', name: 'Mountain Climbers', desc: 'En position de planche, ramène alternativement les genoux vers la poitrine.', img: 'assets/exercises/08-mountain-climbers.jpg' },
  { id: 'torsion', name: 'Torsion allongée', desc: 'Allongé, bascule les genoux d’un côté pour étirer le dos.', img: 'assets/exercises/09-torsion.jpg' },
  { id: 'bird-dog', name: 'Bird Dog', desc: 'En appui quadrupedal, tends le bras opposé et la jambe opposée.', img: 'assets/exercises/10-bird-dog.jpg' },
  { id: 'enfant', name: 'Posture de l’enfant', desc: 'À genoux, assieds-toi sur tes talons en étirant les bras loin devant.', img: 'assets/exercises/11-enfant.jpg' },
  { id: 'cobra', name: 'Cobra', desc: 'À plat ventre, redresse le buste en contractant le dos.', img: 'assets/exercises/12-cobra.jpg' },
  { id: 'chien-tete-en-bas', name: 'Chien tête en bas', desc: 'Forme un V inversé avec le corps, talons vers le sol.', img: 'assets/exercises/13-chien-tete-en-bas.jpg' },
  { id: 'dead-bug', name: 'Dead Bug', desc: 'Sur le dos, descends alternativement bras et jambe opposés sans creuser le dos.', img: 'assets/exercises/14-dead-bug.jpg' },
  { id: 'pike-pushups', name: 'Pike Push-ups', desc: 'Pompes inclinées fesses en l’air pour cibler les épaules.', img: 'assets/exercises/15-pike-pushups.jpg' },
  { id: 'planche-laterale', name: 'Planche latérale', desc: 'En appui sur un seul avant-bras, corps de profil bien aligné.', img: 'assets/exercises/16-planche-laterale.jpg' }
];

// --- ÉTAT DE L'APPLICATION ---
let routines = JSON.parse(localStorage.getItem('ninja_routines')) || [
  {
    id: 'default-routine',
    name: 'Routine Ninja Classique',
    rounds: 3,
    exerciseIds: ['squat', 'pompes', 'fentes', 'gainage']
  }
];

let activeRoutine = null;
let currentRound = 1;
let currentIndex = 0;
let timerInterval = null;
let timeLeft = 30;
let isPaused = false;

// --- SÉLECTION DES ÉLÉMENTS HTML ---
const screens = {
  selector: document.getElementById('routine-selector-screen'),
  creator: document.getElementById('routine-creator-screen'),
  workout: document.getElementById('workout-screen'),
  completion: document.getElementById('completion-screen'),
  library: document.getElementById('library-screen')
};

// --- INITIALISATION AU CHARGEMENT ---
document.addEventListener('DOMContentLoaded', () => {
  renderRoutinesList();
  initEventListeners();
});

// --- GESTION DES ÉCRANS ---
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.style.display = 'none');
  screens[screenName].style.display = 'block';
}

// --- AFFICHAGE DE LA LISTE DES SÉANCES ---
function renderRoutinesList() {
  const container = document.getElementById('saved-routines-list');
  container.innerHTML = '';

  routines.forEach((routine) => {
    const card = document.createElement('div');
    card.className = 'routine-card';
    card.innerHTML = `
      <div>
        <h3>${routine.name}</h3>
        <p>${routine.rounds} tours • ${routine.exerciseIds.length} exercices</p>
      </div>
      <div class="routine-card-actions">
        <button class="btn-primary start-routine-btn" data-id="${routine.id}">Lancer</button>
        <button class="btn-secondary delete-routine-btn" data-id="${routine.id}">Supprimer</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.start-routine-btn').forEach(btn => {
    btn.addEventListener('click', (e) => startRoutine(e.target.dataset.id));
  });

  document.querySelectorAll('.delete-routine-btn').forEach(btn => {
    btn.addEventListener('click', (e) => deleteRoutine(e.target.dataset.id));
  });
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS GLOBAUX ---
function initEventListeners() {
  document.getElementById('btn-create-routine').addEventListener('click', openCreator);
  document.getElementById('btn-cancel-routine').addEventListener('click', () => showScreen('selector'));
  document.getElementById('btn-save-routine').addEventListener('click', saveNewRoutine);
  
  document.getElementById('btn-library').addEventListener('click', openLibrary);
  document.getElementById('btn-library-back').addEventListener('click', () => showScreen('selector'));

  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-next').addEventListener('click', nextExercise);
  document.getElementById('btn-abandon').addEventListener('click', abandonWorkout);
  document.getElementById('btn-home').addEventListener('click', () => showScreen('selector'));
}

// --- OUVRIR LE CRÉATEUR DE SÉANCE ---
function openCreator() {
  document.getElementById('routine-name').value = '';
  document.getElementById('routine-rounds').value = 3;
  
  const checkboxContainer = document.getElementById('exercise-checkboxes-list');
  checkboxContainer.innerHTML = '';

  ALL_EXERCISES.forEach(ex => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.innerHTML = `
      <input type="checkbox" name="exercise-choice" value="${ex.id}" checked>
      ${ex.name}
    `;
    checkboxContainer.appendChild(label);
  });

  showScreen('creator');
}

// --- OUVRIR LA BIBLIOTHÈQUE DES FICHES ---
function openLibrary() {
  const container = document.getElementById('library-exercises-list');
  container.innerHTML = '';

  ALL_EXERCISES.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
      <h3>${ex.name}</h3>
      <div class="exercise-image">
        <img src="${ex.img}" alt="${ex.name}">
      </div>
      <p>${ex.desc}</p>
    `;
    container.appendChild(card);
  });

  showScreen('library');
}

// --- SAUVEGARDER UNE NOUVELLE SÉANCE ---
function saveNewRoutine() {
  const nameInput = document.getElementById('routine-name').value.trim();
  const roundsInput = parseInt(document.getElementById('routine-rounds').value, 10);
  
  const checkboxes = document.querySelectorAll('input[name="exercise-choice"]:checked');
  const selectedExerciseIds = Array.from(checkboxes).map(cb => cb.value);

  if (!nameInput) {
    alert('Veuillez donner un nom à votre séance.');
    return;
  }

  if (selectedExerciseIds.length === 0) {
    alert('Veuillez sélectionner au moins un exercice.');
    return;
  }

  const newRoutine = {
    id: 'routine_' + Date.now(),
    name: nameInput,
    rounds: isNaN(roundsInput) || roundsInput < 1 ? 3 : roundsInput,
    exerciseIds: selectedExerciseIds
  };

  routines.push(newRoutine);
  localStorage.setItem('ninja_routines', JSON.stringify(routines));

  renderRoutinesList();
  showScreen('selector');
}

// --- SUPPRIMER UNE SÉANCE ---
function deleteRoutine(id) {
  if (routines.length <= 1) {
    alert("Tu dois garder au moins une séance !");
    return;
  }

  if (confirm("Veux-tu vraiment supprimer cette séance ?")) {
    routines = routines.filter(r => r.id !== id);
    localStorage.setItem('ninja_routines', JSON.stringify(routines));
    renderRoutinesList();
  }
}

// --- LANCER UN ENTRAÎNEMENT ---
function startRoutine(id) {
  activeRoutine = routines.find(r => r.id === id);
  if (!activeRoutine) return;

  currentRound = 1;
  currentIndex = 0;

  document.getElementById('current-routine-title').textContent = activeRoutine.name;
  showScreen('workout');
  loadExercise();
}

// --- CHARGER L'EXERCICE COURANT ---
function loadExercise() {
  const exerciseId = activeRoutine.exerciseIds[currentIndex];
  const exerciseData = ALL_EXERCISES.find(e => e.id === exerciseId);

  if (!exerciseData) return;

  document.getElementById('exercise-name').textContent = exerciseData.name;
  document.getElementById('exercise-desc').textContent = exerciseData.desc;
  document.getElementById('exercise-img').src = exerciseData.img;
  document.getElementById('round-counter').textContent = `Tour ${currentRound}/${activeRoutine.rounds}`;

  clearInterval(timerInterval);
  timeLeft = 30;
  isPaused = false;
  document.getElementById('btn-pause').textContent = 'Pause';
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        nextExercise();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer-display').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById('btn-pause').textContent = isPaused ? 'Reprendre' : 'Pause';
}

function nextExercise() {
  clearInterval(timerInterval);
  currentIndex++;

  if (currentIndex >= activeRoutine.exerciseIds.length) {
    currentIndex = 0;
    currentRound++;

    if (currentRound > activeRoutine.rounds) {
      showScreen('completion');
      return;
    }
  }

  loadExercise();
}

function abandonWorkout() {
  clearInterval(timerInterval);
  if (confirm("Veux-tu abandonner la séance en cours ?")) {
    showScreen('selector');
  }
}
