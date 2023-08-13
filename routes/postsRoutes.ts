import express, { Request, Response } from 'express';
import { getPosts, deletePost } from '../services/postService';

const postsRouter = express.Router();

postsRouter.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId;
  const pageNumber: number = Number(req.query.pageNumber) || 1;
  const pageSize: number = Number(req.query.pageSize) || 4;

  const ans = await getPosts(userId, pageNumber, pageSize);
  res.send(ans);
});

postsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const postId: number = Number(req.params.id);

  const ans = await deletePost(postId);
  res.send(ans);
});

module.exports = postsRouter;
