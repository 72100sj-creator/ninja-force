// --- BIBLIOTHÈQUE DES 16 EXERCICES AVEC CONSEILS ---
const ALL_EXERCISES = [
  { id: 'squat', name: 'Squat', desc: 'Fléchis les genoux en gardant le dos droit.', tip: 'Garde bien le poids sur les talons et la poitrine ouverte.', img: 'assets/exercises/01-squat.jpg' },
  { id: 'fentes', name: 'Fentes', desc: 'Pas en avant, fléchis les deux genoux à 90°.', tip: 'Ne touche pas le genou arrière violemment par terre.', img: 'assets/exercises/02-fentes.jpg' },
  { id: 'pont', name: 'Pont fessier', desc: 'Allongé sur le dos, soulève le bassin vers le haut.', tip: 'Contracte bien les fessiers et maintiens 1 seconde en haut.', img: 'assets/exercises/03-pont.jpg' },
  { id: 'pompes', name: 'Pompes', desc: 'Corps gainé, descends la poitrine vers le sol.', tip: 'Garde les coudes près du corps pour protéger tes épaules.', img: 'assets/exercises/04-pompes.jpg' },
  { id: 'dips', name: 'Dips chaise', desc: 'Mains sur un support stable, fléchis et tends les bras.', tip: 'Garde le dos près du support et fléchis les bras à 90°.', img: 'assets/exercises/05-dips.jpg' },
  { id: 'birddog', name: 'Bird Dog', desc: 'En appui quadrupedal, tends le bras et la jambe opposés.', tip: 'Ne creuse pas le dos, cherche l’alignement parfait.', img: 'assets/exercises/06-birddog.jpg' },
  { id: 'ytw', name: 'YTW', desc: 'Mouvements des bras allongés sur le ventre pour le haut du dos.', tip: 'Serre les omoplates, fais un mouvement lent et contrôlé.', img: 'assets/exercises/07-ytw.jpg' },
  { id: 'planche', name: 'Planche / Gainage', desc: 'Appuis sur les avant-bras et pointes de pieds, corps aligné.', tip: 'Aspire le ventre et aligne la tête, le bassin et les talons.', img: 'assets/exercises/08-planche.jpg' },
  { id: 'planchelat', name: 'Planche latérale', desc: 'En appui sur un seul avant-bras, corps de profil bien aligné.', tip: 'Repousse bien le sol avec l’avant-bras pour ne pas t’affaisser.', img: 'assets/exercises/09-planchelat.jpg' },
  { id: 'deadbug', name: 'Dead Bug', desc: 'Sur le dos, descends alternativement bras et jambe opposés.', tip: 'Plaque fermement le bas du dos contre le sol en permanence.', img: 'assets/exercises/10-deadbug.jpg' },
  { id: 'pike', name: 'Pike Push-ups', desc: 'Pompes inclinées fesses en l’air pour cibler les épaules.', tip: 'Regarde entre tes pieds et pousse le sol vers le haut.', img: 'assets/exercises/11-pike.jpg' },
  { id: 'commando', name: 'Commando', desc: 'Transition dynamique entre planche sur les coudes et sur les mains.', tip: 'Garde les hanches stables, évite de te balancer de gauche à droite.', img: 'assets/exercises/12-commando.jpg' },
  { id: 'mollets', name: 'Mollets', desc: 'Élévations sur la pointe des pieds pour renforcer les mollets.', tip: 'Monte le plus haut possible sur la pointe des pieds.', img: 'assets/exercises/13-mollets.jpg' },
  { id: 'climbers', name: 'Mountain Climbers', desc: 'En position de planche, ramène alternativement les genoux vers la poitrine.', tip: 'Garde les épaules bien au-dessus des mains, rythme régulier.', img: 'assets/exercises/14-climbers.jpg' },
  { id: 'jacks', name: 'Jumping Jacks', desc: 'Saut écarté avec élévation des bras pour dynamiser le rythme.', tip: 'Amortis bien tes sauts sur l’avant des pieds.', img: 'assets/exercises/15-jacks.jpg' },
  { id: 'genoux', name: 'Montées de genoux', desc: 'Sur place, monte les genoux alternativement vers la poitrine.', tip: 'Garde le buste droit et monte les genoux à hauteur de bassin.', img: 'assets/exercises/16-genoux.jpg' }
];

// --- ÉTAT DE L'APPLICATION ---
let routines = JSON.parse(localStorage.getItem('ninja_routines')) || [
  {
    id: 'default-routine',
    name: 'Routine Ninja Classique',
    rounds: 3,
    exerciseIds: ['squat', 'pompes', 'fentes', 'planche']
  }
];

let activeRoutine = null;
let currentRound = 1;
let currentIndex = 0;
let timerInterval = null;
let timeLeft = 30;
let isPaused = false;
let workflowState = 'initial_setup'; // 'initial_setup', 'exercise', 'mise_en_place'

// État temporaire du créateur de séance (v1.3 - ordre personnalisable)
let creatorSelectedIds = [];

// Wake Lock API & Audio Context global
let wakeLock = null;
let audioCtx = null;

// --- SÉLECTION DES ÉLÉMENTS HTML ---
const screens = {
  selector: document.getElementById('routine-selector-screen'),
  creator: document.getElementById('routine-creator-screen'),
  workout: document.getElementById('workout-screen'),
  completion: document.getElementById('completion-screen'),
  library: document.getElementById('library-screen')
};

// --- CALCUL DU TEMPS ESTIMÉ ---
function calculateDurationText(rounds, exerciseCount) {
  if (exerciseCount === 0) return "0 min";
  const totalSeconds = 10 + (rounds * exerciseCount * (30 + 15));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds}s`;
}

// --- INITIALISATION AUDIO ROBUSTE (iOS Safari) ---
function initAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {}
}

function playBeep() {
  try {
    initAudio();
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

// --- WAKE LOCK API ---
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {}
}

async function releaseWakeLock() {
  try {
    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (err) {}
}

document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

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
    const duration = calculateDurationText(routine.rounds, routine.exerciseIds.length);
    const card = document.createElement('div');
    card.className = 'routine-card';
    card.innerHTML = `
      <div>
        <h3>${routine.name}</h3>
        <p>${routine.rounds} tours • ${routine.exerciseIds.length} exercices • ⏱️ ~${duration}</p>
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
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-abandon').addEventListener('click', abandonWorkout);
  document.getElementById('btn-home').addEventListener('click', () => {
    releaseWakeLock();
    showScreen('selector');
  });
}

// --- OUVRIR LE CRÉATEUR DE SÉANCE (v1.3) ---
function openCreator() {
  document.getElementById('routine-name').value = '';
  document.getElementById('routine-rounds').value = 3;
  
  // Par défaut, tous les exercices sont sélectionnés au départ
  creatorSelectedIds = ALL_EXERCISES.map(ex => ex.id);
  renderCreatorForm();

  document.getElementById('routine-rounds').oninput = updateLiveEstimatedTime;

  showScreen('creator');
}

function renderCreatorForm() {
  // Rendu de la liste ordonnée avec flèches
  const orderedContainer = document.getElementById('ordered-exercises-list');
  orderedContainer.innerHTML = '';

  if (creatorSelectedIds.length === 0) {
    orderedContainer.innerHTML = '<p style="color: #888; font-size: 0.85rem; text-align: center; margin: 5px 0;">Aucun exercice sélectionné</p>';
  } else {
    creatorSelectedIds.forEach((id, index) => {
      const ex = ALL_EXERCISES.find(e => e.id === id);
      if (!ex) return;

      const row = document.createElement('div');
      row.className = 'ordered-item';
      row.innerHTML = `
        <div class="ordered-item-left">
          <span class="ordered-index">${index + 1}.</span>
          <span class="ordered-name">${ex.name}</span>
        </div>
        <div class="ordered-btns">
          <button type="button" class="btn-reorder" onclick="moveExercise(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="btn-reorder" onclick="moveExercise(${index}, 1)" ${index === creatorSelectedIds.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      `;
      orderedContainer.appendChild(row);
    });
  }

  // Rendu des cases à cocher pour filtrer/sélectionner
  const checkboxesContainer = document.getElementById('exercise-checkboxes-list');
  checkboxesContainer.innerHTML = '';

  ALL_EXERCISES.forEach(ex => {
    const isChecked = creatorSelectedIds.includes(ex.id);
    const item = document.createElement('div');
    item.className = 'creator-exercise-item';
    item.innerHTML = `
      <label class="creator-checkbox-label">
        <input type="checkbox" value="${ex.id}" ${isChecked ? 'checked' : ''} class="exercise-cb">
        <span class="creator-exercise-name">${ex.name}</span>
      </label>
    `;
    checkboxesContainer.appendChild(item);
  });

  checkboxesContainer.querySelectorAll('.exercise-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.value;
      if (e.target.checked) {
        if (!creatorSelectedIds.includes(id)) creatorSelectedIds.push(id);
      } else {
        creatorSelectedIds = creatorSelectedIds.filter(i => i !== id);
      }
      renderCreatorForm();
      updateLiveEstimatedTime();
    });
  });

  updateLiveEstimatedTime();
}

// Fonction globale pour déplacer un exercice dans le créateur
window.moveExercise = function(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= creatorSelectedIds.length) return;
  const temp = creatorSelectedIds[index];
  creatorSelectedIds[index] = creatorSelectedIds[newIndex];
  creatorSelectedIds[newIndex] = temp;
  renderCreatorForm();
};

// --- METTRE À JOUR LE TEMPS ESTIMÉ EN DIRECT ---
function updateLiveEstimatedTime() {
  const rounds = parseInt(document.getElementById('routine-rounds').value, 10) || 1;
  const timeText = calculateDurationText(rounds, creatorSelectedIds.length);
  document.getElementById('estimated-time-display').textContent = timeText;
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
      <p><strong>Description :</strong> ${ex.desc}</p>
      <p class="exercise-tip">💡 <strong>Conseil Ninja :</strong> ${ex.tip}</p>
    `;
    container.appendChild(card);
  });

  showScreen('library');
}

// --- SAUVEGARDER UNE NOUVELLE SÉANCE ---
function saveNewRoutine() {
  const nameInput = document.getElementById('routine-name').value.trim();
  const roundsInput = parseInt(document.getElementById('routine-rounds').value, 10);

  if (!nameInput) {
    alert('Veuillez donner un nom à votre séance.');
    return;
  }

  if (creatorSelectedIds.length === 0) {
    alert('Veuillez sélectionner au moins un exercice.');
    return;
  }

  const newRoutine = {
    id: 'routine_' + Date.now(),
    name: nameInput,
    rounds: isNaN(roundsInput) || roundsInput < 1 ? 3 : roundsInput,
    exerciseIds: [...creatorSelectedIds]
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

  // Initialisation audio au clic (déverrouillage iOS Safari)
  initAudio();
  requestWakeLock();

  currentRound = 1;
  currentIndex = 0;
  workflowState = 'initial_setup';

  document.getElementById('current-routine-title').textContent = activeRoutine.name;
  showScreen('workout');
  loadStep();
}

// --- CHARGER L'ÉTAPE COURANTE ---
function loadStep() {
  clearInterval(timerInterval);
  isPaused = false;
  document.getElementById('btn-pause').textContent = 'Pause';

  if (workflowState === 'initial_setup') {
    timeLeft = 10;
    document.getElementById('exercise-name').textContent = "⏱️ Mise en place";
    
    const firstExId = activeRoutine.exerciseIds[0];
    const firstExData = ALL_EXERCISES.find(e => e.id === firstExId);
    
    document.getElementById('exercise-desc').textContent = firstExData ? `Premier exercice : ${firstExData.name}` : "Prépare-toi !";
    document.getElementById('exercise-img').src = firstExData ? firstExData.img : "";
  } 
  else if (workflowState === 'mise_en_place') {
    timeLeft = 15;
    document.getElementById('exercise-name').textContent = "⏱️ Mise en place";
    
    const nextIndex = (currentIndex + 1) % activeRoutine.exerciseIds.length;
    const nextExId = activeRoutine.exerciseIds[nextIndex];
    const nextExData = ALL_EXERCISES.find(e => e.id === nextExId);
    
    document.getElementById('exercise-desc').textContent = nextExData ? `Prochain exercice : ${nextExData.name}` : "Prépare-toi !";
    document.getElementById('exercise-img').src = nextExData ? nextExData.img : "";
  } 
  else {
    timeLeft = 30;
    const exerciseId = activeRoutine.exerciseIds[currentIndex];
    const exerciseData = ALL_EXERCISES.find(e => e.id === exerciseId);

    if (!exerciseData) return;

    document.getElementById('exercise-name').textContent = exerciseData.name;
    document.getElementById('exercise-desc').textContent = exerciseData.desc;
    document.getElementById('exercise-img').src = exerciseData.img;
  }

  document.getElementById('round-counter').textContent = `Tour ${currentRound}/${activeRoutine.rounds}`;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 3 && timeLeft > 0) {
        playBeep();
      }

      if (timeLeft <= 0) {
        playBeep();
        clearInterval(timerInterval);
        handleTimerEnd();
      }
    }
  }, 1000);
}

// --- GESTION DE LA FIN D'UNE ÉTAPE (v1.3 corrigée) ---
function handleTimerEnd() {
  if (workflowState === 'initial_setup') {
    workflowState = 'exercise';
    loadStep();
  } 
  else if (workflowState === 'mise_en_place') {
    workflowState = 'exercise';
    currentIndex++;
    loadStep();
  } 
  else {
    // Fin d'un exercice (30s)
    // Vérifier si c'est le tout dernier exercice du tout dernier tour
    if (currentIndex === activeRoutine.exerciseIds.length - 1 && currentRound === activeRoutine.rounds) {
      releaseWakeLock();
      showCompletionScreen();
      return;
    }

    // Sinon, avancer normalement
    currentIndex++;
    if (currentIndex >= activeRoutine.exerciseIds.length) {
      currentIndex = 0;
      currentRound++;
    }

    workflowState = 'mise_en_place';
    loadStep();
  }
}

// --- AFFICHER L'ÉCRAN DE FIN DE SÉANCE ---
function showCompletionScreen() {
  const totalExercises = activeRoutine.exerciseIds.length;
  const totalRounds = activeRoutine.rounds;
  const totalBlocks = totalExercises * totalRounds;
  const durationText = calculateDurationText(totalRounds, totalExercises);

  document.getElementById('stat-duration').textContent = durationText;
  document.getElementById('stat-exercises').textContent = totalExercises;
  document.getElementById('stat-rounds').textContent = totalRounds;
  document.getElementById('stat-total').textContent = totalBlocks;

  showScreen('completion');
}

function nextStep() {
  clearInterval(timerInterval);
  handleTimerEnd();
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

function abandonWorkout() {
  clearInterval(timerInterval);
  releaseWakeLock();
  if (confirm("Veux-tu abandonner la séance en cours ?")) {
    showScreen('selector');
  }
}
