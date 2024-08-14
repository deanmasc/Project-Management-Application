/**
 * Get tasks from database
 */
async function getTasks() {
    const response = await fetch('/view-tasks');
    const fetchTasks = await response.json();
    
    generateDashboardCard(fetchTasks, getCookie().username);
}

/**
 * Update task status
 * @param {String} id Task ID
 */
async function updateStatusSelect(id) {
    value = document.getElementById(id).value

    let requestBody;

    switch(value){
        case "1":
            document.getElementById(id).setAttribute('class', 'form-select form-select-sm')
            requestBody = {
                id: id,
                status: 'todo'
            }
            break;
        case "2":
            document.getElementById(id).setAttribute('class', 'form-select form-select-sm select-yellow')
            requestBody = {
                id: id,
                status: 'inprogress'
            }
            break;
        case "3":
            document.getElementById(id).setAttribute('class', 'form-select form-select-sm select-green')
            requestBody = {
                id: id,
                status: 'done',
                dateCompleted: Date.now()
            }
            break;
    }

    const updateTask = {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(requestBody)
    }

    await fetch('/update-task-status', updateTask)
        .then(res => res.json())
        .catch(err => console.error(err));

    getTasks(); 
}

/**
 * Update task priority
 * @param {String} id Task ID
 */
async function updatePriority(id) {
    const input = document.getElementById(id);

    const updateTask = {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            id: id.split('_')[1],
            priority: document.getElementById(id).value
        })
    }

    await fetch('/update-task-priority', updateTask)
        .then(res => res.json())
        .catch(err => console.error(err));

    getTasks();
}

/**
 * Get task status
 * @param {Task} task 
 * @returns 
 */
function getTaskStatus(task){
    let options = "";
    if (task.status == "todo"){
        options =   `<option value="1"selected>Todo</option>
                    <option value="2">In Progress</option>
                    <option value="3">Done</option>`
    }
    else if (task.status === 'inprogress') {
        options =   `<option value="1">Todo</option>
                    <option value="2"selected>In Progress</option>
                    <option value="3">Done</option>`
    }
    else{
        options =   `<option value="1">Todo</option>
                    <option value="2">In Progress</option>
                    <option value="3"selected>Done</option>`
    }
    return options
}

/**
 * Changes size of text from user input
 * @param {String} action
 */
function changeFontSize(action) {
    const body = document.querySelector('body');
    const currentSize = parseFloat(window.getComputedStyle(body, null).getPropertyValue('font-size'));
  
    if (action === 'increase') {
      body.style.fontSize = `${currentSize * 1.1}px`;
    } else if (action === 'decrease') {
      body.style.fontSize = `${currentSize * 0.9}px`;
    }
  }

/**
 * Generates task cards for the current user
 * @param {Array<Task>} tasks 
 * @param {User} user 
 */
async function generateDashboardCard(tasks, user) {
    if (!user) {
        window.location.href = '/';
    } 
    
    user_tasks = []

    for (let task of tasks) {
        if (task.user == user) {
            user_tasks.push(task)
        }
    }

    task_column = document.getElementById('task-column')

    card_html = ``

    for (let task of user_tasks) {
        card_html +=    `<div class="card backlog-card" style="width: 19rem;">
                            <div class="card-body">
                            <div class="row">
                                <div class="col">
                                <select id="${task._id}" class="form-select form-select-sm" aria-label="Default select example" onchange="updateStatusSelect('${task._id}')">
                                    ${getTaskStatus(task)}
                                </select>
                                </div>
                                <div class="col-6">
                                <div class="input-group input-group-sm mb-3">
                                    <span class="input-group-text" id="inputGroup-sizing-sm">Priority</span>
                                    <input type="text" class="form-control" placeholder="${task.priority}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">

                                </div>
                                </div>
                                <hr>
                            </div>
                            <div class="row">
                                <div class="col" style="padding-top: 5px; margin-bottom: 5px;">
                                ${task.description}
                                </div>
                            </div>
                                <div class="row">
                                    <div class="col">
                                        <p class="fw-lighter" style="margin: 0;">Assigned to: ${task.user}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <p class="fw-lighter" style="margin: 0;">Start date: ${new Date(task.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <p class="fw-lighter" style="margin: 0;">End date: ${new Date(task.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <p class="fw-lighter" style="margin: 0;">Completion date: ${task.dateCompleted ? new Date(task.dateCompleted).toLocaleString() : 'Incomplete'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>`
    }

    task_column.innerHTML = card_html

}

getTasks()