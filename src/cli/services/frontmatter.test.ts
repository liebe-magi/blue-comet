import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFrontmatter, writeFrontmatter } from './frontmatter';

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'bluecomet-fm-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function fixture(content: string): string {
  const path = join(tempDir, 'post.mdx');
  writeFileSync(path, content);
  return path;
}

describe('frontmatter', () => {
  it('reads frontmatter and content', () => {
    const path = fixture(
      `---
title: Hello
description: A post
---

This is the body.
`
    );
    const file = readFrontmatter(path);
    expect(file.data).toEqual({ title: 'Hello', description: 'A post' });
    expect(file.content.trim()).toBe('This is the body.');
  });

  it('writes a new frontmatter key while preserving body', () => {
    const original = `---
title: Hello
---

Body text here.
`;
    const path = fixture(original);

    const file = readFrontmatter(path);
    const result = writeFrontmatter(file, { bluesky: 'at://did:plc:abc/app.bsky.feed.post/xyz' });

    expect(result.changed).toBe(true);
    const written = readFileSync(path, 'utf8');
    expect(written).toContain("bluesky: 'at://did:plc:abc/app.bsky.feed.post/xyz'");
    expect(written).toContain('title: Hello');
    expect(written.trimEnd().endsWith('Body text here.')).toBe(true);
  });

  it('overwrites an existing key when called with a new value', () => {
    const path = fixture(`---
title: Hello
bluesky: at://old
---

body
`);

    const file = readFrontmatter(path);
    writeFrontmatter(file, { bluesky: 'at://new' });

    const written = readFileSync(path, 'utf8');
    expect(written).toContain("bluesky: 'at://new'");
    expect(written).not.toContain('at://old');
  });

  it('does not write when dry-run is set', () => {
    const original = `---
title: Hello
---

body
`;
    const path = fixture(original);
    const file = readFrontmatter(path);
    writeFrontmatter(file, { bluesky: 'at://x' }, { dryRun: true });

    const after = readFileSync(path, 'utf8');
    expect(after).toBe(original);
  });

  it('preserves trailing-newline state', () => {
    const path = fixture(`---
title: A
---

body without trailing newline`);

    const file = readFrontmatter(path);
    writeFrontmatter(file, { extra: 1 });
    const written = readFileSync(path, 'utf8');
    expect(written.endsWith('\n')).toBe(false);
  });
});
