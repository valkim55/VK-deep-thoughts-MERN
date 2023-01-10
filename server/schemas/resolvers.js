/* resolvers serve the response for the query defined in typeDefs */

const { Thought, User } = require('../models');

// graphql built-in error handler
const {AuthenticationError} = require('apollo-server-express');

// import signToken function
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {

        // when 'me' query is called from the front end, logged-in user's full details will be expected as the response
        me: async (parent, args, context) => {
            if(context.user) { 
                const userData = await User.findOne({ _id: context.user._id })
                    .select(' -__v -password')
                    .populate('thoughts')
                    .populate('friends')

                console.log('authentication successful')
                return userData;
            }

            // if context.user property doesn't exists with this id then throw an error
            throw new AuthenticationError('Access denied. Not logged in');
        },

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
    },

    Mutation: {

        // create/sign up a new user
        addUser: async (parent, args) => {

            // mongoose User model creates a new user in the database with whatever is passed in as the args
            const user = await User.create(args);

            // signing a token and returning an object that combines token and user's data
            const token = signToken(user);

            return {user, token};
        },

        // login with existing account
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            // same here, add token to return token and user's data combined
            const token = signToken(user);

            return {user, token};
        },

        // functionality to allow only authenticated users to add thoughts 
        // once you add thought you also need to update the User's thoughts array
        addThought: async (parent, args, context) => {
            // check if context.user property exists = user is authenticated
            if(context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username});

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: {thoughts: thought._id} },
                    { new: true }
                );

                return thought;
            }

            throw new AuthenticationError('You need to be logged in to create new posts!');
        },

        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if(context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactions: { reactionBody, username: context.user.username } } },
                    { new: true, runValidators: true}
                );

                return updatedThought;
            }

            throw new AuthenticationError('You need to be logged in to add reactions!')
        },

        addFriend: async (parent, { friendId }, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId } },
                    { new: true }
                ).populate('friends');

                console.log('added new friend!')
                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in to add friends!');
        }
    }
};

module.exports = resolvers;