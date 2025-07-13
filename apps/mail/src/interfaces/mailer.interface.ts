export interface Mailer {
  sendMail(to: string, subject: string, html: string): Promise<void>;
}
