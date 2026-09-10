import { describe, expect, it } from 'vitest';
import { createFakeSmtpSocket } from '../testing/fake-smtp-socket';
import { SmtpError } from './smtp-protocol';
import { sendMailOverSmtp } from './smtp-session';

const credentials = { host: 'smtp.example.com', username: 'user', password: 'pass' };

const message = {
  from: 'no-reply@pseudolearn.app',
  to: 'support@pseudolearn.com',
  replyTo: 'ana@ejemplo.com',
  subject: 'Una duda',
  body: 'Cuerpo del mensaje',
};

const HAPPY_PATH = [
  '220 ready\r\n',
  '250 ok\r\n',
  '220 go ahead\r\n',
  '250 ok\r\n',
  '235 authenticated\r\n',
  '250 sender ok\r\n',
  '250 recipient ok\r\n',
  '354 start mail input\r\n',
  '250 queued\r\n',
];

describe('sendMailOverSmtp', () => {
  it('walks the whole conversation and sends the payload', async () => {
    const socket = createFakeSmtpSocket(HAPPY_PATH);
    await sendMailOverSmtp(socket, credentials, message);
    const conversation = socket.sent.join('');
    expect(conversation).toContain('STARTTLS');
    expect(conversation).toContain('AUTH PLAIN');
    expect(conversation).toContain('MAIL FROM:<no-reply@pseudolearn.app>');
    expect(conversation).toContain('RCPT TO:<support@pseudolearn.com>');
    expect(conversation).toContain('Cuerpo del mensaje');
    expect(conversation).toContain('QUIT');
  });

  it('fails when the greeting is not 220', async () => {
    const socket = createFakeSmtpSocket(['554 no service\r\n']);
    await expect(sendMailOverSmtp(socket, credentials, message)).rejects.toBeInstanceOf(SmtpError);
  });

  it('fails when authentication is rejected', async () => {
    const responses = [...HAPPY_PATH];
    responses[4] = '535 bad credentials\r\n';
    const socket = createFakeSmtpSocket(responses);
    await expect(sendMailOverSmtp(socket, credentials, message)).rejects.toBeInstanceOf(SmtpError);
  });

  it('fails when the recipient is refused', async () => {
    const responses = [...HAPPY_PATH];
    responses[6] = '550 unknown recipient\r\n';
    const socket = createFakeSmtpSocket(responses);
    await expect(sendMailOverSmtp(socket, credentials, message)).rejects.toBeInstanceOf(SmtpError);
  });

  it('never sends the password in the clear before the tls upgrade', async () => {
    const socket = createFakeSmtpSocket(HAPPY_PATH);
    await sendMailOverSmtp(socket, credentials, message);
    const beforeUpgrade = socket.sent.slice(
      0,
      socket.sent.findIndex((line) => line.includes('STARTTLS')) + 1,
    );
    expect(beforeUpgrade.join('')).not.toContain('AUTH');
  });
});
