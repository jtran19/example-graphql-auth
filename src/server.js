import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { formatError } from 'apollo-errors';
import cors from 'cors';
import schema from './data/schema';

const GRAPHQL_PORT = process.env.PORT || 4090;
const graphQLServer = express();

graphQLServer.use('/', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  } else {
    try {
      if (req.headers.authorization) {
        const authParts = req.headers.authorization.split(' ');
        if (authParts && authParts.length > 1) {
          const jwtAuth = jwt.verify(authParts[1], 'jarvis1');
          // jwt = {username: '', scopes: ['level1:read', 'level2:read']}
          console.log('jwtauth: ', jwtAuth);
          req.auth = jwtAuth;
        }
      }
      next();
    } catch (e) {
      res
        .status(401)
        .send({ message: e.message || 'JWT verification failed.' });
    }
  }
});

graphQLServer.use(
  '*',
  cors({
    origin: true,
    credentials: true,
  }),
);

graphQLServer.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress((request) => {
    return {
      schema,
      formatError,
      context: {
        type: request.method,
        auth: request.auth,
      },
    };
  }),
);
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.listen(GRAPHQL_PORT, () => {
  console.log(`GraphiQL is now running on \
http://localhost:${GRAPHQL_PORT}/graphiql`);
});
