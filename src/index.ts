import express from 'express';
import createApolloGraphqlServer from './grapgql';
import { expressMiddleware } from '@as-integrations/express5';
import { UserService } from './services/user';
async function init() {
const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to handle CORS
app.get('/', (req, res) => {
  res.json({message: "Server is running!"});
});

// Initialize the GraphQL server
const gqlServer = await createApolloGraphqlServer();
app.use('/graphql', expressMiddleware(await createApolloGraphqlServer(),{context:async({req})=>{
const token =req.headers['token']
try{
  const user= UserService.decodeJWTToken(token as string);
  return  {user};
}catch(error){
  return {};
}
}
}));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
};

init();