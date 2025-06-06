import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

async function init() {
const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

//Create GraphQL Server
const gqlServer = new ApolloServer({
  typeDefs:`
   type Query {
     hello: String
     say(name: String): String
   }`,
  resolvers:{
    Query: {
        hello: () => 'Hey There!, I am a Graphql server!',
say: (_, { name }: { name: string }) => {
  return `Hello ${name}, How are you?`;
}
    },
  },
});

// Start the gql server
await gqlServer.start();

app.get('/', (req, res) => {
  res.json({message: "Server is running!"});
});

app.use('/graphql', expressMiddleware(gqlServer));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
};

init();