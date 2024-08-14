let username = getCookie().username;
let userType = getCookie().type;

window.onload = checkDarkMode();

/**
 * Gets array of tasks from database
 * @returns {Array<Task>}
 */
async function getTasks() {
    const response = await fetch('/view-tasks');
    const tasks = await response.json();

    return tasks;
}

/**
 * For testing: Display all tasks
 */
async function displayTasks() {
    const tasks = await getTasks();
    tasks.forEach(task => {
        document.body.innerHTML += `
            <h1>${task.description}</h1>
            <p>${task.priority}</p>
            <p>${task.status}<p>
            <p>${task.user}</p>
        `;
    });
}

/**
 * 
 * @param {Array} arr 
 * @returns Length of array
 */
function sum(arr) {
    let val = 0;
    for (let task of arr) {
        val += task.priority;
    }
    return val;
};

/**
 * 
 * @param {Array<Task>} arr 
 * @returns List of tasks belonging to current user
 */
function userTaskFinder(arr) {
    let res = [];
    for (let task of arr) {
        if (task.user === username) {
            res.push(task)
        }
    }
    return res;
}

/**
 * Burndown chart calculations
 * @param {Number} story_points 
 * @returns 
 */
function dataCalc(story_points) {
    let res = [];
    res.push(story_points);
    let m = story_points/14;
    let val = story_points - 2*m;
    for (let i = val; i >= 0; i-=2*m) {
        res.push(i)
    }
    res.push(0);
    return res;
}

/**
 * Burndown chart calculations
 * @param {Array<Task>} tasks 
 * @param {Number} story_points 
 * @returns 
 */
function userDataCalc(tasks, story_points) {
    let res = [];
    for (let i = 1; i <= 7; i++) {
        res.push(story_points);
    }
    let val = story_points;
    for (let task of tasks) {
        if (task.status === 'done') {
            val -= task.priority;

            const dateDiff = Math.floor((Date.now() - Date.parse(task.dateCompleted)) / (1000 * 3600 * 24));
            res.fill(res[7 - dateDiff] - task.priority, 7 - dateDiff)
        }
    }
     

    res.push(val);
    return res;
}

/**
 * Displays charts when the page is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    let task_arr = await getTasks();
    let total_tasks = sum(task_arr);
    let user_task_arr = userTaskFinder(task_arr);
    let user_tasks = sum(user_task_arr);

    const currentDate = new Date();
    
    
    
    const ctx = document.getElementById('myChart').getContext('2d');
    
    const data = {
        labels: [14, 12, 10, 8, 6, 4, 2, 0],
        datasets: [
        {
            label: `${username}'s Expected Progress`,
            data: dataCalc(user_tasks),
            fill: false,
            borderColor: 'blue',
            borderWidth: 2
    
        },
        {
            label: `${username}'s Actual Progress`,
            data: userDataCalc(user_task_arr, user_tasks),
            fill: false,
            borderColor: 'red',
            borderWidth: 2 
        }

    ]
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 20
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Previous Days'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Story Points'
                }
            }
        }
    };
    
    
    new Chart (ctx, {
        type: 'line',
        data: data,
        options: options
    
    });

    const ctx2 = document.getElementById('myChart2').getContext('2d');
    
    const data2 = {
        labels: [14, 12, 10, 8, 6, 4, 2, 0],
        datasets: [
        {
            label: 'Team\'s Expected Progress',
            data: dataCalc(total_tasks),
            fill: false,
            borderColor: 'blue',
            borderWidth: 2
    
        },
        {
            label: 'Team\'s Actual Progress',
            data: userDataCalc(task_arr, total_tasks),
            fill: false,
            borderColor: 'red',
            borderWidth: 2
    
        },

    ]
    };
    
    const options2 = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 20
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Previous Days'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Story Points'
                }
            }
        }
    };
    
    
    new Chart (ctx2, {
        type: 'line',
        data: data2,
        options: options2
    
    });
});
