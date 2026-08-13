const App = {
    init: () => {
        App.bindNavigation();
        App.renderLibrary();
        App.renderHistory();

        // Événements Accueil
        document.getElementById('btn-start-home').addEventListener('click', () => {
            App.showView('view-workout');
            WorkoutEngine.init(Storage.getProgram());
        });

        // Événements Séance
        document.getElementById('btn-workout-action').addEventListener('click', WorkoutEngine.nextStep);
        document.getElementById('btn-workout-pause').addEventListener('click', WorkoutEngine.togglePause);
        document.getElementById('btn-workout-quit').addEventListener('click', () => {
            if(confirm("Quitter la séance en cours ?")) {
                clearInterval(WorkoutEngine.timer);
                App.showView('view-home');
            }
        });
        document.getElementById('btn-workout-help').addEventListener('click', () => {
            if(!WorkoutEngine.isPaused) WorkoutEngine.togglePause();
            const ex = WorkoutEngine.program[WorkoutEngine.currentExIndex];
            App.showModal(ex.id);
        });
        document.getElementById('btn-close-modal').addEventListener('click', () => {
            document.getElementById('exercise-modal').classList.remove('active');
        });
        document.getElementById('btn-save-program').addEventListener('click', App.saveCustomProgram);
    },

    bindNavigation: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                App.showView(e.currentTarget.dataset.target);
            });
        });
    },

    showView: (viewId) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    },

    renderLibrary: () => {
        const container = document.getElementById('exercises-list');
        const currentProgram = Storage.getProgram();
        container.innerHTML = '';
        
        Object.values(EXERCISES).forEach(ex => {
            const isChecked = currentProgram.includes(ex.id) ? 'checked' : '';
            const div = document.createElement('div');
            div.className = 'exercise-item';
            div.innerHTML = `
                <div class="exercise-item-info">
                    <h3>${ex.name}</h3>
                    <p>${ex.target}</p>
                    <button class="btn-small" onclick="App.showModal('${ex.id}')" style="margin-top:8px;">❔ Fiche</button>
                </div>
                <input type="checkbox" class="exercise-checkbox" value="${ex.id}" ${isChecked} onchange="App.checkProgramSelection()">
            `;
            container.appendChild(div);
        });
    },

    checkProgramSelection: () => {
        const checked = document.querySelectorAll('.exercise-checkbox:checked').length;
        const btn = document.getElementById('btn-save-program');
        btn.innerText = `Enregistrer (${checked}/8)`;
        btn.style.display = checked === 8 ? 'block' : 'none';
        btn.style.opacity = checked === 8 ? '1' : '0.5';
        btn.disabled = checked !== 8;
    },

    saveCustomProgram: () => {
        const selected = Array.from(document.querySelectorAll('.exercise-checkbox:checked')).map(cb => cb.value);
        if (selected.length === 8) {
            Storage.saveProgram(selected);
            alert("Programme enregistré !");
        }
    },

    renderHistory: () => {
        const container = document.getElementById('history-list');
        const history = Storage.getHistory();
        container.innerHTML = history.length === 0 ? '<p class="subtitle">Aucune séance terminée pour le moment.</p>' : '';
        history.forEach(session => {
            container.innerHTML += `<div class="card"><p><strong>${session.date}</strong></p><p>Durée : ${session.duration} min</p><p>Exos validés : ${session.exercises}</p></div>`;
        });
    },

    showModal: (exId) => {
        const ex = EXERCISES[exId];
        const val = ex.type === 'reps' ? `${ex.value} Répétitions` : `${ex.value} Secondes`;
        document.getElementById('modal-body').innerHTML = `
            <h2>${ex.name}</h2>
            <div class="modal-img">
                <img src="${ex.img}" alt="${ex.name}" style="max-width:100%; max-height:200px; border-radius:10px;" onerror="this.outerHTML='<span style=\\'padding:50px\\'>Image locale absente</span>'">
            </div>
            <p class="modal-detail"><strong>Objectif :</strong> ${val}</p>
            <p class="modal-detail"><strong>Cible :</strong> ${ex.target}</p>
            <hr style="border:0; border-top:1px solid #333; margin:10px 0;">
            <p class="modal-detail"><strong>Exécution :</strong> ${ex.desc}</p>
            <p class="modal-detail"><strong>Respiration :</strong> ${ex.resp}</p>
            <p class="modal-detail"><strong>Erreur :</strong> ${ex.err}</p>
            <p class="modal-detail"><strong>Variante facile :</strong> ${ex.var}</p>
            <p class="modal-detail"><strong>🥷 Astuce :</strong> ${ex.tip}</p>
        `;
        document.getElementById('exercise-modal').classList.add('active');
    }
};

window.onload = App.init;