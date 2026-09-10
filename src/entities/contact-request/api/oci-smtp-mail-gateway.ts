import { connect } from 'cloudflare:sockets';
import type { ContactRequest } from '../model/contact-request';
import { buildContactSubject, formatContactMessageBody } from './format-contact-message';
import type { MailDeliveryResult, MailGateway } from './mail-gateway';
import { SmtpError, type SmtpSocketLike } from './smtp-protocol';
import { sendMailOverSmtp } from './smtp-session';

export interface OciSmtpSettings {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly fromAddress: string;
  readonly toAddress: string;
  readonly userAgent: string | null;
}

export function createOciSmtpMailGateway(settings: OciSmtpSettings): MailGateway {
  return {
    async deliver(request: ContactRequest): Promise<MailDeliveryResult> {
      const socket = connect(
        { hostname: settings.host, port: settings.port },
        { secureTransport: 'starttls', allowHalfOpen: false },
      ) as unknown as SmtpSocketLike;

      try {
        await sendMailOverSmtp(
          socket,
          { host: settings.host, username: settings.username, password: settings.password },
          {
            from: settings.fromAddress,
            to: settings.toAddress,
            replyTo: request.email,
            subject: buildContactSubject(request),
            body: formatContactMessageBody(request, settings.userAgent),
          },
        );
        return { kind: 'sent' };
      } catch (error) {
        return error instanceof SmtpError ? { kind: 'rejected' } : { kind: 'unavailable' };
      } finally {
        await socket.close().catch(() => undefined);
      }
    },
  };
}
