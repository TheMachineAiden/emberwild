// Generated with the exact build inventory. No skipWaiting or clients.claim:
// an open adventure keeps its complete version until all its windows close.
const REVISION = __REVISION__;
const FILES = __FILES__;
const BASE = self.registration.scope;
const PREFIX = `emberwild-runtime:${new URL(BASE).pathname}:`;
const CACHE = PREFIX + REVISION;
const paths = new Set(FILES.map(file => new URL(file.path,BASE).href));
const hex = bytes => [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2,'0')).join('');

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Download and verify everything before publishing this candidate cache.
    // A stale CDN response or interrupted deployment cannot create a mixed set.
    const responses = await Promise.all(FILES.map(async file => {
      const url = new URL(file.path,BASE).href;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(),15000);
      try {
        const response = await fetch(url,{cache:'reload',credentials:'same-origin',signal:controller.signal});
        if (!response.ok) throw new Error('An offline file was unavailable.');
        const digest = await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
        if (hex(digest) !== file.sha256) throw new Error('The offline build was incomplete.');
        return {url,response};
      } finally { clearTimeout(timer); }
    }));
    const cache = await caches.open(CACHE);
    const results = await Promise.allSettled(responses.map(({url,response}) => cache.put(url,response)));
    if (results.some(result => result.status === 'rejected')) {
      await caches.delete(CACHE);
      throw new Error('The offline build could not be stored.');
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(PREFIX) && key !== CACHE)
    .map(key => caches.delete(key)))));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const base = new URL(BASE);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  url.search = ''; url.hash = '';
  // The game has a single document. Do not turn unrelated URLs into game pages.
  if (url.href === BASE) url.href = new URL('index.html',BASE).href;
  if (!paths.has(url.href)) return;
  event.respondWith(caches.open(CACHE).then(async cache =>
    await cache.match(url.href) || new Response('Offline files are unavailable. Reopen Emberwild online.', {
      status:503, headers:{'Content-Type':'text/plain; charset=utf-8'},
    })));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'EMBERWILD_STATUS')
    event.ports?.[0]?.postMessage({revision:REVISION,files:FILES.length});
});
