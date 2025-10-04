import nodemailer from "nodemailer";
import { Logger } from "../core/logger/logger";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export class SmtpMailer {
  private transporter;
  private logger = new Logger("mail.log");
  private from: string;

  constructor(config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
    this.from = config.from;
  }

  async send(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    });
    this.logger.info(`邮件已发送: ${subject} -> ${to}; id=${info.messageId}`);
    return info;
  }
}

export function loadSmtpConfigFromEnv(): SmtpConfig | undefined {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM ?? "review@localhost";
  if (!host || !user || !pass) return undefined;
  return { host, port, secure, user, pass, from };
}


