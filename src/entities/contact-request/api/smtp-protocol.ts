export interface SmtpSocketLike {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
  startTls(): SmtpSocketLike;
  close(): Promise<void>;
}

export interface SmtpCredentials {
  readonly host: string;
  readonly username: string;
  readonly password: string;
}

export interface MimeMessage {
  readonly from: string;
  readonly to: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly body: string;
}

export class SmtpError extends Error {}

const ASCII_PRINTABLE = /^[ -~]*$/;

export function encodeHeaderValue(value: string): string {
  const sanitized = value.replace(/[\r\n]+/g, ' ').trim();
  if (ASCII_PRINTABLE.test(sanitized)) return sanitized;
  const bytes = new TextEncoder().encode(sanitized);
  const encoded = btoa(String.fromCharCode(...bytes));
  return `=?UTF-8?B?${encoded}?=`;
}

export function buildMimeMessage(message: MimeMessage): string {
  const headers = [
    `From: ${encodeHeaderValue(message.from)}`,
    `To: ${encodeHeaderValue(message.to)}`,
    `Reply-To: ${encodeHeaderValue(message.replyTo)}`,
    `Subject: ${encodeHeaderValue(message.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ];
  const body = message.body.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
  return `${headers.join('\r\n')}\r\n\r\n${body}\r\n.\r\n`;
}

export function isCompleteResponse(buffer: string): boolean {
  const lines = buffer.split('\r\n').filter((line) => line !== '');
  const lastLine = lines.at(-1);
  return lastLine !== undefined && /^\d{3} /.test(lastLine);
}

export async function readSmtpResponse(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder();
  let buffer = '';
  while (!isCompleteResponse(buffer)) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
  }
  return buffer;
}

export function expectStatus(response: string, expected: number): void {
  const code = Number.parseInt(response.slice(0, 3), 10);
  if (code !== expected) {
    throw new SmtpError(`Expected SMTP ${expected}, received "${response.trim()}"`);
  }
}

export function encodeCredentials(username: string, password: string): string {
  const separator = String.fromCharCode(0);
  return btoa(`${separator}${username}${separator}${password}`);
}

export function buildSubject(reason: string, locale: string): string {
  return `[PseudoLearn·${locale}] ${reason}`;
}
