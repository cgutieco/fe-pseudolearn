export function connect(): never {
  throw new Error(
    'cloudflare:sockets is not available in tests. Use the fake socket from entities/contact-request/testing.',
  );
}
