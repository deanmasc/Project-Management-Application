const User = require('../models/user');

module.exports = {
    /**
     * Create a new user
     * @param {String} username 
     * @param {String} password 
     * @returns {Boolean} true if user is created, false if user already exists
     */
    createUser: async (username, password) => {
        try {
            const user = new User({ username: username, password: password, type: 'user' });
            await user.save();
            return true;
        } catch(err) {
            return false;
        }
    },
    /**
     * Validate a user's login
     * @param {String} username 
     * @param {String} password 
     * @returns Type of user (admin/user) or null if user doesn't exist
     */
    validateUser: async (username, password) => {
        const user = await User.findOne({ username: username, password: password });

        const result = user ? user.type : null;

        return result;
    },
    /**
     * Set a user as an admin
     * @param {String} username 
     */
    setAdmin: async (username) => {
        await User.findOneAndUpdate({ username: username }, { type: 'admin' });
    },
    /**
     * Remove a user as an admin
     * @param {String} username 
     */
    removeAdmin: async (username) => {
        await User.findOneAndUpdate({ username: username }, { type: 'user' });
    },
    /**
     * Change a user's password
     * @param {String} username 
     * @param {String} password 
     * @param {String} newPassword 
     */
    changePassword: async (username, password, newPassword) => {
        await User.findOneAndUpdate({ username: username, password: password }, { password: newPassword });
    }
}