import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import mysql, { Connection, RowDataPacket } from "mysql2/promise";

const app = express();
const serverPort = 9777;

app.use(cors());

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

app.get("/posts/:userId", async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId;
  const pageNumber: number = Number(req.query.pageNumber) || 1;
  const pageSize: number = Number(req.query.pageSize) || 4;

  try {
    const connection: Connection = await createConnection();
    await createPostsTable(connection);

    const offset: number = (pageNumber - 1) * pageSize;
    const [rows] = await connection.execute<RowDataPacket[]>("SELECT * FROM posts WHERE userId = ? LIMIT ? OFFSET ?", [
      userId,
      pageSize,
      offset
    ]);

    const [totalCount] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM posts WHERE userId = ?", [userId]);

    const total: number = totalCount[0].count;

    if (rows.length > 0) {
      res.send({ posts: rows, total });
    } else {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      const posts = response.data.slice(offset, offset + pageSize);

      for (const post of response.data) {
        await connection.execute("INSERT INTO posts (id, userId, title, body) VALUES (?, ?, ?, ?)", [
          post.id,
          post.userId,
          post.title,
          post.body
        ]);
      }

      res.send({ posts: posts, total: response.data.length });
    }

    connection.end();
  } catch (error) {
    res.status(500).send({ message: "Error fetching posts" });
  }
});

app.delete("/posts/:id", async (req: Request, res: Response): Promise<void> => {
  const postId: number = Number(req.params.id);

  const connection: Connection = await createConnection();

  try {
    await connection.execute("DELETE FROM posts WHERE id = ?", [postId]);

    res.send({ success: true });
  } catch (error) {
    res.status(500).send({ message: "Error deleting post" });
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
