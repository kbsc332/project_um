import cookieParser from 'cookie-parser';
import express from 'express';
import { Request, Response } from 'express';
import morgan from 'morgan';
import {logger } from '@shared';
import path from 'path';
import BaseRouter from './routes';
import { resolvers } from './graphQL/resolvers';
import { ApolloServer } from 'apollo-server-express';
import { schema } from './graphQL/schema';

// Init express
const app = express();

// Add middleware/settings/routes to express.
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// TODO, 세션 체크를 여기서 하자
//

app.use('/', BaseRouter);

const server = new ApolloServer({
  typeDefs: schema,
  context: async ({ req }) => {
    let accountID : any = null;
    let session : any = null;
     try {
      accountID = req.headers['accountid'];
      session = req.headers['session'];

     } catch (e) {
        console.warn('header가 없는데..');
     }

    return {
      accountID,
      session,
    };
 },
  resolvers,
  playground: process.env.NODE_ENV === 'production' ? false : true
});
server.applyMiddleware( { app : app, path :'/api' } );

/**
 * Point express to the 'views' directory. If you're using a
 * single-page-application framework like react or angular
 * which has its own development server, you might want to
 * configure this to only serve the index file while in
 * production mode.
 */
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));


// Export express instance
export default app;
