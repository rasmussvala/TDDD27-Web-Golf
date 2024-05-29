import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js";

export function ballCollision(ball1, ball2, g, my, energyLoss) {
  // velocityIn1, velocityIn2, positionIn1, positionIn2, mass1, mass2, energyLoss

  let v1 = ball1.velocity.clone();
  let v2 = ball2.velocity.clone();
  let p1 = ball1.position.clone();
  let p2 = ball2.position.clone();

  let velocityOut1 = new THREE.Vector3(0.0, 0.0, 0.0);
  let velocityOut2 = new THREE.Vector3(0.0, 0.0, 0.0);

  let p1Diff = new THREE.Vector3(0.0, 0.0, 0.0);
  let p2Diff = new THREE.Vector3(0.0, 0.0, 0.0);
  let v1Diff = new THREE.Vector3(0.0, 0.0, 0.0);
  let v2Diff = new THREE.Vector3(0.0, 0.0, 0.0);

  p1Diff.subVectors(p1, p2);
  p2Diff.subVectors(p2, p1);
  v1Diff.subVectors(v1, v2);
  v2Diff.subVectors(v2, v1);

  velocityOut1
    .subVectors(
      v1,
      p1Diff
        .multiplyScalar(v1Diff.dot(p1Diff))
        .divideScalar(p1.distanceToSquared(p2))
    )
    .multiplyScalar(1 - energyLoss);
  velocityOut2
    .subVectors(
      v2,
      p2Diff
        .multiplyScalar(v2Diff.dot(p2Diff))
        .divideScalar(p2.distanceToSquared(p1))
    )
    .multiplyScalar(1 - energyLoss);
  velocityOut1.y = 0.0;
  velocityOut2.y = 0.0;

  let ball1out = ball1;
  let ball2out = ball2;

  // Stops the ball for a small v
  if (Math.abs(velocityOut1.x) < 0.04 && Math.abs(velocityOut1.z) < 0.04) {
    velocityOut1.x = 0.0;
    velocityOut1.z = 0.0;
  }
  if (Math.abs(velocityOut2.x) < 0.04 && Math.abs(velocityOut2.z) < 0.04) {
    velocityOut2.x = 0.0;
    velocityOut2.z = 0.0;
  }
  ball1out.velocity = velocityOut1;
  ball2out.velocity = velocityOut2;
  ball1out.position = ball1.prevPosition;
  ball2out.position = ball2.prevPosition;

  return [ball1out, ball2out];
}

export function wallDetection(ball, length, width, energyLoss) {
  // Not that fancy (a collision detector would be nice bu time costly to create)
  let positionIn = ball.position;
  let prevPosition = ball.prevPosition;
  let velocityIn = ball.velocity;
  let radius = ball.radius;

  let obstacleW = 0.2;
  let obstacleL = 0.85;

  if (
    ball.prevPosition.x - radius <= -obstacleW &&
    ball.position.x - radius >= -obstacleW &&
    ball.position.z + radius >= -obstacleL / 4
  ) {
    velocityIn.x = -1 * Math.abs(velocityIn.x) * (1 - energyLoss);
    ball.position.x = prevPosition.x;
    // console.log(ball.position.z);
  } else if (
    ball.prevPosition.x + radius >= obstacleW &&
    ball.position.x + radius <= obstacleW &&
    ball.position.z + radius >= -obstacleL / 4
  ) {
    velocityIn.x = 1 * Math.abs(velocityIn.x) * (1 - energyLoss);
    ball.position.x = prevPosition.x;
    // console.log(ball.position.z);
  } else if (
    ball.position.x - radius >= -obstacleW &&
    ball.position.x + radius <= obstacleW &&
    ball.position.z + radius >= -obstacleL / 4 &&
    ball.prevPosition.z + radius <= -obstacleL / 4
  ) {
    velocityIn.z = -1 * Math.abs(velocityIn.z) * (1 - energyLoss);
    ball.position.z = prevPosition.z;
  }

  if (
    ball.prevPosition.x + radius <= obstacleL - obstacleW / 2 &&
    ball.position.x + radius >= obstacleL - obstacleW / 2 &&
    ball.position.z - radius <= obstacleL / 4
  ) {
    velocityIn.x = -1 * Math.abs(velocityIn.x) * (1 - energyLoss);
    ball.position.x = prevPosition.x;
    // console.log(ball.position.z);
  } else if (
    ball.prevPosition.x - radius >= obstacleL + (obstacleW * 3) / 2 &&
    ball.position.x - radius <= obstacleL + (obstacleW * 3) / 2 &&
    ball.position.z - radius <= obstacleL / 4
  ) {
    velocityIn.x = 1 * Math.abs(velocityIn.x) * (1 - energyLoss);
    ball.position.x = prevPosition.x;
    // console.log(ball.position.z);
  } else if (
    ball.position.x + radius >= obstacleL - obstacleW / 2 &&
    ball.position.x - radius <= obstacleL + (obstacleW * 3) / 2 &&
    ball.position.z - radius <= obstacleL / 4 &&
    ball.prevPosition.z - radius > obstacleL / 4
  ) {
    velocityIn.z = 1 * Math.abs(velocityIn.z) * (1 - energyLoss);
    ball.position.z = prevPosition.z;
  }

  if (positionIn.x + radius > length / 2 + width) {
    velocityIn.x = -1 * Math.abs(velocityIn.x) * (1 - energyLoss);
    ball.position.x = prevPosition.x;
    // console.log("F");
  } else if (positionIn.x - radius < -length / 2) {
    velocityIn.x = 1 * Math.abs(velocityIn.x) * (1 - energyLoss);
    ball.position.x = prevPosition.x;
    // console.log("B");
  } else if (
    positionIn.z + radius > width / 2 &&
    !(positionIn.x + radius > length / 2)
  ) {
    if (prevPosition.x + radius > length / 2) {
      velocityIn.x = 1 * Math.abs(velocityIn.x) * (1 - energyLoss);
      ball.position.x = prevPosition.x;
      // console.log("H");
    } else {
      velocityIn.z = -1 * Math.abs(velocityIn.z) * (1 - energyLoss);
      ball.position.z = prevPosition.z;
      // console.log("E");
    }
  } else if (positionIn.z - radius < -width / 2) {
    velocityIn.z = 1 * Math.abs(velocityIn.z) * (1 - energyLoss);
    ball.position.z = prevPosition.z;
    // console.log("D");
  } else if (positionIn.z + radius > length - width / 2) {
    velocityIn.z = -1 * Math.abs(velocityIn.z) * (1 - energyLoss);
    ball.position.z = prevPosition.z;
    // console.log("G");
  }
}
