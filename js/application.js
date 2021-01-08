var animationDelay = 150;
var minSearchTime = 100;

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.manager = new GameManager(4, KeyboardInputManager, HTMLActuator);
});
