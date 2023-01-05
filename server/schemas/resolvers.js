/* resolvers serve the response for the query defined in typeDefs */

const { User, Thought } = require('../models');

const resolvers = {
    Query: {

        // parent is passed as a placeholder for the first spot to access the username argument from the second parameter
        thoughts: async (parent, {username}) => {

            // 'if username exists then set params to an object with a key username, if it doesn't the return empty object'
            const params = username ? {username} : {};

            /* passing 'params' object to find() method. 
            if it finds matching thoughts by username - it'll return it, if not it'll return every thought*/
            return Thought.find(params).sort({ createdAt: -1});
        }
    }
};

module.exports = resolvers;