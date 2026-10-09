const C='itin-v33-pw';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const net=fetch(e.request.url,{cache:'no-cache'}).then(r=>{
    // sólo se guarda la página real: nunca un portal de Wi-Fi de hotel ni una redirección
    if(r.ok&&r.type==='basic'&&!r.redirected){const cp=r.clone();
      cp.clone().text().then(t=>{ if(t.includes('"c":"')||t.includes("const C=")) caches.open(C).then(c=>c.put(e.request,cp)); });}
    return r; });
  const slow=new Promise((_,no)=>setTimeout(no,4000));
  e.respondWith(Promise.race([net,slow]).catch(()=>caches.match(e.request,{ignoreSearch:true})
    .then(r=>r||caches.match('./')).then(r=>r||net)));
});