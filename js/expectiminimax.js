//  @author: William Oseghare (who2103)


var MAX_DEPTH = 6;
var time_limit = 0.18;

var weight_matrix = [[4**15,4**14,4**13,4**12],
						[4**8,4**9,4**10,4**11],
						[4**7,4**6,4**5,4**4],
						[4**0,4**1,4**2,4**3]];



function getMove(grid){
	var move = dearMax(grid, depth=0, prob=1, alpha=-Infinity, beta=Infinity);

	if (move == null){
		console.log("shouldn't be here");
		return dearMax(grid, depth=MAX_DEPTH, prob=1, alpha=-Infinity, beta=Infinity);
	}

	return move;
}

function dearMax(grid,depth,prob,alpha,beta){
	// console.log("dearMax");
	var queue = grid.getAvailableMoves();
	// console.log("dearMax");

	queue.sort(rankMoves);
	var max_util = -Infinity;
	var max_move, utility;

	
	for (let i = 0;i<queue.length;i++){
		utility = chance(queue[i][1],depth+1,prob,alpha,beta);

		if (utility > max_util){
			max_move = queue[i][0];
			max_util = utility;
		}

		if (max_util >= beta)
			break;

		if (max_util > alpha)
			alpha = max_util;
	}
		
	if (max_util == -Infinity)
		max_util = evalFunction(grid);

	return [max_move, max_util];


}

function chance(grid,depth,prob, alpha, beta){
	// console.log("chance");
	return 0.9*hiMin(grid,depth+1,0.9*prob, tile=2, alpha=alpha, beta=beta) +
		0.1*hiMin(grid,depth,0.1 * prob, tile=4, alpha=alpha, beta=beta)
}


function hiMin(grid,depth,prob,tile_val,alpha,beta){
	// console.log("hiMin");
	var min_utility = Infinity;
	
	var gridCopy = grid.clone();
	var queue = gridCopy.availableCells();
	queue.sort(rankPositions);
	// prob *= (1/(queue.length));
	var utility;
	for (let i = 0; i < queue.length;i++){
		var tile =new Tile(queue[i],tile_val);

		gridCopy.insertTile(tile);
		if (/*prob < 0.04 ||*/ depth >= MAX_DEPTH)
			utility = evalFunction(gridCopy);
		else
			utility = dearMax(gridCopy.clone(), depth+1,prob,alpha,beta)[1];
		
		gridCopy.removeTile(tile);

		if (utility < min_utility)
			min_utility = utility;
		if (min_utility <= alpha)
			break;
		if (min_utility < beta)
			beta = min_utility;
	}

	return min_utility;

}
function rankMoves(a, b){
	return evalFunction(b[1]) - evalFunction(a[1]);
}

function rankPositions(a, b){

	return (weight_matrix[a.y][a.x]) - 
			((weight_matrix[b.y][b.x]))
}

function evalFunction(grid){
	var map = grid.cells;
	// console.log(grid.cells);
	
	var result=  0;

	for (let i =0;i<grid.size;i++){
		for(let j=0;j<grid.size;j++){
			if(map[j][i] != null)
				result+=map[j][i].value * weight_matrix[i][j];
		}
	}

	if (openSquares(grid) == 0)
		return 0.9 * result;
	
	return result;	
}

function openSquares(grid){
	if (grid == null)
		return 0;
	var count = 0;
	for (let i =0;i<grid.size;i++){
		for(let j=0;j<grid.size;j++){
			if (grid.cells[i][j] == null)
				count += 1;
		}
	}
	return count;
}