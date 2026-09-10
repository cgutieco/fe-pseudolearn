import type { SmtpSocketLike } from '../api/smtp-protocol';

export interface FakeSmtpSocket extends SmtpSocketLike {
  readonly sent: string[];
  readonly closed: () => boolean;
}

export function createFakeSmtpSocket(responses: readonly string[]): FakeSmtpSocket {
  const sent: string[] = [];
  const pending = [...responses];
  let isClosed = false;

  const build = (): SmtpSocketLike => ({
    readable: new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          const next = pending.shift();
          if (next === undefined) {
            controller.close();
            return;
          }
          controller.enqueue(new TextEncoder().encode(next));
        },
      },
      { highWaterMark: 0 },
    ),
    writable: new WritableStream<Uint8Array>({
      write(chunk) {
        sent.push(new TextDecoder().decode(chunk));
      },
    }),
    startTls: () => build(),
    close: () => {
      isClosed = true;
      return Promise.resolve();
    },
  });

  return Object.assign(build(), { sent, closed: () => isClosed });
}
