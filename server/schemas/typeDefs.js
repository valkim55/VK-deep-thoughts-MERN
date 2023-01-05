/* import the gql tagged template function.
tagged templates - an advanced use of template literals */
const { gql } = require('apollo-server-express');

//create type definitions
const typeDefs = gql`

    type Thought {
        _id: ID
        thoughtText: String
        createdAt: String
        username: String
        reactionCount: Int
        reactions: [Reaction]
    }

    type Reaction {
        _id: ID
        reactionBody: String
        createdAt: String
        username: String
    }
    
    type Query {
        thoughts(username: String): [Thought]
    }
`;

// export the typeDefs
module.exports = typeDefs;