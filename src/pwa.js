// Progressive enhancement only: unbuilt source previews remain ordinary pages.
export async function setupPwa() {
  if (!document.querySelector('meta[name="emberwild-build"]')) return null;
  const help = document.getElementById('app-help');
  const install = document.getElementById('install-game');
  const status = document.getElementById('offline-status');
  const update = document.getElementById('app-update');
  const hint = document.getElementById('install-hint');
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  help.hidden = false;
  if (standalone()) hint.textContent = 'Emberwild is open in app view.';
  let prompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); prompt = event;
    install.hidden = standalone();
  });
  install.addEventListener('click', async () => {
    if (!prompt) return;
    const request = prompt; prompt = null; install.hidden = true;
    try { await request.prompt(); await request.userChoice; }
    catch { hint.textContent = 'Use your browser’s Install or Add to Home Screen option.'; }
  });
  window.addEventListener('appinstalled', () => {prompt=null;install.hidden=true;});
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Offline play is unavailable in this browser.';
    return null;
  }
  let registration;
  try {
    const base = new URL('./',document.baseURI);
    const existing = await navigator.serviceWorker.getRegistration(base);
    registration = !navigator.onLine && existing?.scope === base.href ? existing :
      await navigator.serviceWorker.register(new URL('sw.js',base), {
        scope:base.pathname, updateViaCache:'none',
      });
    let failed = false;
    const refresh = () => {
      const active = registration.active?.state === 'activated';
      status.textContent = active ? 'Offline ready. You can reopen this game without a connection.' : failed
        ? 'Offline setup is not ready. Stay online and reopen the game to retry.' : 'Preparing offline play…';
      update.hidden = !registration.waiting;
    };
    const watch = worker => worker?.addEventListener('statechange', () => {
      if (worker.state === 'redundant' && !registration.active) failed = true;
      setTimeout(refresh,0);
    });
    watch(registration.installing); watch(registration.active);
    registration.addEventListener('updatefound', () => {failed=false;watch(registration.installing);refresh();});
    refresh();
    if (registration.active?.state !== 'activated') {
      await new Promise((resolve,reject) => {
        const timer = setTimeout(() => reject(new Error('Offline setup timed out')),20000);
        const worker = registration.installing || registration.waiting || registration.active;
        const changed = () => {
          if (registration.active?.state === 'activated') {clearTimeout(timer);resolve();}
          else if (worker?.state === 'redundant') {clearTimeout(timer);reject(new Error('Offline setup failed'));}
        };
        worker?.addEventListener('statechange',changed);
        changed();
      });
    }
    refresh();
    window.addEventListener('online', () => registration.update().catch(() => {}));
    return registration;
  } catch {
    if (registration && !registration.active) await registration.unregister().catch(() => {});
    status.textContent = 'Offline setup is not ready. Stay online and reopen the game to retry.';
    return null;
  }
}
