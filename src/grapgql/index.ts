import { ApolloServer } from '@apollo/server';
import {User} from './user';
async function createApolloGraphqlServer(){
    //Create GraphQL Server
const gqlServer = new ApolloServer({
  typeDefs:`
   type Query {
     ${User.queries}
     getContext:(_:any,parameters:any,context)=>{
     console.log("Context:",context);
     return "Okay";
     }
   }
    type Mutation{
        ${User.mutations}
  }
`,
  resolvers:{
    Query: {
        ...User.resolvers.queries,
    },
    Mutation: {
        ...User.resolvers.mutations,
    }
  },
});

// Start the gql server
await gqlServer.start();
return gqlServer;
}

export default createApolloGraphqlServer;