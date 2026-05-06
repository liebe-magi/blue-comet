// Programmatic surface of the bluecomet CLI.
// Useful for scripts that want to skip the argv parser.

export { runLogin } from './commands/login';
export { runLogout } from './commands/logout';
export { runPost } from './commands/post';
export { runLink } from './commands/link';

export type { LoginInput } from './commands/login';
export type { PostOptions } from './commands/post';
export type { LinkOptions, LinkReport, LinkReportEntry } from './commands/link';
export type { BlueCometConfig } from './config';
export { loadConfig, loadConfigFromExplicitPath } from './config';
