const mongoose = require('mongoose');

/**
 * User mongoose schema
 * @class
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    storyPointsAssigned: {
        type: Number,
        default: 0
    },
    storyPointsCompleted: {
        type: Number,
        default: 0
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;