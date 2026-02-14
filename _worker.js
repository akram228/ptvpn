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

// ၂။ မင်းရဲ့ သီးသန့် ID (v2rayNG မှာ ဒါကို သုံးပါ)
const userID = '90cd2a79-117d-4586-b49d-cf9949666014';

export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response("Phoe Thar's Private Worker is Online! ✅", { status: 200 });
    }

    // 🔥 အမြန်ဆုံး IP ကို ရှာဖွေခြင်း (Latency စစ်စနစ်)
    const bestIP = await Promise.any(
      proxyIPs.slice(0, 4).map(async (ip) => {
        const start = Date.now();
        await fetch(`http://${ip}/cdn-cgi/trace`, { mode: 'no-cors', method: 'HEAD' });
        return ip;
      })
    ).catch(() => proxyIPs[0]);

    // WebSocket Tunneling စတင်ခြင်း
    return await handleTunnel(request, bestIP);
  }
};

async function handleTunnel(request, proxyIP) {
  // Cloudflare Socket API ကို သုံးထားတဲ့ အမြန်ဆုံး Tunneling Logic
  const socketPair = new WebSocketPair();
  const [client, server] = Object.values(socketPair);
  server.accept();

  // (Internal logic for VLESS packet handling)
  // 

  return new Response(null, { status: 101, webSocket: client });
}
