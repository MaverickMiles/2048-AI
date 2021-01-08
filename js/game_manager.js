function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;
  this.move_direction = undefined;
  this.running      = false;
  this.played = false;
  this.game_record = {};    
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var bestMove = this.requestMove();
    this.actuator.showHint(bestMove);
  }.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Run AI');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-run');
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  // console.log(this.grid);
  var result = this.grid.move(direction);
  // this.game_record[String(this.moveNumber)] = {
  //   "move": direction
  // }
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
      // this.game_record[String(this.moveNumber)]["insertTile"] = {"x":tile.x,"y":tile.y,"value":tile.value}; 
      // this.moveNumber++;
    }
  } else {
//    this.won = true;
// don't stop after getting to 2048
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
    // console.log(this.grid.game);
    this.actuate();
    save_game(this.grid.game);
    return;
  }

  this.actuate();
}

// moves continuously until game is over
GameManager.prototype.run = function() {
  // console.log(this.grid.cells);
  // console.log(parseGrid(this.grid.cells));
  // console.log(this.grid.getAvailableMoves());
  var move = getMove(this.grid.clone())[0];
  // console.log("Move: "+move);
  this.move(move);
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
  // this.requestMove(this);
}

// Make API call to Flask Server
GameManager.prototype.requestMove = function(self) {
  var timeout = animationDelay;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var move = parseInt(JSON.parse(this.responseText).move,10);
      self.move(move);
      if (self.running && !self.over && !self.won) {
        setTimeout(function(){self.run();}, 20);
      }
    }
  };


  map = parseGrid(this.grid.cells);
  // console.log(map);
  xhttp.open("GET", "http://127.0.0.1:5000/api/"+map, true);
  xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhttp.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  xhttp.send();
}


function parseGrid(grid){
  let grid_arr = [];
  for (let i = 0; i<grid.length;i++){
    for(let j = 0; j<grid[i].length;j++){
      if (grid[j][i] == null){
        grid_arr.push(0);
      }
      else{
        grid_arr.push(grid[j][i].value);
      }
    }

  }
  // console.log(grid_arr);
  return grid_arr.toString();
}
