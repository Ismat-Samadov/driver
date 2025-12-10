"use client";

import { useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import StartScreen from "@/components/StartScreen";
import GameOverScreen from "@/components/GameOverScreen";

export default function Home() {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleStartGame = () => {
    setGameState("playing");
    setScore(0);
  };

  const handleGameOver = (finalScore: number) => {
    setGameState("gameover");
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      if (typeof window !== "undefined") {
        localStorage.setItem("highScore", finalScore.toString());
      }
    }
  };

  const handleRestart = () => {
    setGameState("playing");
    setScore(0);
  };

  const handleBackToMenu = () => {
    setGameState("start");
  };

  // Load high score on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const savedHighScore = localStorage.getItem("highScore");
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore));
      }
    }
  });

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      {gameState === "start" && (
        <StartScreen onStart={handleStartGame} highScore={highScore} />
      )}
      {gameState === "playing" && (
        <GameCanvas onGameOver={handleGameOver} />
      )}
      {gameState === "gameover" && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </main>
  );
}
