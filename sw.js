const C='itin-v41';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  // copia guardada PRIMERO (abre al instante con poca señal); la versión nueva se baja en segundo plano
  // y aparece la siguiente vez que se abre. Sólo se guarda la página real (nunca un portal de Wi-Fi).
  const net=fetch(e.request.url,{cache:'no-cache'}).then(async r=>{
    if(r.ok&&r.type==='basic'&&!r.redirected){
      const keep=r.clone(), t=await r.clone().text();
      if(t.includes('"c":"')||t.includes("const C=")){
        const c=await caches.open(C);
        const old=(await c.match(e.request,{ignoreSearch:true}))||(e.request.mode==='navigate'?await c.match('./'):null);
        const ot=old?await old.text():null;
        await c.put(e.request,keep);
        // versión nueva publicada: avisa a la página para que se recargue sola
        if(e.request.mode==='navigate'&&ot!==null&&ot!==t){ (await self.clients.matchAll()).forEach(cl=>cl.postMessage('itin-updated')); }
      }
    }
    return r; });
  e.waitUntil(net.catch(()=>{}));
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./'):null))
    .then(r=>r||net));
});