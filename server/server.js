const express = require('express');

// after setting up schema files connect them to apollo server hooked up with express
const { ApolloServer } = require('apollo-server-express');

// import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;

// create a new Apollo server and pass in the schema data
const server = new ApolloServer({
    typeDefs, 
    resolvers 
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
    await server.start();

    // integrate Apollo server with the Express application as middleware
    server.applyMiddleware({ app });

    db.once('open', () => {
        app.listen(PORT, () => {
          console.log(`API server running on port ${PORT}!`);

          // log where you can go to test gql API
          console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
          
        });
    });
};

// call tha async function to start the server
startApolloServer(typeDefs, resolvers);


