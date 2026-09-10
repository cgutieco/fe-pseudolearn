import { emailMessage, messageForOutcome, renderCounter, type ClientMessages } from './form-messages';
import { mountTurnstile, turnstileToken } from './turnstile-widget';
import { attachCustomSelects } from '@shared/ui/select-field';

export function attachContactForm(root: ParentNode): void {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const messages = JSON.parse(form.dataset.messages ?? '{}') as ClientMessages;

  attachCounter(form, messages);
  attachEmailValidation(form, messages);
  attachTurnstile(form);
  attachSubmit(form, messages);
  attachCustomSelects(form);
}

function attachCounter(form: HTMLFormElement, messages: ClientMessages): void {
  const textarea = form.querySelector<HTMLTextAreaElement>('#message-field');
  const counter = form.querySelector<HTMLElement>('#message-counter');
  if (!textarea || !counter) return;
  const limit = Number(form.dataset.messageLimit ?? '2000');
  const update = () => {
    counter.textContent = renderCounter(messages.counter, textarea.value.length, limit);
  };
  textarea.addEventListener('input', update);
  update();
}

function attachEmailValidation(form: HTMLFormElement, messages: ClientMessages): void {
  const input = form.querySelector<HTMLInputElement>('#email-field');
  const error = form.querySelector<HTMLElement>('[data-email-error]');
  const errorText = form.querySelector<HTMLElement>('[data-email-error-text]');
  if (!input || !error || !errorText) return;

  const validate = () => {
    const isEmpty = input.value.length === 0;
    const isValid = isEmpty || input.validity.valid;
    error.hidden = isValid;
    input.setAttribute('aria-invalid', String(!isValid));
    if (!isValid) errorText.textContent = emailMessage(messages, input.value);
  };

  input.addEventListener('blur', validate);
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validate();
  });
}

function attachTurnstile(form: HTMLFormElement): void {
  const container = form.querySelector<HTMLElement>('[data-turnstile-sitekey]');
  if (!container) return;
  form.addEventListener('focusin', () => mountTurnstile(container), { once: true });
}

function attachSubmit(form: HTMLFormElement, messages: ClientMessages): void {
  const button = form.querySelector<HTMLButtonElement>('[data-submit-button]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!button || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    void submitForm({ form, button, status, messages });
  });
}

interface SubmissionContext {
  readonly form: HTMLFormElement;
  readonly button: HTMLButtonElement;
  readonly status: HTMLElement;
  readonly messages: ClientMessages;
}

async function submitForm({ form, button, status, messages }: SubmissionContext): Promise<void> {
  button.disabled = true;
  showStatus(status, messages.sending, 'pending');
  const payload = new FormData(form);
  payload.set('locale', form.dataset.locale ?? 'es');
  payload.set('turnstileToken', turnstileToken(form));

  try {
    const response = await fetch(form.action, { method: 'POST', body: payload });
    const outcome = (await response.json()) as { status?: string; fields?: Record<string, string> };
    const resultStatus = outcome.status ?? 'mail_failed';
    showStatus(
      status,
      messageForOutcome(messages, resultStatus),
      resultStatus === 'ok' ? 'success' : 'error',
    );
    markInvalidFields(form, outcome.fields ?? {});
    if (resultStatus === 'ok') form.reset();
  } catch {
    showStatus(status, messages.networkError, 'error');
  } finally {
    button.disabled = false;
  }
}

function markInvalidFields(form: HTMLFormElement, fields: Record<string, string>): void {
  form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
  const names = Object.keys(fields);
  names.forEach((name) => form.querySelector(`[name="${name}"]`)?.setAttribute('aria-invalid', 'true'));
  if (names[0]) form.querySelector<HTMLElement>(`[name="${names[0]}"]`)?.focus();
}

function showStatus(status: HTMLElement, text: string, tone: string): void {
  status.textContent = text;
  status.dataset.tone = tone;
  status.hidden = false;
}
