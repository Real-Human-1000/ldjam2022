class Crate {
  constructor(x, y, w, h, hp, fp, ap) {
    // Crate coordinates are still in grid space! (1 grid unit is about 100 pixels)
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = w;
    this.h = h;
    this.hp = hp;  // Normal crate hp starts at 10. Reinforced crate hp starts at 20. 0 hp is a destroyed crate
    this.fireproof = fp;
    this.acidproof = ap;
    this.fireTimer = 0;
    this.acidTimer = 0;
  }
  
  
  stepEffectsDamage() {
    if (this.fireTimer > 0 && this.fireproof == false) {
      this.fireTimer -= deltaTime/1000;
      this.hp -= 5 * deltaTime/1000;
    }
    if (this.acidTimer > 0 && this.acidproof == false) {
      this.acidTimer -= deltaTime/1000;
      this.hp -= 2.5 * deltaTime/1000;
    }
  }
  
  
  stepX() {
    if (abs(this.vx) > 1) {
      this.vx = 1 * this.vx / abs(this.vx);
    }
    
    this.x += this.vx * deltaTime/1000;
  }
  
  stepY() {
    if (this.y < 10) {  // if it's that far down don't even bother with this
      this.vy += 9.8 * deltaTime/1000;
      if (abs(this.vy) > 9.8) {
        this.vy = 9.8 * this.vy / abs(this.vy);
      }
    }
    
    this.y += this.vy * deltaTime/1000;
  }
  
  
  drawSelf(cornerX, cornerY, squareSize, AM) {
  //  colorMode(HSB);
  //  stroke(184, 121, 59);
  //  fill(181, 130, 80);
  //  if (this.fireproof && this.acidproof) {
  //    stroke(0, 0, 80);
  //    fill(0, 0, 80, 1 / (this.hp+1) + 0.4);
  //  } else if (this.fireproof) {
  //    stroke(0, 0, 50);
  //    fill(0, 0, 1 * this.hp + 50);
  //  } else if (this.acidproof) {
  //    stroke(0, 0, 90);
  //    fill(0, 0, 2 * this.hp + 60);
  //  } else {
  //    stroke(30, 70, 70);
  //    fill(30, 55, 3 * this.hp + 40);
  //  }
    
  //  strokeWeight(5);
  //  rect((this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
  //      this.w * squareSize, this.h * squareSize);
  //  line((this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY,
  //      (this.x + this.w/2) * squareSize + cornerX, (this.y + this.h/2) * squareSize + cornerY);
  //  colorMode(RGB);
    
  //  noStroke();
  //  if (this.fireTimer > 0) {
  //    fill(200, 50, 0, 128);
  //    rect((this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
  //      this.w * squareSize, this.h * squareSize);
  //  }
  //  if (this.acidTimer > 0) {
  //    fill(0, 200, 0, 128);
  //    rect((this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
  //      this.w * squareSize, this.h * squareSize);
  //  }
  //}
  
    if (this.fireproof && this.acidproof) {
      image(AM.glassCrate, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    } else if (this.fireproof) {
      image(AM.metalCrate, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    } else if (this.acidproof) {
      image(AM.plasticCrate, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    } else {
      image(AM.woodCrate, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    }
    
    if (this.hp > 10) {
      image(AM.reinforcement, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    }
    
    tint(255, 255 - this.hp*25.5);
    blendMode(MULTIPLY);
    image(AM.crateGrime, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    noTint();
    blendMode(BLEND);
    
    if (!this.fireproof && this.fireTimer > 0) {
      image(AM.flames, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    }
    if (!this.acidproof && this.acidTimer > 0) {
      image(AM.acid, 
        (this.x - this.w/2) * squareSize + cornerX, (this.y - this.h/2) * squareSize + cornerY, 
        this.w * squareSize, this.h * squareSize);
    }
  }
}
