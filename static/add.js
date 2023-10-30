document.addEventListener('DOMContentLoaded', function() {
    // Get form containers
    const goalFormContainer = document.getElementById('goal-form-container');
    const workoutFormContainer = document.getElementById('workout-form-container');
  
    // Get buttons
    const showGoalFormButton = document.getElementById('goal');
    const showWorkoutFormButton = document.getElementById('workout');

    const currentForm = "None";
  
    // Function to hide all forms
    function hideAllForms() {
        goalFormContainer.style.display = 'none';
        workoutFormContainer.style.display = 'none';
    }
  
    // Event listeners for buttons
    showGoalFormButton.addEventListener('click', function() {
        hideAllForms();
        goalFormContainer.style.display = 'flex';
        currentForm = "goal";
    });
  
    showWorkoutFormButton.addEventListener('click', function() {
        hideAllForms();
        workoutFormContainer.style.display = 'flex';
        currentForm = "exercise";
    });

    const exercisesContainer = document.getElementById('exercises-container');

    // Function to add a new exercise
    document.getElementById('add-exercise').addEventListener('click', function(event) {

        // Clone the first exercise record to create a new one
        const newExercise = exercisesContainer.children[0].cloneNode(true);

        // Add event listeners for new sets and remove exercise
        addEventListenersToExercise(newExercise);
        
        // Append the new exercise record to the container
        exercisesContainer.appendChild(newExercise);
    });

    // Function to add a set within an exercise
    function addSet(setsContainer) {
        const setDiv = document.createElement('div');
        setDiv.className = 'set-record';
        setDiv.innerHTML = `
            <label for="reps">Reps:</label>
            <input type="number" name="reps"/>
            
            <label for="weight">Weight:</label>
            <input type="number" name="weight"/>
        `;

        setsContainer.appendChild(setDiv);
    }

    // Function to add 'Add Set' and 'Remove Exercise' event listeners
    function addEventListenersToExercise(exerciseDiv) {
        // When user changes the number of sets
        exerciseDiv.querySelector('.sets').addEventListener('change', function(event) {
            const setsContainer = exerciseDiv.querySelector('.sets-container');
            const numSets = event.target.value;

            // Clear the existing sets
            setsContainer.innerHTML = '';

            // Add new sets based on the number
            for (let i = 0; i < numSets; i++) {
                addSet(setsContainer);
            }
        });

        // Add 'Remove Exercise' click listener
        exerciseDiv.querySelector('.remove-exercise').addEventListener('click', function() {
            exercisesContainer.removeChild(exerciseDiv);
        });
    }

    // Add event listeners to the first (template) exercise
    addEventListenersToExercise(exercisesContainer.children[0]);

    // Prevent Enter from submitting the form
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            return false;
        }
    });

    function formToJSONWeight() {
        const formData = {
            type: "weight",
            name: document.getElementById('workout-name').value,
            description: document.getElementById('workout-description').value,
            exercises: []
        };
        
        const exerciseRecords = document.querySelectorAll('.exercise-record');
        
        exerciseRecords.forEach((exerciseRecord, index) => {
            const exerciseName = exerciseRecord.querySelector('input[name="exercise"]').value;
            const sets = [];
    
            // Assuming each exerciseRecord contains set-records.
            const setRecords = exerciseRecord.querySelectorAll('.set-record');
            setRecords.forEach((setRecord) => {
                const weight = parseInt(setRecord.querySelector('input[name="weight"]').value, 10);
                const reps = parseInt(setRecord.querySelector('input[name="reps"]').value, 10);
                
                sets.push({
                    weight: weight,
                    reps: reps
                });
            });
    
            const exercise = {
                name: exerciseName,
                sets: sets
            };
            
            formData.exercises.push(exercise);
        });
        
        return JSON.stringify(formData);
    }    

    function formToJSONgoal() {
        const formData = {
            name: document.getElementById('goal-name').value,
            description: document.getElementById('goal-description').value,
            type: document.getElementById('goal-type').value,
            value: document.getElementById('goal-amount').value
        };

        return JSON.stringify(formData)
    }
    
    // Example of using the function
    document.getElementById('finish').addEventListener('click', function(event) {
        event.preventDefault();
        const formDataJSON = formToJSONWeight();
        fetch('/add_workout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: formDataJSON
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = data.redirect_url;
        })
        .catch((error) => console.error('Error:', error));
    });
    
    document.getElementById('ready').addEventListener('click', function(event) {
        event.preventDefault();
        const formDataJSON = formToJSONgoal();
        fetch('/add_goal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: formDataJSON
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = data.redirect_url;
        })
        .catch((error) => console.error('Error:', error));
    });
});

