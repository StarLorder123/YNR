import { createLogger, format, transports, Logger as WinstonLogger } from "winston";
import path from "path";
import fs from "fs";

const logDir = path.resolve(process.cwd(), "logs");
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch {}

export class Logger {
  private logger: WinstonLogger;
  private scope?: string;

  constructor(filename = "app.log", scope?: string) {
    this.scope = scope;
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
          const label = this.scope ? ` [${this.scope}]` : "";
          return `[${timestamp}] [${level.toUpperCase()}]${label} ${message}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, filename) }),
      ],
    });
  }

  info(message: string) {
    this.logger.info(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
