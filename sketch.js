var s = function(p) {
  let flock;
  var v1 = 0.0;
  var v2 = 0.0;
  var v3 = 0.0;
  var the_size = 5.0;
  let boid_pos = [];
  let boid_distance = [];
  //--------------- Setup ---------------------
  p.setup = function() {
    p.createCanvas(innerWidth, innerHeight);
    // カンマ区切りで入力したい値を追加できます。

    flock = new Flock();
    for (let i = 0; i < 1; i++) {
      let b = new Boid(p.width / 2, p.height / 2);
      flock.addBoid(b);
    }
    window.max.bindInlet('set_value', function(_v1, _v2, _v3) {
      v1 = _v1;
      v2 = _v2;
      v3 = _v3;
    });
  };

  //--------------- Draw ---------------------
  p.draw = function() {
    p.background(1,120,159,60);
    flock.run();

    //平均
    let average = 0.0;
    let sum = 0.0;
    for(var i  = 0; i< boid_distance.length; i++){
       sum += boid_distance[i];
    }
    average = sum / boid_distance.length;

    // 分散
    let dispersion = 0.0;
    let cal_dispersion = [];
    for(var ii = 0; ii< boid_distance.length; ii++){
      cal_dispersion[ii] = (average - boid_distance[ii])*(average - boid_distance[ii]);
    }
    let sum_despersion = 0.0;
    for(var j = 0; j < cal_dispersion.length; j++){
       sum_despersion += cal_dispersion[j];
    }
    dispersion = sum_despersion / cal_dispersion.length;

    let sd = Math.sqrt(dispersion)

    p.fill(227,181,5);
    p.ellipse(boid_pos[0].x, boid_pos[0].y, 5.0,5.0);


    p.fill(227,181,5);
    p.ellipse(boid_pos[0].x, boid_pos[0].y, 5.0,5.0);
    let d_max = Math.sqrt(p.width*p.width + p.height * p.height);
    // カンマ区切りで出力したい値を追加できます。
    window.max.outlet('output', p.frameCount, p.map(boid_pos[0].x,0.0,p.width,0.0,1.0), p.map(boid_pos[0].y,0.0,p.height,0.0,1.0),
    p.map(average, 0.0, d_max,0.0,1.0), dispersion, sd);

    //
  };

  // マウスを押した時に呼ばれる関数
  p.mousePressed = function() {
    flock.addBoid(new Boid(p.mouseX, p.mouseY));
  }

function Flock() {
  this.boids = [];
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

function Boid(x, y) {
  this.acceleration = p.createVector(0, 0);
  this.velocity = p.createVector(p.random(-1, 1), p.random(-1, 1));
  this.position = p.createVector(x, y);
  this.r = 5.0;
  this.eye = 0;
  this.maxspeed = 1;    // Maximum speed
  this.maxforce = 0.01; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  p.fill(242);
  this.render();
}

Boid.prototype.applyForce = function(force) {
  this.acceleration.add(force);
}

Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);

}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  let theta = this.velocity.heading() + p.radians(90);
  // fill(127);
  // stroke(200);
  p.push();
  p.translate(this.position.x, this.position.y);
  p.rotate(theta);
  p.ellipse(0, 0, this.r, this.r);
  p.ellipse(0, this.r, this.r, this.r);
  p.ellipse(0, this.r*2, this.r, this.r);
  // ellipse(0,0,this.r*5,this.r*10);
  // // fill(255);
  // ellipse(0,0,this.r*0.3,this.r*3);
  // fill(242);
  // let eyes = abs(sin(this.eye*0.01));
  // ellipse(-this.r*0.5,-this.r*3, this.r*0.3, this.r*0.5*eyes);
  // ellipse(this.r*0.5,-this.r*3, this.r*0.3, this.r*0.5*eyes);
  // this.eye += 1;
  p.pop();
}

// Wraparound
Boid.prototype.borders = function() {
//   if (this.position.x < -this.r){ this.position.x = p.width + this.r;}
//   if (this.position.y < -this.r){ this.position.y = p.height + this.r;}
//   if (this.position.x > p.width + this.r){ this.position.x = -this.r;}
//   if (this.position.y > p.height + this.r){ this.position.y = -this.r;}
  if (this.position.x < -this.r){ this.velocity.x *= -1;}
  if (this.position.y < -this.r){ this.velocity.y *= -1;}
  if (this.position.x > p.width + this.r){ this.velocity.x *= -1;}
  if (this.position.y > p.height + this.r){ this.velocity.y *= -1;}
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = p.createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment

Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = p.createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return p.createVector(0, 0);
  }
}


Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = p.createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    boid_pos[i] = boids[i].position;
    let d = p5.Vector.dist(this.position,boids[i].position);
    boid_distance[i] = d;
    if ((d > 0) && (d < neighbordist)) {

      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return p.createVector(0, 0);
  }
}

  //--------------- ReSize---------------------
  //画面サイズの自動調整
  p.windowResized = function() {
    p.resizeCanvas(innerWidth, innerHeight);
  }

};

const myp5 = new p5(s);
