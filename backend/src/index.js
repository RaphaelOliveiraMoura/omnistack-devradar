import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';

import mongoose from 'mongoose';

import routes from './routes';

import { setupWebsocket } from './websocket';

const app = express();
const server = http.Server(app);

setupWebsocket(server);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use(routes);

server.listen(3333, () => console.log('Server running ...'));
