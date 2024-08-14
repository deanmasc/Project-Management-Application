let username = getCookie().username;
let userType = getCookie().type;

window.onload = () => {
    // Hide create task button if user is not an admin
    if(userType != 'admin') {
        document.getElementById('create-button-container').style.display = 'none';
    }

    checkDarkMode();
}

/**
 * Updates task status in database when it is changed
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
                status: 'todo',
                dateCompleted: null
            }
            break;
        case "2":
            document.getElementById(id).setAttribute('class', 'form-select form-select-sm select-yellow')
            requestBody = {
                id: id,
                status: 'inprogress',
                dateCompleted: null
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
 * Updates task priority on database when it is changed
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
 * Deletes task from database when it is deleted on frontend
 * @param {String} id Task ID
 */
async function deleteTask(id) {
    const deleteTask = {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            id: id
        })
    }

    await fetch('/delete-task', deleteTask)
        .then(res => res.json())
        .catch(err => console.error(error));

    // Reload tasks
    getTasks();
}

/**
 * Generates options for task status select in html
 * @param {Task} task Task
 * @returns HTML select options
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
 * Generate task cards to be displayed
 * @param {Array<Task>} tasks Array of tasks
 */
function generateBacklogCards(tasks) {

    todo_column = document.getElementById('todo-column');
    inprogress_column = document.getElementById('inprogress-column');
    done_column = document.getElementById('done-column');

    let todoList = [] 
    let inprogressList = []
    let doneList = []

    let columnLists = [todoList, inprogressList, doneList];
    let columns = [todo_column, inprogress_column, done_column];

    for (let task of tasks){
        if (task.status == "todo"){
            todoList.push(task)
        }
        else if (task.status === 'inprogress') {
            inprogressList.push(task)
        }
        else{
            doneList.push(task)
        }
    }



    for (i=0;i<columnLists.length;i++) {
        columnLists[i].sort((a,b) => a.priority - b.priority)
        columnHTML = ""
        for (let task of columnLists[i]) {

            columnHTML += `
                        <div class="card backlog-card" style="width: 19rem;">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col">
                                        <select id="${task._id}" class="form-select form-select-sm" aria-label="Default select example" onchange="updateStatusSelect('${task._id}')">
                                            ${getTaskStatus(task)}
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="inputGroup-sizing-sm">Story Points</span>
                                            <input id="p_${task._id}" type="number" min="1" max="10" class="form-control" value="${task.priority}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" onchange="updatePriority('p_${task._id}')">
                        
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
                                        <p class="fw-lighter" style="margin: 0;">Completion date: ${task.dateCompleted ? new Date(task.dateCompleted).toLocaleDateString() : 'Incomplete'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body d-grid gap-2">
                                <button class="btn btn-danger btn-sm" onclick="deleteTask('${task._id}')">Delete</button>
                            </div>
                        </div>`
        }
        columns[i].innerHTML = columnHTML
    }

    for (let task of tasks) {

        value = document.getElementById(task._id).value

        switch(value){
            case "1":
                document.getElementById(task._id).setAttribute('class', 'form-select form-select-sm')
                break;
            case "2":
                document.getElementById(task._id).setAttribute('class', 'form-select form-select-sm select-yellow')
                break;
            case "3":
                document.getElementById(task._id).setAttribute('class', 'form-select form-select-sm select-green')
                break;
        }
    }
    

}

/**
 * Get tasks from database
 */
async function getTasks() {
    const response = await fetch('/view-tasks');
    const fetchTasks = await response.json();

    fetchTasks.forEach(task => {
        console.log(task)
    });
    
    generateBacklogCards(fetchTasks);
}

/**
 * Show create task modal
 */
function showModal() {
    const createModal = new bootstrap.Modal('#createTaskModal')
    createModal.show()
}

/**
 * Hide create task modal
 */
function hideModal() {
    const createModal = new bootstrap.Modal('#createTaskModal')
    createModal.hide()
}

/**
 * Get users from database
 */
async function getUsers() {
    const response = await fetch('/get-users');
    const fetchUsers = await response.json();

    
    generateUserSelectOptions(fetchUsers);
}

/**
 * Generate a list of options to select a user for a task
 * @param {Array<User>} users 
 */
function generateUserSelectOptions(users) {

    user_select = document.getElementById('user')

    select_html = "<option selected>Select User</option>"

    for (let user of users) {
        select_html += `<option value="${user.username}">${user.username}</option>`
    }

    user_select.innerHTML = select_html;
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

// $(function() {
//     $("#startDate").datepicker({
//       dateFormat: "yy-mm-dd",
//       onSelect: function(selectedDate) {
//         $("#endDate").datepicker("option", "minDate", selectedDate);
//       }
//     });
  
//     $("#endDate").datepicker({
//       dateFormat: "yy-mm-dd",
//       onSelect: function(selectedDate) {
//         $("#startDate").datepicker("option", "maxDate", selectedDate);
//       }
//     });
//   });

getTasks();
getUsers();



// let tasks = [{taskID: 1, description: "Create Login Page", user: 'Jake', status: "done", priority: 7}, {taskID: 2, description: "Create Database", user: 'Ben', status: "inprogress", priority: 5}, {taskID: 3, description: "Create Girlfriend", user: 'Connor', status: "todo", priority: 10}, {taskID: 4, description: "Create Fart Page", user: 'Logan', status: "done", priority: 2}]
// generateBacklogCards(tasks)
