// ptvpn v1.0 - Created by Phoe Thar
import { connect } from 'cloudflare:sockets';

// ၁။ မင်းရဲ့ Password (UUID) ကို ဒီမှာ ပြောင်းလို့ရတယ်
let userID = '89b3cbba-e6ac-485a-9481-976a0415eab9'; 

// ၂။ ပိုမြန်အောင် ကူညီပေးမယ့် Proxy IP
const proxyIPs = ['bpb.yousef.isegaro.com'];
let proxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];

export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');

    // VPN App က လာချိတ်ရင် (VLESS over WebSocket)
    if (upgradeHeader === 'websocket') {
      return await vlessOverWSHandler(request);
    }

    // သာမန် Website အနေနဲ့ ကြည့်ရင်
    return new Response(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1>Welcome to ptvpn</h1>
          <p>Status: <span style="color: green;">Online</span></p>
          <p>Created by Phoe Thar</p>
          <hr>
          <p style="font-size: 0.8rem;">Copy your UUID: <code>${userID}</code></p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};

// VLESS Logic အပိုင်း (ဒါက အဓိက အလုပ်လုပ်တဲ့ ဦးနှောက်ပါ)
async function vlessOverWSHandler(request) {
  // ဒီနေရာမှာ မူရင်း _worker.js ထဲက VLESS handler logic တွေကို 
  // နောက်တစ်ဆင့်အနေနဲ့ ကျွန်တော်တို့ အပြည့်အစုံ ဖြည့်သွားကြမယ်။
  return new Response("VLESS Engine Starting...", { status: 101 });
}

