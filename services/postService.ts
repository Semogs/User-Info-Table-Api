import axios from 'axios';
import { RowDataPacket } from 'mysql2/promise';
import { createConnection, createPostsTable, getTotalPostsCount } from './sqlHandler';

export const getPosts = async (userId: string, pageNumber: number, pageSize: number) => {
  try {
    const connection = await createConnection();
    const total = await getTotalPostsCount(userId);

    const maxPage = Math.ceil(total / pageSize);
    const validPageNumber = Math.max(1, Math.min(pageNumber, maxPage));
    const offset = (validPageNumber - 1) * pageSize;

    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM posts WHERE userId = ? LIMIT ? OFFSET ?', [
      userId,
      pageSize,
      offset
    ]);

    if (rows.length > 0) {
      return { posts: rows, total };
    } else {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      const posts = response.data.slice(offset, offset + pageSize);

      for (const post of response.data) {
        await connection.execute('INSERT INTO posts (id, userId, title, body) VALUES (?, ?, ?, ?)', [
          post.id,
          post.userId,
          post.title,
          post.body
        ]);
      }

      return { posts: posts, total: response.data.length };
    }
  } catch (error) {
    return { success: false };
  }
};

export const deletePost = async (postId: number) => {
  const connection = await createConnection();

  try {
    await connection.execute('DELETE FROM posts WHERE id = ?', [postId]);

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
