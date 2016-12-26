var simulationOn = 0;
var gameGrid;

function generateGameGrid() {
	var i, j, tr, td;
	
	// create the table grid (html element)
	var container = document.getElementsByClassName('gridContainer')[0];
	var tableGrid = document.createElement('table');
	var tableBody = document.createElement('tbody');
	
	for (i = 0; i < 100; i++) {
		tr = document.createElement('tr');
		for (j = 0; j < 100; j++) {
				td = document.createElement('td');
				td.setAttribute("id", createId(i,j));
				td.setAttribute('onclick','giveToOrTakeLifeFromCell(this.id);');
				tr.appendChild(td);
		}
		tableBody.appendChild(tr);
	}
	tableGrid.appendChild(tableBody);
	container.insertBefore(tableGrid, container.firstChild);
	
	// create and initialize the table grid (array element)
	gameGrid = createZero2DTable(100,100);
	
	document.getElementById("globalALiveCells").innerHTML = 0;
	
	disableStopButton();
	disableStartButton();
	disableClearButton();
	emptyGridMessage();
}

function createZero2DTable(rows, cols) {
  var array = [], row = [];
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}

function clearGrid() {
	if (!simulationOn) {
		var i, j, id;
		for(i = 0; i < 100; i++)
			for(j = 0; j < 100; j++)
				if (gameGrid[i][j] == 1) {
					gameGrid[i][j] = 0;
					document.getElementById(createId(i,j)).style.backgroundColor = 'white';
				}
		document.getElementById("globalALiveCells").innerHTML = 0;
		document.getElementById("generations").innerHTML = 0;
		emptyGridMessage();
		disableStartButton();
		disableClearButton();
		enableGenerateButton();
	}
}

function giveToOrTakeLifeFromCell(id) {
	var row = getRow(id);
	var column = getColumn(id);
	
	if (!simulationOn) {
		if (gameGrid[row][column] == 0) { // give it life!
				if (document.getElementById("globalALiveCells").innerHTML >= 2000) {
				noRoomForAliveCellsMessage();
				return;
			}
			enableClearButton();
			enableStartButton();
			
			gameGrid[row][column] = 1;
			document.getElementById(id).style.backgroundColor = 'black';
			document.getElementById("globalALiveCells").innerHTML++;
			document.getElementById("generations").innerHTML = 0;
		} else { // (gameGrid[row][column] == 1) -> take its life!
			gameGrid[row][column] = 0;
			document.getElementById(id).style.backgroundColor = 'white';
			document.getElementById("globalALiveCells").innerHTML--;
			document.getElementById("generations").innerHTML = 0;
			if (document.getElementById("globalALiveCells").innerHTML == 0) {
				disableClearButton();
				disableStartButton();
			}
		}
	}
}

function generateLiveCells() {
	var numberOfLiveCellsToGenerate = document.getElementById("liveCells").value;
	
	if (numberOfLiveCellsToGenerate <= 0) {
		alert("Please put a positive number (>0) in the selected field!");
		return;
	}
	
	if (numberOfLiveCellsToGenerate >= 1 && numberOfLiveCellsToGenerate <= 2000) {
		enableClearButton();
		enableStartButton();
	}
	
	var globalALiveCells = document.getElementById("globalALiveCells").innerHTML;
	if (globalALiveCells >= 2000) {
		noRoomForAliveCellsMessage();
		return;
	}
	
	var totalLiveCells = parseInt(globalALiveCells) + parseInt(numberOfLiveCellsToGenerate);
	if (totalLiveCells > 2000) {
		var maxAllowedAliveCells = 2000 - globalALiveCells;
		alert("The total number of live cells has to be 2000 at most! You have room for " + maxAllowedAliveCells + " more...");
		document.getElementById("liveCells").value = maxAllowedAliveCells;
		return;
	} else {
		var i, row, column, id;
		for (i = 1; i <= numberOfLiveCellsToGenerate; i++) {
			do {
				row = Math.floor((Math.random() * 100) + 0);
				column = Math.floor((Math.random() * 100) + 0);
			} while (gameGrid[row][column] == 1);
			gameGrid[row][column] = 1;
			id = row + "," + column;
			document.getElementById(id).style.backgroundColor = 'black';
		}
	document.getElementById("globalALiveCells").innerHTML = totalLiveCells;
	document.getElementById("generations").innerHTML = 0;
	}
}

async function startSimulation() {
	enableStopButton();
	disableStartButton();
	disableClearButton();
	disableGenerateButton();
	simulationOn = 1;
	
	var row, column, nextRow, nextColumn, previousRow, previousColumn, neighbourhoodSum;
	while (simulationOn) {
		// find new gameGrid
		var nextGenerationGameGrid = createZero2DTable(100,100);
		for(i = 0; i < 100; i++) {
			for(j = 0; j < 100; j++) {
				row = i;
				column = j;
				if ((i+1) == 100) nextRow = 0; else nextRow = i+1;
				if ((j+1) == 100) nextColumn = 0; else nextColumn = j+1;
				if ((i-1) == -1) previousRow = 99; else previousRow = i-1;
				if ((j-1) == -1) previousColumn = 99; else previousColumn = j-1;
				
				// Add the values of the center grid and all 8 surounding it
				neighbourhoodSum  = gameGrid[previousRow][previousColumn] + gameGrid[previousRow][column] + gameGrid[previousRow][nextColumn];
				neighbourhoodSum += gameGrid[row][previousColumn] + gameGrid[row][column] + gameGrid[row][nextColumn];
				neighbourhoodSum += gameGrid[nextRow][previousColumn] + gameGrid[nextRow][column] + gameGrid[nextRow][nextColumn];
				
				// Rules for creating the next generation of cells
				if (neighbourhoodSum == 3) nextGenerationGameGrid[row][column] = 1;
				else if (neighbourhoodSum == 4) nextGenerationGameGrid[row][column] = gameGrid[row][column];
				else nextGenerationGameGrid[row][column] = 0;
			}
		}
		
		if (equalGeneration(gameGrid,nextGenerationGameGrid)) {
			alert("Identical generation found: the population stabilized (simulation stops here)!");
			stopSimulation();
			if (document.getElementById("globalALiveCells").innerHTML == 0) {
				disableClearButton();
				disableStartButton();
			}
		}
		
		gameGrid = nextGenerationGameGrid;
		
		// draw the new gameGrid
		var globalALiveCells = 0;
		for(i = 0; i < 100; i++)
			for(j = 0; j < 100; j++)
				if (gameGrid[i][j] == 1) { // a live cell
					globalALiveCells++;
					document.getElementById(createId(i,j)).style.backgroundColor = 'black';
				} else document.getElementById(createId(i,j)).style.backgroundColor = 'white'; // a dead cell
		
		// change generations and number of alive cells on the web page
		document.getElementById("generations").innerHTML++;
		document.getElementById("globalALiveCells").innerHTML = globalALiveCells;
		
		// wait 
		await sleep(500);
	}
}

function stopSimulation() {
	simulationOn = 0;
	enableGenerateButton();
	enableClearButton();
	enableStartButton();
	disableStopButton();
}

function equalGeneration(gameGrid,nextGenerationGameGrid) {
	var i, j;
	for(i = 0; i < 100; i++)
		for(j = 0; j < 100; j++)
			if (gameGrid[i][j] != nextGenerationGameGrid[i][j])
				return false;
	return true;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createId(i,j) {
	return (i + "," + j);
}

function getRow(id) {
	return id.split(",")[0];
}

function getColumn(id) {
	return id.split(",")[1];
}

function emptyGridMessage() {
	document.getElementById("Messages").innerHTML = "Try generating live cells with the button above" +
	"</br>and/or give life to them by clicking on the squares!" + 
	"</br>You can also \"kill\" the alive cells by clicking on them." +
	"</br>The total number of live cells in the grid has to be </br>2000 at most :)" + 
	"</br>The simulation stops when a generation is identical" +
	"</br>to the previous one or if you hit the Stop button.";
}

function noRoomForAliveCellsMessage() {
	alert("No room for more alive cells! You can either clear the grid or \"kill\" some of the alive cells by clicking on them!");
}

function nonEmptyGridMessage() {
	document.getElementById("Messages").innerHTML = "";
}

function disableGenerateButton() {
	document.getElementsByClassName("generateButton")[0].disabled = true;
}

function enableGenerateButton() {
	document.getElementsByClassName("generateButton")[0].disabled = false;
}

function disableClearButton() {
	document.getElementsByClassName("clearButton")[0].disabled = true;
}

function enableClearButton() {
	document.getElementsByClassName("clearButton")[0].disabled = false;
}

function disableStartButton() {
	document.getElementsByClassName("startButton")[0].disabled = true;
}

function enableStartButton() {
	document.getElementsByClassName("startButton")[0].disabled = false;
}

function disableStopButton() {
	document.getElementsByClassName("stopButton")[0].disabled = true;
}

function enableStopButton() {
	document.getElementsByClassName("stopButton")[0].disabled = false;
}