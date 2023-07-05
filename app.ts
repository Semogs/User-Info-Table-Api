import express, { Request, Response, Router } from "express";
import axios from "axios";
import mysql, { Connection } from "mysql2/promise";

const app = express();
const serverPort = 9777;

const createConnection = async (): Promise<Connection> => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysecretpassword",
    database: "my_database"
  });
  return connection;
};

const createPostsTable = async (connection: Connection): Promise<void> => {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT PRIMARY KEY,
      userId INT,
      title VARCHAR(255),
      body TEXT
    )
  `);
};

app.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/users");
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ message: "Error fetching users" });
  }
});

app.get("/users/:userId/posts", async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId;

  const connection: Connection = await createConnection();
  await createPostsTable(connection);
  const [rows] = await connection.execute("SELECT * FROM posts WHERE userId = ?", [userId]);

  if (rows.length > 0) {
    res.send(rows);
  } else {
    try {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);

      const posts = response.data;
      for (const post of posts) {
        await connection.execute("INSERT INTO posts (id, userId, title, body) VALUES (?, ?, ?, ?)", [
          post.id,
          post.userId,
          post.title,
          post.body
        ]);
      }

      res.send(posts);
    } catch (error) {
      res.status(500).send({ message: "Error fetching posts" });
    }
  }
});

const startServer = async () => {
  try {
    app.listen(serverPort, () => {
      console.log(`Server is running on port => ${serverPort}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

module.exports = app;
