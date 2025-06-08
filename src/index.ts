import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { prismaClient } from './lib/db';

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
   }
    type Mutation{
    createUser(firstName: String!,lastName: String!, email: String!, password: String!):Boolean
    }
`,
  resolvers:{
    Query: {
        hello: () => 'Hey There!, I am a Graphql server!',
say: (_, { name }: { name: string }) => {
  return `Hello ${name}, How are you?`;
}
    },
    Mutation: {
      createUser: async (_, { firstName, lastName, email, password }:{ firstName: string, lastName: string, email: string, password: string}) => {
        // Here you would typically call your database to create a user
        // For now, we will just return true to indicate success
        await prismaClient.user.create({
          data: {
            firstName,
            lastName,
            email,
            password, // In a real application, make sure to hash the password before storing it
            salt: 'random_salt', // You should generate a unique salt for each user
          },
        });
        return true; // Indicating the user was created successfully
      }
    }
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