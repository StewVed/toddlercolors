/*
  Service worker for 'installing' and caching of the game.
  Apparently, this is the 'future' way of doing things,
  and it is also prececely what I had in mind when I decided
  on webbased apps and games for my development focus back in 2012.

  stuff (mostly) learned from:
  https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
  https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
*/
//I will default to using the date in the name instead of versioning.
//var CACHE_NAME = 'toddlercolors-2016-11-25';
var CACHE_NAME = 'toddlercolors';
//for more than one cache list, use an array:
//var cacheList = ['pages-cache-v1', 'blog-posts-cache-v1'];
/*
from cache-manifest that depreceated in HTML 5.1
in favour of the Service Worker method.

index.html
main.css
loader.js
initialize.js
inputs.js
storage.js
main.js
favicon.png
favicon.svg
favicon256.png

all of these are in the root directory,
and it all has to be cached, is this just '/' ???

how about 
    'index.html'
  , 'appmanifest'
  , 'sw.js'
  , 

or are they implicitly added?
OK sw.js returned an Uncaught (in promise) TypeError so I will assume it doesn't have to be cached manually
hmm looks like a chrome extension is getting in the way!
chrome-extension:
*/
/* 
  leave this out in the hope that the RR (Rolling Release) style works after all!
  
var urlsToCache = ['index.html', 'appmanifest', 'main.css', 'loader.js', 'initialize.js', 'inputs.js', 'storage.js', 'main.js', 'favicon.png', 'favicon.svg', 'favicon256.png'];
self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    console.log('Opened cache');
    return cache.addAll(urlsToCache);
  }));
});
*/
/*
  put the code that errors on chrome-extensions back in 
*/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('toddlercolors').then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        })
        return response || fetchPromise;
      })
    })
  );
});

/*
  in this next peice of code, the SW asks the server
  for a file that the app requested.
  Subject to a few checks, the SW then caches that
  file.
  Question:
  If the app uses AJAX to get all of the neccessary files, 
  Would we need to specify the list of files to cache?!?
*/
/*
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // Cache hit - return response
    if (response) {
      return response;
    }
    // IMPORTANT: Clone the request. A request is a stream and
    // can only be consumed once. Since we are consuming this
    // once by cache and once by the browser for fetch, we need
    // to clone the response.
    var fetchRequest = event.request.clone();
    return fetch(fetchRequest).then(function(response) {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      // IMPORTANT: Clone the response. A response is a stream
      // and because we want the browser to consume the response
      // as well as the cache consuming the response, we need
      // to clone it so we have two streams.
      // Remember to never...ever...cross the streams! XD
      var responseToCache = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseToCache);
      });
      return response;
    });
  }));
});
*/

/*
  This last bit is for updating the service/app.
  I will assume that the SW is always upgraded,
  along with any file in the app...  or does the SW
  somehow check for newer files of the ones that are
  cached?!?
*/
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(cacheNames) {
    return Promise.all(cacheNames.map(function(cacheName) {
      if (cacheName !== CACHE_NAME) {
        return caches.delete(cacheName);
      }
    }));
  }));
});

