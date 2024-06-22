const mongoose = require('mongoose');

/**
 * Task mongoose schema
 * @class
 */
const taskSchema = new mongoose.Schema({
    description: String,
    user: String,
    status: String,
    priority: Number,
    startDate: Date,
    endDate: Date,
    dateCompleted: Date,
    initialStoryPoints: Number
})

taskSchema.virtual('timeRemaining').get(() => {
    return this.endDate - this.startDate;
})

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;