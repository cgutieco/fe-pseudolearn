const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FIELD_NAME = 'cf-turnstile-response';

interface TurnstileApi {
  render(container: HTMLElement, options: { sitekey: string }): string;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi | null> | null = null;

export function loadTurnstile(): Promise<TurnstileApi | null> {
  loading ??= new Promise<TurnstileApi | null>((resolve) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile ?? null);
    script.onerror = () => resolve(null);
    document.head.append(script);
  });
  return loading;
}

export function mountTurnstile(container: HTMLElement): void {
  const sitekey = container.dataset.turnstileSitekey ?? '';
  if (sitekey === '' || container.childElementCount > 0) return;
  void loadTurnstile().then((api) => api?.render(container, { sitekey }));
}

export function turnstileToken(form: HTMLFormElement): string {
  const field = form.querySelector<HTMLInputElement>(`[name="${FIELD_NAME}"]`);
  return field?.value ?? '';
}
