import { Command } from 'commander';
import { runLink } from './commands/link';
import { runLogin } from './commands/login';
import { runLogout } from './commands/logout';
import { runPost } from './commands/post';
import { log } from './util/logger';

const VERSION = process.env.BLUECOMET_VERSION ?? '0.0.0';

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('bluecomet')
    .description('Manage Bluesky posts that host comments for blog articles.')
    .version(VERSION);

  program
    .command('login')
    .description('Save Bluesky credentials (handle + app password) locally')
    .option('--handle <handle>', 'Bluesky handle (skips the prompt)')
    .option('--service <url>', 'PDS service URL', 'https://bsky.social')
    .action(async (opts: { handle?: string; service?: string }) => {
      await runLogin({ handle: opts.handle, service: opts.service });
    });

  program
    .command('logout')
    .description('Remove the stored Bluesky credentials')
    .action(async () => {
      await runLogout();
    });

  program
    .command('post')
    .description('Create a Bluesky post and print its URI')
    .option('--text <text>', 'Text to post')
    .option('--stdin', 'Read post text from stdin')
    .option('--json', 'Output the result as JSON')
    .option('--lang <lang>', 'Language tag (default: en)')
    .action(async (opts: { text?: string; stdin?: boolean; json?: boolean; lang?: string }) => {
      await runPost(opts);
    });

  program
    .command('link')
    .description('Create a Bluesky post per file and write the URI back to frontmatter')
    .argument('[files...]', 'Files to link')
    .option('--text-template <tpl>', 'Mustache-style template; tokens map to frontmatter keys')
    .option('--frontmatter-key <key>', 'Frontmatter key to write the URI into', 'bluesky')
    .option('--dry-run', 'Print the rendered text without posting or writing')
    .option('--skip-existing', 'Skip files that already have the frontmatter key (default)')
    .option('--force', 'Overwrite existing frontmatter values')
    .option('--config <path>', 'Path to a bluecomet.config.{json,mjs,js}')
    .option('--concurrency <n>', 'Number of parallel requests', '1')
    .option('--lang <lang>', 'Language tag for the resulting post')
    .action(
      async (
        files: string[],
        opts: {
          textTemplate?: string;
          frontmatterKey?: string;
          dryRun?: boolean;
          skipExisting?: boolean;
          force?: boolean;
          config?: string;
          concurrency?: string;
          lang?: string;
        }
      ) => {
        await runLink(files, {
          textTemplate: opts.textTemplate,
          frontmatterKey: opts.frontmatterKey,
          dryRun: opts.dryRun,
          skipExisting: opts.skipExisting,
          force: opts.force,
          configPath: opts.config,
          concurrency: opts.concurrency ? Number(opts.concurrency) : undefined,
          language: opts.lang,
        });
      }
    );

  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(message);
    process.exit(1);
  }
}

void main();
