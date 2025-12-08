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
  scene: [MainScene],
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
  audio: {
    disableWebAudio: false, // Use Web Audio API (not HTML5 Audio)
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

// Unlock audio context on user interaction (required for mobile browsers)
// This needs to work in both regular browser tabs AND when opened as web app
let audioContextUnlocked = false
let audioContext: AudioContext | null = null

const unlockAudioContext = (force: boolean = false) => {
  // Don't return early if force is true - we want to keep trying
  if (audioContextUnlocked && !force) return
  
  // Try to unlock Web Audio API context
  try {
    // Create a temporary audio context to unlock it
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      if (!audioContext) {
        audioContext = new AudioContextClass()
      }
      
      if (audioContext && audioContext.state === 'suspended') {
        const context = audioContext // Store reference for closure
        context.resume().then(() => {
          console.log('Audio context unlocked')
          
          // Play a silent sound to "wake up" the audio system on mobile
          // This is required for some mobile browsers
          try {
            const buffer = context.createBuffer(1, 1, 22050)
            const source = context.createBufferSource()
            source.buffer = buffer
            source.connect(context.destination)
            source.start(0)
            source.stop(0.001)
          } catch (e) {
            // Silent sound creation failed, but context is unlocked
          }
          
          audioContextUnlocked = true
        }).catch((err: unknown) => {
          console.warn('Failed to unlock audio context:', err)
        })
      } else if (audioContext && audioContext.state === 'running') {
        audioContextUnlocked = true
      }
    }
  } catch (err: unknown) {
    console.warn('Audio context unlock failed:', err)
  }
  
  // Also unlock Phaser's audio system - this is the most important part
  const gameWindow = window as any
  if (gameWindow.game && gameWindow.game.sound) {
    const phaserSound = gameWindow.game.sound as any
    if (phaserSound.context) {
      if (phaserSound.context.state === 'suspended') {
        phaserSound.context.resume().then(() => {
          console.log('Phaser audio context unlocked')
          audioContextUnlocked = true
        }).catch((err: unknown) => {
          console.warn('Failed to unlock Phaser audio context:', err)
        })
      } else if (phaserSound.context.state === 'running') {
        audioContextUnlocked = true
      }
    }
  }
}

// Listen for ANY user interaction to unlock audio (not just once - keep trying)
// This ensures it works even if user interacts before game loads
const unlockOnInteraction = () => {
  unlockAudioContext(true) // Force unlock attempt
}

// Add listeners for all possible user interactions
const events = ['touchstart', 'touchend', 'mousedown', 'mouseup', 'keydown', 'click', 'pointerdown']
events.forEach(event => {
  // Use capture phase and don't use once - we want to catch interactions
  document.addEventListener(event, unlockOnInteraction, { passive: true, capture: true })
  // Also listen on window
  window.addEventListener(event, unlockOnInteraction, { passive: true, capture: true })
})

// Also try to unlock when page becomes visible (handles tab switching)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    unlockAudioContext(true)
  }
})

// Try to unlock on page load (in case it's already unlocked in web app mode)
if (document.readyState === 'complete') {
  unlockAudioContext(true)
} else {
  window.addEventListener('load', () => {
    unlockAudioContext(true)
  })
}

// Make unlockAudioContext globally available so Phaser can call it
const gameWindow = window as any
gameWindow.unlockAudioContext = unlockAudioContext


// Create game with error handling
try {
  const game = new Phaser.Game(config)
  
  // Store game reference globally for audio unlock
  gameWindow.game = game
  
  // Add game-level error handling
  game.events.on('error', (error: Error) => {
    console.error('Phaser game error:', error)
  })
  
  // Unlock audio when game is ready
  game.events.once('ready', () => {
    // Try to unlock audio context after a short delay
    setTimeout(() => {
      unlockAudioContext(true)
    }, 100)
    
    // Also try periodically to ensure it unlocks
    let attempts = 0
    const maxAttempts = 10
    const interval = setInterval(() => {
      attempts++
      unlockAudioContext(true)
      if (audioContextUnlocked || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 200)
  })
  
  // Hook into Phaser's input system to unlock on any game interaction
  game.events.once('ready', () => {
    // Wait for scene to be created
    setTimeout(() => {
      const scene = game.scene.getScenes()[0]
      if (scene && scene.input) {
        // Unlock on any input event
        scene.input.on('pointerdown', () => {
          unlockAudioContext(true)
        })
        scene.input.on('pointerup', () => {
          unlockAudioContext(true)
        })
        // Also listen for touch events
        scene.input.on('pointermove', () => {
          unlockAudioContext(true)
        })
      }
    }, 500)
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

