fetch('/dash_info')
  .then(response => response.json())
  .then(data => {
    const goals = data.goals;

    // Get the container where the goals will stay
    const container = document.getElementById('goal-container');

    // Iterate through each goal and create the widgets
    goals.forEach(goal => {
        const widget = document.createElement('div');
        widget.className = 'goal-widget';
        
        // Create header, description, and label
        widget.innerHTML = `
            <h3>${goal.name}</h3>
            <p>${goal.description}</p>
            <label>${goal.current} / ${goal.target}</label>
        `;

        // Create the progress bar
        const progress_bar = document.createElement('div');
        progress_bar.className = 'progress_bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        progress.style.width = `${(goal.current / goal.target) * 100}%`;
        progress_bar.appendChild(progress);

        // Append the progress bar to the widget
        widget.appendChild(progress_bar);

        // Create and append the edit button
        const editButton = document.createElement('div');
        editButton.className = 'edit-button';
        editButton.textContent = 'Edit/Add';
        widget.appendChild(editButton);

        // Attach mouseover and mouseout events to the widget
        widget.addEventListener('mouseover', function() {
          editButton.style.display = 'block';
        });
        widget.addEventListener('mouseout', function() {
          editButton.style.display = 'none';
        });


        
        // To avoid bugs
        let isEditing = false;

        // Attach click event to the Edit button
        editButton.addEventListener('click', function() {
          if (isEditing) return;
          isEditing = true;

          // Toggle widget height
          if (widget.style.height === 'auto' || widget.style.height === '') {
            widget.style.height = '200px';  // Extend the height to whatever you need
          } else {
            widget.style.height = 'auto';
          }

          // Get existing elements
          const h3 = widget.querySelector('h3');
          const p = widget.querySelector('p');
          const label = widget.querySelector('label');
          
          // Create input fields
          const nameInput = document.createElement('input');
          nameInput.className = "widget-name-edit";
          nameInput.type = "text";
          nameInput.style.textAlign = "center";
          nameInput.value = h3.textContent;
          
          const descriptionInput = document.createElement('input');
          descriptionInput.className = "widget-description-edit";
          descriptionInput.type = "text";
          descriptionInput.value = p.textContent;
          
          const currentInput = document.createElement('input');
          currentInput.className = "widget-current-edit";
          currentInput.type = "number";
          currentInput.value = label.textContent.split(' / ')[0];
          currentInput.style.width = '60px';  // setting width to make it smaller

          const targetInput = document.createElement('input');
          targetInput.className = "widget-target-edit";
          targetInput.type = "number";
          targetInput.value = label.textContent.split(' / ')[1];
          targetInput.style.width = '60px';  // setting width to make it smaller
          
          // Toggle visibility and replace elements with input fields or vice versa
          if (h3.style.display === 'none') {
            h3.style.display = 'block';
            p.style.display = 'block';
            label.style.display = 'block';
            
            nameInput.style.display = 'none';
            descriptionInput.style.display = 'none';
            currentInput.style.display = 'none';
            targetInput.style.display = 'none';
          } else {
            h3.style.display = 'none';
            p.style.display = 'none';
            label.style.display = 'none';
            
            nameInput.style.display = 'block';
            descriptionInput.style.display = 'block';
            currentInput.style.display = 'block';
            targetInput.style.display = 'block';
            
            widget.insertBefore(nameInput, progress_bar);
            widget.insertBefore(descriptionInput, progress_bar);
            widget.insertBefore(currentInput, progress_bar);
            widget.insertBefore(targetInput, progress_bar);
          }

          widget.id = goal.id;

          const saveButton = document.createElement('button');
          saveButton.textContent = "Save";
          saveButton.addEventListener('click', function() {
              // Fetch the updated values from inputs
              const updatedName = nameInput.value;
              const updatedDesc = descriptionInput.value;
              const updatedCurrent = currentInput.value;
              const updatedTarget = targetInput.value;

              // Submit these to the server
              fetch('/update_goal', {
                  method: 'POST',
                  headers: {
                  'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                  id: widget.id,
                  name: updatedName,
                  description: updatedDesc,
                  current: updatedCurrent,
                  target: updatedTarget
                  })
              }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      // Update the widget
                      h3.textContent = updatedName;
                      p.textContent = updatedDesc;
                      label.textContent = `${updatedCurrent} / ${updatedTarget}`;
                      
                      // Switch back to non-editing mode
                      widget.replaceChild(h3, nameInput);
                      widget.replaceChild(p, descriptionInput);
                      widget.replaceChild(label, numContainer);
                      widget.removeChild(saveButton);

                      isEditing = false; // Reset the flag
                  }
                  window.location.href = data.redirect_url;
              });
          });
          widget.appendChild(saveButton);
        });

        // Add the widget to the container
        container.appendChild(widget);
    });
});

function workoutTemplate (id, workoutName, workoutDescription) { 
  const widget = document.createElement('div');
  widget.className = "workout-widget";
  widget.id = `${id}`;
  widget.innerHTML = `
    <h3>${workoutName}</h3>
    <p>${workoutDescription}</p>`;
  return widget;
};

let actualHeight = 0;

function addDetails(widget, workoutData) {
  const detailDiv = document.createElement('div');
  detailDiv.className = 'extra-details';

  // Loop through all of the exercises
  workoutData.exercises.forEach(exercise => {
    const exerciseName = document.createElement('h4');
    exerciseName.textContent = exercise.name;
    detailDiv.appendChild(exerciseName);

    // Create a table for this exercise
    const table = document.createElement('table');
    table.className = 'exercise-table';

    // Table headers for 'Set', 'Reps', 'Weight'
    const headerRow = document.createElement('tr');
    const headers = ['Set', 'Reps', 'Weight'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate the table with sets
    exercise.sets.forEach((set, index) => {
      const row = document.createElement('tr');

      // Set number
      const setCell = document.createElement('td');
      setCell.textContent = index + 1;
      row.appendChild(setCell);

      // Reps
      const repsCell = document.createElement('td');
      repsCell.textContent = set.reps;
      row.appendChild(repsCell);

      // Weight
      const weightCell = document.createElement('td');
      weightCell.textContent = set.weight;
      row.appendChild(weightCell);

      table.appendChild(row);
    });

    // Append table to extra-details div
    detailDiv.appendChild(table);
  });

  // Append extra-details div to the widget
  widget.classList.add('has-extra-details'); 
  widget.appendChild(detailDiv);

  actualHeight = detailDiv.scrollHeight;
}

// Function to remove extra details from a workout widget
function removeDetails(widget) {
  const detailDiv = widget.querySelector('.extra-details');
  if (detailDiv) {
    widget.classList.remove('has-extra-details'); // Remove the class
    widget.removeChild(detailDiv); 
  }
}

let currentExpandedWidget = null;



fetch('/get_workouts')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('workout-container');
    
    data.workouts.forEach(workout => {
      const widget = workoutTemplate(workout.id, workout.name, workout.description);

      widget.addEventListener('mouseleave', function() {
        if (currentExpandedWidget) {
          removeDetails(currentExpandedWidget);
          currentExpandedWidget.style.height = "8vw";
          currentExpandedWidget = null;
        }
      });
      
      widget.addEventListener('mouseover', function() {
        // Collapse the previously expanded widget, if any
        if (currentExpandedWidget) {
          removeDetails(currentExpandedWidget);
          currentExpandedWidget.style.height = "8vw";
        }
        
        // Expand the new widget
        addDetails(widget, workout);
        widget.style.height = (actualHeight + ((8 * window.innerWidth) / 100)) + "px";
    
        // Update the currently expanded widget
        currentExpandedWidget = widget;
      });
    
      // Remove this part if you're using the `mouseleave` on the container to collapse widgets
      /*
      widget.addEventListener('mouseout', function() {
        removeDetails(widget);
        widget.style.height = "8vw";
      });
      */
    
      // Append the widget directly to the container
      container.appendChild(widget);
    });
    
  });