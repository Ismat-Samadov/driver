"use client";

import { useEffect, useRef, useState } from "react";

interface GameCanvasProps {
  onGameOver: (score: number) => void;
}

interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: "car" | "cone";
}

interface Coin {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

const GameCanvas = ({ onGameOver }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const gameStateRef = useRef({
    isRunning: true,
    car: { x: 0, y: 0, width: 40, height: 70, speed: 8 } as Car,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    keys: { left: false, right: false },
    roadOffset: 0,
    lastObstacleTime: 0,
    lastCoinTime: 0,
    score: 0,
    distance: 0,
    baseSpeed: 3,
    touchStartX: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = Math.min(window.innerWidth, 600);
      canvas.height = window.innerHeight;
      // Initialize car position
      gameStateRef.current.car.x = canvas.width / 2 - gameStateRef.current.car.width / 2;
      gameStateRef.current.car.y = canvas.height - gameStateRef.current.car.height - 50;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") gameStateRef.current.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") gameStateRef.current.keys.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") gameStateRef.current.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") gameStateRef.current.keys.right = false;
    };

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      gameStateRef.current.touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const diff = touchX - gameStateRef.current.touchStartX;

      if (diff > 10) {
        gameStateRef.current.keys.right = true;
        gameStateRef.current.keys.left = false;
      } else if (diff < -10) {
        gameStateRef.current.keys.left = true;
        gameStateRef.current.keys.right = false;
      } else {
        gameStateRef.current.keys.left = false;
        gameStateRef.current.keys.right = false;
      }

      gameStateRef.current.touchStartX = touchX;
    };

    const handleTouchEnd = () => {
      gameStateRef.current.keys.left = false;
      gameStateRef.current.keys.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Game loop
    let animationFrameId: number;

    const drawRoad = () => {
      const roadWidth = canvas.width * 0.7;
      const roadX = (canvas.width - roadWidth) / 2;

      // Road background
      ctx.fillStyle = "#2c2c2c";
      ctx.fillRect(roadX, 0, roadWidth, canvas.height);

      // Road edges
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(roadX, 0, 5, canvas.height);
      ctx.fillRect(roadX + roadWidth - 5, 0, 5, canvas.height);

      // Lane markings
      ctx.fillStyle = "#ffeb3b";
      const laneWidth = 8;
      const laneHeight = 40;
      const laneGap = 30;
      const offset = gameStateRef.current.roadOffset;

      for (let i = -1; i < canvas.height / (laneHeight + laneGap) + 1; i++) {
        const y = i * (laneHeight + laneGap) + offset;
        ctx.fillRect(roadX + roadWidth / 2 - laneWidth / 2, y, laneWidth, laneHeight);
      }

      // Grass sides
      ctx.fillStyle = "#2e7d32";
      ctx.fillRect(0, 0, roadX, canvas.height);
      ctx.fillRect(roadX + roadWidth, 0, canvas.width - roadX - roadWidth, canvas.height);
    };

    const drawCar = (car: Car) => {
      // Car body
      ctx.fillStyle = "#ff1744";
      ctx.fillRect(car.x, car.y, car.width, car.height);

      // Car top (windshield area)
      ctx.fillStyle = "#c51162";
      ctx.fillRect(car.x + 5, car.y + 5, car.width - 10, 20);

      // Windshield
      ctx.fillStyle = "#64b5f6";
      ctx.fillRect(car.x + 8, car.y + 8, car.width - 16, 14);

      // Wheels
      ctx.fillStyle = "#212121";
      ctx.fillRect(car.x - 3, car.y + 10, 6, 15);
      ctx.fillRect(car.x + car.width - 3, car.y + 10, 6, 15);
      ctx.fillRect(car.x - 3, car.y + car.height - 25, 6, 15);
      ctx.fillRect(car.x + car.width - 3, car.y + car.height - 25, 6, 15);

      // Headlights
      ctx.fillStyle = "#ffeb3b";
      ctx.fillRect(car.x + 5, car.y + car.height - 5, 10, 3);
      ctx.fillRect(car.x + car.width - 15, car.y + car.height - 5, 10, 3);
    };

    const drawObstacle = (obstacle: Obstacle) => {
      if (obstacle.type === "car") {
        // Obstacle car
        ctx.fillStyle = "#1976d2";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Windshield
        ctx.fillStyle = "#64b5f6";
        ctx.fillRect(obstacle.x + 8, obstacle.y + obstacle.height - 22, obstacle.width - 16, 14);

        // Wheels
        ctx.fillStyle = "#212121";
        ctx.fillRect(obstacle.x - 3, obstacle.y + 10, 6, 12);
        ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y + 10, 6, 12);
        ctx.fillRect(obstacle.x - 3, obstacle.y + obstacle.height - 22, 6, 12);
        ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y + obstacle.height - 22, 6, 12);
      } else {
        // Traffic cone
        ctx.fillStyle = "#ff6f00";
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();

        // Cone stripes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(obstacle.x + 5, obstacle.y + obstacle.height * 0.3, obstacle.width - 10, 3);
        ctx.fillRect(obstacle.x + 5, obstacle.y + obstacle.height * 0.6, obstacle.width - 10, 3);
      }
    };

    const drawCoin = (coin: Coin) => {
      if (coin.collected) return;

      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffed4e";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius - 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", coin.x, coin.y);
    };

    const checkCollision = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const checkCoinCollision = (car: Car, coin: Coin) => {
      if (coin.collected) return false;
      const carCenterX = car.x + car.width / 2;
      const carCenterY = car.y + car.height / 2;
      const distance = Math.sqrt(
        Math.pow(carCenterX - coin.x, 2) + Math.pow(carCenterY - coin.y, 2)
      );
      return distance < coin.radius + 20;
    };

    const gameLoop = () => {
      if (!gameStateRef.current.isRunning) return;

      const currentTime = Date.now();

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw road
      drawRoad();

      // Update road offset
      gameStateRef.current.roadOffset += gameStateRef.current.baseSpeed * 2;
      if (gameStateRef.current.roadOffset > 70) {
        gameStateRef.current.roadOffset = 0;
      }

      // Update car position
      const car = gameStateRef.current.car;
      const roadWidth = canvas.width * 0.7;
      const roadX = (canvas.width - roadWidth) / 2;

      if (gameStateRef.current.keys.left) {
        car.x -= car.speed;
      }
      if (gameStateRef.current.keys.right) {
        car.x += car.speed;
      }

      // Keep car on road
      car.x = Math.max(roadX + 5, Math.min(car.x, roadX + roadWidth - car.width - 5));

      // Spawn obstacles
      if (currentTime - gameStateRef.current.lastObstacleTime > 1500) {
        const obstacleType = Math.random() > 0.3 ? "car" : "cone";
        const width = obstacleType === "car" ? 40 : 30;
        const height = obstacleType === "car" ? 60 : 40;
        const lanes = 3;
        const laneWidth = (roadWidth - 20) / lanes;
        const lane = Math.floor(Math.random() * lanes);

        gameStateRef.current.obstacles.push({
          x: roadX + 10 + lane * laneWidth + (laneWidth - width) / 2,
          y: -height,
          width,
          height,
          speed: gameStateRef.current.baseSpeed + Math.random() * 2,
          type: obstacleType,
        });
        gameStateRef.current.lastObstacleTime = currentTime;
      }

      // Spawn coins
      if (currentTime - gameStateRef.current.lastCoinTime > 2000) {
        const lanes = 3;
        const laneWidth = (roadWidth - 20) / lanes;
        const lane = Math.floor(Math.random() * lanes);

        gameStateRef.current.coins.push({
          x: roadX + 10 + lane * laneWidth + laneWidth / 2,
          y: -20,
          radius: 15,
          collected: false,
        });
        gameStateRef.current.lastCoinTime = currentTime;
      }

      // Update and draw obstacles
      gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter((obstacle) => {
        obstacle.y += obstacle.speed;

        // Check collision
        if (checkCollision(car, obstacle)) {
          gameStateRef.current.isRunning = false;
          onGameOver(gameStateRef.current.score);
          return false;
        }

        if (obstacle.y < canvas.height) {
          drawObstacle(obstacle);
          return true;
        }

        // Obstacle passed, increase score
        gameStateRef.current.score += 10;
        gameStateRef.current.distance += 1;
        return false;
      });

      // Update and draw coins
      gameStateRef.current.coins = gameStateRef.current.coins.filter((coin) => {
        coin.y += gameStateRef.current.baseSpeed;

        // Check collection
        if (checkCoinCollision(car, coin)) {
          coin.collected = true;
          gameStateRef.current.score += 50;
        }

        if (coin.y < canvas.height + 50) {
          drawCoin(coin);
          return true;
        }
        return false;
      });

      // Draw car
      drawCar(car);

      // Update score display
      setScore(gameStateRef.current.score);
      setDistance(gameStateRef.current.distance);

      // Increase difficulty over time
      if (gameStateRef.current.distance > 0 && gameStateRef.current.distance % 20 === 0) {
        gameStateRef.current.baseSpeed = Math.min(8, gameStateRef.current.baseSpeed + 0.05);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-800 shadow-2xl"
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-6 py-4 rounded-lg border-2 border-yellow-400 shadow-lg">
        <div className="text-yellow-400 font-bold text-lg">SCORE</div>
        <div className="text-white text-3xl font-bold">{score}</div>
      </div>

      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-6 py-4 rounded-lg border-2 border-green-400 shadow-lg">
        <div className="text-green-400 font-bold text-lg">DISTANCE</div>
        <div className="text-white text-3xl font-bold">{distance}m</div>
      </div>

      {/* Mobile controls hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-block bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm">
          <span className="hidden md:inline">Use Arrow Keys or A/D to move</span>
          <span className="md:hidden">Touch and drag to move</span>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
