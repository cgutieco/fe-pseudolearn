import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import ContactForm from './ContactForm.astro';
import { CONTACT_REASONS } from '@entities/contact-request/model/contact-request';

let container: AstroContainer;
const props = { locale: 'es' as const, privacyHref: '/privacy', turnstileSiteKey: 'test-key' };

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('ContactForm', () => {
  it('renders one branch per reason', async () => {
    const html = await container.renderToString(ContactForm, { props });
    for (const reason of CONTACT_REASONS) {
      expect(html).toContain(`pl-branch--${reason}`);
      expect(html).toContain(`id="reason-${reason}"`);
    }
  });

  it('gives every control a label', async () => {
    const html = await container.renderToString(ContactForm, { props });
    for (const id of ['name-field', 'email-field', 'message-field', 'snippet-field']) {
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
  });

  it('wires the message counter through aria-describedby', async () => {
    const html = await container.renderToString(ContactForm, { props });
    expect(html).toContain('aria-describedby="message-counter"');
    expect(html).toContain('id="message-counter"');
    expect(html).toContain('aria-live="polite"');
  });

  it('posts to the contact endpoint', async () => {
    const html = await container.renderToString(ContactForm, { props });
    expect(html).toContain('action="/api/contact"');
    expect(html).toContain('method="post"');
  });

  it('ships the client messages already translated', async () => {
    const spanish = await container.renderToString(ContactForm, { props });
    const english = await container.renderToString(ContactForm, { props: { ...props, locale: 'en' } });
    expect(spanish).toContain('Enviando');
    expect(english).toContain('Sending');
  });

  it('offers no file input, only a pasted program', async () => {
    const html = await container.renderToString(ContactForm, { props });
    expect(html).not.toContain('type="file"');
    expect(html).toContain('name="codeSnippet"');
  });

  it('renders the turnstile mount without loading third party script markup', async () => {
    const html = await container.renderToString(ContactForm, { props });
    expect(html).toContain('data-turnstile-sitekey="test-key"');
    expect(html).not.toContain('challenges.cloudflare.com');
  });
});
