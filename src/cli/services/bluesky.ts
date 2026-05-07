import { AtpAgent, AppBskyRichtextFacet, RichText } from '@atproto/api';
import { buildBlueskyPostUrl } from '../../core/uri';
import type { StoredCredentials } from './credentials';

const CARDYB_ENDPOINT = 'https://cardyb.bsky.app/v1/extract';
const MAX_THUMB_BYTES = 1_000_000; // Bluesky blob limit for embed thumbnails

interface CardybMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  error?: string;
}

interface ExternalEmbed {
  $type: 'app.bsky.embed.external';
  external: {
    uri: string;
    title: string;
    description: string;
    thumb?: unknown;
  };
}

function findFirstLink(facets: RichText['facets']): string | undefined {
  if (!facets) return undefined;
  for (const facet of facets) {
    for (const feature of facet.features) {
      if (AppBskyRichtextFacet.isLink(feature) && typeof feature.uri === 'string') {
        return feature.uri;
      }
    }
  }
  return undefined;
}

async function buildExternalEmbed(
  url: string,
  agent: AtpAgent
): Promise<ExternalEmbed | undefined> {
  let meta: CardybMetadata;
  try {
    const res = await fetch(`${CARDYB_ENDPOINT}?url=${encodeURIComponent(url)}`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return undefined;
    meta = (await res.json()) as CardybMetadata;
    if (meta.error) return undefined;
  } catch {
    return undefined;
  }

  let thumb: unknown;
  if (meta.image) {
    try {
      const imgRes = await fetch(meta.image);
      if (imgRes.ok) {
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        if (buf.byteLength <= MAX_THUMB_BYTES) {
          const encoding = imgRes.headers.get('content-type') ?? 'image/jpeg';
          const upload = await agent.uploadBlob(buf, { encoding });
          thumb = upload.data.blob;
        }
      }
    } catch {
      // ignore — embed without thumbnail is still useful
    }
  }

  return {
    $type: 'app.bsky.embed.external',
    external: {
      uri: url,
      title: meta.title ?? url,
      description: meta.description ?? '',
      ...(thumb ? { thumb } : {}),
    },
  };
}

export interface PostResult {
  uri: string;
  cid: string;
  webUrl: string;
}

export interface BlueskyClient {
  post(text: string, options?: { langs?: string[] }): Promise<PostResult>;
  did: string;
  handle: string;
}

export async function createBlueskyClient(credentials: StoredCredentials): Promise<BlueskyClient> {
  const agent = new AtpAgent({ service: credentials.service });
  await agent.login({ identifier: credentials.handle, password: credentials.appPassword });

  const session = agent.session;
  if (!session) {
    throw new Error('Bluesky login succeeded but session is missing');
  }

  return {
    did: session.did,
    handle: session.handle,
    async post(text, options = {}) {
      // Detect URLs, @mentions, and #hashtags so they render as clickable
      // facets on Bluesky. Without this the post is plain text only.
      const rt = new RichText({ text });
      await rt.detectFacets(agent);

      // If the post contains a URL, attempt to attach an OGP embed card
      // via Bluesky's public cardyb service.
      let embed: ExternalEmbed | undefined;
      const firstLink = findFirstLink(rt.facets);
      if (firstLink) {
        embed = await buildExternalEmbed(firstLink, agent);
      }

      const response = await agent.post({
        text: rt.text,
        facets: rt.facets,
        langs: options.langs ?? ['en'],
        createdAt: new Date().toISOString(),
        ...(embed ? { embed } : {}),
      });
      return {
        uri: response.uri,
        cid: response.cid,
        webUrl: buildBlueskyPostUrl(response.uri, session.handle),
      };
    },
  };
}

export async function verifyCredentials(credentials: StoredCredentials): Promise<{
  did: string;
  handle: string;
}> {
  const agent = new AtpAgent({ service: credentials.service });
  await agent.login({ identifier: credentials.handle, password: credentials.appPassword });
  const session = agent.session;
  if (!session) {
    throw new Error('Login succeeded but session is missing');
  }
  return { did: session.did, handle: session.handle };
}
