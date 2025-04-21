import express from 'express';
import type { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import db from './config/connection.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import http from 'http';
import { typeDefs, resolvers } from './schema/index.js';
import { authenticateToken } from './services/auth.js';

interface context {
  user?: {
    _id: string;
    username: string;
    email: string;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);
const server = new ApolloServer<context>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}




app.use('/graphql',
  express.urlencoded({ extended: true }),
  express.json(),
  expressMiddleware(server, {
    context:authenticateToken,
  }),
);

db.once('open', () => {
  console.log('🚀 MongoDB connection established');
});

await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);







