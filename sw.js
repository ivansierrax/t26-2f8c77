const C='itin-v35-pw';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  // copia guardada PRIMERO (abre al instante con poca señal); la versión nueva se baja en segundo plano
  // y aparece la siguiente vez que se abre. Sólo se guarda la página real (nunca un portal de Wi-Fi).
  const net=fetch(e.request.url,{cache:'no-cache'}).then(r=>{
    if(r.ok&&r.type==='basic'&&!r.redirected){const cp=r.clone();
      return cp.clone().text().then(t=>{ if(t.includes('"c":"')||t.includes("const C=")) return caches.open(C).then(c=>c.put(e.request,cp)); }).then(()=>r);}
    return r; });
  e.waitUntil(net.catch(()=>{}));
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./'):null))
    .then(r=>r||net));
});