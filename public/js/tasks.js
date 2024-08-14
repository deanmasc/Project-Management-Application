document.addEventListener('DOMContentLoaded', () => generateChart())
const ctx = document.getElementById('chart').getContext('2d');

window.onload = checkDarkMode();

/**
 * Returns list of incomplete tasks
 * @returns {Array<Task>}
 */
function getIncompleteTasks() {
    const incompleteTasks = [];

    tasks.forEach(task => {
        if(task.status != 'done') {
            incompleteTasks.push(task);
        }
    })

    return incompleteTasks;
}

/**
 * Generates chart
 */
function generateChart() {
    const tasks = getIncompleteTasks();

    const data = {
        labels: [],
        datasets: [
            {
                label: 'Complete',
                data: []
            },
            {
                label: 'Incomplete',
                data: []
            }
            
        ]
    }

    tasks.forEach(task => { 
        data.labels.push(`Task: ${task.description}`);
        data.datasets[0].data.push(task.initialStoryPoints - task.priority);
        data.datasets[1].data.push(task.priority);
    })

    const chartConfig = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Story Points'
                    }
                }
            }
        }
    }

    const chart = new Chart(ctx, chartConfig);
}