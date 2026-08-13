const App = {
    currentSelection: [],
    
    init: () => {
        App.currentSelection = Storage.getProgram();
        App.bindNavigation();
        App.renderLibrary();
        App.renderHistory();

        // Clic sur COMMENCER
        document.getElementById('btn-start-home').addEventListener('click', () => {
            if (typeof AudioEngine !== 'undefined') AudioEngine.init(); // Autorise le son sur iPhone
            App.showView('view-workout');
            WorkoutEngine.init(Storage.getProgram()); // Charge le VRAI programme enregistré
        });

        // Boutons Séance
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
                
                // Recharge la sélection si on revient sur l'onglet Exercices
                if (e.currentTarget.dataset.target === 'view-library') {
                    App.currentSelection = Storage.getProgram();
                    App.renderLibrary();
                }
            });
        });
    },

    showView: (viewId) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    },

    // NOUVELLE GESTION DE LA BIBLIOTHÈQUE AVEC ORDRE
    renderLibrary: () => {
        const container = document.getElementById('exercises-list');
        
        container.innerHTML = `
            <div style="background:var(--bg-card); padding:15px; border-radius:12px; margin-bottom:20px;">
                <h3 style="margin-bottom:15px; color:var(--accent);">🏋️ Mon programme (${App.currentSelection.length}/8)</h3>
                <div id="selected-list" style="display:flex; flex-direction:column; gap:10px;"></div>
            </div>
            <h3 style="margin-bottom:15px;">📚 Bibliothèque</h3>
            <p class="subtitle" style="margin-top:-10px;">Ajoute des exercices pour compléter ton programme.</p>
            <div id="available-list" style="display:flex; flex-direction:column; gap:10px;"></div>
        `;
        
        const selectedList = document.getElementById('selected-list');
        const availableList = document.getElementById('available-list');
        
        if (App.currentSelection.length === 0) {
            selectedList.innerHTML = '<p class="subtitle">Aucun exercice sélectionné.</p>';
        }

        // Affichage des exercices CHOISIS (avec flèches d'ordre)
        App.currentSelection.forEach((id, index) => {
            const ex = EXERCISES[id];
            selectedList.innerHTML += `
                <div class="exercise-item" style="border: 1px solid var(--accent);">
                    <div style="font-weight:bold; font-size:1.2rem; color:var(--accent); width:25px;">${index + 1}.</div>
                    <div class="exercise-item-info" style="flex:1;">
                        <h3 style="font-size:1rem; margin:0;">${ex.name}</h3>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <button class="btn-small" style="padding:4px 8px;" onclick="App.moveOrder(${index}, -1)" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
                            <button class="btn-small" style="padding:4px 8px;" onclick="App.moveOrder(${index}, 1)" ${index === App.currentSelection.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
                        </div>
                        <button class="btn-small btn-danger" style="padding:8px;" onclick="App.removeEx('${id}')">✖</button>
                    </div>
                </div>
            `;
        });
        
        // Affichage des exercices DISPONIBLES
        Object.values(EXERCISES).forEach(ex => {
            if (!App.currentSelection.includes(ex.id)) {
                availableList.innerHTML += `
                    <div class="exercise-item">
                        <div class="exercise-item-info" style="flex:1;">
                            <h3>${ex.name}</h3>
                            <p>${ex.target}</p>
                            <button class="btn-small" onclick="App.showModal('${ex.id}')" style="margin-top:8px;">❔ Fiche</button>
                        </div>
                        <button class="btn-small" style="background:var(--accent); padding:10px;" onclick="App.addEx('${ex.id}')">➕ Ajouter</button>
                    </div>
                `;
            }
        });
        
        App.checkProgramSelection();
    },

    moveOrder: (index, dir) => {
        if (index + dir < 0 || index + dir >= App.currentSelection.length) return;
        const temp = App.currentSelection[index];
        App.currentSelection[index] = App.currentSelection[index + dir];
        App.currentSelection[index + dir] = temp;
        App.renderLibrary();
    },

    removeEx: (id) => {
        App.currentSelection = App.currentSelection.filter(exId => exId !== id);
        App.renderLibrary();
    },

    addEx: (id) => {
        if (App.currentSelection.length >= 8) {
            alert("Ton programme est plein ! Retire un exercice (✖) avant d'en ajouter un nouveau.");
            return;
        }
        App.currentSelection.push(id);
        App.renderLibrary();
    },

    checkProgramSelection: () => {
        const btn = document.getElementById('btn-save-program');
        const count = App.currentSelection.length;
        btn.innerText = `💾 Enregistrer le programme (${count}/8)`;
        btn.style.display = 'block';
        btn.style.opacity = count === 8 ? '1' : '0.5';
        btn.disabled = count !== 8;
    },

    saveCustomProgram: () => {
        if (App.currentSelection.length === 8) {
            Storage.saveProgram(App.currentSelection);
            alert("🥷 Programme mis à jour avec succès !");
            App.showView('view-home');
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
                <img src="${ex.img}" alt="${ex.name}" style="max-width:100%; max-height:200px; border-radius:10px;" onerror="this.outerHTML='<span style=\\'padding:50px\\'>Image absente</span>'">
            </div>
            <p class="modal-detail"><strong>Objectif :</strong> ${val}</p>
            <p class="modal-detail"><strong>Cible :</strong> ${ex.target}</p>
            <hr style="border:0; border-top:1px solid #333; margin:10px 0;">
            <p class="modal-detail"><strong>Exécution :</strong> ${ex.desc}</p>
            <p class="modal-detail"><strong>Respiration :</strong> ${ex.resp}</p>
            <p class="modal-detail"><strong>Erreur :</strong> ${ex.err}</p>
            <p class="modal-detail"><strong>Variante :</strong> ${ex.var}</p>
            <p class="modal-detail"><strong>🥷 Astuce :</strong> ${ex.tip}</p>
        `;
        document.getElementById('exercise-modal').classList.add('active');
    }
};

window.onload = App.init;
