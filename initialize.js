//Modified from stewved/gameTemplate/initialize.s - part of my gameTemplate project.
//hopefully comprehensive HTML cancel fullscreen:
var killFS = (document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen);
//kick up fullscreen:
var getFS = (document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullscreen || document.documentElement.msRequestFullscreen);
//mousewheel event, based on the all-encompassing mozDev version
var mouseWheelType = 'onwheel'in document.createElement('div') ? 'wheel' : document.onmousewheel ? 'mousewheel' : 'DOMMouseScroll';
/*
 * Keys to ignore... alt-tab is annoying, so don't bother with alt for example
 * 16 = shift
 * 17 = Ctrl
 * 18 = Alt (and 17 if altGr)
 * 91 = windows key
 * 116 = F5 - browser refresh
 * 122 = F11 - Full Screen Toggle
*/
var keysIgnore = [0, 16, 17, 18, 91, 116, 122];
/*
 * left,up,right,down,A,B,X,Y   you can add more should your game require it.
*/
var keysDefault = [37, 38, 39, 40, 0, 0, 0, 0];
/*
 * the currently used keys are loaded on init
*/
var keysCurrent = [0, 0, 0, 0, 0, 0, 0, 0];
//Input events vars to hold the event info:
var inputType;
// touch|gamePad|mouse|keyboard - depending on game type you could add GPS or whatever else HTML supports...
//Mouse:
var mouseVars = [];
//Gamepad:
var gamePadVars = [];
//keyboard:
var keyVars = [];
//For touch-enabled devices
var touchVars = [];
//global array to handle ongoing touch events
// Create the main sound var
var audioCtx = new (window.AudioContext || window.webkitAudioContext);
//webkit prefix for safari according to caniuse
/*
 * To make the game run when the JS file is loaded, we would call the init function:
 * Init();
 * but because I am using a loader which tracks the loading of the images and sounds, Init is called by that.
*/
function Init() {
  // Add event listeners to the game elenemt
  addEventListeners();
  // initialize the mouse event
  mouseClear();
  //for the moment, just use the default keyset:
  keysCurrent = keysDefault;
  //generate sounds natively
  //create waveforms for sounds? for example soundBeep('sine', 1000, 1, 75);
  /*
   * example for ogg and mp3: - stupidly, not all devices support either, so you gotta use both!
   * gameVars.sound1 = document.createElement('audio');
   * gameVars.sound1.src = 'sounds/1.mp3';
   * gameVars.sound1.src = 'sounds/1.ogg';
   *
   * call it by doing
   * soundPlay(gameVars.sound1, 0); //0 is the startTime of the sound.
  */
  InitMain();
}
function addEventListeners() {
  //window.addEventListener('error', Win_errorHandler, false); //now done from the main index.html file
  window.addEventListener('resize', resize, false);
  /*
   * I only want to pick up input events on the game,
   * if this doesn't work, go back to window/document
   * and use blur/focus/pause.
   */
  window.addEventListener('contextmenu', bubbleStop, false);
  window.addEventListener('dblclick', bubbleStop, false);
  //all below used to be document.getElementById('Wallpaper')
  window.addEventListener(mouseWheelType, mouseWheel, false);
  window.addEventListener('touchstart', touchDown, false);
  window.addEventListener('touchmove', touchMove, false);
  window.addEventListener('touchcancel', touchUp, false);
  window.addEventListener('touchend', touchUp, false);
  window.addEventListener('touchleave', touchUp, false);
  window.addEventListener('mousedown', mouseDown, false);
  window.addEventListener('mousemove', mouseMove, false);
  window.addEventListener('mouseup', mouseUp, false);
  window.addEventListener('keydown', keyDown, false);
  window.addEventListener('keyup', keyUp, false);
}
