import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';

export interface FrontmatterFile {
  path: string;
  data: Record<string, unknown>;
  content: string;
  /** The original raw text, used to detect no-op writes. */
  original: string;
}

export function readFrontmatter(path: string): FrontmatterFile {
  const original = readFileSync(path, 'utf8');
  const parsed = matter(original);
  return {
    path,
    data: parsed.data as Record<string, unknown>,
    content: parsed.content,
    original,
  };
}

export interface WriteFrontmatterOptions {
  /**
   * If true, only return the rendered string without writing. Defaults to false.
   */
  dryRun?: boolean;
}

export function writeFrontmatter(
  file: FrontmatterFile,
  data: Record<string, unknown>,
  options: WriteFrontmatterOptions = {}
): { rendered: string; changed: boolean } {
  const merged = { ...file.data, ...data };
  // gray-matter strips a trailing newline from `content`; preserve original
  // body verbatim so we don't churn unrelated whitespace.
  const rendered = matter.stringify(file.content, merged);
  const final = ensureTrailingNewline(rendered, file.original);
  const changed = final !== file.original;
  if (!options.dryRun && changed) {
    writeFileSync(file.path, final);
  }
  return { rendered: final, changed };
}

function ensureTrailingNewline(rendered: string, original: string): string {
  const originalEndsWithNewline = original.endsWith('\n');
  const renderedEndsWithNewline = rendered.endsWith('\n');
  if (originalEndsWithNewline && !renderedEndsWithNewline) {
    return rendered + '\n';
  }
  if (!originalEndsWithNewline && renderedEndsWithNewline) {
    return rendered.replace(/\n+$/u, '');
  }
  return rendered;
}
