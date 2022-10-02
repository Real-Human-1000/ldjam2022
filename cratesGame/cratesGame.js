let GAMEMODE = 0;  // 0 = title, 1 = text1, 2 = text2, 3 = text3, 4 = game, 5 = lose, 6 = win

let crates = [];
let grid;
let money = 300;
let smoke = 0;

let wStrings;
let waveNum = 0;
let numInWave = -1;
let waves = [];
let crateTimer = 1;

let gridCornerX = 10;
let gridCornerY = 10;
let gridScreenSize = 533-2*gridCornerX;

let buildMode = false;

let gridObjectNames = ["Conveyor", "Crusher", "Incinerator", "Acid Sprayer"];
let rotationNames = ["Right", "Down", "Left", "Up"];
let wearNames = ["Brand New", "Like New", "Used", "Worn", "Damaged", "Broken"]; 
let prices = [50, 100, 200, 300];

let AM;
function preload() {
  AM = new AssetManager();
  wStrings = loadStrings("data/waves.txt");
}


function setup() {
  pixelDensity(1);
  noSmooth();
  frameRate(40);
  createCanvas(800,533);
  grid = new Grid(8, 8);
  loadWaves();
}


function draw() {
  if (deltaTime/1000 > 0.1) {
    // Don't step if there's more than a tenth of a second between frames
    // This will cause problems if the game runs at 10 FPS or under
    return;
  }
  
  if (GAMEMODE == 0) {
    image(AM.title, 0, 0, width, height);
  }
  if (GAMEMODE == 1) {
    image(AM.text1, 0, 0, width, height);
  }
  if (GAMEMODE == 2) {
    image(AM.text2, 0, 0, width, height);
  }
  if (GAMEMODE == 3) {
    image(AM.text3, 0, 0, width, height);
  }
  
  if (GAMEMODE == 4) {
    // Game logic
    if (smoke > 0) {
      smoke -= 0.01 * deltaTime/1000;
    }
    spawnCrates();
    stepCrates();
    removeDeadCrates();
    
    // Draw
    drawMainScreen();
    
    // Crate "aura" effect 
    stroke(255);
    strokeWeight(2);
    for (let p = 0; p < pow(crates.length,2); p++) {
      point(gridCornerX + random()*gridScreenSize, gridCornerY + random()*gridScreenSize);
    }
    
    checkForLose();
    checkForWin();
  }
  
  if (GAMEMODE == 5) {
    // You lose!
    drawMainScreen();
    noStroke();
    fill(0,128);
    rect(0,0,width,height);
    let imgHeight = width * (AM.wintext.height / AM.wintext.width);
    image(AM.losetext, 0, (height - imgHeight)/2, width, imgHeight);
  }
  if (GAMEMODE == 6) {
    // You win!
    drawMainScreen();
    noStroke();
    fill(0,128);
    rect(0,0,width,height);
    let imgHeight = width * (AM.losetext.height / AM.losetext.width);
    image(AM.wintext, 0, (height - imgHeight)/2, width, imgHeight);
  }
}


function checkForWin() {
  if (waveNum >= waves.length) {
    GAMEMODE = 6;
  }
}


function checkForLose() {
  if (crates.length >= 10 || smoke > 1) {
    GAMEMODE = 5;
  }
}


function loadWaves() {
  for (let s = 1; s < wStrings.length; s++) {
    waves.push(wStrings[s].split(","));
    for (let subs = 0; subs < waves[waves.length-1].length; subs++) {
      waves[waves.length-1][subs] = parseInt(waves[waves.length-1][subs]);
    }
  }
}


function drawMainScreen() {
  background(230);
    
  fill(100);
  stroke(150);
  rect(0,0,width - (width-height),height);
  drawCrates(gridCornerX, gridCornerY, gridScreenSize / grid.w);
  grid.drawGrid(gridCornerX, gridCornerY, gridScreenSize, buildMode);
  
  strokeWeight(6);
  stroke(150);
  noFill();
  rect(gridCornerX/2,gridCornerY/2,gridScreenSize+gridCornerX,gridScreenSize+gridCornerX);
  //image(grimeImage, gridCornerX, gridCornerY, gridScreenSize, gridScreenSize);
  image(AM.screenGrime, 0, 0, width, height);
  
  drawSidePanel();
  
  blendMode(MULTIPLY);
  tint(255, 255*smoke);
  image(AM.smoke, 0, 0, width, height);
  noTint();
  blendMode(BLEND);
}


function spawnCrates() {
  crateTimer -= deltaTime/1000;
  
  if (crateTimer <= 0) {
    numInWave ++;
    if (numInWave >= waves[waveNum].length) {
      waveNum ++;
      crateTimer = 10;
      numInWave = -1;
    } else {
      crateTimer = 1;
      if (waves[waveNum][numInWave] != 0) {
        
        let newCrate = new Crate(1.5, -5, 0.6, 0.6, 10, false, false);
        if (waves[waveNum][numInWave] < 0) {
          newCrate.hp = 20;
        }
        if (waves[waveNum][numInWave] == 2 || waves[waveNum][numInWave] == 4) {
          newCrate.fireproof = true;
        }
        if (waves[waveNum][numInWave] == 3 || waves[waveNum][numInWave] == 4) {
          newCrate.acidproof = true;
        }
        
        crates.push(newCrate);
      }
    }
  }
}


function removeDeadCrates() {
  for (let c = 0; c < crates.length; c++) {
    if (crates[c].hp <= 0) {
      money += 25;
      crates.splice(c, 1);
      c--;
    }
  }
}


function drawCrates(cornerX, cornerY, squareSize) {
  for (let c = 0; c < crates.length; c++) {
    crates[c].drawSelf(cornerX, cornerY, squareSize, AM);
  }
}


function drawMeter(cornerX, cornerY, sideLength, value, maxVal, title) {
  strokeWeight(5);
  stroke(0);
  fill(255);
  let centerX = cornerX + sideLength/2;
  let centerY = cornerY + sideLength/2;
  ellipse(centerX, centerY, sideLength, sideLength);
  
  textAlign(CENTER, CENTER);
  textFont('monospace');
  textSize(20);
  fill(0);
  noStroke();
  text(title, centerX, centerY+sideLength/4);
  
  strokeWeight(5);
  stroke(0);
  let angle = PI/6 + (value/maxVal) * (2*PI/3);
  line(centerX, centerY+sideLength/10, centerX - cos(angle)*sideLength/3, centerY+sideLength/10 - sin(angle)*sideLength/3);
  fill(0);
  ellipse(centerX, centerY+sideLength/10, sideLength/15, sideLength/15);
}


function drawSidePanel() {
  
  fill(200);
  if (pointInBox(mouseX, mouseY, 650, 50, 100, 50)) {
    fill(230);
  }
  rect(650-50, 50-25, 100, 50);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(30);
  textFont("monospace");
  if (buildMode) {
    text("GAME", 650, 50);
  } else {
    text("BUILD", 650, 50);
  }
  
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
  textSize(25);
  text("Money", 650, 100);
  text(money, 650, 120);
  
  textSize(20);
  if (grid.selectedX != -1 && grid.selectedY != -1) {
    let selectedObject = grid.grid[grid.selectedY][grid.selectedX];
    text("(" + (grid.selectedY+1) + ", " + (grid.selectedX+1) + ")", 650, 410);
    if (selectedObject[0] != -1) {
      text(gridObjectNames[selectedObject[0]], 650, 440);
      text(rotationNames[selectedObject[1]], 650, 470);
      text(wearNames[floor((100 - selectedObject[2])/16.666666666)], 650, 500);
    } else {
      text("None", 650, 450);
    }
  }
  
  if (!buildMode) {
    drawMeter(600, 160, 100, smoke, 0.9, "Smoke");  // smoke of 1 is the lose condition
    drawMeter(600, 285, 100, crates.length, 9, "Crates");  // 10 crates is the lose condition
  } else {
    drawMachineButtons();
  }
}


function drawMachineButtons() {
  textAlign(CENTER, CENTER);
  text("Machines", 650, 150);
  
  // Conveyor buy button
  stroke(200);
  fill(100);
  if (pointInBox(mouseX, mouseY, 575+150/2, 175+35/2, 150, 35)) { fill(150); }
  rect(575, 175, 150, 35);
  // Press buy button
  //fill(250);
  //if (pointInBox(mouseX, mouseY, 710+65/2, 225+35/2, 65, 35)) { fill(255, 255, 240); }
  //rect(710, 225, 65, 35);
  
  // Incinerator buy button
  fill(200,100,100);
  if (pointInBox(mouseX, mouseY, 575+65/2, 230+35/2, 65, 35)) { fill(200,150,150); }
  rect(575, 230, 65, 35);
  // Acid Sprayer Buy button
  fill(100,200,100);
  if (pointInBox(mouseX, mouseY, 660+65/2, 230+35/2, 65, 35)) { fill(150,200,150); }
  rect(660, 230, 65, 35);
  
  // Rotate button
  //fill(150);
  //if (pointInBox(mouseX, mouseY, 575+65/2, 335+35/2, 65, 35)) { fill(190); }
  //rect(575, 335, 65, 35);
  // Repair button
  fill(150);
  if (pointInBox(mouseX, mouseY, 575+65/2, 285+35/2, 150, 35)) { fill(190); }
  rect(575, 285, 150, 35);
  
  // Remove button
  fill(50);
  if (pointInBox(mouseX, mouseY, 575+150/2, 340+35/2, 150, 35)) { fill(100); }
  rect(575, 340, 150, 35);
  
  // Button texts:
  buttonText = "";
  textSize(15);
  noStroke();
  fill(0);
  
  buttonText = "CONVEYOR";
  if (pointInBox(mouseX, mouseY, 575+150/2, 175+35/2, 150, 35)) { buttonText = prices[0]; }
  text(buttonText, 575+150/2, 175+35/2);
  
  //buttonText = "PRESS";
  //if (pointInBox(mouseX, mouseY, 710+65/2, 225+35/2, 65, 35)) { buttonText = prices[1]; }
  //text(buttonText, 710+65/2, 225+35/2);
  
  buttonText = "FIRE";
  if (pointInBox(mouseX, mouseY, 575+65/2, 230+35/2, 65, 35)) { buttonText = prices[2]; }
  text(buttonText, 575+65/2, 230+35/2);
  
  buttonText = "ACID";
  if (pointInBox(mouseX, mouseY, 660+65/2, 230+35/2, 65, 35)) { buttonText = prices[3]; }
  text(buttonText, 660+65/2, 230+35/2);
  
  //buttonText = "ROTATE";
  //if (pointInBox(mouseX, mouseY, 575+65/2, 335+35/2, 65, 35)) { buttonText = "25"; }
  //text(buttonText, 575+65/2, 335+35/2);
  
  buttonText = "REPAIR";
  if (pointInBox(mouseX, mouseY, 575+65/2, 285+35/2, 150, 35)) { buttonText = "50"; }
  text(buttonText, 575+150/2, 285+35/2);
  
  buttonText = "REMOVE";
  if (pointInBox(mouseX, mouseY, 575+150/2, 340+35/2, 150, 35)) { buttonText = "YOU SURE?"; }
  fill(255,100,100);
  text(buttonText, 575+150/2, 340+35/2);
}


function signedOverlap(o1, o2) {
  if (o1.x + o1.w/2 > o2.x - o2.w/2 &&
      o1.x - o1.w/2 < o2.x + o2.w/2 &&
      o1.y + o1.h/2 > o2.y - o2.h/2 &&
      o1.y - o1.h/2 < o2.y + o2.h/2) {
  
    let overlaps = [0,0];
    
    if (o2.x - o1.x != 0) {
      overlaps[0] = (o2.w / 2 + o1.w / 2) * (o2.x - o1.x) / abs(o2.x - o1.x) - (o2.x - o1.x);
    } else {
      overlaps[0] = 2 * (o1.vx / max(abs(o1.vx), 0.0001));
    }
    
    if (o2.y - o1.y != 0) {
      overlaps[1] = (o2.h / 2 + o1.h / 2) * (o2.y - o1.y) / abs(o2.y - o1.y) - (o2.y - o1.y);
    } else {
       overlaps[1] = 2 * (o1.vy / max(abs(o1.vy), 0.0001));
    }
    
    return overlaps;
  }
  return [0,0];
}


function pointInBox(x, y, bx, by, bw, bh) {
  return (x > bx - bw/2) && (x < bx + bw/2) && (y > by - bh/2) && (y < by + bh/2);
}


function stepCrates() {
  // Move each crate, calculate collision, and resolve overlaps
  for (let c = 0; c < crates.length; c++) {

    // Step Y and check for collisions
    crates[c].stepY();
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        
        if (crates[c].y + y >= 0 && crates[c].y + y < grid.h &&
            crates[c].x + x >= 0 && crates[c].x + x < grid.w) {
          let thisObject = grid.grid[floor(crates[c].y + y)][floor(crates[c].x + x)];
          if (thisObject[0] == -1) {
            continue;
          }
          
          let gridCollider = grid.getCollider(floor(crates[c].x + x), floor(crates[c].y + y));
          let overlap = signedOverlap(crates[c], gridCollider);
          
          if (abs(overlap[1]) > 0.00001) {
            // Every second the object is in contact with a crate, remove hp by 3
            thisObject[2] = max(thisObject[2] - 3 * deltaTime/1000, 0);
            
            if (thisObject[0] == 0) {
              // Conveyor or Press/Piston (physical objects)
              crates[c].y -= overlap[1]+0.00001;  // emergency hack since collision wasn't working right before the deadline
              crates[c].vy *= -0.1;
              if (thisObject[0] == 0 && thisObject[2] > 17) {
                // Conveyors move crates sideways
                crates[c].vx += -0.1 * (thisObject[1] - 1);
              }
            } else {
              if (thisObject[0] == 2 && thisObject[2] > 17) {
                // Incinerator
                smoke += 0.1 * deltaTime/1000;
                crates[c].fireTimer = 2;
                crates[c].acidTimer = 0;
              }
              if (thisObject[0] == 3 && thisObject[2] > 17) {
                // Acid sprayer
                crates[c].acidTimer = 4;
                crates[c].fireTimer = 0;
              }
            }
          }
        }
      }
      
    }
    
    //for (let c1 = 0; c1 < crates.length; c1++) {
    //  if (c != c1) {
    //    let overlap = signedOverlap(crates[c], crates[c1]);
    //    if (abs(overlap[1]) > 0.00001) {
    //      crates[c].y -= overlap[1];
    //      crates[c].vy *= -0.1;
    //    }
    //  }
    //}
    
    // Step X and check for collisions
    crates[c].stepX();
    for (let y = -1; y < 2; y++) {
      for (let x = -1; x < 2; x++) {
        
        if (crates[c].x + x >= 0 && crates[c].x + x < grid.w &&
            crates[c].y + y >= 0 && crates[c].y + y < grid.h) {
          if (grid.grid[floor(crates[c].y + y)][floor(crates[c].x + x)][0] == -1) {
            continue;
          }
          
          let thisObject = grid.grid[floor(crates[c].y + y)][floor(crates[c].x + x)];
          let gridCollider = grid.getCollider(floor(crates[c].x + x), floor(crates[c].y + y));
          let overlap = signedOverlap(crates[c], gridCollider);
          
          if (abs(overlap[0]) > 0.00001) {
            // Every second the object is in contact with a crate, remove hp by 3
            thisObject[2] = max(thisObject[2] - 3 * deltaTime/1000, 0);
            
            if (thisObject[0] == 0) {
              // Conveyors and presses have physical collision
              crates[c].x -= overlap[0]+0.00001;  // emergency hack since collision wasn't working right before the deadline
              crates[c].vx *= -0.1;
            } else if (thisObject[2] > 0) {
              if (thisObject[0] == 2) {
                // Incinerator
                crates[c].fireTimer = 2;
                crates[c].acidTimer = 0;
              }
              if (thisObject[0] == 3) {
                // Acid sprayer
                crates[c].acidTimer = 4;
                crates[c].fireTimer = 0;
              }
            }
          }
        }
        
      }
    }

    //for (let c1 = 0; c1 < crates.length; c1++) {
    //  if (c != c1) {
    //    let overlap = signedOverlap(crates[c], crates[c1]);
    //    if (abs(overlap[0]) > 0.00001) {
    //      crates[c].x -= overlap[0];
    //      crates[c].vx *= -0.1;
    //    }
    //  }
    //}
    
    if (crates[c].x + crates[c].w/2 > grid.w) {
      crates[c].x = grid.w - crates[c].w/2;
      crates[c].vx *= -0.1;
    }
    if (crates[c].x - crates[c].w/2 < 0) {
      crates[c].x = 0 + crates[c].w/2;
      crates[c].vx *= -0.1;
    }
    
    crates[c].stepEffectsDamage();
    
  }
}


function mousePressed() {
  if (GAMEMODE == 0 || GAMEMODE == 1 || GAMEMODE == 2 || GAMEMODE == 3) {
    GAMEMODE ++;
  }
  if (GAMEMODE == 4) {
    if (!buildMode) {
      for (let c = 0; c < crates.length; c++) {
        if (pointInBox( (mouseX - gridCornerX) / (gridScreenSize / grid.w), (mouseY - gridCornerY) / (gridScreenSize / grid.h), 
            crates[c].x, crates[c].y, crates[c].w, crates[c].h)) {
          crates[c].hp -= 1;
          return;
        }
      }
    } else {
      
      // CONVEYOR
      if (pointInBox(mouseX, mouseY, 575+150/2, 175+35/2, 150, 35)) { 
        if (money >= prices[0] && grid.selectedY > 0) {
          let rot = 0;
          if (grid.selectedY % 2 == 0) {
            rot = 2;
          }
          grid.grid[grid.selectedY][grid.selectedX] = [0, rot, 100, millis()];
          money -= prices[0];
        }
      }
      
      // PRESS
      //if (pointInBox(mouseX, mouseY, 710+65/2, 225+35/2, 65, 35)) { 
      //  if (money >= prices[1]) {
      //    grid.grid[grid.selectedY][grid.selectedX] = [1, 0, 100, millis()];
      //    money -= prices[1];
      //  }
      //}
      
      // FIRE
      if (pointInBox(mouseX, mouseY, 575+65/2, 230+35/2, 65, 35)) { 
        if (money >= prices[2]) {
          grid.grid[grid.selectedY][grid.selectedX] = [2, 0, 100, millis()];
          money -= prices[2];
        }
      }
      
      // ACID
      if (pointInBox(mouseX, mouseY, 660+65/2, 230+35/2, 65, 35)) { 
        if (money >= prices[3]) {
          grid.grid[grid.selectedY][grid.selectedX] = [3, 0, 100, millis()];
          money -= prices[3];
        }
      }
      
      // ROTATE
      //if (pointInBox(mouseX, mouseY, 575+65/2, 335+35/2, 65, 35)) { 
      //  if (money >= 25 && grid.grid[grid.selectedY][grid.selectedX][0] != -1) {
      //    if (grid.grid[grid.selectedY][grid.selectedX][0] == 0) {
      //      grid.grid[grid.selectedY][grid.selectedX][1] = (grid.grid[grid.selectedY][grid.selectedX][1] + 2) % 4;
      //    } else {
      //      grid.grid[grid.selectedY][grid.selectedX][1] = (grid.grid[grid.selectedY][grid.selectedX][1] + 1) % 4;
      //    }
      //    money -= 25;
      //  }
      //}
      
      // REPAIR
      if (pointInBox(mouseX, mouseY, 575+65/2, 285+35/2, 150, 35)) { 
        if (money >= 50 && grid.grid[grid.selectedY][grid.selectedX][0] != -1) {
          grid.grid[grid.selectedY][grid.selectedX][2] = 100;
          money -= 50;
        }
      }
      
      // REMOVE
      if (pointInBox(mouseX, mouseY, 575+150/2, 340+35/2, 150, 35)) { 
        grid.grid[grid.selectedY][grid.selectedX] = [-1, -1, -1, -1];
      }
      
    }
    
    let gridX = floor((mouseX - gridCornerX) / (gridScreenSize / grid.w));
    let gridY = floor((mouseY - gridCornerY) / (gridScreenSize / grid.h));
    if (gridX >= 0 && gridX < grid.w && gridY >= 0 && gridY < grid.h) {
      grid.selectedX = gridX;
      grid.selectedY = gridY;
    }
    
    if (pointInBox(mouseX, mouseY, 650, 50, 100, 50)) {
      buildMode = !buildMode;
    }
  }
  if (GAMEMODE == 5 || GAMEMODE == 6) {
      crates = [];
      grid = new Grid(8, 8);
      money = 300;
      smoke = 0;
      buildMode = false;
      waveNum = 0;
      numInWave = -1;
      crateTimer = 1;
      GAMEMODE = 0;
  }
}
