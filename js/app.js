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
    playTone(frequency, type, duration, volume = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    beepShort() { this.playTone(600, 'square', 0.15, 0.3); },
    beepLong() { this.playTone(800, 'square', 0.4, 0.1); },
    beepEnd() { this.playTone(400, 'square', 0.5, 0.1); }
};

let wakeLock = null;
const WakeLockSys = {
    async request() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
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

const WorkoutEngine = {
    state: 'STOPPED', 
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
        AudioSys.init(); 
        WakeLockSys.request();
        
        this.routine = routine;
        this.maxRounds = routine.rounds;
        this.round = 1;
        this.exIndex = 0;
        this.isPaused = false;
        this.startTime = Date.now();
        
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
            if (this.timeLeft > 0 && this.timeLeft <= 3 && (this.state === 'PREP' || this.state === 'TRANSITION' || this.state === 'REST' || this.state === 'WORK')) {
                AudioSys.beepShort();
            }
            this.updateUI();
            return;
        }
        this.advanceState();
    },

    advanceState() {
        if (this.state === 'PREP' || this.state === 'TRANSITION' || this.state === 'REST') {
            AudioSys.beepLong();
            this.state = 'WORK';
            this.timeLeft = this.routine.exercises[this.exIndex].duration;
        } 
        else if (this.state === 'WORK') {
            AudioSys.beepEnd();
            this.exIndex++;
            
            if (this.exIndex >= this.routine.exercises.length) {
                this.round++;
                if (this.round > this.maxRounds) {
                    this.endWorkout();
                    return; 
                } else {
                    this.state = 'REST';
                    this.timeLeft = 60; 
                    this.exIndex = 0; 
                }
            } else {
                this.state = 'TRANSITION';
                this.timeLeft = 10; 
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
        const imageEl = document.getElementById('workout-image');
        const ninjaEl = document.getElementById('workout-ninja');

        switch (this.state) {
            case 'PREP':
                statusEl.textContent = 'Préparation';
                titleEl.textContent = 'Mettez-vous en place';
                imageEl.src = this.routine.exercises[0].image; 
                imageEl.style.display = 'block';
                ninjaEl.src = 'assets/mascot/ninja-prep.png';
                ninjaEl.classList.remove('large');
                break;
            case 'WORK':
                const currentEx = this.routine.exercises[this.exIndex];
                statusEl.textContent = 'En cours';
                titleEl.textContent = currentEx.name;
                imageEl.src = currentEx.image;
                imageEl.style.display = 'block';
                ninjaEl.src = 'assets/mascot/ninja-active.png';
                ninjaEl.classList.remove('large');
                break;
            case 'TRANSITION':
                const nextEx = this.routine.exercises[this.exIndex];
                statusEl.textContent = 'Mise en place';
                titleEl.textContent = `À suivre : ${nextEx.name}`;
                imageEl.src = nextEx.image;
                imageEl.style.display = 'block';
                ninjaEl.src = 'assets/mascot/ninja-prep.png';
                ninjaEl.classList.remove('large');
                break;
            case 'REST':
                statusEl.textContent = 'Récupération';
                titleEl.textContent = 'Soufflez un peu !';
                imageEl.style.display = 'none'; 
                ninjaEl.src = 'assets/mascot/ninja-rest.png';
                ninjaEl.classList.add('large');
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
        
        const mins = Math.floor(this.totalDuration / 60);
        const secs = this.totalDuration % 60;
        document.getElementById('summary-duration').textContent = `${mins} min ${secs} sec`;
        document.getElementById('summary-rounds').textContent = `${this.maxRounds}/${this.maxRounds}`;
        document.getElementById('summary-exercises').textContent = this.routine.exercises.length;
        
        App.saveHistoryEntry({
            date: new Date().toLocaleDateString('fr-FR'),
            routineName: this.routine.name,
            duration: `${mins} min ${secs} sec`,
            rounds: this.maxRounds,
            exercisesCount: this.routine.exercises.length
        });
        
        App.showScreen('screen-summary');
    },

    forceStop() {
        clearInterval(this.timerId);
        this.state = 'STOPPED';
        WakeLockSys.release();
    }
};

const App = {
    routines: [],
    editingRoutineId: null,
    builderExercises: [], 

    init() {
        this.loadRoutines();
        this.renderHome();
        this.renderCatalogue();
        
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
        if(screenId === 'screen-history') this.renderHistory();
    },

    loadRoutines() {
        const data = localStorage.getItem('ninja_routines');
        if (data) {
            this.routines = JSON.parse(data);
        } else {
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

    loadHistory() {
        const data = localStorage.getItem('ninja_force_history');
        return data ? JSON.parse(data) : [];
    },

    saveHistoryEntry(entry) {
        const history = this.loadHistory();
        history.unshift(entry);
        const trimmed = history.slice(0, 20);
        localStorage.setItem('ninja_force_history', JSON.stringify(trimmed));
    },

    renderHistory() {
        const container = document.getElementById('history-list');
        container.innerHTML = '';
        const history = this.loadHistory();

        if (history.length === 0) {
            container.innerHTML = '<p class="text-muted">Aucune séance enregistrée pour l\'instant.</p>';
            return;
        }

        history.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'history-card';
            div.innerHTML = `
                <div class="history-date">${entry.date}</div>
                <div class="history-name">${this.escapeHtml(entry.routineName)}</div>
                <div class="history-meta">${entry.rounds} tours • ${entry.exercisesCount} exercices • ${entry.duration}</div>
            `;
            container.appendChild(div);
        });
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    estimateDuration(routine) {
        const N = routine.exercises.length;
        const R = routine.rounds;
        const workTotal = routine.exercises.reduce((sum, ex) => sum + ex.duration, 0) * R;
        const transitions = (N - 1) * 10 * R;
        const rests = (R - 1) * 60;
        const totalSeconds = 10 + workTotal + transitions + rests;
        const mins = Math.round(totalSeconds / 60);
        return `≈ ${mins} min`;
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
            
            const exosListHTML = routine.exercises.map(ex => `<li>${ex.name}</li>`).join('');

            card.innerHTML = `
                <div class="routine-title">${this.escapeHtml(routine.name)}</div>
                <div class="routine-meta">${routine.exercises.length} exercices • ${routine.rounds} tours • ${this.estimateDuration(routine)}</div>
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
                <div class="exo-item-info">
                    <img src="${exo.image}" class="exo-thumb" alt="${exo.name}"> 
                    <span>${exo.name}</span>
                </div>
                <button class="btn-primary btn-small" onclick="App.addToBuilder('${exo.id}')">+</button>
            `;
            container.appendChild(div);
        });
    },

    addToBuilder(exoId) {
        const exo = ExercicesDB.find(e => e.id === exoId);
        if(exo) {
            this.builderExercises.push({...exo}); 
            this.renderBuilderSelected();
        }
    },

    removeFrameBuilder(index) {
        this.builderExercises.splice(index, 1);
        this.renderBuilderSelected();
    },

    moveBuilderExo(index, direction) {
        if (direction === -1 && index > 0) {
            const temp = this.builderExercises[index];
            this.builderExercises[index] = this.builderExercises[index - 1];
            this.builderExercises[index - 1] = temp;
        } else if (direction === 1 && index < this.builderExercises.length - 1) {
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
                <div class="exo-item-info">
                    <img src="${exo.image}" class="exo-thumb" alt="${exo.name}"> 
                    <span>${exo.name}</span>
                </div>
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
            const index = this.routines.findIndex(r => r.id === this.editingRoutineId);
            this.routines[index] = newRoutine;
        } else {
            this.routines.push(newRoutine);
        }

        this.saveToStorage();
        this.showScreen('screen-home');
    }
};

window.onload = () => App.init();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((reg) => console.log('Service Worker enregistré :', reg.scope))
            .catch((err) => console.warn('Erreur Service Worker :', err));
    });
}
