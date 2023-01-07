/* resolvers serve the response for the query defined in typeDefs */

const { Thought, User } = require('../models');

const resolvers = {
    Query: {

        // parent is passed as a placeholder for the first spot to access the username argument from the second parameter
        thoughts: async () => {

            // 'if username exists then set params to an object with a key username, if it doesn't the return empty object'
            //const params = username ? {username} : {};

            /* passing 'params' object to find() method. 
            if it finds matching thoughts by username - it'll return it, if not it'll return every thought*/
            return Thought.find().sort({ createdAt: -1});
        },

        // return a single thought by its ID
        thought: async (parent, {_id}) => {
            return Thought.findOne({_id});
        },

        // return all users
        users: async () => {
            return User.find()
                .select(' -__v -password ')
                .populate('friends')
                .populate('thoughts');
        },

        // return a single user by username
        user: async(parent, {username}) => {
            return User.findOne({username})
                .select(' -__v -password ')
                .populate('friends')
                .populate('thoughts');
        }
    }
};

module.exports = resolvers;