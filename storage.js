var saveSplit1 = '<^>', saveSplit2 = '<*>', saveY;
function storageCheck() {
  if (localStorage) {
    if (localStorage.length) {
      //something is stored
      var dataToLoad = storageLoad('AllowSave');
      if (dataToLoad == 1) {
        //user has said YES to saving.
        saveY = 1;
      } else if (dataToLoad == 0) {
        //user has said NO to saving.
        saveY = -1;
      } else {
        //either there is nothing saved yet, or something is amiss!
        saveY = 0;
      }
    } else {
      saveY = 0;
    }
  } else {
    notifyShow('localStorage appears to be unavailable in this browser. Unable to save anything.');
    saveY = -1;
  }
}
function storageChoose(zChoice) {
  if (zChoice == 'Y') {
    var a = saveY[0]
      , b = saveY[1];
    saveY = 1;
    storageSave('AllowSave', saveY);
    storageSave(a, b);
  } else {
    //disable saving for this session.
    saveY = -1;
  }
  //later on if it is called for by anyone, I can add a 'never' save that disables saving, except for saving the preference to never save :D
}
function storageLoad(toLoad) {
  var dataToLoad = '';
  try {
    dataToLoad = localStorage.getItem(toLoad);
  } catch (ex) {}
  return dataToLoad;
}
function storageSave(toSave, dataToSave) {
  //ONLY save if if is 1
  if (saveY == 1) {
    localStorage.setItem(toSave, dataToSave);
  }//check wether this is the first time the user has saved something:
  else if (saveY == 0) {
    //nothing stored
    //check if the user has already got a notifyer yet:
    if (!document.getElementById('storY')) {
      saveY = [toSave, dataToSave];
      //temporerily store the data in this variable.
      var message = '<p style="font-size:0.3em;margin-bottom:0.5em;">Remember preferences?</p><button id="storY" class="uButtons uButtonGreen buttonYN" type="button " style="float:left;">Yes</button>' + '<button id="storN" class="uButtons uButtonRed buttonYN" type="button" style="float:right;">No</button>';
      notifyShow(message);
    }
  }
  //else stor is -1 and that means the user has opted to not save anything.
}
function notifyShow(message) {
  if (message) {
    //create a semi-opaque rounded rectangle on the top-right, and put the message into it.
    var newWindow = document.createElement('div');
    newWindow.id = 'noty';
    newWindow.classList = 'noty';
    var xButton = '<div id="notyClose" class="uButtonRed buttonClose">X</div>';
    //look for buttons etc and add the notifier's id nunmber to it
    message = message.replace(/ id="_/gi, ' id="_');
    //case insensetive and global
    newWindow.innerHTML = xButton + message;
    document.getElementById('cont').appendChild(newWindow);
    //next, place the menu.
    var noty = document.getElementById('noty');
    //center the notify popup
    noty.style.top = Math.round((document.getElementById('cont').offsetHeight - noty.offsetHeight) / 2) + 'px';
    newWindow.style.opacity = 1;
  }
}
