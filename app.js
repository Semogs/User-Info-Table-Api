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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const promise_1 = __importDefault(require("mysql2/promise"));
const app = (0, express_1.default)();
const serverPort = 9777;
app.use((0, cors_1.default)());
const createConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield promise_1.default.createConnection({
        host: "localhost",
        user: "root",
        password: "mysecretpassword",
        database: "my_database"
    });
    return connection;
});
const createPostsTable = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    yield connection.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT PRIMARY KEY,
      userId INT,
      title VARCHAR(255),
      body TEXT
    )
  `);
});
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get("https://jsonplaceholder.typicode.com/users");
        res.send(response.data);
    }
    catch (error) {
        res.send({ success: false });
    }
}));
app.get("/posts/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 4;
    try {
        const connection = yield createConnection();
        yield createPostsTable(connection);
        const [totalCount] = yield connection.execute("SELECT COUNT(*) as count FROM posts WHERE userId = ?", [userId]);
        const total = totalCount[0].count;
        const maxPage = Math.ceil(total / pageSize);
        const validPageNumber = Math.max(1, Math.min(pageNumber, maxPage));
        const offset = (validPageNumber - 1) * pageSize;
        const [rows] = yield connection.execute("SELECT * FROM posts WHERE userId = ? LIMIT ? OFFSET ?", [
            userId,
            pageSize,
            offset
        ]);
        if (rows.length > 0) {
            res.send({ posts: rows, total });
        }
        else {
            const response = yield axios_1.default.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
            const posts = response.data.slice(offset, offset + pageSize);
            for (const post of response.data) {
                yield connection.execute("INSERT INTO posts (id, userId, title, body) VALUES (?, ?, ?, ?)", [
                    post.id,
                    post.userId,
                    post.title,
                    post.body
                ]);
            }
            res.send({ posts: posts, total: response.data.length });
        }
        connection.end();
    }
    catch (error) {
        res.send({ success: false });
    }
}));
app.delete("/posts/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = Number(req.params.id);
    const connection = yield createConnection();
    try {
        yield connection.execute("DELETE FROM posts WHERE id = ?", [postId]);
        res.send({ success: true });
    }
    catch (error) {
        res.send({ success: false });
    }
}));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        app.listen(serverPort, () => {
            console.log(`Server is running on port => ${serverPort}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
startServer();
module.exports = app;
