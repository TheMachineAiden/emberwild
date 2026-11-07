import { setupPwa } from './pwa.js';

const launch = document.getElementById('launch-status');
const registration = await setupPwa().catch(() => null);
if (registration?.active &&
    navigator.serviceWorker.controller?.scriptURL !== registration.active.scriptURL) {
  // First setup only, before the game or save code starts. This makes the first
  // adventure a controlled client too; later updates can safely wait for exit.
  location.reload();
} else {
  try {
    await import('./main.js');
    launch.remove();
  } catch {
    launch.textContent = 'The coast could not open. Reconnect and reload Emberwild.';
  }
}
