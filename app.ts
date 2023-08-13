import express from 'express';
import cors from 'cors';
import { createConnection } from './services/sqlHandler';

const app = express();
const serverPort = 9777;

app.use(cors());

app.use('/users', require('./routes/userRoutes'));
app.use('/posts', require('./routes/postsRoutes'));

const startServer = async () => {
  try {
    await createConnection();
    app.listen(serverPort, () => {
      console.log(`Server is running on port => ${serverPort}`);
    });
    const connection = await createConnection();
    if (connection) console.log('Connected to DB');
  } catch (error) {
    console.log(error);
  }
};

startServer();

module.exports = app;
