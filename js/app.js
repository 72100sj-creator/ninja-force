// NINJA FORCE V1.4 - Moteur Principal

/* --- GESTION AUDIO (Compatible iPhone/iOS) --- */
// Utilisation de l'API Web Audio pour garantir le fonctionnement sans fichiers mp3 bloqués.
const AudioSys = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    playTone(frequency, type, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime); // Volume modéré
        gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    beepShort() { this.playTone(600, 'sine', 0.1); },
    beepLong() { this.playTone(800, 'square', 0.4); },
    beepEnd() { this.playTone(400, 'square', 0.5); }
};

/* --- WAKE LOCK API --- */
let wakeLock = null;
const WakeLockSys = {
    async request() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activé');
            } catch (err) {
                console.warn('Wake Lock refusé:', err);
            }
        }
    },
    release() {
        if (wakeLock !== null) {
            wakeLock.release().then(() => wakeLock = null);
        }
    }
};

/* --- MOTEUR DE SÉANCE STRICT (State Machine) --- */
const WorkoutEngine = {
    state: 'STOPPED', // STOPPED, PREP, WORK, TRANSITION, REST, FINISHED
    routine: null,
    round: 1,
    maxRounds: 1,
    exIndex: 0,
    timeLeft: 0,
    timerId: null,
    isPaused: false,
    startTime: 0,
    totalDuration: 0,

    start(routine) {
        AudioSys.init(); // Déverrouille l'audio iOS au clic
        WakeLockSys.request();
        
        this.routine = routine;
        this.maxRounds = routine.rounds;
        this.round = 1;
        this.exIndex = 0;
        this.isPaused = false;
        this.startTime = Date.now();
        
        // État initial
        this.state = 'PREP';
        this.timeLeft = 10;
        
        App.showScreen('screen-workout');
        this.updateUI();
        
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = setInterval(() => this.tick(), 1000);
    },

    tick() {
        if (this.isPaused) return;

        if (this.timeLeft > 0) {
            this.timeLeft--;
            
            // Bips sonores dans les 3 dernières secondes
            if (this.timeLeft > 0 && this.timeLeft <= 3 && (this.state === 'PREP' || this.state === 'TRANSITION' || this.state === 'REST' || this.state === 'WORK')) {
                AudioSys.beepShort();
            }
            this.updateUI();
            return;
        }

        // Le temps est écoulé, on passe à l'étape stricte suivante
        this.advanceState();
    },

    advanceState() {
        if (this.state === 'PREP' || this.state === 'TRANSITION' || this.state === 'REST') {
            // Début d'un exercice
            AudioSys.beepLong();
            this.state = 'WORK';
            this.timeLeft = this.routine.exercises[this.exIndex].duration;
        } 
        else if (this.state === 'WORK') {
            // Fin d'un exercice
            AudioSys.beepEnd();
            this.exIndex++;
            
            if (this.exIndex >= this.routine.exercises.length) {
                // Fin du tour complet
                this.round++;
                if (this.round > this.maxRounds) {
                    // Fin totale de la séance
                    this.endWorkout();
                    return; // Arrêt immédiat
                } else {
                    // Récupération entre les tours
                    this.state = 'REST';
                    this.timeLeft = 60; // 60 secondes strictes
                    this.exIndex = 0; // Réinitialise l'index pour le prochain tour
                }
            } else {
                // Passage à l'exercice suivant (même tour)
                this.state = 'TRANSITION';
                this.timeLeft = 5; // 5 secondes de mise en place
            }
        }
        this.updateUI();
    },

    updateUI() {
        document.getElementById('workout-timer').textContent = this.timeLeft;
        document.getElementById('workout-progress-tours').textContent = `Tour ${Math.min(this.round, this.maxRounds)}/${this.maxRounds}`;
        
        const exoDisplayIndex = Math.min(this.exIndex + 1, this.routine.exercises.length);
        document.getElementById('workout-progress-exos').textContent = `Exercice ${exoDisplayIndex}/${this.routine.exercises.length}`;

        const statusEl = document.getElementById('workout-status');
        const titleEl = document.getElementById('workout-exercise-name');
        const emojiEl = document.getElementById('workout-emoji');

        // Affichage conditionné strictement par l'état
        switch (this.state) {
            case 'PREP':
                statusEl.textContent = '⏱️ Préparation';
                titleEl.textContent = 'Mettez-vous en place';
                emojiEl.textContent = '🥷';
                break;
            case 'WORK':
                const currentEx = this.routine.exercises[this.exIndex];
                statusEl.textContent = '🔥 En cours';
                titleEl.textContent = currentEx.name;
                emojiEl.textContent = currentEx.emoji;
                break;
            case 'TRANSITION':
                const nextEx = this.routine.exercises[this.exIndex];
                statusEl.textContent = '⏱️ Mise en place';
                titleEl.textContent = `À suivre : ${nextEx.name}`;
                emojiEl.textContent = nextEx.emoji;
                break;
            case 'REST':
                statusEl.textContent = '☕ Récupération';
                titleEl.textContent = 'Soufflez un peu !';
                emojiEl.textContent = '🥷';
                break;
        }
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('btn-pause').textContent = this.isPaused ? "Reprendre" : "Pause";
        document.getElementById('btn-pause').className = this.isPaused ? "btn-success" : "btn-secondary";
    },

    abandon() {
        if(confirm("Voulez-vous vraiment abandonner la séance ?")) {
            this.forceStop();
            App.showScreen('screen-home');
        }
    },

    endWorkout() {
        this.totalDuration = Math.floor((Date.now() - this.startTime) / 1000);
        this.forceStop();
        
        // Formater la durée
        const mins = Math.floor(this.totalDuration / 60);
        const secs = this.totalDuration % 60;
        document.getElementById('summary-duration').textContent = `${mins} min ${secs} sec`;
        document.getElementById('summary-rounds').textContent = `${this.maxRounds}/${this.maxRounds}`;
        document.getElementById('summary-exercises').textContent = this.routine.exercises.length;
        
        App.showScreen('screen-summary');
    },

    forceStop() {
        clearInterval(this.timerId);
        this.state = 'STOPPED';
        WakeLockSys.release();
    }
};

/* --- LOGIQUE APPLICATION ET SAUVEGARDE --- */
const App = {
    routines: [],
    editingRoutineId: null,
    builderExercises: [], // Liste des exos sélectionnés dans le constructeur

    init() {
        this.loadRoutines();
        this.renderHome();
        this.renderCatalogue();
        
        // Gérer le réveil pour le Wake Lock
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && WorkoutEngine.state !== 'STOPPED') {
                WakeLockSys.request();
            }
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        if(screenId === 'screen-home') this.renderHome();
    },

    loadRoutines() {
        const data = localStorage.getItem('ninja_routines');
        if (data) {
            this.routines = JSON.parse(data);
        } else {
            // Routine par défaut pour les débutants
            this.routines = [{
                id: Date.now().toString(),
                name: "Routine Express",
                rounds: 3,
                exercises: [ExercicesDB[0], ExercicesDB[1], ExercicesDB[3]]
            }];
            this.saveToStorage();
        }
    },

    saveToStorage() {
        localStorage.setItem('ninja_routines', JSON.stringify(this.routines));
    },

    renderHome() {
        const container = document.getElementById('routines-list');
        container.innerHTML = '';

        if (this.routines.length === 0) {
            container.innerHTML = '<p class="text-muted">Aucune routine. Créez-en une !</p>';
            return;
        }

        this.routines.forEach(routine => {
            const card = document.createElement('div');
            card.className = 'routine-card';
            
            // Générer la liste à puces des exercices pour affichage rapide
            const exosListHTML = routine.exercises.map(ex => `<li>${ex.emoji} ${ex.name}</li>`).join('');

            card.innerHTML = `
                <div class="routine-title">${routine.name}</div>
                <div class="routine-meta">${routine.exercises.length} exercices • ${routine.rounds} tours</div>
                <ul class="routine-exercises-list">${exosListHTML}</ul>
                <div class="routine-actions">
                    <button class="btn-success" onclick="App.startRoutine('${routine.id}')">Démarrer</button>
                    <button class="btn-secondary" onclick="App.editRoutine('${routine.id}')">Modifier</button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    startRoutine(id) {
        const routine = this.routines.find(r => r.id === id);
        if(routine) WorkoutEngine.start(routine);
    },

    /* --- CONSTRUCTEUR DE ROUTINES --- */
    openBuilder() {
        this.editingRoutineId = null;
        this.builderExercises = [];
        document.getElementById('routine-name').value = '';
        document.getElementById('routine-rounds').value = 3;
        document.getElementById('builder-title').textContent = "Nouvelle Routine";
        this.renderBuilderSelected();
        this.showScreen('screen-builder');
    },

    editRoutine(id) {
        const routine = this.routines.find(r => r.id === id);
        if(!routine) return;
        
        this.editingRoutineId = routine.id;
        // Clonage profond pour ne pas modifier la source avant sauvegarde
        this.builderExercises = JSON.parse(JSON.stringify(routine.exercises));
        document.getElementById('routine-name').value = routine.name;
        document.getElementById('routine-rounds').value = routine.rounds;
        document.getElementById('builder-title').textContent = "Modifier la Routine";
        
        this.renderBuilderSelected();
        this.showScreen('screen-builder');
    },

    renderCatalogue() {
        const container = document.getElementById('catalogue-list');
        container.innerHTML = '';
        ExercicesDB.forEach(exo => {
            const div = document.createElement('div');
            div.className = 'exo-item';
            div.innerHTML = `
                <span><span class="emoji">${exo.emoji}</span> ${exo.name}</span>
                <button class="btn-primary btn-small" onclick="App.addToBuilder('${exo.id}')">+</button>
            `;
            container.appendChild(div);
        });
    },

    addToBuilder(exoId) {
        const exo = ExercicesDB.find(e => e.id === exoId);
        if(exo) {
            this.builderExercises.push({...exo}); // Ajout
            this.renderBuilderSelected();
        }
    },

    removeFrameBuilder(index) {
        this.builderExercises.splice(index, 1);
        this.renderBuilderSelected();
    },

    moveBuilderExo(index, direction) {
        if (direction === -1 && index > 0) {
            // Monter
            const temp = this.builderExercises[index];
            this.builderExercises[index] = this.builderExercises[index - 1];
            this.builderExercises[index - 1] = temp;
        } else if (direction === 1 && index < this.builderExercises.length - 1) {
            // Descendre
            const temp = this.builderExercises[index];
            this.builderExercises[index] = this.builderExercises[index + 1];
            this.builderExercises[index + 1] = temp;
        }
        this.renderBuilderSelected();
    },

    renderBuilderSelected() {
        const container = document.getElementById('selected-list');
        container.innerHTML = '';
        
        if (this.builderExercises.length === 0) {
            container.innerHTML = '<p class="text-muted text-center mt-20">Ajoutez des exercices depuis le catalogue.</p>';
            return;
        }

        this.builderExercises.forEach((exo, index) => {
            const div = document.createElement('div');
            div.className = 'exo-item';
            div.innerHTML = `
                <span><span class="emoji">${exo.emoji}</span> ${exo.name}</span>
                <div class="controls-order">
                    <button class="btn-secondary btn-small" onclick="App.moveBuilderExo(${index}, -1)">↑</button>
                    <button class="btn-secondary btn-small" onclick="App.moveBuilderExo(${index}, 1)">↓</button>
                    <button class="btn-danger btn-small" onclick="App.removeFrameBuilder(${index})">X</button>
                </div>
            `;
            container.appendChild(div);
        });
    },

    saveRoutine() {
        const nameInput = document.getElementById('routine-name').value.trim();
        const roundsInput = parseInt(document.getElementById('routine-rounds').value);

        if (!nameInput) { alert("Veuillez donner un nom à la routine."); return; }
        if (this.builderExercises.length === 0) { alert("La routine doit contenir au moins un exercice."); return; }
        if (roundsInput < 1) { alert("Il faut au moins 1 tour."); return; }

        const newRoutine = {
            id: this.editingRoutineId ? this.editingRoutineId : Date.now().toString(),
            name: nameInput,
            rounds: roundsInput,
            exercises: this.builderExercises
        };

        if (this.editingRoutineId) {
            // Mise à jour
            const index = this.routines.findIndex(r => r.id === this.editingRoutineId);
            this.routines[index] = newRoutine;
        } else {
            // Nouvelle création
            this.routines.push(newRoutine);
        }

        this.saveToStorage();
        this.showScreen('screen-home');
    }
};

// Initialisation au chargement
window.onload = () => App.init();
