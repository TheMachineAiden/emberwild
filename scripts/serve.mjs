import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve(process.env.EMBERWILD_ROOT || ".");
const port = Number(process.env.EMBERWILD_PORT || 4387);
const base = process.env.EMBERWILD_BASE || '/';
if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..')) throw new Error('Invalid base path');
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".wav": "audio/wav",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (pathname.split("/").some((part) => part.startsWith(".")))
        throw new Error("Hidden path");
      if (!pathname.startsWith(base)) throw new Error('Outside game base');
      const localPath = pathname.slice(base.length);
      const file = resolve(
        root,
        localPath || 'index.html',
      );
      if (!file.startsWith(root + "/")) throw new Error("Invalid path");
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Emberwild: http://127.0.0.1:${port}${base}`),
  );
