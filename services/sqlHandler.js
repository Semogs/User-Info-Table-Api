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
exports.getTotalPostsCount = exports.createPostsTable = exports.createConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const createConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield promise_1.default.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'mysecretpassword',
        database: 'mydatabase'
    });
    yield (0, exports.createPostsTable)(connection);
    return connection;
});
exports.createConnection = createConnection;
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
exports.createPostsTable = createPostsTable;
const getTotalPostsCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, exports.createConnection)();
    const [totalCount] = yield connection.execute('SELECT COUNT(*) as count FROM posts WHERE userId = ?', [userId]);
    return totalCount[0].count;
});
exports.getTotalPostsCount = getTotalPostsCount;
