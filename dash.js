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
        widget.innerHTML = `
            <h3>${goal.name}</h3>
            <p>${goal.description}</p>
            <label>${goal.current} / ${goal.target}</label>
        `;

        // Get the progress bar
        const progress_bar = document.createElement('div');
        progress_bar.className = 'progress_bar';
        const progress = document.createElement('div');
        progress.className = 'progress';

        // Calculate how far they have progressed
        progress.style.width = `${((data.target - data.current) / data.target) * 100}%`;
        widget.appendChild(progress_bar);

        // Add the widget to the container
        container.appendChild(widget);
    })
  });
