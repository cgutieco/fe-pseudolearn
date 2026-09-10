import {
  buildMimeMessage,
  encodeCredentials,
  expectStatus,
  readSmtpResponse,
  type MimeMessage,
  type SmtpCredentials,
  type SmtpSocketLike,
} from './smtp-protocol';

interface SmtpChannel {
  read(): Promise<string>;
  send(payload: string): Promise<void>;
  release(): Promise<void>;
}

export async function sendMailOverSmtp(
  socket: SmtpSocketLike,
  credentials: SmtpCredentials,
  message: MimeMessage,
): Promise<void> {
  const plain = openChannel(socket);
  expectStatus(await plain.read(), 220);
  await plain.send(`EHLO ${credentials.host}\r\n`);
  expectStatus(await plain.read(), 250);
  await plain.send('STARTTLS\r\n');
  expectStatus(await plain.read(), 220);
  await plain.release();

  const secureSocket = socket.startTls();
  const secure = openChannel(secureSocket);
  await authenticate(secure, credentials);
  await transferMessage(secure, message);
  await secure.send('QUIT\r\n');
  await secure.release();
  await secureSocket.close().catch(() => undefined);
}

async function authenticate(channel: SmtpChannel, credentials: SmtpCredentials): Promise<void> {
  await channel.send(`EHLO ${credentials.host}\r\n`);
  expectStatus(await channel.read(), 250);
  await channel.send(`AUTH PLAIN ${encodeCredentials(credentials.username, credentials.password)}\r\n`);
  expectStatus(await channel.read(), 235);
}

async function transferMessage(channel: SmtpChannel, message: MimeMessage): Promise<void> {
  await channel.send(`MAIL FROM:<${message.from}>\r\n`);
  expectStatus(await channel.read(), 250);
  await channel.send(`RCPT TO:<${message.to}>\r\n`);
  expectStatus(await channel.read(), 250);
  await channel.send('DATA\r\n');
  expectStatus(await channel.read(), 354);
  await channel.send(buildMimeMessage(message));
  expectStatus(await channel.read(), 250);
}

function openChannel(socket: SmtpSocketLike): SmtpChannel {
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const encoder = new TextEncoder();
  return {
    read: () => readSmtpResponse(reader),
    send: async (payload) => {
      await writer.write(encoder.encode(payload));
    },
    release: async () => {
      reader.releaseLock();
      writer.releaseLock();
    },
  };
}
