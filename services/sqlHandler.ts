import mysql, { Connection, RowDataPacket } from 'mysql2/promise';

export const createConnection = async (): Promise<Connection> => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysecretpassword',
    database: 'mydatabase'
  });

  await createPostsTable(connection);

  return connection;
};

export const createPostsTable = async (connection: any): Promise<void> => {
  await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY,
        userId INT,
        title VARCHAR(255),
        body TEXT
      )
    `);
};

export const getTotalPostsCount = async (userId: string): Promise<number> => {
  const connection = await createConnection();
  const [totalCount] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM posts WHERE userId = ?', [userId]);
  return totalCount[0].count;
};
