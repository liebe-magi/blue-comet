export class BlueCometError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'BlueCometError';
  }
}

export class NotFoundError extends BlueCometError {
  readonly uri: string;

  constructor(uri: string) {
    super(`Post not found: ${uri}`);
    this.name = 'NotFoundError';
    this.uri = uri;
  }
}

export class NetworkError extends BlueCometError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NetworkError';
  }
}
