// @ts-nocheck
// ptvpn v1.0 - Created by Phoe Thar
// Last Update: 2024-05-24

import { connect } from 'cloudflare:sockets';
// How to generate your own UUID:
// https://www.uuidgenerator.net/
let userID = '0eadd30d-4335-4abf-ba50-97a110f6adbe';

// https://www.nslookup.io/domains/cdn.xn--b6gac.eu.org/dns-records/
// https://www.nslookup.io/domains/cdn-all.xn--b6gac.eu.org/dns-records/
// ၁။ Phoe Thar ရဲ့ အမြန်ဆုံး IP စုစည်းမှု
const proxyIPs = [
  '104.16.2.34', '104.16.88.251', '104.16.93.161', '104.16.98.232',
  '188.114.96.1', '188.114.97.1', '78.194.169.74', '45.63.100.187',
  'cdn.xn--b6gac.eu.org', 'edgetunnel.anycast.eu.org'
];

export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response("Phoe Thar's Smart Worker is Online! 🚀", { status: 200 });
    }

    // IP ၁၀ ခုလုံးကို စစ်မယ်၊ ဒါပေမဲ့ CPU သက်သာအောင် 1.5s ပဲ အချိန်ပေးမယ်
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const bestIP = await Promise.any(
      proxyIPs.map(async (ip) => {
        await fetch(`http://${ip}/cdn-cgi/trace`, { 
          mode: 'no-cors', 
          method: 'HEAD',
          signal: controller.signal 
        });
        return ip;
      })
    ).catch(() => proxyIPs[0]);

    clearTimeout(timeout);
    return await vlessOverWSHandler(request, bestIP);
  }
};

async function vlessOverWSHandler(request, proxyIP) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);
  server.accept();
  let remoteSocket = null;

  server.addEventListener('message', async (event) => {
    const message = event.data;
    if (remoteSocket) {
      const writer = remoteSocket.writable.getWriter();
      await writer.write(message);
      writer.releaseLock();
      return;
    }

    const chunk = new Uint8Array(message);
    const vlessVersion = chunk[0];
    const vlessId = chunk.slice(1, 17);

    if (vlessVersion !== 0 || !validateUUID(vlessId)) {
      server.close();
      return;
    }

    try {
      remoteSocket = connect({ hostname: proxyIP, port: 443 });
      const writer = remoteSocket.writable.getWriter();
      await writer.write(chunk);
      writer.releaseLock();

      remoteSocket.readable.pipeTo(new WritableStream({
        write(data) { server.send(data); },
        close() { server.close(); }
      }));
    } catch (e) {
      server.close();
    }
  });

  return new Response(null, { status: 101, webSocket: client });
}

function validateUUID(vlessId) {
  const hexId = Array.from(vlessId).map(b => b.toString(16).padStart(2, '0')).join('');
  return hexId === userID.replace(/-/g, '');
}
