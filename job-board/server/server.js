import { readFile } from "fs/promises";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";

import { authMiddleware, handleLogin } from "./auth.js";
import { resolvers } from "./resolvers.js";
import { getUser } from "./db/users.js";
import { createCompanyLoader } from "./db/companies.js";

const PORT = 9000;

const app = express();

app.use(cors(), express.json(), authMiddleware);

app.post("/login", handleLogin);

const typeDefs = await readFile("./schema.graphql", "utf8");

const apolloServer = new ApolloServer({ typeDefs, resolvers });

async function startServer(app) {
  await apolloServer.start();
  async function getContext({ req }) {
    const companyLoader = createCompanyLoader();
    let context = {};
    // will automatically get access to the request .
    if (req.auth) {
      const user = await getUser(req.auth.sub);
      context = { ...context, user };
    }
    context.companyLoader = companyLoader;
    return context;
  }
  app.use("/graphql", apolloMiddleware(apolloServer, { context: getContext }));

  app.listen({ port: PORT }, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Graphql running on  http://localhost:${PORT}/graphql`);
  });
}

startServer(app);
