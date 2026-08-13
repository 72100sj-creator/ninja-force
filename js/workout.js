// Moteur Audio Web API (Aucun fichier mp3 requis !)
const AudioEngine = {
    ctx: null,
    init: () => {
        if (!AudioEngine.ctx) {
            AudioEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (AudioEngine.ctx.state === 'suspended') {
            AudioEngine.ctx.resume();
        }
    },
    playTone: (freq, type, duration, vol=0.1) => {
        if (!AudioEngine.ctx) return;
        try {
            const osc = AudioEngine.ctx.createOscillator();
            const gain = AudioEngine.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, AudioEngine.ctx.currentTime);
            gain.gain.setValueAtTime(vol, AudioEngine.ctx.currentTime);
            osc.connect(gain);
            gain.connect(AudioEngine.ctx.destination);
            osc.start();
            osc.stop(AudioEngine.ctx.currentTime + duration);
        } catch(e) {}
    },
    beepStart: () => AudioEngine.playTone(880, 'sine', 0.4, 0.2), // Go! (Aigu)
    beepEnd: () => AudioEngine.playTone(440, 'square', 0.4, 0.1), // Repos (Grave)
    beepTick: () => AudioEngine.playTone(600, 'sine', 0.1, 0.1) // Compte à rebours 3-2-1
};

const WorkoutEngine = {
    program: [],
    currentExIndex: 0,
    currentRound: 1,
    totalRounds: 2,
    timer: null,
    timeLeft: 0,
    isPaused: false,
    phase: 'prep',
    startTime: null,

    init: (programIds) => {
        WorkoutEngine.program = programIds.map(id => EXERCISES[id]);
        WorkoutEngine.currentExIndex = 0;
        WorkoutEngine.currentRound = 1;
        WorkoutEngine.startTime = Date.now();
        WorkoutEngine.startPhase('prep', 10);
    },

    startPhase: (phase, duration) => {
        WorkoutEngine.phase = phase;
        WorkoutEngine.timeLeft = duration;
        WorkoutEngine.updateUI();

        // Réveil de l'audio si nécessaire
        if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') AudioEngine.ctx.resume();

        // Signaux sonores
        if (phase === 'work') {
            AudioEngine.beepStart();
        } else if (phase === 'rest' || phase === 'round_rest') {
            AudioEngine.beepEnd();
        }

        if (phase === 'work' && WorkoutEngine.program[WorkoutEngine.currentExIndex].type === 'reps') {
            document.getElementById('workout-value').innerText = WorkoutEngine.program[WorkoutEngine.currentExIndex].value;
            document.getElementById('workout-unit').innerText = 'Répétitions';
            document.getElementById('btn-workout-action').innerText = 'VALIDER';
            document.getElementById('btn-workout-action').style.display = 'block';
        } else {
            document.getElementById('btn-workout-action').style.display = (phase === 'prep' || phase.includes('rest')) ? 'block' : 'none';
            document.getElementById('btn-workout-action').innerText = 'PASSER';
            WorkoutEngine.startTimer();
        }
    },

    startTimer: () => {
        clearInterval(WorkoutEngine.timer);
        WorkoutEngine.timer = setInterval(() => {
            if (!WorkoutEngine.isPaused) {
                WorkoutEngine.timeLeft--;
                WorkoutEngine.updateUI();
                
                // Bips des 3 dernières secondes
                if (WorkoutEngine.timeLeft > 0 && WorkoutEngine.timeLeft <= 3) {
                    AudioEngine.beepTick();
                }

                if (WorkoutEngine.timeLeft <= 0) {
                    clearInterval(WorkoutEngine.timer);
                    WorkoutEngine.nextStep();
                }
            }
        }, 1000);
    },

    nextStep: () => {
        clearInterval(WorkoutEngine.timer);
        if (WorkoutEngine.phase === 'prep' || WorkoutEngine.phase === 'rest') {
            WorkoutEngine.startPhase('work', WorkoutEngine.program[WorkoutEngine.currentExIndex].value);
        } else if (WorkoutEngine.phase === 'work') {
            WorkoutEngine.currentExIndex++;
            if (WorkoutEngine.currentExIndex >= WorkoutEngine.program.length) {
                if (WorkoutEngine.currentRound >= WorkoutEngine.totalRounds) {
                    WorkoutEngine.finish();
                } else {
                    WorkoutEngine.currentRound++;
                    WorkoutEngine.currentExIndex = 0;
                    WorkoutEngine.startPhase('round_rest', 40);
                }
            } else {
                WorkoutEngine.startPhase('rest', 30);
            }
        } else if (WorkoutEngine.phase === 'round_rest') {
            WorkoutEngine.startPhase('work', WorkoutEngine.program[WorkoutEngine.currentExIndex].value);
        }
    },

    togglePause: () => {
        WorkoutEngine.isPaused = !WorkoutEngine.isPaused;
        document.getElementById('btn-workout-pause').innerText = WorkoutEngine.isPaused ? '▶ Reprendre' : '⏸ Pause';
    },

    finish: () => {
        const durationMin = Math.round((Date.now() - WorkoutEngine.startTime) / 60000);
        Storage.saveSession(durationMin, WorkoutEngine.program.length * WorkoutEngine.totalRounds);
        AudioEngine.beepStart(); // Bip de victoire
        alert('🎉 Séance terminée, Ninja !');
        App.showView('view-home');
        App.renderHistory();
    },

    updateUI: () => {
        const titleEl = document.getElementById('workout-title');
        const phaseEl = document.getElementById('workout-phase');
        document.getElementById('workout-round').innerText = `Tour ${WorkoutEngine.currentRound}/${WorkoutEngine.totalRounds}`;
        
        if (WorkoutEngine.phase === 'work') {
            const ex = WorkoutEngine.program[WorkoutEngine.currentExIndex];
            titleEl.innerText = ex.name;
            phaseEl.innerText = `Exercice ${WorkoutEngine.currentExIndex + 1}/${WorkoutEngine.program.length}`;
            if (ex.type === 'time') {
                document.getElementById('workout-value').innerText = WorkoutEngine.timeLeft;
                document.getElementById('workout-unit').innerText = 'secondes';
            }
        } else {
            document.getElementById('workout-value').innerText = WorkoutEngine.timeLeft;
            document.getElementById('workout-unit').innerText = 'secondes';
            if (WorkoutEngine.phase === 'prep') { titleEl.innerText = 'Prépare-toi !'; phaseEl.innerText = 'Échauffement'; }
            if (WorkoutEngine.phase === 'rest') { 
                const nextEx = WorkoutEngine.program[WorkoutEngine.currentExIndex];
                titleEl.innerText = `Repos (Suivant: ${nextEx.name})`; 
                phaseEl.innerText = 'Récupération'; 
            }
            if (WorkoutEngine.phase === 'round_rest') { titleEl.innerText = 'Repos long'; phaseEl.innerText = 'Fin du tour'; }
        }
    }
};
