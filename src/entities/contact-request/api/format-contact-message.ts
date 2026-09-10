import type { ContactRequest } from '../model/contact-request';

interface MessageLine {
  readonly label: string;
  readonly value: string | undefined;
}

export function formatContactMessageBody(request: ContactRequest, userAgent: string | null): string {
  const lines: MessageLine[] = [
    { label: 'Reason', value: request.reason },
    { label: 'Locale', value: request.locale },
    { label: 'Name', value: request.name === '' ? undefined : request.name },
    { label: 'Email', value: request.email },
    { label: 'Platform', value: request.platform },
    { label: 'App version', value: request.appVersion },
    { label: 'Execution step', value: request.executionStep },
    { label: 'Feature intent', value: request.featureIntent },
    { label: 'Current workaround', value: request.currentWorkaround },
    { label: 'Frequency', value: request.frequency },
    { label: 'App area', value: request.appArea },
    { label: 'Friction', value: request.friction },
    { label: 'Subject', value: request.subject },
    { label: 'User agent', value: request.includeEnvironment ? (userAgent ?? undefined) : undefined },
  ];

  const metadata = lines
    .filter((line): line is { label: string; value: string } => line.value !== undefined)
    .map((line) => `${line.label}: ${line.value}`)
    .join('\n');

  const snippet = request.codeSnippet ? `\n\n--- Program ---\n${request.codeSnippet}` : '';
  return `${metadata}\n\n--- Message ---\n${request.message}${snippet}`;
}

export function buildContactSubject(request: ContactRequest): string {
  const author = request.name === '' ? request.email : request.name;
  return `[PseudoLearn/${request.locale}] ${request.reason} - ${author}`;
}
