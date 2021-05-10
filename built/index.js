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
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const server = require('./api/server');
const { connectDb } = require('./model/index');
const port = parseInt(process.env.PORT || '7000');
connectDb()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        server.listen(port, () => console.log(`===== Server running on port ${port} =====`));
    }
    catch (error) {
        console.error(error);
    }
}))
    .catch((error) => console.error(error));
