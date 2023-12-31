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
const cors_1 = __importDefault(require("cors"));
const sqlHandler_1 = require("./services/sqlHandler");
const app = (0, express_1.default)();
const serverPort = 9777;
app.use((0, cors_1.default)());
app.use('/users', require('./routes/userRoutes'));
app.use('/posts', require('./routes/postsRoutes'));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, sqlHandler_1.createConnection)();
        app.listen(serverPort, () => {
            console.log(`Server is running on port => ${serverPort}`);
        });
        const connection = yield (0, sqlHandler_1.createConnection)();
        if (connection)
            console.log('Connected to DB');
    }
    catch (error) {
        console.log(error);
    }
});
startServer();
module.exports = app;
