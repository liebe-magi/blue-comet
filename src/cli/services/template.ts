import { basename, extname } from 'node:path';

const TOKEN_RE = /\{\{\s*([\w.-]+)\s*\}\}/g;

const BLUESKY_POST_LIMIT = 300; // graphemes
const TRUNCATION_SUFFIX = '…';

export interface RenderTemplateOptions {
  template: string;
  filePath: string;
  data: Record<string, unknown>;
  /**
   * Maximum graphemes for the resulting text. Bluesky's post record caps at
   * 300 graphemes. Defaults to 300; pass `Infinity` to disable truncation.
   */
  maxGraphemes?: number;
}

export function renderTemplate(options: RenderTemplateOptions): string {
  const { template, filePath, data, maxGraphemes = BLUESKY_POST_LIMIT } = options;
  const filename = basename(filePath);
  const slug = filename.replace(/\.[^.]+$/u, '');

  const builtins: Record<string, string> = {
    filename,
    slug,
  };

  const rendered = template.replace(TOKEN_RE, (_, key: string) => {
    if (key in data) {
      return formatValue(data[key]);
    }
    if (key in builtins) {
      const value = builtins[key];
      return value === undefined ? '' : value;
    }
    // Leave unmatched tokens visible; this surfaces template typos rather
    // than silently dropping content.
    return `{{${key}}}`;
  });

  // Convert escaped newline literals (\n) so authors can write
  // --text-template "{{title}}\n\n{{summary}}" on the shell.
  const normalized = rendered.replace(/\\n/gu, '\n').replace(/\\t/gu, '\t');

  return truncateToGraphemes(normalized, maxGraphemes);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function truncateToGraphemes(text: string, max: number): string {
  if (!Number.isFinite(max) || max <= 0) return text;
  const segmenter = getSegmenter();
  if (!segmenter) {
    return text.length <= max ? text : text.slice(0, Math.max(0, max - 1)) + TRUNCATION_SUFFIX;
  }
  const segments: string[] = [];
  for (const { segment } of segmenter.segment(text)) {
    segments.push(segment);
  }
  if (segments.length <= max) return text;
  return segments.slice(0, Math.max(0, max - 1)).join('') + TRUNCATION_SUFFIX;
}

let cachedSegmenter: Intl.Segmenter | null | undefined;

function getSegmenter(): Intl.Segmenter | null {
  if (cachedSegmenter !== undefined) return cachedSegmenter;
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    cachedSegmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  } else {
    cachedSegmenter = null;
  }
  return cachedSegmenter;
}

const FILE_EXT_FROM_PATH = (path: string): string => extname(path);
export { FILE_EXT_FROM_PATH };
