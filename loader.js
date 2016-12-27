/*
 * Purpose of this file:
 * to give the user a progressbar for each file that is being loaded.
 * it is not smooth, but at the moment, this is the only way I've
 * found to show progress.
*/
var fileList = ['initialize', 'inputs', 'storage', 'main'];
var isLoaded = 0;
var loadingVars = [];
//add service worker registration to the app:
addServiceWorker();
//loop through the required files, and load then now.
for (var fileName of fileList) {
  fLoad(fileName + '.js', 'script', fileName, fileName + ' file', '', 0);
}
function fLoad(zSrc, zType, zId, zText, zLoad, WinNo) {
  //remove the dot and any slashes in the name, so that it can be used for the name of the progressbar
  var zFileName = zSrc.replace(/\./, '').replace(/\//, '');
  fLoadProgressBar(zFileName, zText);
  //create a new global variable with the name of the file so that the progress bar moves a little bit even with no response from the server
  loadingVars[zFileName] = [];
  //create an object to keep the time and amount downloaded for dl speed:
  loadingVars[zFileName].text = zText;
  loadingVars[zFileName].time = performance.now();
  //high resolution version of date.now()
  loadingVars[zFileName].tick = performance.now();
  loadingVars[zFileName].size = 0;
  //the amount of data currently downlaoded.
  loadingVars[zFileName].speed = 2;
  //bytes per second (I think)
  loadingVars[zFileName].total = 0;
  loadingVars[zFileName].xhr = 1;
  //the total amount to be downloaded.
  //Create a new request to the server
  var xhr = new XMLHttpRequest();
  xhr.open('GET', zSrc, true);
  //was false so it blocks until a response is got, but recoded to true with a loading pulser instead.
  //change the responseType to blob in the case of an image - blob=not changed/as-is
  if (zType === 'img') {
    xhr.responseType = 'blob';
  }
  //create an onLoad event for when the server has sent the data through to the browser
  xhr.addEventListener('loadend', function() {
    if (loadingVars[zFileName].xhr) {
      //Create an empty element of the type required (link=css, script=javascript, img=image)
      var zElem = document.createElement(zType);
      //if there is an ID for this script, add it to the new element
      if (zId) {
        zElem.id = zId;
      }
      if (zType === 'img') {
        window.URL.revokeObjectURL(zElem.src);
        //make sure there is no src
        zElem.src = window.URL.createObjectURL(xhr.response);
        //add the downloaded src to the element
      } else {
        zElem.innerHTML = xhr.responseText;
      }
      document.head.appendChild(zElem);
    }
  }, false);
  xhr.addEventListener('error', function() {
    //will happen with files during local development
    loadingVars[zFileName].xhr = 0;
    fLoadSimple(zSrc.split('.')[0]);
  }, false);
  xhr.addEventListener('progress', function(e) {
    fileProgress(e, zFileName)
  }, false);
  xhr.send();
  //high resolution version of date.now()
  loadingVars[zFileName].frame = window.requestAnimationFrame(function() {
    fileProgresser(zFileName)
  });
}
function fLoadSimple(fileName) {
  var firstScript = document.getElementsByTagName('script')[0];
  var zScript = document.createElement('script');
  //zScript.type = 'text/javascript'; //needed in modern browsers?!Q?
  zScript.id = fileName + 'l';
  zScript.src = fileName + '.js';
  zScript.addEventListener('load', function() {
    this.id = this.id.slice(0, -1);
    filesLoadedCheck();
  });
  firstScript.parentNode.insertBefore(zScript, firstScript);
}
function fLoadProgressBar(zFileName, zText) {
  if (document.getElementById('loading')) {
    //create new element for the progressbar of this loader
    var pBar = '<div id="' + zFileName + 'C" class="loadC">' + '<div id="' + zFileName + 'Pi" class="loadPi"></div>' + '<div id="' + zFileName + 'Pc" class="loadPc">' + zText + ' (...)</div>' + '</div>';
    //add the progreassBar to the game
    document.getElementById('loading').innerHTML += pBar;
    loaderReHeight();
  }
}
function fileProgress(e, zFileName) {
  if (document.getElementById(zFileName + 'Pi')) {
    if (e.lengthComputable) {
      if (loadingVars[zFileName].sizeUnknown) {
        loadingVars[zFileName].sizeUnknown = 0;
        window.clearInterval(loadingVars[zFileName].endCheckTimer);
        loadingVars[zFileName].endCheckTimer = null ;
      }
      document.getElementById(zFileName + 'Pi').classList.remove('loadVV');
      //calculate the amount of time that has passed since last update:
      var timeNow = performance.now();
      //on slower devices, this might change by the end of the function, so make a var of the time.
      var timePassed = timeNow - loadingVars[zFileName].time;
      var amountDownloaded = e.loaded - loadingVars[zFileName].size;
      loadingVars[zFileName].speed = amountDownloaded / timePassed;
      //bytes per millisecond (I think)
      loadingVars[zFileName].time = timeNow;
      //high resolution version of date.now()
      loadingVars[zFileName].size = e.loaded;
      //the amount of data currently downlaoded
      if (!loadingVars[zFileName].total) {
        loadingVars[zFileName].total = e.total;
      }
      var pCent = (e.loaded / e.total) * 100;
      document.getElementById(zFileName + 'Pi').style.width = pCent + '%';
      document.getElementById(zFileName + 'Pc').innerHTML = loadingVars[zFileName].text + ' (' + pCent.toFixed(1) + '%)';
    } else {
      /*
        this appears to happen on github, which is reallllly annoying, but let's hack through it :D
        v1 - non-hack; move the inner progress back and forth in knight-rider/cylon/linux style...
        heh thinking about it.. maybe I should make it glowing... but still green!
      */
      //try pure css animation for the job:  
      if (!loadingVars[zFileName].sizeUnknown) {
        loadingVars[zFileName].sizeUnknown = 1;
        loadingVars[zFileName].endCheckTimer = window.setInterval(function() {
          filesLoadedCheck()
        }, 500);
      }
      document.getElementById(zFileName + 'Pi').classList.add('loadVV');
    }
  }
}
function fileProgresser(zFileName) {
  if (document.getElementById(zFileName + 'Pi')) {
    var zNum = parseFloat(document.getElementById(zFileName + 'Pi').style.width || 0);
    if (zNum < 100) {
      if (loadingVars[zFileName].total) {
        /*
         * additional bit to calculate download speed since last fileProgress...
         * All I need is the amount of time that has elapsed, and the amount
         * that has been downloaded during that time, and the total.
        */
        //calculate the amount of time that has passed since last update:
        var timeNow = performance.now();
        //on slower devices, this might change by the end of the function, so make a var of the time.
        var timePassed = timeNow - loadingVars[zFileName].tick;
        var amountToAdd = parseFloat(loadingVars[zFileName].speed * timePassed);
        //300 because that is the amount of the timer Interval
        var percentToAdd = parseFloat((amountToAdd / loadingVars[zFileName].total) * 100);
        var pCent = (zNum + percentToAdd);
        document.getElementById(zFileName + 'Pi').style.width = pCent + '%';
        document.getElementById(zFileName + 'Pc').innerHTML = loadingVars[zFileName].text + ' (' + pCent.toFixed(1) + '%)';
      } else {
        document.getElementById(zFileName + 'Pc').innerHTML = loadingVars[zFileName].text + ' (...)';
        document.getElementById(zFileName + 'Pi').classList.add('loadVV');
      }
      loadingVars[zFileName].tick = timeNow;
      //high resolution version of date.now()
      loadingVars[zFileName].frame = window.requestAnimationFrame(function() {
        fileProgresser(zFileName)
      });
    } else {
      //window.clearInterval(window[zFileName + 'Timer']);
      document.getElementById(zFileName + 'C').style.transition = '1s';
      document.getElementById(zFileName + 'C').style.opacity = 0;
      window.setTimeout(function() {
        if (document.getElementById(zFileName + 'C')) {
          document.getElementById(zFileName + 'C').parentNode.removeChild(document.getElementById(zFileName + 'C'));
          loaderReHeight();
        }
        filesLoadedCheck();
      }, 1000);
    }
  }
}
function filesLoadedCheck() {
  //if all essential data is loaded, initialize. Once only
  if (document.getElementById('loading')) {
    //check for the scripts:
    for (var fileName of fileList) {
      if (!document.getElementById(fileName)) {
        //Not all scripts have finished (down)loading, so do not start yet.
        return;
      }
    }
    //getting this far means everything is loaded. continue...
    //make sure to only run this once :D
    if (!isLoaded) {
      isLoaded = 1;
      document.getElementById('loading').parentNode.removeChild(document.getElementById('loading'));
      Init();
    }
  }
}
function loaderReHeight() {
  document.getElementById('loading').style.top = ((window.innerHeight - document.getElementById('loading').offsetHeight) / 2) + 'px';
}

/*serviceworker (mostly) learned from:
https://www.w3.org/TR/service-workers/
https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
*/
function addServiceWorker() {
  if ('serviceWorker'in navigator) {

    //should the user be prompted whether they'd like this made available offline?
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('ServiceWorker registred');
      
      registration.addEventListener('updatefound'
      , function(){
          console.log('Service Worker update found!');
          window.setTimeout(function() {
           upNotOpen('<p>Update available!<br>Restart app to update.</p>');
          }, 3000);
      });

      if (registration.installing) {
        console.log('Service Worker installing...');
      }

      if (registration.waiting) {
        console.log('Service Worker installed and waiting to activate.');
      }
      registration.addEventListener('statechange'
      , function(e){
          console.log('Service Worker Resgistration state changed: ' + e.state)
      });
    }).catch(function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });

    //listen for communication from the ServiceWorker:
    navigator.serviceWorker.addEventListener('message', swMessage);

    /*
      this next event should fire when a serviceWorker is:
      installing, installed, activating, activated, redundant
    */
    navigator.serviceWorker.addEventListener('statechange', swSS);

  }
}

function swSS(e) {
  console.log('ServiceWorker State Change: ' + e.state);
}
//learned from https://serviceworke.rs/message-relay.html
function swMessage(e) {
  console.log('nessage received: ' + e.data);
  if (e.data === 'updated') {
    if (!isUpdated) {
      isUpdated = 1;
      window.setTimeout(function() {
       upNotOpen('<p>app updated</p>')
      }, 3000);
      /*
        IDEA:
        swipe up for changelog, swipe down to dismiss.
      */
    }
  }
  else if (e.data === 'Updating') {
    if (!isUpdated) {
      isUpdated = 1;
      window.setTimeout(function() {
       upNotOpen('<p>update downloaing...<br>Restart app to update.</p>')
      }, 3000);
    }
  }


  
}
function upNotOpen(msg) {
  var newWindow = document.createElement('div');
  newWindow.id = 'updateNotice';
  document.body.appendChild(newWindow);
  newWindow.innerHTML = msg;
  newWindow.style.opacity = .9;
  newWindow.style.top = (document.body.offsetHeight - newWindow.offsetHeight) + 'px';
  window.setTimeout(function() {
   upNotClose()
  }, 5000);
}
function upNotClose() {
  if (document.getElementById('updateNotice')) {
    document.getElementById('updateNotice').style.opacity = 0;
    document.getElementById('updateNotice').style.top = document.body.offsetHeight + 'px';
    window.setTimeout(function() {
      if (document.getElementById('updateNotice')) {
        //after a second, once the element is hidden, remove it.
        document.body.removeChild(document.getElementById('updateNotice'));
      }
    }, 1000);
  }
}
