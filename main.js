/*
  Color learning game by StewVed.
*/
var nums = []
, globVol = .33 //the volume of the beeps in the game.
, randing = 0 //whether the game is generating and playing the new number sequence
, buttons = 7 //how many buttons to use in the game - 4 by default
, clrs = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
, hsls = [
   'hsl(0, 100%, 50%)'
 , 'hsl(39, 100%, 50%)'
 , 'hsl(60, 100%, 48%)'
 , 'hsl(120, 100%, 40%)'
 , 'hsl(240, 100%, 60%)'
 , 'hsl(275, 100%, 35%)'
 , 'hsl(300, 76%, 65%)']
 , hslLs = [
   'hsl(0, 100%, 80%)'
 , 'hsl(39, 100%, 80%)'
 , 'hsl(60, 100%, 80%)'
 , 'hsl(120, 100%, 70%)'
 , 'hsl(240, 100%, 80%)'
 , 'hsl(275, 100%, 60%)'
 , 'hsl(300, 76%, 90%)']
, combo
, score
, turns
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
  document.body.innerHTML = '<div id="game">' + createButtons() + '</div>' + '<div id="settns" style="visibility:hidden;">' + createSettings() + '</div>' + '';
  //check for saved data. If set, the user has chosed to either save or not save data.
  storageCheck();
  //check if the user has modified the volume level:
  var dataToLoad = storageLoad('vol');
  if (dataToLoad) {
    globVol = parseFloat(dataToLoad);
    //move the volume slider to the loaded volume
    volUpdate();
  }

  /*
    make the circles smoothly make a ring around the inside of the Game circle.
  */
  swatch();

  resize();
  newGame();
}
function createButtons() {
  var a = '<div id = "ctext" class="cont ctext">let\'s go!</div>';
  //create empty string
  for (var x = 0; x < buttons; x++) {
    //add element to be a button
    a += '<div id = "c' + x + '" class="cting">' +
      '<div id = "' + x + '" class="ting" style="background-color:' + hsls[x] + ';"></div>' +
    '</div>';
  }
  return a;
}

function createSettings() {
  return '<div id="scoreText">Turn:0</div>' + '<button id="mem" type="button" class="uButtonLeft uButtons uButtonGreen" style="clear:both;width:50%;">Memory</button>' + '<button id="ges" type="button" class="uButtons uButtonGrey uButtonRight" ' + 'style="width:40%;padding-left:4px;margin-left:-1px;">Guess</button>' + '<div id="fs" class="uButtons uButtonGrey fsButton">' + '<span id="fsI" class="fsInner">&#9974;</span> Fullscreen' + '</div>' + '<br>' + '<div class="vImg">&#9698;</div>' + '<div id="vol%" style="display:inline-block;">33%</div>' + '<div id="vol-Cv" class="sliderCont">&nbsp;' + '<div id="vol-Iv" class="sliderInner">&nbsp;</div>' + //Off ♫ &#128266;
  '</div>' + '';
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
  //simple method of scaling the entire thing - make the font size a percent of the space.
  zGame.style.width = zGame.style.height = zGame.style.borderRadius = document.getElementById('settns').style.width = document.getElementById('settns').style.height = a + 'px';
  zGame.style.fontSize = a * 1.5 + '%';
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
  document.getElementById('settns').style.fontSize = a + '%';
  if (portraitLayout) {
    zGame.style.top = Math.round((b / 2) - c1) + 'px';
    zGame.style.left = '0px';
  } else {
    zGame.style.left = Math.round((b / 2) - c1) + 'px';
    zGame.style.top = '0px';
  }
    reHeightText();
}
function reHeightText() {
  document.getElementById('ctext').style.top = (((document.getElementById('game').offsetHeight *.97) - document.getElementById('ctext').offsetHeight) / 2) + 'px';
}
function randNums() {
  nums = [];
  for (var x = 0; x < level; x++) {
    // randomize which button is 'pressed' for each 'tick'
    nums.push(Math.round(Math.random() * (buttons - 1)));
  }
}
function newGame() {
  window.clearTimeout(playing);
  playing = null ;
  Win = 1;
  turn = 0;
  randing = 1;
  randNums();
  //in this game, there will only ever be one sequence, but I will leave the code for color memory game.
  playing = window.setTimeout(function() {
    playSequence(0);
  }, (t * 2));
}
function playSequence(x) {
  //ButtonBackColor(nums[x]);
  document.getElementById('ctext').innerHTML = clrs[nums[x]];
  reHeightText();
  //let us make this one go up in a scale, since there are 7...(TODO)
  soundBeep('sine', 500, 1, 100);
  x++;
  if (x < nums.length) {
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
    if (document.getElementById('fs')) {
      document.getElementById('fs').classList.remove('fsd')
      document.getElementById('fs').classList.add('fsu');
    }
  } else {
    getFS.call(document.documentElement, function() {});
    if (document.getElementById('fs')) {
      document.getElementById('fs').classList.remove('fsu')
      document.getElementById('fs').classList.add('fsd');
    }
  }
}
function toggleSettings() {
  if (document.getElementById('settns').style.visibility === 'hidden') {
    document.getElementById('settns').style.visibility = 'visible';
  } else {
    document.getElementById('settns').style.visibility = 'hidden';
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
