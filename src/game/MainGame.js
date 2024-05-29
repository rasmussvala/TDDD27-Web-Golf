// Import list
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { eulerApproximation } from "./euler.js";
import { ballCollision, wallDetection } from "./collision.js";
import { useNavigate } from "react-router-dom";

import { ref, onValue, set, get } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { auth, database } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";

import "../styles/maingame.css";

export default function MainGame({ url, myID, leaveLobby }) {
  // Auth and navigation hooks
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // State variables for game data
  const [ball1DB, setBall1DB] = useState(null);
  const [ball2DB, setBall2DB] = useState(null);
  const [gameSwitch, setGameSwitch] = useState(1);
  const [isGameFocused, setIsGameFocused] = useState(false);
  const [switchChecker, setSwitchChecker] = useState({
    prev: true,
    now: true,
  });

  // State variables for game status and UI
  const [endClass, setEndClass] = useState("");
  const [endOfGame, setEndOfGame] = useState(false);
  const [endMsg, setEndMsg] = useState("Game over");

  // Refs
  const gameRef = useRef(null);
  const gameSwitchRef = useRef(gameSwitch);
  const isGameFocusedRef = useRef(isGameFocused);

  // This effect updates the "turn" in the database
  useEffect(() => {
    const turnRef = ref(database, url + "/game/turn");

    gameSwitchRef.current = gameSwitch;
    set(turnRef, gameSwitch);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSwitch]);

  // Updates isGameFocusedRef to check if user has focus on game window or not
  useEffect(() => {
    isGameFocusedRef.current = isGameFocused;
  }, [isGameFocused]);

  // Upload when ball1DB changes
  useEffect(() => {
    if (myID > 2) return;
    const ball1Ref = ref(database, url + "/game/ball1");
    set(ball1Ref, ball1DB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ball1DB, url]);

  // Upload when ball2DB changes
  useEffect(() => {
    if (myID > 2) return;
    const ball2Ref = ref(database, url + "/game/ball2");
    set(ball2Ref, ball2DB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ball2DB, url]);

  // Switches the active player and increments the total shots count
  useEffect(() => {
    // Adds +1 for the local users total shots
    function incrementShots() {
      const shotRef = ref(database, "users/" + user.uid + "/shots");
      get(shotRef).then((snapshot) => {
        if (!snapshot.exists()) return;

        const currentShots = snapshot.val();
        set(shotRef, currentShots + 1);
      });
    }

    if (!switchChecker.prev && switchChecker.now) {
      setGameSwitch(gameSwitch === 1 ? 2 : 1);
      incrementShots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchChecker]);

  // Initialize game with state management
  useEffect(() => {
    const winnerRef = ref(database, url + "/game/winner");
    set(winnerRef, "none");

    function checkWinner(snapshot) {
      function updateStats(winsOrLosses) {
        const userStatsRef = ref(database, `users/${user.uid}/`);

        // Increment wins or losses and update w/l ratio
        get(userStatsRef).then((snapshot) => {
          if (!snapshot.exists()) return;

          const userStats = snapshot.val();
          const wins = userStats.wins;
          const losses = userStats.losses;

          // Increment the appropriate stat
          if (winsOrLosses === "wins") userStats.wins = wins + 1;
          else if (winsOrLosses === "losses") userStats.losses = losses + 1;

          // Calculate new W/L ratio
          const newRatio =
            losses === 0
              ? userStats.wins.toFixed(2)
              : (userStats.wins / userStats.losses).toFixed(2);

          userStats.ratio = newRatio;

          // Update the database
          set(userStatsRef, userStats);
        });
      }

      const winner = snapshot.val();
      // Set stats
      if (winner === "none" || winner === null) return;
      if (winner !== myID) {
        setEndMsg("Defeat");
        setEndClass("defeat");
        updateStats("losses");
      } else {
        setEndMsg("Victory");
        setEndClass("victory");
        updateStats("wins");
      }
      setEndOfGame(true);
    }

    onValue(winnerRef, checkWinner);

    // Camera, camera controls, render, scene and more
    const gameDiv = document.getElementById("game");

    let camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    let scene = new THREE.Scene();
    let renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const controls = new OrbitControls(camera, renderer.domElement);

    let sceneRoot = new THREE.Group();

    // Constants
    const massBall = 0.165;
    const radiusBall = 0.0286;
    const holeRadius = 2.5 * radiusBall;
    const my = 0.027;
    const g = 9.82;
    const playPlaneL = 4; //2.87;
    const playPlaneW = 1.27;
    const angleIncreaseValue = (3 * Math.PI) / 180;
    const energyLoss = 0.08;
    const maxHitForce = 130;
    const hitForceStart = 100;
    const theta = 0.8;
    const frictionGround = (5 / 7) * massBall * 9.82 * theta;

    class Ball {
      constructor(radius, mass, position, color) {
        this.radius = radius;
        this.mass = mass;
        this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
        this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
        this.position = position;
        this.spin = new THREE.Group();
        this.trans = new THREE.Group();
        this.geometry = new THREE.SphereGeometry(1, 32, 32);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.matrix = new THREE.Matrix4();

        this.PoolCueTrans = new THREE.Group();
        this.PoolCueSpin = new THREE.Group();
        this.PoolCueMesh = new THREE.Group();

        this.hitForce = hitForceStart;
        this.hitAngle = Math.PI;
      }
    }

    class BallContainer {
      constructor() {
        this.balls = [];
        this.length = 0;
        this.startPositions = [];
      }
      push(ball) {
        this.balls.push(ball);
        this.length += 1;
        this.startPositions.push(ball.position);
      }

      get(index) {
        return this.balls[index];
      }

      set(index, ball) {
        this.balls[index] = ball;
      }

      reSet() {
        // players.activePlayer = 1;
        for (let index = 0; index < this.balls.length; index++) {
          this.balls[index].acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
          this.balls[index].velocity = new THREE.Vector3(0.0, 0.0, 0.0);
          this.balls[index].position = new THREE.Vector3(
            this.startPositions[index].x,
            this.startPositions[index].y,
            this.startPositions[index].z
          );
        }
      }

      hideAllPoolCueMesh() {
        for (let index = 0; index < this.balls.length; index++) {
          this.balls[index].PoolCueMesh.visible = false;
        }
      }
    }

    class Hole {
      constructor(position, radius) {
        const geometryHole = new THREE.CircleGeometry(radius, 32);
        const materialHole = new THREE.MeshStandardMaterial({
          color: 0x000000,
        });
        this.mesh = new THREE.Mesh(geometryHole, materialHole);
        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotation.x = -90 * (3.14 / 180);
        this.radius = radius;
      }
    }

    class Player {
      constructor() {
        this.id = -1;
      }
    }

    class PlayerContainer {
      constructor() {
        this.nrOfPlayers = 0;
        this.players = [];
        this.activePlayer = 0;
        this.prevPlayer = 0;
      }

      addPlayer(player) {
        this.activePlayer = 1;
        player.id = this.nrOfPlayers + 1;
        this.players.push(player);
        this.nrOfPlayers++;
      }

      get(index) {
        return this.players[index];
      }

      removePlayer(player) {
        let index = this.players.indexOf(player);
        if (index !== false) {
          this.players.splice(index, 1);
          this.nrOfPlayers--;
          if (this.nextPlayer === 0) {
            this.activePlayer = 0;
          } else if (this.activePlayer > this.nrOfPlayers) {
            this.activePlayer = this.nrOfPlayers;
          }
        }
      }

      nextPlayer() {
        this.prevPlayer = this.activePlayer;
        this.activePlayer += 1;
        if (this.activePlayer > this.nrOfPlayers) {
          this.activePlayer = 1;
        }
      }

      setActivePlayer(index) {
        if (index < 1) {
          this.activePlayer = 1;
        } else if (index > this.players.length) {
          this.activePlayer = this.players.length;
        } else {
          this.activePlayer = index;
        }

        if (this.activePlayer === 1) {
          this.prevPlayer = this.players.length;
        } else {
          this.prevPlayer = this.activePlayer - 1;
        }
      }

      getActivePlayer() {
        return this.players[this.activePlayer - 1];
      }

      getPrevPlayer() {
        return this.players[this.prevPlayer - 1];
      }

      checkActivePlayers(number) {
        return this.nrOfPlayers === number;
      }
    }

    // Add 2 players
    let players = new PlayerContainer();
    let player1 = new Player();
    let player2 = new Player();
    players.addPlayer(player1);
    players.addPlayer(player2);

    // Ball and hole var
    let balls = new BallContainer();
    let holes = [];

    // Player 1
    balls.push(
      new Ball(
        radiusBall,
        massBall,
        new THREE.Vector3(-1.0, 0.0, -0.2),
        "#595EFF"
      )
    );

    // Player 2
    balls.push(
      new Ball(
        radiusBall,
        massBall,
        new THREE.Vector3(-1.0, 0.0, 0.2),
        "#FF8040"
      )
    );

    const turnRef = ref(database, url + "/game/turn");
    set(turnRef, gameSwitch);
    onValue(turnRef, (snapshot) => {
      const data = snapshot.val();
      setGameSwitch(data);
      players.setActivePlayer(data);
    });

    // ---- Create the Scene ----

    // Colors
    const FLOOR_COLOR = "#9eca7f";
    const OBSTACLE_COLOR = "#e64a19";
    const WALL_COLOR = "#ffdf00";
    const LIGHT_COLOR = "#ffffff";

    // ---- Lights ----

    // Point light
    const sun = new THREE.PointLight(LIGHT_COLOR, 80);
    sun.position.set(5.0, 5.0, -3.0);
    sun.castShadow = true;
    sceneRoot.add(sun);

    // Behövs inte
    sun.shadow.mapSize.width = 1024; // default
    sun.shadow.mapSize.height = 1024; // default
    // sun.shadow.camera.near = 0.5; // default
    // sun.shadow.camera.far = 500; // default

    // Ambient light
    const ambient = new THREE.AmbientLight(LIGHT_COLOR);
    sceneRoot.add(ambient);

    // ---- Floor ----

    // Creates floor function
    function creatPlane(
      length,
      width,
      color,
      position,
      rotation = new THREE.Vector3(0.0, 0.0, 0.0)
    ) {
      const geometryPlane = new THREE.PlaneGeometry(length, width);
      const materialPlane = new THREE.MeshStandardMaterial({
        color: color,
      });
      const plane = new THREE.Mesh(geometryPlane, materialPlane);
      plane.receiveShadow = true;
      plane.rotation.set(-Math.PI / 2 + rotation.x, rotation.y, rotation.z);
      plane.position.set(position.x, position.y, position.z);

      return plane;
    }

    // Add floor
    sceneRoot.add(
      creatPlane(
        playPlaneL,
        playPlaneW,
        FLOOR_COLOR,
        new THREE.Vector3(0, -radiusBall, 0.0)
      )
    );
    sceneRoot.add(
      creatPlane(
        playPlaneL,
        playPlaneW,
        FLOOR_COLOR,
        new THREE.Vector3(
          (playPlaneL + playPlaneW) / 2,
          -radiusBall,
          (playPlaneL - playPlaneW) / 2
        ),
        new THREE.Vector3(0.0, 0.0, 90 * (3.14 / 180))
      )
    );

    // --- Obstacles ---

    const OBSTACLE_WIDTH = 0.25;
    const OBSTACLE_LENGTH = 0.85;
    const OBSTACLE_HEIGHT = 0.1;

    // Create geometry and material for obstacle
    const geometryObstacle = new THREE.BoxGeometry(
      OBSTACLE_WIDTH,
      OBSTACLE_HEIGHT,
      OBSTACLE_LENGTH
    );
    const materialObstacle = new THREE.MeshStandardMaterial({
      color: OBSTACLE_COLOR,
    });

    // Create Meshes for obstacle
    const obstacle1 = new THREE.Mesh(geometryObstacle, materialObstacle);
    obstacle1.position.set(OBSTACLE_LENGTH, 0.0, -OBSTACLE_LENGTH / 4);
    obstacle1.castShadow = true;
    sceneRoot.add(obstacle1);
    const obstacle2 = new THREE.Mesh(geometryObstacle, materialObstacle);
    obstacle2.position.set(0.0, 0.0, OBSTACLE_LENGTH / 4);
    obstacle2.castShadow = true;
    sceneRoot.add(obstacle2);

    // ---- Walls ----

    const WALL_HEIGHT = OBSTACLE_HEIGHT + 0.01; // + 0.01 to remove weird clipping effect
    const WALL_WIDTH = 0.05;
    const WALL_LENGTH_LONG = playPlaneL + WALL_WIDTH; // + WALL_WIDTH to make corners connected
    const WALL_LENGTH_SHORT = playPlaneW + WALL_WIDTH;

    // Create geometry and material for obstacle
    const geometryWallLong = new THREE.BoxGeometry(
      WALL_LENGTH_LONG,
      WALL_HEIGHT,
      WALL_WIDTH
    );
    const geometryWallMedium = new THREE.BoxGeometry(
      WALL_LENGTH_LONG - WALL_LENGTH_SHORT,
      WALL_HEIGHT,
      WALL_WIDTH
    );
    const geometryWallShort = new THREE.BoxGeometry(
      WALL_LENGTH_SHORT,
      WALL_HEIGHT,
      WALL_WIDTH
    );
    const materialWall = new THREE.MeshStandardMaterial({
      color: WALL_COLOR,
    });

    const wall1 = new THREE.Mesh(geometryWallLong, materialWall);
    wall1.position.set(0.0, 0.0, playPlaneW / 2);
    wall1.castShadow = true;
    sceneRoot.add(wall1);

    const wall2 = new THREE.Mesh(geometryWallMedium, materialWall);
    wall2.rotation.set(0.0, Math.PI / 2, 0.0);
    wall2.position.set(playPlaneL / 2, 0.0, playPlaneL / 2);
    wall2.castShadow = true;
    sceneRoot.add(wall2);

    const wall3 = new THREE.Mesh(geometryWallShort, materialWall);
    wall3.position.set(
      playPlaneL - playPlaneW - 2 * WALL_WIDTH + 0.005,
      0.0,
      playPlaneL - playPlaneW / 2
    );
    wall3.castShadow = true;
    sceneRoot.add(wall3);

    const wall4 = new THREE.Mesh(geometryWallMedium, materialWall);
    wall4.position.set(
      playPlaneL - playPlaneW / 2 - 2 * WALL_WIDTH + 0.005,
      0.0,
      playPlaneL / 2
    );
    wall4.rotation.set(0.0, Math.PI / 2, 0.0);
    wall4.castShadow = true;
    sceneRoot.add(wall4);

    const wall5 = new THREE.Mesh(geometryWallShort, materialWall);
    wall5.position.set(
      playPlaneL - playPlaneW / 2 - 2 * WALL_WIDTH + 0.005,
      0.0,
      0.0
    );
    wall5.rotation.set(0.0, Math.PI / 2, 0.0);
    wall5.castShadow = true;
    sceneRoot.add(wall5);

    const wall6 = new THREE.Mesh(geometryWallShort, materialWall);
    wall6.position.set(
      playPlaneL - playPlaneW - 2 * WALL_WIDTH + 0.005,
      0.0,
      -playPlaneW / 2
    );
    wall6.castShadow = true;
    sceneRoot.add(wall6);

    const wall7 = new THREE.Mesh(geometryWallLong, materialWall);
    wall7.position.set(0.0, 0.0, -playPlaneW / 2);
    wall7.castShadow = true;
    sceneRoot.add(wall7);

    const wall8 = new THREE.Mesh(geometryWallShort, materialWall);
    wall8.rotation.set(0.0, Math.PI / 2, 0.0);
    wall8.position.set(-playPlaneL + 1.56 * playPlaneW, 0.0, 0.0);
    wall8.castShadow = true;
    sceneRoot.add(wall8);

    // ---- Hole ----
    const hole = new Hole(
      new THREE.Vector3(
        playPlaneL / 2 + playPlaneW / 2,
        -radiusBall + 0.001,
        playPlaneL / 2 + playPlaneW / 2 + 0.5
      ),
      holeRadius
    );
    holes[0] = hole;
    sceneRoot.add(hole.mesh);

    function onWindowResize() {
      camera.aspect = gameDiv.clientWidth / gameDiv.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(gameDiv.clientWidth, gameDiv.clientHeight);
    }

    function addPoolCueToBall(ball) {
      ball.trans.add(ball.PoolCueSpin);
      ball.PoolCueSpin.add(ball.PoolCueTrans);
      ball.PoolCueSpin.position.set(
        (ball.hitForce / 70) * Math.cos(ball.hitAngle),
        0.0,
        (ball.hitForce / 70) * Math.sin(ball.hitAngle)
      );

      // Create the shaft of the arrow
      const rectangleGeometry = new THREE.PlaneGeometry(0.7, 3);

      // Calculate the starting color
      const force = ball.hitForce / ball.maxHitForce;
      const padding = 0.1;
      const r = 1;
      const g = 0.3 * (1 - force) + padding;
      const b = 0;

      const rectangleMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(r, g, b),
      });
      const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);

      // Create the arrowhead of the arrow
      const triangleShape = new THREE.Shape();
      triangleShape.moveTo(0, 4); // Top vertex
      triangleShape.lineTo(-1.1, 1.3); // Bottom left vertex
      triangleShape.lineTo(1.1, 1.3); // Bottom right vertex
      triangleShape.lineTo(0, 4); // Closing the shape

      const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
      const triangleMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(r, g, b),
      });
      const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);

      const arrow = new THREE.Group();
      arrow.add(rectangle);
      arrow.add(triangle);

      arrow.rotation.x = -Math.PI / 2;
      arrow.rotation.z = -Math.PI / 2;
      arrow.position.set(9.5, -1.0, 0.0);
      ball.PoolCueTrans.add(arrow);
      ball.PoolCueMesh = arrow;
    }

    function addBallsToSceneRoot(balls, sceneRoot) {
      for (let index = 0; index < balls.length; index++) {
        sceneRoot.add(balls.get(index).spin);
        balls.get(index).spin.add(balls.get(index).trans);
        balls.get(index).trans.add(balls.get(index).mesh);

        balls.get(index).trans.scale.set(radiusBall, radiusBall, radiusBall);
        balls
          .get(index)
          .trans.position.set(
            balls.get(index).position.x,
            balls.get(index).position.y,
            balls.get(index).position.z
          );
      }
    }

    function createSceneGraph(scene, sceneRoot) {
      scene.add(sceneRoot);

      addBallsToSceneRoot(balls, sceneRoot);
      for (let index = 0; index <= 1; index++) {
        addPoolCueToBall(balls.get(index));
      }
    }

    function userInputs(ballInPlay, angleIncreaseValue) {
      document.onkeydown = function (event) {
        if (
          !isGameFocusedRef.current ||
          gameSwitchRef.current !== myID ||
          endOfGame
        ) {
          return;
        }
        // Only user changes if the sim is done
        if (breakBOOL) {
          if (event.code === "Space" && breakBOOL) {
            event.preventDefault();

            ballInPlay.PoolCueSpin.position.set(0.0, 0.0, 0.0);
            let delayInMilliseconds = 80;
            setTimeout(function () {
              ballInPlay.acceleration.set(
                -ballInPlay.hitForce * Math.cos(ballInPlay.hitAngle),
                0.0,
                -ballInPlay.hitForce * Math.sin(ballInPlay.hitAngle)
              );
              breakBOOL = false;
              ballInPlay.PoolCueMesh.visible = false;

              ballInPlay.PoolCueSpin.position.set(
                (ballInPlay.hitForce / 100) * Math.cos(ballInPlay.hitAngle),
                0.0,
                (ballInPlay.hitForce / 100) * Math.sin(ballInPlay.hitAngle)
              );
            }, delayInMilliseconds);
          } else if (
            event.code === "ArrowUp" &&
            ballInPlay.hitForce < maxHitForce
          ) {
            event.preventDefault();
            ballInPlay.hitForce =
              ballInPlay.hitForce + 10 > maxHitForce
                ? maxHitForce
                : ballInPlay.hitForce + 10;
          } else if (event.code === "ArrowDown" && ballInPlay.hitForce > 10) {
            event.preventDefault();
            ballInPlay.hitForce =
              ballInPlay.hitForce - 10 < 10 ? 10 : ballInPlay.hitForce - 10;
          } else if (event.code === "ArrowLeft") {
            ballInPlay.hitAngle -= angleIncreaseValue;
          } else if (event.code === "ArrowRight") {
            ballInPlay.hitAngle += angleIncreaseValue;
          }

          // Color the arrow depending on strength
          const normalizedForce = ballInPlay.hitForce / maxHitForce;
          const colorPadding = 0.1;

          // Calculate the interpolated color
          const red = 1;
          const green = 0.3 * (1 - normalizedForce) + colorPadding;
          const blue = 0;

          const newColor = new THREE.Color(red, green, blue);

          // ballInPlay.PoolCueMesh is a THREE.Group so we need to change its children
          ballInPlay.PoolCueMesh.children.forEach((child) => {
            if (child.material) {
              child.material.color.set(newColor);
            }
          });
        }
      };
    }

    function rotateAroundObjectAxis(ball, axis, radians) {
      // https://stackoverflow.com/questions/11060734/how-to-rotate-a-3d-object-on-axis-three-js

      let rotWorldMatrix = new THREE.Matrix4();
      rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
      rotWorldMatrix.multiply(ball.matrix);

      ball.matrix = rotWorldMatrix;
      ball.rotation.setFromRotationMatrix(ball.matrix);
    }

    function rotateBall(ball, FPS) {
      let ballAxis = new THREE.Vector3(ball.velocity.z, 0, -ball.velocity.x);
      let radians = (FPS * ball.velocity.length()) / ball.radius;

      rotateAroundObjectAxis(ball.mesh, ballAxis, radians);
    }

    function init() {
      camera.position.set(-playPlaneL - 2.0, 4.0, 0.0);
      controls.enableDamping = true;
      controls.enablePan = true;
      controls.maxDistance = 6.5;
      controls.minDistance = 2.5;
      controls.minPolarAngle = 0; // Set to 0
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.saveState();

      createSceneGraph(scene, sceneRoot);
      renderer.setClearColor(0xdff1fc);
      renderer.setPixelRatio(window.devicePixelRatio);

      camera.aspect = gameDiv.clientWidth / gameDiv.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(gameDiv.clientWidth, gameDiv.clientHeight);
      gameDiv.appendChild(renderer.domElement);

      window.addEventListener("resize", onWindowResize, true);
    }

    let breakBOOL = false;

    // Animate the movement of the balls
    function render(FPS) {
      // Perform animations
      if (!breakBOOL) {
        breakBOOL = true;

        for (let index = 0; index < balls.length; index++) {
          // First loop for animation
          balls.get(index).prevPosition = balls.get(index).position;

          // Euleraprox the next positions
          const [velocity, position] = eulerApproximation(
            balls.get(index).acceleration,
            balls.get(index).velocity,
            balls.get(index).position,
            1,
            FPS
          );
          balls.get(index).velocity = velocity; // Saves speed
          balls.get(index).position = position; // Saves pos

          // Collision checker
          for (let index2 = index + 1; index2 < balls.length; index2++) {
            if (
              balls
                .get(index2)
                .position.clone()
                .distanceTo(balls.get(index).position) <
                2 * radiusBall &&
              balls.get(index).position.y === 0.0 &&
              balls.get(index2).position.y === 0.0
            ) {
              const [updatedBall1, updatedBall2] = ballCollision(
                balls.get(index),
                balls.get(index2),
                g,
                my,
                energyLoss
              );
              balls.set(index, updatedBall1);
              balls.set(index2, updatedBall2);
            }
          }

          // Rendesrs values for euler
          balls
            .get(index)
            .trans.position.set(
              balls.get(index).position.x,
              balls.get(index).position.y,
              balls.get(index).position.z
            );

          // Calc friction
          balls.get(index).acceleration = balls
            .get(index)
            .velocity.clone()
            .normalize()
            .multiplyScalar(-frictionGround);

          rotateBall(balls.get(index), FPS);

          // Checher for collision whit walls
          wallDetection(balls.get(index), playPlaneL, playPlaneW, energyLoss);

          // Check for if a ball is in a hole
          for (let indexHole = 0; indexHole < holes.length; indexHole++) {
            if (
              Math.pow(
                balls.get(index).position.x - holes[indexHole].position.x,
                2
              ) +
                Math.pow(
                  balls.get(index).position.z - holes[indexHole].position.z,
                  2
                ) <
              Math.pow(0.9 * holes[indexHole].radius, 2)
            ) {
              balls.get(index).position.x = holes[indexHole].position.x;
              balls.get(index).position.y = -2 * radiusBall;
              balls.get(index).position.z = holes[indexHole].position.z;

              for (let i = 0; i < players.nrOfPlayers; i++) {
                if (i === index) set(winnerRef, myID);
              }

              // To let the simulation go on a few frames longer (if this is the last moving ball)
              balls.get(index).velocity.set(0.1, 0.0, 0.0);
            }
          }

          // Stop the ball if it has a small velocity
          if (
            Math.abs(balls.get(index).velocity.x) < 0.04 &&
            Math.abs(balls.get(index).velocity.z) < 0.04
          ) {
            balls.get(index).velocity.set(0.0, 0.0, 0.0);
          } else {
            breakBOOL = false;
          }

          if (index === 0) {
            const pos = balls.get(index).position;
            setBall1DB({ position: { x: pos.x, y: pos.y, z: pos.z } });
          }
          if (index === 1) {
            const pos = balls.get(index).position;
            setBall2DB({ position: { x: pos.x, y: pos.y, z: pos.z } });
          }
        }
      }

      let activePlayer = players.getActivePlayer();
      let activeBall = balls.get(activePlayer.id - 1);

      if (gameSwitchRef.current !== myID) {
        const ball1Ref = ref(database, url + "/game/ball1");
        get(ball1Ref).then((snapshot) => {
          if (snapshot.exists()) {
            const ball1Value = snapshot.val();

            balls
              .get(0)
              .position.set(
                ball1Value.position.x,
                ball1Value.position.y,
                ball1Value.position.z
              );
            balls
              .get(0)
              .trans.position.set(
                balls.get(0).position.x,
                balls.get(0).position.y,
                balls.get(0).position.z
              );
          } else {
            console.log("Ball 1 data does not exist");
          }
        });
        const ball2Ref = ref(database, url + "/game/ball2");
        get(ball2Ref)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const ball2Value = snapshot.val();

              balls
                .get(1)
                .position.set(
                  ball2Value.position.x,
                  ball2Value.position.y,
                  ball2Value.position.z
                );
              balls
                .get(1)
                .trans.position.set(
                  balls.get(1).position.x,
                  balls.get(1).position.y,
                  balls.get(1).position.z
                );
            } else {
              console.log("Ball 2 data does not exist");
            }
          })
          .catch((error) => {
            console.error("Error getting ball2 value:", error);
          });
      }

      // Fetch user inputs
      userInputs(activeBall, angleIncreaseValue);

      let hitForce = activeBall.hitForce;
      const poolCueDrawBack = -hitForce / 70;

      activeBall.PoolCueTrans.rotation.y = Math.PI - activeBall.hitAngle;
      activeBall.PoolCueSpin.position.set(
        poolCueDrawBack * Math.cos(activeBall.hitAngle),
        0.0,
        poolCueDrawBack * Math.sin(activeBall.hitAngle)
      );

      activeBall.PoolCueMesh.scale.set(
        1.0,
        1 + (0.5 * hitForce) / maxHitForce,
        1.0
      );

      if (breakBOOL) {
        if (activeBall.position.y < 0.0) {
          activeBall.position.set(-1.0, 0.0, 0.0);
          activeBall.trans.position.set(
            activeBall.position.x,
            activeBall.position.y,
            activeBall.position.z
          );
          activeBall.acceleration.set(0.0, massBall * g, 0.0);
        }
        if (gameSwitchRef.current === myID) {
          activeBall.PoolCueMesh.visible = true;
        }
      }

      activeBall.PoolCueTrans.position.set(
        6.5 * Math.cos(activeBall.hitAngle),
        0.2,
        6.5 * Math.sin(activeBall.hitAngle)
      );

      // Set up for possible switch of turn
      if (breakBOOL) {
        setSwitchChecker((prevSwitchChecker) => ({
          prev: prevSwitchChecker.now,
          now: true,
        }));
      } else {
        setSwitchChecker((prevSwitchChecker) => ({
          prev: prevSwitchChecker.now,
          now: false,
        }));
      }

      // Render the scene
      renderer.render(scene, camera);
    }

    function animate() {
      if (!gameRef.current) return;

      // Make the camera follow your ball, spectators don't follow anything
      if (myID === 1 || myID === 2) {
        controls.target.copy(balls.get(myID - 1).position);
      }
      controls.update(); // For orbitControls
      requestAnimationFrame(animate); // Request to be called again for next frame
      let FPS = 1.0 / 60.0;
      balls.hideAllPoolCueMesh();

      render(FPS);
    }

    init(); // Set up the scene
    animate(); // Enter an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={gameRef}
      id="game"
      tabIndex="0"
      onFocus={() => {
        setIsGameFocused(true);
      }}
      onBlur={() => {
        setIsGameFocused(false);
      }}
    >
      {endOfGame ? (
        <div id="end" className={endClass}>
          {endMsg}
          <button onClick={leaveLobby}>&larr; Go to menu</button>
        </div>
      ) : null}
    </div>
  );
}
