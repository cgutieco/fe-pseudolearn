import type { ContactRequest } from '../model/contact-request';

export type MailDeliveryResult =
  { readonly kind: 'sent' } | { readonly kind: 'rejected' } | { readonly kind: 'unavailable' };

export interface MailGateway {
  deliver(request: ContactRequest): Promise<MailDeliveryResult>;
}
