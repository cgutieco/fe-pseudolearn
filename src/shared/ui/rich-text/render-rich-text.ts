const ALLOWED_TAGS = ['code', 'strong', 'em'] as const;

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const ALLOWED_TAG_PATTERN = new RegExp(`&lt;(/?)(${ALLOWED_TAGS.join('|')})&gt;`, 'g');

export function renderRichText(source: string): string {
  const escaped = source.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
  return escaped.replace(ALLOWED_TAG_PATTERN, '<$1$2>');
}
