// Cloudflare Pages Function, served at /api/upcoming.
//
// LL2 allows 15 unauthenticated requests per hour for each address. A
// visitor who opens the page often, or who shares an address with others,
// can run out. This function asks LL2 from Cloudflare and keeps the answer
// at the edge, so that all visitors share one request every 20 minutes.
import { LL2_UPCOMING_URL, reduceLaunch } from '../../lib/ll2.js';

const MAX_AGE_S = 20 * 60;
const JSON_TYPE = { 'content-type': 'application/json; charset=utf-8' };

export async function onRequest(context) {
  const key = new Request(new URL('/api/upcoming', context.request.url).toString());
  const cache = globalThis.caches?.default;
  const hit = cache && (await cache.match(key));
  if (hit) return hit;

  let upstream;
  try {
    upstream = await fetch(LL2_UPCOMING_URL, {
      headers: { 'user-agent': 'spaceJellyfish (https://github.com/neely/spaceJellyfish)' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Could not reach Launch Library 2: ${error.message}` }), { status: 502, headers: JSON_TYPE });
  }
  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: `Launch Library 2 answered ${upstream.status}` }), { status: 502, headers: JSON_TYPE });
  }

  const body = await upstream.json();
  const response = new Response(
    JSON.stringify({ fetched: Date.now(), results: body.results.map(reduceLaunch) }),
    { headers: { ...JSON_TYPE, 'cache-control': `public, max-age=${MAX_AGE_S}` } },
  );
  if (cache) context.waitUntil(cache.put(key, response.clone()));
  return response;
}
