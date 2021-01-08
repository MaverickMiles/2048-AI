var game;
var game_grids;
var prevgrid;
var current_move_id = 0;
var game_paused = true;

const loadFile = document.getElementById('load-file');

function save_game(){

  function encode( s ) {
    var out = [];
    for ( var i = 0; i < s.length; i++ ) {
        out[i] = s.charCodeAt(i);
    }
    return new Uint8Array( out );
  }

  var data = encode( JSON.stringify(window.manager.grid.game, null, 4) );

  var blob = new Blob( [ data ], {
      type: 'application/octet-stream'
  });
  
  url = URL.createObjectURL( blob );
  var link = document.createElement( 'a' );
  link.setAttribute( 'href', url );
  link.setAttribute( 'download', 'game.json' );
  
  var event = document.createEvent( 'MouseEvents' );
  event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
  link.dispatchEvent( event );

}


function load_game(filename){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            game =  JSON.parse(xobj.responseText);
            console.log("Game loaded");
            console.log(game["0"]);     
            load_game_callback();
          }
    };
    xobj.send(null);  
   
}

function load_game_callback(){
  current_move_id = 0
  window.manager.grid.clearGrid();
  var tile;
  console.log(game[String(current_move_id)][0]);
  game[String(current_move_id)].forEach(function(item,index){
    tile = new Tile({"x":item['x'], "y":item['y']},item["value"]);
    window.manager.grid.insertTile(tile);
    window.manager.actuate();
  });
  current_move_id++;
  build_game_grids();
}

function build_game_grids(){
  game_grids = [];
  var prev_grid = window.manager.grid;
  game_grids.push(prev_grid);
  var n = Object.keys(game).length;
  for (var i = 1;i<n;i++){
    var grid = prev_grid.clone();
    var move = game[String(i)]["move"];
    grid.move(move);
    var tile_text = game[String(i)]["insertTile"];
    var tile = new Tile({"x":tile_text['x'], "y":tile_text['y']},tile_text["value"]);
    grid.insertTile(tile);
    game_grids.push(grid);
    prev_grid = grid;
  }

  // console.log(game_grids);
}

function pause_play(){
  game_paused = !game_paused;
  if(!game_paused){
    run_game();
  }
}

function previous(){
  if (game && game_paused){
    step_forward(false);
  }
}

function next(){
  if (game && game_paused){
    step_forward(true);
  }
}

function getGrid(index){
  // console.log(game_grids[index-1]);
  // if(game_grids && game_grids[index-1]){
    window.manager.grid = game_grids[index].clone();
    window.manager.actuate();
    current_move_id = index;
    console.log(game_grids[index]);
  // }
}

function speed(){}

function jump_to_max_tile(tileValue){
  for(var i = 0;i<game_grids.length;i++){
    if (gridContainsTileValue(game_grids[i],tileValue))
      getGrid(i);
      return;
  }
}

function gridContainsTileValue(grid,tileValue){
  var cells = grid.cells;
  for (var i = 0;i<grid.size;i++){
    for(var j=0;j<grid.size;j++){
      if (cells[i][j].value == tileValue)
        return true;
    }
  }
  return false;
}
function slider(){}

function inspect_move(){}



function step_forward(direction){
  if (direction && current_move_id < Object.keys(game).length-1){
      sleep(animationDelay*1.25).then(function(){
        var move = game[String(current_move_id)]["move"];
        window.manager.grid.move(move);
        var tile_text = game[String(current_move_id)]["insertTile"];
        var tile = new Tile({"x":tile_text['x'], "y":tile_text['y']},tile_text["value"]);
        window.manager.grid.insertTile(tile);
        window.manager.actuate();
        current_move_id++;
      });

  }
  else if(!direction && current_move_id > 0){
      sleep(animationDelay*1.25).then(function(){
        var move = game[String(current_move_id-1)]["move"];
        window.manager.grid = new Grid(4 );
        // var tile_text = game[String(index)]["insertTile"];
        // var tile = new Tile({"x":tile_text['x'], "y":tile_text['y']},tile_text["value"]);
        // window.manager.grid.removeTile(tile_text['x'],tile_text['y']);
        window.manager.actuate();
        current_move_id--;
      });
    }
  
}
function run_game(){
  if(game_paused)
      return;
  sleep(animationDelay).then(() =>{
    if (current_move_id < Object.keys(game).length){
      console.log(current_move_id);  
      var move = game[String(current_move_id)]["move"];
      console.log(move)
      window.manager.grid.move(move);
      var tile_text = game[String(current_move_id)]["insertTile"];
      var tile = new Tile({"x":tile_text['x'], "y":tile_text['y']},tile_text["value"]);
      window.manager.grid.insertTile(tile);
      console.log(tile);
      current_move_id++;
      window.manager.actuate(); 
           
      // setTimeout(run_game,animationDelay);
      run_game();
    }    
  });
  
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById('load-game-button').addEventListener('click', function(){
  loadFile.click();
});

loadFile.addEventListener('change', e => {
  console.log(loadFile);
  if (loadFile){
    // console.log(e);
    // console.log(e.target.files[0]);
    var file = e.target.files[0]; 

    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
        game = JSON.parse(readerEvent.target.result); // this is the content!
        // console.log(game);
        load_game_callback();
        // console.log( content );
   }
    // load_game(filename);
   }
   else{
     alert("Invalid file. Please choose another file.");
   }
});

document.getElementById('save-game-button').addEventListener('click', function(){
  save_game();
});

document.getElementById('prev-game-button').addEventListener('click', function(){
  previous();
});

document.getElementById('play-game-button').addEventListener('click', function(){
  pause_play();
});

document.getElementById('next-game-button').addEventListener('click', function(){
  next();
});

document.getElementById("moveIndex").addEventListener("change", function(){
  console.log(this.value);
  getGrid(this.value);
}); 