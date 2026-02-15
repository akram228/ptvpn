// @ts-nocheck
// ptvpn v1.1 - Fixed by Gemini for Phoe Thar
import { connect } from 'cloudflare:sockets';

let userID = '0eadd30d-4335-4abf-ba50-97a110f6adbe';

const proxyIPs = [
  '104.16.51.111', '104.17.98.7', '104.18.2.161', '172.67.73.39',
  '104.16.2.34', '104.16.88.251', '104.16.93.161', '104.16.98.232',
  '188.114.96.1', '188.114.97.1'
];

export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response("Phoe Thar's Smart Worker is Online! 🚀", { status: 200 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    // အောက်က အပိုင်းကို တစ်ခါပဲ သုံးရပါမယ်
    const bestIP = await Promise.any(
      proxyIPs.map(async (ip) => {
        const response = await fetch(`http://${ip}/cdn-cgi/trace`, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        if (response.ok) return ip;
        throw new Error("fail");
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
      // Proxy IP နဲ့ ချိတ်တဲ့နေရာမှာ 443 (TLS) သုံးမယ်
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
