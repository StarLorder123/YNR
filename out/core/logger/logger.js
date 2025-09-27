"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.resolve(process.cwd(), "logs");
class Logger {
    logger;
    constructor(filename = "app.log") {
        this.logger = (0, winston_1.createLogger)({
            level: "debug",
            format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`)),
            transports: [
                new winston_1.transports.Console(),
                new winston_1.transports.File({ filename: path_1.default.join(logDir, filename) }),
            ],
        });
    }
    info(message) {
        this.logger.info(message);
    }
    warn(message) {
        this.logger.warn(message);
    }
    error(message) {
        this.logger.error(message);
    }
    debug(message) {
        this.logger.debug(message);
    }
}
exports.Logger = Logger;
