import express, { Request, Response } from "express";
import { getUsers } from "../services/userService";

const userRouter = express.Router();

userRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const ans = await getUsers();
  res.send(ans);
});

module.exports = userRouter;
