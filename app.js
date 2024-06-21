// Import node_modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // Added cookie-parser for managing cookies
const mongoose = require('mongoose');
const Hash = require('jshashes');
const sha512 = new Hash.SHA512();

// Import schemas
const User = require('./models/user');
const Task = require('./models/task');

// Import DB controllers
const userController = require('./controllers/user-controller');

// Connect to DB
const dbUrl = 'mongodb+srv://agiletechdb:fkdC10su0berGIYn@fit2101.2i9sqic.mongodb.net/?retryWrites=true&w=majority';

async function connect() {
    await mongoose.connect(dbUrl);
}

connect().catch((err) => console.error(err));

// DB Test (remove)
const admin = new User({ username: 'admin', password: 'password' });

// Create server
const app = express();

// Server port
const port = 8081;

// Server configuration

// Set view engine to use EJS templates
app.set('view engine', 'ejs');
// Set views directory (folder to put HTML files in)
app.set('views', __dirname + '/views');
// Create a route to access Bootstrap CSS files
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/chart', express.static(__dirname + '/node_modules/chart.js/dist/'));
// Make the public directory (for images) accessible
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser to parse cookies

// Define routes (pages)

// Home page
app.get('/', (req, res) => {
    let cookie;
    try {
        cookie = JSON.parse(req.cookies.agiletech);
    } catch {
        cookie = {};
    }

    if(!cookie.username) {
        res.sendFile(__dirname + '/views/index.html');
    } else {
        res.redirect('/dashboard');
    }
})

// Login route
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = sha512.hex(req.body.password);

    const success = await userController.validateUser(username, password);

    if(success) {
        res.cookie('agiletech', JSON.stringify({ username: username, type: success }), { maxAge: 24 * 60 * 60 * 1000 }).redirect('dashboard');
    } else {
        res.send('Username of password is incorrect');
    }

    
})

app.get('/logout', async (req, res) => {
    res.cookie('agiletech', JSON.stringify({})).redirect('/');
})

// Profile route
app.get('/profile', async (req, res) => {
    try {
        const cookie = JSON.parse(req.cookies.agiletech);

        const user = await User.findOne({ username: cookie.username, type: cookie.type })

        res.render('profile.ejs', { user: user });
    } catch {
        res.redirect('/');
    }
})

// Change password route
app.post('/change-password', async (req, res) => {
    const userID = req.body._id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const user = await User.findOne({ _id: userID });

    if (user.password == currentPassword) {
        user.password = newPassword
        await user.save();
        res.redirect('/');
    } else {
        res.send('Error: Current password did not match, please login and try again');
    }
})

// Backlog route
app.get('/backlog', async (req, res) => {
    try {
        const cookie = JSON.parse(req.cookies.agiletech);

        await User.findOne({ username: cookie.username, type: cookie.type })

        res.sendFile(__dirname + '/views/backlog.html');
    } catch {
        res.redirect('/');
    }
})

// Burndown chart page route
app.get('/burndown', async (req, res) => {
    try {
        const cookie = JSON.parse(req.cookies.agiletech);

        await User.findOne({ username: cookie.username, type: cookie.type })

        res.sendFile(__dirname + '/views/burndown.html');
    } catch {
        res.redirect('/');
    }
    
})

// Registration route
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.html');
})

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = sha512.hex(req.body.password);

    const success = await userController.createUser(username, password);

    if (success) {
        res.redirect('/')
    } else {
        res.send(`Error: User already exists with username: ${username}`);
    }
})

// Dashboard route
app.get('/dashboard', async (req, res) => {
    try {
        const cookie = JSON.parse(req.cookies.agiletech);

        await User.findOne({ username: cookie.username, type: cookie.type })

        res.render('dashboard.ejs', { username: cookie.username, type: cookie.type });
    } catch {
        res.redirect('/');
    }
})

// Team route
app.get('/team', async (req, res) => {
    const tasks = await Task.find({});
    const users = await User.find({});

    console.log(users)

    let taskUser;
    for (let task of tasks) { 
        for(let i = 0; i < users.length; i++) {
            if(users[i].username == task.user) { 
                taskUser = i;
                // console.log(taskUser)
                break;
            }
        }

        console.log(taskUser)

        users[taskUser].storyPointsAssigned += task.priority;

        if(task.status == 'done') {
            users[taskUser].storyPointsCompleted += task.priority;
        }
    }

    

    try {
        const cookie = JSON.parse(req.cookies.agiletech);

        await User.findOne({ username: cookie.username, type: cookie.type })

        res.render('team.ejs', { tasks: tasks, users: users });
    } catch {
        res.redirect('/');
    }
})

// Task overview route
app.get('/tasks', async (req, res) => {
    const tasks = await Task.find({});

    try {
        const cookie = JSON.parse(req.cookies.agiletech);

        await User.findOne({ username: cookie.username, type: cookie.type })

        res.render('tasks.ejs', { tasks: JSON.stringify(tasks) });
    } catch {
        res.redirect('/');
    }
})

// Create a new task route
app.post('/create-task', async (req, res) => {
    try {
        // Create a new task
        const task = new Task({
            description: req.body.description,
            user: req.body.user,
            status: 'todo',
            priority: req.body.priority,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            dateCompleted: null,
            initialStoryPoints: req.body.priority
        });



        // Save the task to the database
        await task.save();

        res.redirect('/backlog');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating task');
    }
});
       
// View tasks route
app.get('/view-tasks', async (req, res) => {
    try {
        // Retrieve all tasks from the database
        const tasks = await Task.find();

        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving tasks');
    }
});
       
// Get users route
app.get('/get-users', async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find();

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving users');
    }
});
       
// Update task status (todo, doing, done) route
app.put('/update-task-status', async (req, res) => {
    try {
        const newStatus = req.body.status;
        const taskID = req.body.id;
        const dateCompleted = req.body.dateCompleted;

        await Task.findOneAndUpdate({ _id: taskID }, { status: newStatus, dateCompleted: dateCompleted });

        res.status(200).json({
            "taskID": taskID,
            "status": newStatus,
            "dateCompleted": dateCompleted ? dateCompleted : null
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating task');
    }
});
       
// Update task priority route
app.put('/update-task-priority', async (req, res) => {
    try {
        const newPriority = req.body.priority;
        const taskID = req.body.id;

        await Task.findOneAndUpdate({ _id: taskID }, { priority: newPriority });

        res.status(200).json({
            "taskID": taskID,
            "priority": newPriority
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating task');
    }
});
       
// Delete a task route
app.delete('/delete-task', async (req, res) => {
    try {
        const taskID = req.body.id;

        await Task.deleteOne({ _id: taskID });

        res.status(200).json({
            "status": "success",
            "deletedCount": 1
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting task');
    }
});

// Start server
app.listen(port, async () => {
    console.log(`Server listening on port ${port}`);
});   