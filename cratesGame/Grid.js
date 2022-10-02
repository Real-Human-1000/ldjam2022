class Grid {
  
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.grid = [];
    
    // -1 = None, 0 = Conveyor, 1 = Crusher, 2 = Incinerator, 3 = Acid Sprayer
    // 0 = Facing Right, 1 = Facing Down, 2 = Facing Left, 3 = Facing Up
    // HP: starts at 100, 0 is broken
    // Time: time at which the object was created
    
    
    for (let y = 0; y < this.h; y++) {
      this.grid.push([]);
      for (let x = 0; x < this.w; x++) {
        this.grid[y].push([-1, -1, -1, -1]);
      }
    }
    
    this.grid[1][0] = [0, 0, 100, 0];
    this.grid[1][1] = [0, 0, 100, 0];
    this.grid[1][2] = [0, 0, 100, 0];
    this.grid[1][3] = [0, 0, 100, 0];
    this.grid[1][4] = [0, 0, 100, 0];
    this.grid[1][5] = [0, 0, 100, 0];
    this.grid[1][6] = [0, 0, 100, 0];
    
    this.selectedX = 0;
    this.selectedY = 0;
  }
  
  
  drawGrid(cornerX, cornerY, w, buildMode) {
    // x and y are top-left corner, 
    // w is width in pixels (drawn as a square)
    
    let squareSize = w / this.w;
    
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        
        let squareX = x * squareSize + cornerX;  // x of top left corner
        let squareY = y * squareSize + cornerY;  // y of top left corner
        
        if (buildMode) {
          // Draw grid lines
          strokeWeight(1);
          stroke(200);
          if (x != 0) {
            line(squareX, squareY, squareX, squareY + squareSize);
          }
          if (y != 0) {
            line(squareX, squareY, squareX + squareSize, squareY);
          }
          
          // Highlight square mouse is over
          if (floor((mouseX - cornerX) / squareSize) == x && floor((mouseY - cornerY) / squareSize) == y) {
            noStroke();
            fill(255, 255, 255, 64);
            rect(squareX, squareY, squareSize, squareSize);
          }
          
          // Also highlight selected square
          if (x == this.selectedX && y == this.selectedY) {
            noStroke();
            fill(255,255,255,64);
            rect(squareX, squareY, squareSize, squareSize);
          }
        }
        
        // Draw individual grid space object
        let thisObject = this.grid[y][x];
        if (thisObject[0] == 0) {  // Conveyor
          stroke(0);
          strokeWeight(5);
          fill(75);
          if (thisObject[2] < 30) {
            fill(100, 50, 50);
          }
          rectMode(CENTER);
          rect(squareX + 0.5*squareSize, squareY + 0.5*squareSize, 0.8*squareSize, 0.25*squareSize, 10);
          rectMode(CORNER);
          stroke(255,0,0);
          switch(thisObject[1]) {
            case 0:
              line(squareX + 0.2*squareSize, squareY + 0.8*squareSize, squareX + 0.8*squareSize, squareY + 0.8*squareSize);
              line(squareX + 0.8*squareSize, squareY + 0.8*squareSize, squareX + 0.7*squareSize, squareY + 0.7*squareSize);
              break;
            case 1:
              print("Conveyor with improper rotation");
              break;
            case 2:
              line(squareX + 0.2*squareSize, squareY + 0.8*squareSize, squareX + 0.8*squareSize, squareY + 0.8*squareSize);
              line(squareX + 0.2*squareSize, squareY + 0.8*squareSize, squareX + 0.3*squareSize, squareY + 0.7*squareSize);
              break;
            case 3:
              print("Conveyor with improper rotation");
              break
          }
        }
        if (thisObject[0] == 1) {
          stroke(200);
          fill(150);
          strokeWeight(5);
          let size = sin((millis() - thisObject[3])/500)*0.45+0.55;
          switch(thisObject[1]) {
            case 0:
              rect(squareX, squareY, squareSize * size, squareSize);
              break;
            case 1:
              rect(squareX, squareY, squareSize, squareSize * size);
              break;
            case 2:
              rect(squareX + squareSize*(1 - size), squareY, squareSize * size, squareSize);
              break;
            case 3:
              rect(squareX, squareY + squareSize*(1 - size), squareSize, squareSize * size);
              break;
          }
        }
        if (thisObject[0] == 2) {
          let cycle = sin((millis() - thisObject[3])/500)*0.5+0.5;
          strokeWeight(5);
          stroke(150);
          fill(128,32,0);
          if (thisObject[2] < 30) {
            stroke(100,50,50);
          }
          ellipse(squareX + squareSize/2, squareY + squareSize/2, squareSize/5, squareSize/5);
          if (thisObject[2] >= 0) {
            noStroke();
            fill(200,(1-cycle)*200,0,128);
            ellipse(squareX + squareSize/2, squareY + squareSize/2, cycle*squareSize, cycle*squareSize);
          }
        }
        if (thisObject[0] == 3) {
          let cycle = sin((millis() - thisObject[3])/500)*0.5+0.5;
          strokeWeight(5);
          stroke(150);
          fill(50,100,50);
          if (thisObject[2] < 30) {
            stroke(100,50,50);
          }
          ellipse(squareX + squareSize/2, squareY + squareSize/2, squareSize/5, squareSize/5);
          if (thisObject[2] >= 0) {
            noStroke();
            fill(0,200,0,128);
            ellipse(squareX + squareSize/2, squareY + squareSize/2, cycle*squareSize, cycle*squareSize);
          }
        }
      }
    }
  }
  
  
  getCollider(x, y) {
    let thisObject = this.grid[y][x];
    if (thisObject[0] == 0) {
      return { x : x+0.5, y : y+0.5, w : 0.8, h : 0.25 };
    } else if (thisObject[0] == 1) {
      let size = sin((millis() - thisObject[3])/500)*0.45+0.55;
      switch(thisObject[1]) {
        case 0:
          return { x : x+size/2, y : y+0.5, w : size, h : 1 };
        case 1:
          return { x : x+0.5, y : y+size/2, w : 1, h : size };
        case 2:
          fill(255,0,0);
          noStroke();
          return { x : x+1-size/2, y : y+0.5, w : size, h : 1 };
        case 3:
          return { x : x+0.5, y : y+1-size/2, w : 1, h : size };
      }
    } else {
      let size = sin((millis() - thisObject[3])/500)*0.5+0.5;
      return { x : x+0.5, y : y+0.5, w : size, h : size};
    }
  }
  
}
