import { createLogger, format, transports, Logger as WinstonLogger } from "winston";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");

export class Logger {
  private logger: WinstonLogger;

  constructor(filename = "app.log") {
    this.logger = createLogger({
      level: "debug",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          ({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`
        )
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
