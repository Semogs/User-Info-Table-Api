"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.getPosts = void 0;
const axios_1 = __importDefault(require("axios"));
const sqlHandler_1 = require("./sqlHandler");
const getPosts = (userId, pageNumber, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, sqlHandler_1.createConnection)();
        const total = yield (0, sqlHandler_1.getTotalPostsCount)(userId);
        const maxPage = Math.ceil(total / pageSize);
        const validPageNumber = Math.max(1, Math.min(pageNumber, maxPage));
        const offset = (validPageNumber - 1) * pageSize;
        const [rows] = yield connection.execute('SELECT * FROM posts WHERE userId = ? LIMIT ? OFFSET ?', [
            userId,
            pageSize,
            offset
        ]);
        if (rows.length > 0) {
            return { posts: rows, total };
        }
        else {
            const response = yield axios_1.default.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
            const posts = response.data.slice(offset, offset + pageSize);
            for (const post of response.data) {
                yield connection.execute('INSERT INTO posts (id, userId, title, body) VALUES (?, ?, ?, ?)', [
                    post.id,
                    post.userId,
                    post.title,
                    post.body
                ]);
            }
            return { posts: posts, total: response.data.length };
        }
    }
    catch (error) {
        return { success: false };
    }
});
exports.getPosts = getPosts;
const deletePost = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, sqlHandler_1.createConnection)();
    try {
        yield connection.execute('DELETE FROM posts WHERE id = ?', [postId]);
        return { success: true };
    }
    catch (error) {
        return { success: false };
    }
});
exports.deletePost = deletePost;
