/*
  Color learning game by StewVed.
*/
var nums = []
, globVol = .33 //the volume of the beeps in the game.
, randing = 0 //whether the game is generating and playing the new number sequence
, buttons = 7 //how many buttons to use in the game - 4 by default
, clrs = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']
, hsls = [
   'hsl(0, 100%, 50%)'
 , 'hsl(31, 100%, 50%)'
 , 'hsl(60, 100%, 48%)'
 , 'hsl(120, 100%, 45%)'
 , 'hsl(220, 100%, 50%)'
 , 'hsl(270, 100%, 50%)'
 , 'hsl(320, 100%, 50%)']
 , hslLs = [
   'hsl(0, 100%, 80%)'
 , 'hsl(31, 100%, 80%)'
 , 'hsl(60, 100%, 80%)'
 , 'hsl(120, 100%, 75%)'
 , 'hsl(220, 100%, 80%)'
 , 'hsl(270, 100%, 80%)'
 , 'hsl(320, 100%, 80%)']
, combo = 0
, score = 0
, turns = 0
, threshold
, level = 1 //starting/current level
, t = 600 //for how long something takes to animate... pause time.
, playing //disregard any button clicks while the combo is playing.
, saveY;
//user's choice on whether to save data - volume and memory/guess choice, etc.
function InitMain() {
  //could add customisazions like colors, sounds, shapes, amount of buttons, etc. as well.
  /*
    create the amount of circles that the user will play.
*/
  document.body.innerHTML = '<div id="cont" style="position:absolute;">' +
  '<div id="game">' + createButtons() + '</div>' +
  '<div id="set"class="uButtons uButtonGrey">&#9776;</div>' + 
  '<div id="fs" class="uButtons uButtonGrey fsButton">' +
    '<div id="fsI" class="fsd">&#9974;</div>' +
  '</div>' +
  '</div>' +
  '';
  //check for saved data. If set, the user has chosed to either save or not save data.
  storageCheck();
  //check if the user has modified the volume level:
  var dataToLoad = storageLoad('vol');
  /*
    make the circles smoothly make a ring around the inside of the Game circle.
  */
  swatch();

  resize();
  initCombo();
  newGame();
}
function createButtons() {
  var a = '<div id = "ctext" class="cont ctext">let&apos;s go!</div>' ;

  for (var x = 0; x < buttons; x++) {
    //add element to be a button
    a += '<div id = "c' + x + '" class="cting">' +
      '<div id = "' + x + '" class="ting" style="background-color:' + hsls[x] + ';"></div>' +
    '</div>';
  }
  return a;
}

function createSettings() {
  var zVol = (globVol*100).toFixed(0);
  //create a semi-opaque rounded rectangle on the top-right, and put the message into it.
  var newWindow = document.createElement('div');
  newWindow.id = 'settns';
  newWindow.classList = 'noty';

  newWindow.innerHTML = 
    '<div id="setClose" class="uButtonRed buttonClose">X</div>' +
    '<div class="vImg">&#9698;</div>' + '<div id="vol%" style="display:inline-block;left:' + zVol + '%;">' + zVol + '%</div>' + 
    '<div id="vol-Cv" class="sliderCont">&nbsp;' + 
      '<div id="vol-Iv" class="sliderInner">&nbsp;</div>' + //Off ♫ &#128266;
  '</div>';
  document.getElementById('cont').appendChild(newWindow);
  //next, place the menu.
  var settns = document.getElementById('settns');
  //center the notify popup
  newWindow.style.top = Math.round((document.getElementById('cont').offsetHeight - newWindow.offsetHeight) / 2) + 'px';
  newWindow.style.opacity = .98;
}

function swatch() {
  var y = (360 / buttons);
  if (document.getElementById('c0')) {
    for (var x = 0; x < buttons; x++) {
     document.getElementById('c'+ x).style.transform = 'rotate(' + ((y * x) - 90) + 'deg)';
    }
  }
}

function resize() {
  //maybe I should make the game bit a squre, then have the scores bit
  //however amount of space is left? what if the available area is square?
  //regardless, let's begin by finding the smallest size out of length and width:
  var a = window.innerWidth;
  var b = window.innerHeight;
  document.body.style.width = a + 'px';
  document.body.style.height = b + 'px';
  var portraitLayout = 1;
  if (a > b) {
    var c = a;
    a = b;
    b = c;
    portraitLayout = 0;
  }
  var zGame = document.getElementById('game');
  var zCont = document.getElementById('cont');
  zCont.style.fontSize = a * 1.5 + '%';
  //simple method of scaling the entire thing - make the font size a percent of the space.
  zCont.style.width = zCont.style.height = zGame.style.borderRadius = a + 'px';
 /*
     make the circles the correct size.
  */
  var a1 = Math.floor(a * .01);
  var a2 = Math.floor(a * .02);
  var a3 = Math.floor(a * .31); //should prolly be amount of circles divided by (the circumference of game, take half the diameter of a circle)!
  var c1 = (a / 2);
  var c2 = c1 - a3;

  zGame.style.borderWidth = a2 + 'px';

  if (document.getElementById('0')) {
    for (var x = 0; x < buttons; x++) {
      var y = document.getElementById(x).style;
      y.width = y.height = y.borderRadius = a3 + 'px';
      y.borderWidth = a2 + 'px';
      y.left = c2 + 'px';
    }

    //next, move the containers to the new center of the game cirle
    //the containers rotate from the middle.
    var ctop = c1 - (document.getElementById('c0').offsetHeight / 2);
    for (var x = 0; x < buttons; x++) {
      document.getElementById('c' + x).style.top = ctop + 'px';
    }
  }
  if (portraitLayout) {
    zCont.style.top = 
    Math.round((b / 2) - c1) + 'px';
    zCont.style.left = '0px';
  } else {
    zCont.style.left = 
    Math.round((b / 2) - c1) + 'px';
    zCont.style.top = '0px';
  }
    reHeightText();
    moveFSbutton();
}
function reHeightText() {
  document.getElementById('ctext').style.top = (((document.getElementById('game').offsetHeight *.97) - document.getElementById('ctext').offsetHeight) / 2) + 'px';
}
function moveFSbutton() {
  //check for and move fullscreen button to the bottom-right of the screen...
  document.getElementById('fs').style.left = (document.getElementById('cont').offsetWidth - document.getElementById('fs').offsetWidth) + 'px';
  document.getElementById('fs').style.top = (document.getElementById('cont').offsetHeight - document.getElementById('fs').offsetHeight) + 'px';
}
function initCombo() {
  //make sure the nums array is empty
  nums = [];
  //randomize a number for teh first element of the array
  nums.push(randNum());
  //loop through the amount of combinations, then add 2 more,
  //so that there will never be the same color twice in a row, or once removed. (for variety)
    nums.push(randNum());
    while (nums[nums.length - 1] === nums[nums.length - 2]) {
      //this is the same number as the last one... retry
      nums[nums.length - 1] = randNum();
    }
}
function randCombo() {
  for (var x = 2; x < (level + 2); x++) {
    // randomize which button is 'pressed' for each 'tick'
    nums.push(randNum());
    while (nums[nums.length - 1] === nums[nums.length - 2] || nums[nums.length - 1] === nums[nums.length - 3]) {
      //this is the same number as one of the last two... retry
      nums[nums.length - 1] = randNum();
    }
    //remove the first element in the array, so the whole length remains 2 above the current level.
    nums.shift();
  }
}
function randNum() {
  return Math.round(Math.random() * (buttons - 1));
}
function newGame() {
  window.clearTimeout(playing);
  playing = null ;
  Win = 1;
  turn = 0;
  randing = 1;
  randCombo();
  //in this game, there will only ever be one sequence, but I will leave the code for color memory game.
  playing = window.setTimeout(function() {
    playSequence(0);
  }, (t * 2));
}
function playSequence(x) {
  //ButtonBackColor(nums[x]);
  document.getElementById('ctext').style.fontSize = '0.4em';
  document.getElementById('ctext').innerHTML = clrs[nums[x]];
  reHeightText();
  //let us make this one go up in a scale, since there are 7...(TODO)
  soundBeep('sine', 500, 1, 100);
  x++;
  if (x < level) {
    playing = window.setTimeout(function() {
      playSequence(x);
    }, t);
  } else {
    playing = window.setTimeout(function() {
      randing = 0;
    }, (t / 2));
  }
}
function updateScore() {
  document.getElementById('scoreText').innerHTML = 'Turns: ' + turns;
  document.getElementById('pt').innerHTML = 'Level: ' + level;
}
function updateProgress() {
  document.getElementById('pa').style.left = (((score / threshold) * 100) - 100).toFixed(2) + '%';
}
function endTurn() {
  combo = 0;
  turns++;
  if (Win) {
    score++;
    window.setTimeout(function() {
      soundBeep('sine', 1000, 1, 100)
    }, 100);
  } else {
    score--;
    window.setTimeout(function() {
      soundBeep('sine', 500, 1, 100)
    }, 100);
  }
  //updateProgress();
  if (score >= threshold) {
    end1(1, '100%');
    window.setTimeout(function() {
      soundBeep('sine', 1500, 1, 100)
    }, 200);
  } else if (score <= -threshold) {
    end1(-1, '-300%');
    window.setTimeout(function() {
      soundBeep('sine', 330, 1, 100);
    }, 200);
  }
  //updateScore();
  newGame();
}
function end1(num, x) {
  score = 0;
  level += num;
  if (level < 1) {
    level = 1;
  }
  window.setTimeout(function() {
    document.getElementById('pa').style.left = x;
  }, t);
  window.setTimeout(function() {
    levelChange();
  }, t * 2);
}
function levelChange() {
  // hide the progressbars, move to center, show bars again
  document.getElementById('pa').style.opacity = '0';
  document.getElementById('pa').style.left = '-100%';
  window.setTimeout(function() {
    document.getElementById('pa').style.opacity = '1';
  }, t);
}
function ButtonBackColor(a) {
  if (document.getElementById(a)) {
    document.getElementById(a).style.transition = '0s';
    document.getElementById(a).style.backgroundColor = hslLs[a];
    window.setTimeout(function() {
      document.getElementById(a).style.transition = '.3s';
      document.getElementById(a).style.backgroundColor = hsls[a];
    }, (t * .5));
  }
}
function swapButton(zEnable, zDisable) {
  document.getElementById(zEnable).classList.remove('uButtonGrey');
  document.getElementById(zEnable).classList.add('uButtonGreen');
  document.getElementById(zDisable).classList.remove('uButtonGreen');
  document.getElementById(zDisable).classList.add('uButtonGrey');
  window.clearTimeout(playing);
  playing = null ;
  turns = 0;
  level = 1;
  score = 0;
  //updateScore();
  //updateProgress();
  storageSave('mem', mem);
}
// fullscreen handling from webtop then simplified for this project...
function fullScreenToggle() {
  var isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (isFS) {
    killFS.call(document, function() {});
    document.getElementById('fsI').classList.remove('fsd')
    document.getElementById('fsI').classList.add('fsu');
  } else {
    getFS.call(document.documentElement, function() {});
    document.getElementById('fsI').classList.remove('fsu')
    document.getElementById('fsI').classList.add('fsd');
  }
}
function toggleSettings() {
  if (!document.getElementById('settns')) {
    createSettings();
  } else {
    document.getElementById('cont').removeChild(document.getElementById('settns'));
    newGame();
  }
}
// example: soundBeep('sine', 500, 1, 100);setTimeout(function(){soundBeep('sine', 750, 1, 100)}, 100);
function soundBeep(type, frequency, volume, duration) {
  //make the volume comform to the globally set volume
  volume *= globVol;
  volume *= .5;
  //make the entire game queiter.
  //create a HTML5 audio occilator thingy
  var zOscillator = audioCtx.createOscillator();
  //create a HTML5 audio volume thingy
  var zGain = audioCtx.createGain();
  //link the volume to the occilator
  zOscillator.connect(zGain);
  zGain.connect(audioCtx.destination);
  //set up the audio beep to what is needed:
  zOscillator.type = type;
  //default = 'sine' — other values are 'square', 'sawtooth', 'triangle' and 'custom'
  zOscillator.frequency.value = frequency;
  zGain.gain.value = volume;
  //start the audio beep, and set a timeout to stop it:
  zOscillator.start();
  window.setTimeout(function() {
    window.setTimeout(function() {
      zOscillator.stop()
    }, 25);
    //stop once the volume is riiiight down.
    zGain.gain.value = 0.001;
    //hopefully stop that cilck at the end that can happen.
  }, duration);
  //default to qurter of a second for the beep if no time is specified
}
