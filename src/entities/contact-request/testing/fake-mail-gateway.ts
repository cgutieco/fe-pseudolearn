import type { ContactRequest } from '../model/contact-request';
import type { MailGateway, MailDeliveryResult } from '../api/mail-gateway';

export interface RecordingMailGateway extends MailGateway {
  readonly delivered: ContactRequest[];
}

export function createFakeMailGateway(result: MailDeliveryResult = { kind: 'sent' }): RecordingMailGateway {
  const delivered: ContactRequest[] = [];
  return {
    delivered,
    deliver: (request) => {
      delivered.push(request);
      return Promise.resolve(result);
    },
  };
}
