var CACHE = 'toddlercolors-2016-12-27';
//https://serviceworke.rs/strategy-cache-only_service-worker_doc.html
self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE).then(function(cache) {
    return cache.addAll(['./', './appmanifest', './index.html', './initialize.js', './inputs.js', './loader.js', './main.js', './storage.js', './main.css'//do I not need the favicons?!?
    ]).then(function() {
      console.log('SW: app updated. awaiting activation');
    });
  }));
});
self.addEventListener('fetch', function(event) {
  //never bother checking online
  event.respondWith(caches.match(event.request));
});
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(cacheNames) {
    return Promise.all(cacheNames.map(function(cacheName) {
      if (cacheName !== CACHE) {
        return caches.delete(cacheName);
      }
    })).then(function() {
      console.log('SW: new version active.');
      sendMessage(self, 'updated');
    });
  }));
})

function sendMessage(me, msg) {
  console.log('SW: sendMessage try: ' + msg);

  me.clients.matchAll().then(function(clients) {
    console.log('SW: in forEach clients..');
    clients.forEach(function(client) {
      client.postMessage(msg);
      console.log('SW: clients.client.id is ' + client.id);
    });
  });
}
