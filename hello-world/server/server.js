const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

// typeDefs is the interface of our API .
const typeDefs = `#graphql

    schema {
        query: Query,
    }

    type Query {
        greeting: String
    }
`;

// the resolvers are responsible for returning the corresponding values
const resolvers = {
  Query: {
    greeting: () => "Hello! World .",
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, { listen: { port: 9000 } })
  .then((info) => {
    console.log(`Server is running at ${info.url}`);
  })
  .catch((err) => console.log);
