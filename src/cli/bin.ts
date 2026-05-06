import { cac } from 'cac';
import { runLogin } from './commands/login';
import { runLogout } from './commands/logout';
import { runPost } from './commands/post';
import { runLink } from './commands/link';
import { log } from './util/logger';

const cli = cac('bluecomet');

cli
  .command('login', 'Save Bluesky credentials (handle + app password) locally')
  .option('--handle <handle>', 'Bluesky handle (skips the prompt)')
  .option('--service <url>', 'PDS service URL', { default: 'https://bsky.social' })
  .action(async (options: { handle?: string; service?: string }) => {
    await runLogin({ handle: options.handle, service: options.service });
  });

cli.command('logout', 'Remove the stored Bluesky credentials').action(async () => {
  await runLogout();
});

cli
  .command('post', 'Create a Bluesky post and print its URI')
  .option('--text <text>', 'Text to post')
  .option('--stdin', 'Read post text from stdin')
  .option('--json', 'Output the result as JSON')
  .option('--lang <lang>', 'Language tag (default: en)')
  .action(async (options: { text?: string; stdin?: boolean; json?: boolean; lang?: string }) => {
    await runPost(options);
  });

cli
  .command(
    'link [...files]',
    'Create a Bluesky post per file and write the URI back to frontmatter'
  )
  .option('--text-template <tpl>', 'Mustache-style template; tokens map to frontmatter keys')
  .option('--frontmatter-key <key>', 'Frontmatter key to write the URI into', {
    default: 'bluesky',
  })
  .option('--dry-run', 'Print the rendered text without posting or writing')
  .option('--skip-existing', 'Skip files that already have the frontmatter key (default)')
  .option('--force', 'Overwrite existing frontmatter values')
  .option('--config <path>', 'Path to a bluecomet.config.{json,mjs,js}')
  .option('--concurrency <n>', 'Number of parallel requests', { default: 1 })
  .option('--lang <lang>', 'Language tag for the resulting post')
  .action(
    async (
      files: string[],
      options: {
        textTemplate?: string;
        frontmatterKey?: string;
        dryRun?: boolean;
        skipExisting?: boolean;
        force?: boolean;
        config?: string;
        concurrency?: number;
        lang?: string;
      }
    ) => {
      await runLink(files, {
        textTemplate: options.textTemplate,
        frontmatterKey: options.frontmatterKey,
        dryRun: options.dryRun,
        skipExisting: options.skipExisting,
        force: options.force,
        configPath: options.config,
        concurrency: options.concurrency,
        language: options.lang,
      });
    }
  );

cli.help();
cli.version(getVersion());

function getVersion(): string {
  // The bundler inlines this string at build time via tsup's define option,
  // but for now read the package.json next to dist/ at runtime as a fallback.
  return process.env.BLUECOMET_VERSION ?? '1.0.0-alpha.0';
}

async function main(): Promise<void> {
  try {
    cli.parse(process.argv, { run: false });
    await cli.runMatchedCommand();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(message);
    process.exit(1);
  }
}

void main();
