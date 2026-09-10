declare module 'cloudflare:sockets' {
  export interface SocketAddress {
    hostname: string;
    port: number;
  }

  export interface SocketOptions {
    secureTransport?: 'off' | 'on' | 'starttls';
    allowHalfOpen?: boolean;
  }

  export interface Socket {
    readonly readable: ReadableStream<Uint8Array>;
    readonly writable: WritableStream<Uint8Array>;
    startTls(): Socket;
    close(): Promise<void>;
  }

  export function connect(address: SocketAddress, options?: SocketOptions): Socket;
}

declare module 'cloudflare:workers' {
  export const env: Record<string, string | undefined>;
}
