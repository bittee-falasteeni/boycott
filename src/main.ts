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
}

void new Phaser.Game(config)
