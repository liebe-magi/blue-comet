import { describe, expect, it } from 'vitest';
import { renderTemplate, truncateToGraphemes } from './template';

describe('renderTemplate', () => {
  it('substitutes frontmatter keys directly', () => {
    expect(
      renderTemplate({
        template: '{{title}} — {{summary}}',
        filePath: '/posts/hello.mdx',
        data: { title: 'Hello', summary: 'A post about hellos' },
      })
    ).toBe('Hello — A post about hellos');
  });

  it('falls back to the literal token for missing keys', () => {
    expect(
      renderTemplate({
        template: '{{title}} {{missing}}',
        filePath: '/posts/x.mdx',
        data: { title: 'T' },
      })
    ).toBe('T {{missing}}');
  });

  it('exposes {{slug}} derived from the filename', () => {
    expect(
      renderTemplate({
        template: 'https://example.com/{{slug}}',
        filePath: '/posts/20260506_hello.mdx',
        data: {},
      })
    ).toBe('https://example.com/20260506_hello');
  });

  it('exposes {{filename}} including the extension', () => {
    expect(
      renderTemplate({
        template: '{{filename}}',
        filePath: 'posts/hello.md',
        data: {},
      })
    ).toBe('hello.md');
  });

  it('joins array values with comma-space', () => {
    expect(
      renderTemplate({
        template: 'tags: {{tags}}',
        filePath: 'a.md',
        data: { tags: ['react', 'bluesky'] },
      })
    ).toBe('tags: react, bluesky');
  });

  it('expands escape sequences \\n and \\t', () => {
    expect(
      renderTemplate({
        template: '{{title}}\\n\\n{{summary}}',
        filePath: 'a.md',
        data: { title: 'T', summary: 'S' },
      })
    ).toBe('T\n\nS');
  });

  it('truncates output exceeding the grapheme cap', () => {
    const long = 'a'.repeat(400);
    const out = renderTemplate({
      template: '{{body}}',
      filePath: 'a.md',
      data: { body: long },
    });
    expect(out.length).toBeLessThanOrEqual(300);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('truncateToGraphemes', () => {
  it('returns the input unchanged when within the cap', () => {
    expect(truncateToGraphemes('hello', 10)).toBe('hello');
  });

  it('counts emoji as a single grapheme', () => {
    // 👨‍👩‍👧 is one grapheme but multiple code points; should fit in 1.
    const family = '👨‍👩‍👧';
    expect(truncateToGraphemes(family, 1)).toBe(family);
  });

  it('appends ellipsis when truncating', () => {
    const text = 'x'.repeat(20);
    const out = truncateToGraphemes(text, 5);
    expect(out.endsWith('…')).toBe(true);
    expect(Array.from(out).length).toBe(5);
  });
});
