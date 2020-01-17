import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import mongoose from 'mongoose';

import routes from './routes';

const app = express();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(3333, () => console.log('Server running ...'));
