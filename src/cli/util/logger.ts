import kleur from 'kleur';

export const log = {
  info: (msg: string) => process.stdout.write(`${msg}\n`),
  success: (msg: string) => process.stdout.write(`${kleur.green('✓')} ${msg}\n`),
  warn: (msg: string) => process.stderr.write(`${kleur.yellow('!')} ${msg}\n`),
  error: (msg: string) => process.stderr.write(`${kleur.red('✗')} ${msg}\n`),
  dim: (msg: string) => process.stdout.write(`${kleur.gray(msg)}\n`),
};
