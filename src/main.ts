import './style.css'
import Phaser from 'phaser'

import { MainScene } from './game/scenes/MainScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 720,
  height: 1280,
  backgroundColor: '#1c231e', // Darker version of start modal background (0x2f3b32)
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 350 },
      debug: false,
    },
  },
  scene: [MainScene],bittee
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  loader: {
    imageLoadType: 'HTMLImageElement', // Use Image elements instead of XHR/Blob to avoid CSP issues
    baseURL: import.meta.env.DEV ? '/' : '/boycott/',
    // Note: Audio CORS errors in dev are usually harmless - Phaser will fall back to HTMLAudioElement
    // The errors appear but audio should still work
  },
  input: {
    activePointers: 5, // Support up to 5 simultaneous touches for multi-touch mobile controls
  },
  fps: {
    target: 30, // Limit to 30fps on mobile to prevent crashes and improve stability
    // Removed forceSetTimeOut - it was causing mobile to not work
    // Mobile browsers handle requestAnimationFrame better than setTimeout
  },
  render: {
    antialias: false, // Disable antialiasing on mobile for better performance
    pixelArt: false, // Not pixel art, but helps with performance
  },
}

// Add global error handling to prevent crashes on mobile
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  // Prevent the error from crashing the game
  event.preventDefault()
  return true
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Prevent the rejection from crashing the game
  event.preventDefault()
})

// Create game with error handling
try {
  const game = new Phaser.Game(config)
  
  // Add game-level error handling
  game.events.on('error', (error: Error) => {
    console.error('Phaser game error:', error)
  })
} catch (error) {
  console.error('Failed to create Phaser game:', error)
  // Show user-friendly error message
  const app = document.getElementById('app')
  if (app) {
    app.innerHTML = `
      <div style="color: white; padding: 20px; text-align: center;">
        <h2>Game failed to load</h2>
        <p>Please refresh the page. If the problem persists, your device may not support this game.</p>
        <p style="font-size: 12px; color: #888;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `
  }
}

