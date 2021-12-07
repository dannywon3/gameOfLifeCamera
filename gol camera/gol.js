function make2DArray(cols, rows) {
    arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

let capture;
let arr;
let grid;
let cols;
let rows;
let resolution = 10
let playBool = true;
let resSlider;
let sliderVal;
let drawModeBool = true;
let clearMode = false;


function setup() {
    createCanvas(windowWidth, windowHeight);

    capture = createCapture(VIDEO);
    capture.size(width, height);
    // capture.hide();

    cols = floor(width / resolution);
    rows = floor(height / resolution);
    
    grid = make2DArray(cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = floor(random(2));
        }
    }

    button = createButton('Randomize Grid');
    button.position(19, 50);
    button.mousePressed(randomizeGrid);

    button = createButton('Clear Grid');
    button.position(19, 80);
    button.mousePressed(clearGrid);

    button = createButton('Play Toggle');
    button.position(19, 110);
    button.mousePressed(play);

    // button = createButton('Draw Toggle');
    // button.position(19, 140);
    // button.mousePressed(drawMode);

    resSlider = createSlider(5, 15, 10);
    resSlider.position(19, 140);

    
    loop();
}

function draw() {

    sliderVal = resSlider.value();
    
    background(0);

    // Display video image, apply filters
    image(capture, 0, 0, capture.width, capture.height);
    filter(INVERT);
    filter(THRESHOLD, 0.5);


    // Get data from screen, convert to Game Of Life grid data
    loadPixels();
    let numCols = floor(capture.width / resolution);
    let numRows = floor(capture.height / resolution);
    for (let i = 0; i < numCols; i++) {
        for (let j = 0; j < numRows; j++) {
            let x = i * resolution;
            let y = j * resolution;

            let averageSaturation = 0;
            for (let camRow = x; camRow < x + resolution; camRow++) {
                for (let camCol = y; camCol < y + resolution; camCol++) {
                    let loc = 4*camRow + 4*camCol * width;
                    if (pixels[loc] == 255) {
                        averageSaturation++;
                    } else {
                        averageSaturation--;
                    }
                }
            }
            if (averageSaturation > 0) {
                grid[i][j] = 1;
            } else if (clearMode) {
                grid[i][j] = 0;
            }
        }
    }


    // Drawing on grid
    stroke(255);
    if (mouseIsPressed === true && drawModeBool) {
        // making drawing easier when not playing
        if (playBool) {
            loop();
        } else {
            noLoop();
        }
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i * resolution;
                let y = j * resolution;
                if (mouseX >= x && mouseX <= x + (resolution-1) &&
                    mouseY >= y && mouseY <= y + (resolution-1)) {
                    if (grid[i][j] == 0) {
                        grid[i][j] = 1;
                        fill(255);
                        stroke(0);
                        rect(x, y, resolution-1, resolution-1); 
                    } else {
                        grid[i][j] = 0;
                        fill(0);
                        stroke(0);
                        rect(x, y, resolution-1, resolution-1);
                    }
                    
                    
                }
            }
        }
    }


    // Draw grid of rects
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * resolution;
            let y = j * resolution;
            if (grid[i][j] == 1) {
                fill(255);
                stroke(0);
                rect(x, y, resolution-1, resolution-1);   
            }
        }
    }


    if (playBool) {
        let next = make2DArray(cols, rows);

        // calculate the next generation/array based on prev grid
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {

            
                // count amount of alive neighbours
                let neighbours = countNeighbours(grid, i, j);

                // grab current state of a cell
                let state = grid[i][j];

                // rules of conways game of life logic
                if (state == 0 && neighbours== 3) {
                    next[i][j] = 1;
                } else if (state == 1 && (neighbours < 2 || neighbours > 3)) {
                    next[i][j] = 0;
                } else {
                    next[i][j] = state;
                }
                
            }
        }
        
        grid = next;
    }  
}



function countNeighbours(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {

            //edges continuing off to loop around
            let col = (x + i + cols) % cols;
            let row = (y + j + rows) % rows;

            sum += grid[col][row];
        }
    }

    // remove self count as neighbour
    sum -= grid[x][y];
    return sum;
}

function randomizeGrid() {
    resolution = sliderVal;
    cols = floor(windowWidth / resolution);
    rows = floor(windowHeight / resolution);
    grid = make2DArray(cols, rows);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = floor(random(2));
        }
    }
}

function clearGrid() {
    resolution = sliderVal;
    cols = floor(windowWidth / resolution);
    rows = floor(windowHeight / resolution);
    grid = make2DArray(cols, rows);
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;
        }
    }
}

function play() {
    playBool = !playBool;
}

// function drawMode() {
//     drawModeBool = !drawModeBool;
// }

function mouseReleased() {
    loop();
    draw();
}

function mouseDragged() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * resolution;
            let y = j * resolution;
            if (mouseX >= x && mouseX <= x + (resolution-1) &&
                mouseY >= y && mouseY <= y + (resolution-1)) {
                if (grid[i][j] == 0) {
                    grid[i][j] = 1;
                    fill(255);
                    stroke(0);
                    rect(x, y, resolution-1, resolution-1); 
                } else {
                    grid[i][j] = 0;
                    fill(0);
                    stroke(0);
                    rect(x, y, resolution-1, resolution-1);
                }
                
                
            }
        }
    }
}

// Shortcuts
function keyTyped() {
    if (key == "c") {
        clearGrid();
    }

    if (key == "p") {
        play();
    }

    if (key == "r") {
        randomizeGrid();
    }

    if (key == "v") {
        clearMode = !clearMode;
    }

    let rx = floor(random(arr.length-5));
    let ry = floor(random(arr[0].length-6));
    // console.log(arr.length);
    // console.log(rx);
    if (key === "1") {
        // down glider
        grid[1+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[4+rx][2+ry] = 1;
        grid[4+rx][3+ry] = 1;
        grid[4+rx][4+ry] = 1;
        grid[4+rx][5+ry] = 1;
        grid[3+rx][5+ry] = 1;
        grid[2+rx][5+ry] = 1;
        grid[1+rx][4+ry] = 1;
    }

    if (key == "2") {
        // right glider
        grid[1+rx][2+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[4+rx][1+ry] = 1;
        grid[5+rx][1+ry] = 1;
        grid[5+rx][2+ry] = 1;
        grid[5+rx][3+ry] = 1;
        grid[4+rx][4+ry] = 1;
        grid[1+rx][4+ry] = 1;
    }

    if (key == "3") {
        // up glider
        grid[1+rx][1+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[1+rx][2+ry] = 1;
        grid[4+rx][2+ry] = 1;
        grid[1+rx][3+ry] = 1;
        grid[1+rx][4+ry] = 1;
        grid[2+rx][5+ry] = 1;
        grid[2+rx][5+ry] = 1;
    }

    if (key == "4") {
        // left glider
        grid[5+rx][2+ry] = 1;
        grid[4+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[1+rx][1+ry] = 1;
        grid[1+rx][2+ry] = 1;
        grid[1+rx][3+ry] = 1;
        grid[2+rx][4+ry] = 1;
        grid[5+rx][4+ry] = 1;
    }
    

    if (key == "5") {
        // diag R glider down
        grid[2+rx][1+ry] = 1;
        grid[3+rx][2+ry] = 1;
        grid[3+rx][3+ry] = 1;
        grid[2+rx][3+ry] = 1;
        grid[1+rx][3+ry] = 1;
    }

    if (key == "6") {
        //diag L glider down
        grid[2+rx][1+ry] = 1;
        grid[1+rx][2+ry] = 1;
        grid[3+rx][3+ry] = 1;
        grid[2+rx][3+ry] = 1;
        grid[1+rx][3+ry] = 1;
    }

    if (key == "7") {
        // diag R glider up
        grid[1+rx][1+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[3+rx][2+ry] = 1;
        grid[2+rx][3+ry] = 1;
    }

    if (key == "8") {
        //diag L glider up
        grid[1+rx][1+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[1+rx][2+ry] = 1;
        grid[2+rx][3+ry] = 1;
    }

    if (key == "9") {
        // flower
        grid[1+rx][2+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[4+rx][1+ry] = 1;
        grid[5+rx][1+ry] = 1;
        grid[5+rx][2+ry] = 1;
        grid[5+rx][3+ry] = 1;
        grid[4+rx][4+ry] = 1;
        grid[1+rx][4+ry] = 1;
        grid[5+rx][2+ry] = 1;
        grid[4+rx][1+ry] = 1;
        grid[3+rx][1+ry] = 1;
        grid[2+rx][1+ry] = 1;
        grid[1+rx][1+ry] = 1;
        grid[1+rx][2+ry] = 1;
        grid[1+rx][3+ry] = 1;
        grid[2+rx][4+ry] = 1;
        grid[5+rx][4+ry] = 1;
    }
}