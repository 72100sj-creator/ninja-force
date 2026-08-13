const Storage = {
    getProgram: () => {
        const saved = localStorage.getItem('ninja_force_program');
        return saved ? JSON.parse(saved) : DEFAULT_PROGRAM;
    },
    saveProgram: (programIds) => {
        localStorage.setItem('ninja_force_program', JSON.stringify(programIds));
    },
    getHistory: () => {
        const history = localStorage.getItem('ninja_force_history');
        return history ? JSON.parse(history) : [];
    },
    saveSession: (duration, completedExercises) => {
        const history = Storage.getHistory();
        history.unshift({
            date: new Date().toLocaleDateString('fr-FR'),
            duration: duration,
            exercises: completedExercises
        });
        localStorage.setItem('ninja_force_history', JSON.stringify(history));
    }
};