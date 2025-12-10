
import Phaser from 'phaser'

type BallSize = 'large' | 'medium' | 'small' | 'mini'

type DifficultyKey = 'sproutWatch' | 'stormWarning' | 'meteorShower'

interface DifficultyPreset {
  label: string
  ballSpeedMultiplier: number
  fireRate: number
  startingLives: number
}

interface GameSettings {
  volumeIndex: number
  showBackground: boolean
  screenShake: boolean
  difficulty: DifficultyKey
  levelIndex: number
}

// Helper function to get asset path with base path
// For images, we need relative paths (without leading slash) so Phaser's baseURL works
const getAssetPath = (path: string): string => {
  // Remove leading slash - Phaser's baseURL will handle the prefix
  // In dev: baseURL = '/' + 'assets/...' = '/assets/...'
  // In prod: baseURL = '/boycott/' + 'assets/...' = '/boycott/assets/...'
  return path.startsWith('/') ? path.slice(1) : path
}

// Special function for audio paths - use paths relative to baseURL
const getAudioPath = (path: string): string => {
  // Remove leading slash - Phaser's baseURL will prepend /boycott/ in production
  // So 'assets/audio/file.webm' becomes '/boycott/assets/audio/file.webm'
  return path.startsWith('/') ? path.slice(1) : path
}

interface LevelDefinition {
  key: string
  label: string
  textureUrl: string
}

const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { key: 'level-1', label: 'Level 1', textureUrl: getAssetPath('/assets/nyc.jpg') },
  { key: 'level-2', label: 'Level 2', textureUrl: getAssetPath('/assets/la.png') },
  { key: 'level-3', label: 'Level 3', textureUrl: getAssetPath('/assets/sydney.jpg') },
  { key: 'level-4', label: 'Level 4', textureUrl: getAssetPath('/assets/machupicchu.jpg') },
  { key: 'level-5', label: 'Level 5', textureUrl: getAssetPath('/assets/tokyo.jpg') },
  { key: 'level-6', label: 'Level 6', textureUrl: getAssetPath('/assets/hongkong.jpg') },
  { key: 'level-7', label: 'Level 7', textureUrl: getAssetPath('/assets/dubai.png') },
  { key: 'level-8', label: 'Level 8', textureUrl: getAssetPath('/assets/london.jpg') },
  { key: 'level-9', label: 'Level 9', textureUrl: getAssetPath('/assets/paris.jpg') },
  { key: 'level-10', label: 'Level 10', textureUrl: getAssetPath('/assets/rome.jpg') },
  { key: 'level-11', label: 'Level 11', textureUrl: getAssetPath('/assets/cairo.jpg') },
  { key: 'level-12', label: 'Level 12', textureUrl: getAssetPath('/assets/moon.jpg') },
  { key: 'boss-transition', label: 'Boss Transition', textureUrl: getAssetPath('/assets/gaza.jpg') },
  { key: 'boss-jet', label: 'Boss: Jet', textureUrl: getAssetPath('/assets/gaza1.jpg') },
  { key: 'boss-tank1', label: 'Boss: Tank 1', textureUrl: getAssetPath('/assets/gaza2.jpg') },
  { key: 'boss-tank2', label: 'Boss: Tank 2', textureUrl: getAssetPath('/assets/gaza3.jpg') },
  { key: 'boss-tank3', label: 'Boss: Tank 3', textureUrl: getAssetPath('/assets/gaza4.jpg') },
  { key: 'boss-victory', label: 'Victory', textureUrl: getAssetPath('/assets/gaza5.jpg') },
  { key: 'boss-victory2', label: 'Victory 2', textureUrl: getAssetPath('/assets/gaza6.jpg') },
  { key: 'boss-victory3', label: 'Victory 3', textureUrl: getAssetPath('/assets/gaza7.jpg') },
]

const DIFFICULTY_PRESETS: Record<DifficultyKey, DifficultyPreset> = {
  sproutWatch: {
    label: 'Sprout Watch',
    ballSpeedMultiplier: 0.75,
    fireRate: 320,
    startingLives: 4,
  },
  stormWarning: {
    label: 'Storm Warning',
    ballSpeedMultiplier: 1,
    fireRate: 250,
    startingLives: 3,
  },
  meteorShower: {
    label: 'Meteor Shower',
    ballSpeedMultiplier: 1.25,
    fireRate: 200,
    startingLives: 2,
  },
}

const VOLUME_LEVELS = [
  { label: 'Intifada', value: 1 },
  { label: 'Silent', value: 0 },
] as const

type VolumeLevelIndex = 0 | 1

const DEFAULT_SETTINGS: GameSettings = {
  volumeIndex: 0,  // Default to "Intifada" (was 2, now 0)
  showBackground: true,
  screenShake: true,
  difficulty: 'stormWarning',
  levelIndex: 0,
}

const BITTEE_TARGET_HEIGHT = 144
// TEMPORARILY DISABLED: Used in disabled texture normalization
// const BITTEE_TEXTURE_SIZE = 256
const ROCK_TARGET_SIZE = 72

// Visual offset so Bittee's feet sit exactly on the game/HUD boundary line.
// Player origin is at bottom (0.5, 1), so Y position = where feet are.
// Negative values shift sprite UP into the collision box
// Positive values shift sprite DOWN (lower on screen)
const PLAYER_FOOT_Y_OFFSET = 3  // Shift Bittee slightly lower on Y axis

// Ground position offset - locked to prevent changes from affecting Bittee's position
// Negative moves ground UP (higher on screen), positive moves DOWN
const GROUND_Y_OFFSET = 0  // Ground at HUD/game border (gameplayHeight boundary)

// Jump strength – normal jump reaches a modest, controllable height.
// Boosted jumps (after crouch) use a slightly higher multiplier.
const JUMP_SPEED = 450

const PLAYER_SPEED = 368  // 15% faster than before (320 * 1.15)
const BULLET_SPEED = 520

const BITTEE_SPRITES = {
  stand: {
    key: 'bittee-stand',
    path: getAssetPath('/assets/bittee-stand.png'),
  },
  crouch: {
    key: 'bittee-crouch',
    path: getAssetPath('/assets/bittee-crouch.png'),
  },
  runRight: [
    {
      key: 'bittee-run-right1',
      path: getAssetPath('/assets/bittee-run-right1.png'),
    },
    {
      key: 'bittee-run-right2',
      path: getAssetPath('/assets/bittee-run-right2.png'),
    },
    {
      key: 'bittee-run-right3',
      path: getAssetPath('/assets/bittee-run-right3.png'),
    },
    {
      key: 'bittee-run-right4',
      path: getAssetPath('/assets/bittee-run-right4.png'),
    },
    {
      key: 'bittee-run-right5',
      path: getAssetPath('/assets/bittee-run-right5.png'),
    },
  ],
  runLeft: [
    {
      key: 'bittee-run-left1',
      path: getAssetPath('/assets/bittee-run-left1.png'),
    },
    {
      key: 'bittee-run-left2',
      path: getAssetPath('/assets/bittee-run-left2.png'),
    },
    {
      key: 'bittee-run-left3',
      path: getAssetPath('/assets/bittee-run-left3.png'),
    },
    {
      key: 'bittee-run-left4',
      path: getAssetPath('/assets/bittee-run-left4.png'),
    },
    {
      key: 'bittee-run-left5',
      path: getAssetPath('/assets/bittee-run-left5.png'),
    },
  ],
  throwFrames: [
    {
      key: 'bittee-throw1',
      path: getAssetPath('/assets/bittee-throw1.png'),
    },
    {
      key: 'bittee-throw2',
      path: getAssetPath('/assets/bittee-throw2.png'),
    },
  ],
  taunt: {
    key: 'bittee-taunt',
    path: getAssetPath('/assets/bittee-taunt.png'),
  },
  taunt2: {
    key: 'bittee-taunt2',
    path: getAssetPath('/assets/bittee-taunt2.png'),
  },
  jumpSquat: {
    right: {
      key: 'bittee-jump-right1',
      path: getAssetPath('/assets/bittee-jump-right1.png'),
    },
    left: {
      key: 'bittee-jump-left1',
      path: getAssetPath('/assets/bittee-jump-left1.png'),
    },
  },
  jumpAir: {
    right: [
      {
        key: 'bittee-jump-right2',
        path: getAssetPath('/assets/bittee-jump-right2.png'),
      },
      {
        key: 'bittee-jump-right3',
        path: getAssetPath('/assets/bittee-jump-right3.png'),
      },
    ],
    left: [
      {
        key: 'bittee-jump-left1',
        path: getAssetPath('/assets/bittee-jump-left1.png'),
      },
      {
        key: 'bittee-jump-left2',
        path: getAssetPath('/assets/bittee-jump-left2.png'),
      },
      {
        key: 'bittee-jump-left3',
        path: getAssetPath('/assets/bittee-jump-left3.png'),
      },
    ],
  },
} as const

// TEMPORARILY DISABLED: Used in disabled texture normalization
// const BITTEE_TEXTURE_KEYS: string[] = [
//   BITTEE_SPRITES.stand.key,
//   BITTEE_SPRITES.crouch.key,
//   ...BITTEE_SPRITES.runRight.map(({ key }) => key),
//   ...BITTEE_SPRITES.runLeft.map(({ key }) => key),
//   ...BITTEE_SPRITES.throwFrames.map(({ key }) => key),
//   BITTEE_SPRITES.taunt.key,
//   BITTEE_SPRITES.jumpSquat.right.key,
//   BITTEE_SPRITES.jumpSquat.left.key,
//   ...BITTEE_SPRITES.jumpAir.right.map(({ key }) => key),
//   ...BITTEE_SPRITES.jumpAir.left.map(({ key }) => key),
// ]

const ROCK_SPRITE = {
  key: 'bittee-rock',
  path: getAssetPath('/assets/rock.png'),
} as const

const ROCK_HUD_SPRITE = {
  key: 'bittee-rock-hud',
  path: getAssetPath('/assets/rock1.png'),
} as const

// BALL_TEXTURES is no longer used - brands are assigned per level via LEVEL_BRAND_ASSIGNMENTS

interface BallRule {
  textureKey: string
  displayScale: number
  bounceVelocity: number
  horizontalSpeedRange: [number, number]
  nextSize?: BallSize
}

const BALL_RULES: Record<BallSize, BallRule> = {
  large: {
    textureKey: 'ball-large',
    displayScale: 0.5,
    bounceVelocity: 746,  // Increased to bounce ~280px higher (650² + 560*240 = 746²)
    horizontalSpeedRange: [100, 150],  // Much reduced horizontal speed for less sideways movement
    nextSize: 'medium',
  },
  medium: {
    textureKey: 'ball-medium',
    displayScale: 0.36,
    bounceVelocity: 636,  // Increased to bounce ~280px higher (520² + 560*240 = 636²)
    horizontalSpeedRange: [110, 160],  // Much reduced horizontal speed
    nextSize: 'small',
  },
  small: {
    textureKey: 'ball-small',
    displayScale: 0.285,
    bounceVelocity: 557,  // Increased to bounce ~280px higher (420² + 560*240 = 557²)
    horizontalSpeedRange: [120, 170],  // Much reduced horizontal speed
    nextSize: 'mini',
  },
  mini: {
    textureKey: 'ball-mini',
    displayScale: 0.18,
    bounceVelocity: 500,  // Increased to bounce ~280px higher (340² + 560*240 = 500²)
    horizontalSpeedRange: [130, 180],  // Much reduced horizontal speed
  },
}

// Available brands organized by category
const FOOD_BRANDS = ['cocacola', 'mcds', 'pizzahut', 'starbucks', 'bk', 'nestle']
const TECH_BRANDS = ['amazon', 'google', 'microsoft', 'intel', 'xbox', 'dell', 'hp', 'disneyplus', 'chevron', 'puma', 'zara', 'airbnb']

// Brand assignment system: ensures unique brands per size within level and minimizes repetition across levels
function generateBrandAssignments(levelIndex: number, usedBrands: Set<string>, previousLevelBrands?: string[]): [string, string, string, string] {
  // Determine which category to use based on level
  const useFoodBrands = levelIndex < 2 || levelIndex >= 9
  
  // Get available brands for this category
  const availableBrands = useFoodBrands ? [...FOOD_BRANDS] : [...TECH_BRANDS]
  
  // Filter out brands used in previous level
  const brandsExcludingPrevious = previousLevelBrands 
    ? availableBrands.filter(b => !previousLevelBrands.includes(`ball-${b}`))
    : availableBrands
  
  // Filter out recently used brands (prioritize unused brands)
  const unusedBrands = brandsExcludingPrevious.filter(b => !usedBrands.has(`ball-${b}`))
  const brandsToUse = unusedBrands.length >= 4 ? unusedBrands : brandsExcludingPrevious
  
  // Shuffle to randomize selection
  const shuffled = [...brandsToUse].sort(() => Math.random() - 0.5)
  
  // Select 4 unique brands for the 4 sizes
  const selected: string[] = []
  const selectedSet = new Set<string>()
  
  for (let i = 0; i < 4 && i < shuffled.length; i++) {
    let brand = shuffled[i]
    let attempts = 0
    // Ensure we get 4 unique brands and avoid cocacola/pizzahut together
    while ((selectedSet.has(brand) || 
            (brand === 'cocacola' && selectedSet.has('pizzahut')) ||
            (brand === 'pizzahut' && selectedSet.has('cocacola'))) && attempts < 50) {
      brand = shuffled[(i + attempts) % shuffled.length]
      attempts++
    }
    // If we still can't find a valid brand, try all available brands
    if (selectedSet.has(brand) || 
        (brand === 'cocacola' && selectedSet.has('pizzahut')) ||
        (brand === 'pizzahut' && selectedSet.has('cocacola'))) {
      const remaining = brandsToUse.filter(b => 
        !selectedSet.has(b) && 
        !(b === 'cocacola' && selectedSet.has('pizzahut')) &&
        !(b === 'pizzahut' && selectedSet.has('cocacola'))
      )
      if (remaining.length > 0) {
        brand = remaining[0]
      }
    }
    selected.push(brand)
    selectedSet.add(brand)
  }
  
  // Fill remaining slots if needed (shouldn't happen with current brand counts)
  while (selected.length < 4) {
    const remaining = brandsToUse.filter(b => 
      !selectedSet.has(b) &&
      !(b === 'cocacola' && selectedSet.has('pizzahut')) &&
      !(b === 'pizzahut' && selectedSet.has('cocacola'))
    )
    if (remaining.length > 0) {
      selected.push(remaining[0])
      selectedSet.add(remaining[0])
    } else {
      // Fallback: reuse brands if we run out (but still avoid cocacola/pizzahut together)
      const fallbackBrands = availableBrands.filter(b =>
        !(b === 'cocacola' && selectedSet.has('pizzahut')) &&
        !(b === 'pizzahut' && selectedSet.has('cocacola'))
      )
      if (fallbackBrands.length > 0) {
        selected.push(fallbackBrands[selected.length % fallbackBrands.length])
        selectedSet.add(fallbackBrands[selected.length % fallbackBrands.length])
      } else {
        // Last resort: just use any brand
        selected.push(availableBrands[selected.length % availableBrands.length])
      }
    }
  }
  
  // Exclude specific brands from mini balls: nestle, disney (disneyplus), intel, puma, zara
  const excludedMiniBrands = ['nestle', 'disneyplus', 'intel', 'puma', 'zara']  // disneyplus is the actual brand name in TECH_BRANDS
  let miniBrand = selected[3]
  
  // If the selected mini brand is excluded, find an alternative
  if (excludedMiniBrands.includes(miniBrand)) {
    const availableForMini = brandsToUse.filter(b => 
      !excludedMiniBrands.includes(b) && 
      !selected.slice(0, 3).includes(b)  // Don't use brands already assigned to large/medium/small
    )
    if (availableForMini.length > 0) {
      miniBrand = availableForMini[0]
    } else {
      // Fallback: use any brand that's not excluded
      const fallbackBrands = availableBrands.filter(b => !excludedMiniBrands.includes(b))
      if (fallbackBrands.length > 0) {
        miniBrand = fallbackBrands[0]
      }
    }
  }
  
  // Return as [large, medium, small, mini] format
  return [
    `ball-large-${selected[0]}`,
    `ball-medium-${selected[1]}`,
    `ball-small-${selected[2]}`,
    `ball-mini-${miniBrand}`,
  ]
}

// Generate brand assignments for all levels
const LEVEL_BRAND_ASSIGNMENTS: Array<[string, string, string, string]> = []
const globalUsedBrands = new Set<string>()

for (let i = 0; i < 12; i++) {
  // Get brands from previous level to avoid reusing them
  const previousLevelBrands = i > 0 ? LEVEL_BRAND_ASSIGNMENTS[i - 1] : undefined
  const assignments = generateBrandAssignments(i, globalUsedBrands, previousLevelBrands)
  LEVEL_BRAND_ASSIGNMENTS.push(assignments)
  // Track used brands (but allow some reuse after a few levels)
  assignments.forEach(brand => {
    globalUsedBrands.add(brand)
    // Remove brands from tracking after 3 levels to allow reuse
    if (i >= 3) {
      const oldAssignments = LEVEL_BRAND_ASSIGNMENTS[i - 3]
      if (oldAssignments) {
        oldAssignments.forEach(oldBrand => globalUsedBrands.delete(oldBrand))
      }
    }
  })
}

const LEVEL_BALL_WAVES: Array<Array<{ size: BallSize; textureKey: string }>> = [
  [{ size: 'small', textureKey: 'ball-small' }],
  [
    { size: 'small', textureKey: 'ball-small' },
    { size: 'small', textureKey: 'ball-small' },
  ],
  [
    { size: 'small', textureKey: 'ball-small' },
    { size: 'small', textureKey: 'ball-small' },
    { size: 'small', textureKey: 'ball-small' },
  ],
  [{ size: 'medium', textureKey: 'ball-medium' }],
  [
    { size: 'medium', textureKey: 'ball-medium' },
    { size: 'small', textureKey: 'ball-small' },
  ],
  [
    { size: 'medium', textureKey: 'ball-medium' },
    { size: 'medium', textureKey: 'ball-medium' },
  ],
  [{ size: 'large', textureKey: 'ball-large' }],
  [
    { size: 'large', textureKey: 'ball-large-a' },
    { size: 'small', textureKey: 'ball-small' },
  ],
  [
    { size: 'large', textureKey: 'ball-large-b' },
    { size: 'medium', textureKey: 'ball-medium' },
  ],
  [
    { size: 'large', textureKey: 'ball-large-c' },
    { size: 'large', textureKey: 'ball-large' },
  ],
  [
    { size: 'large', textureKey: 'ball-large-a' },
    { size: 'medium', textureKey: 'ball-medium' },
    { size: 'small', textureKey: 'ball-small' },
  ],
]

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private fireKey!: Phaser.Input.Keyboard.Key
  private bullets!: Phaser.Physics.Arcade.Group
  private balls!: Phaser.Physics.Arcade.Group
  private powerUps!: Phaser.Physics.Arcade.Group
  private ground!: Phaser.Physics.Arcade.Image
  private scoreText!: Phaser.GameObjects.Text
  private scoreTriangleText?: Phaser.GameObjects.Text  // Red triangle for boss level scores
  private livesText!: Phaser.GameObjects.Text
  private settingsButton!: Phaser.GameObjects.Text
  private tauntButton?: Phaser.GameObjects.Container
  private leftButton?: Phaser.GameObjects.Container
  private rightButton?: Phaser.GameObjects.Container
  private upButton?: Phaser.GameObjects.Container
  private downButton?: Phaser.GameObjects.Container
  private throwButton?: Phaser.GameObjects.Container
  private touchLeft = false
  private touchRight = false
  private touchUp = false
  private touchDown = false
  private touchThrow = false
  private touchUpJustPressed = false
  private backgroundLayer!: Phaser.GameObjects.Image
  private currentLevelIndex = 0
  private hudContainer!: Phaser.GameObjects.Container
  private levelText!: Phaser.GameObjects.Text
  private levelUnderline?: Phaser.GameObjects.Rectangle
  private gameplayHeight = 0
  private settingsPanel?: Phaser.GameObjects.Container
  private settingsPanelOpenTime = 0  // Timestamp when settings panel was opened (to prevent immediate closing)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private keepBoycottingButton?: Phaser.GameObjects.Text  // Store reference to Keep Boycotting button (stored at line 2619)
  private settingsOptionsMap: Map<string, Phaser.GameObjects.Text> = new Map()
  private instructionsOverlay?: Phaser.GameObjects.Rectangle
  private instructionsPanel?: Phaser.GameObjects.Container
  private levelSelectionPanel?: Phaser.GameObjects.Container
  private creditsPanel?: Phaser.GameObjects.Container
  private creditsOverlay?: Phaser.GameObjects.Rectangle
  private levelButtons: Phaser.GameObjects.Container[] = []  // Store city containers for cleanup
  private currentlyPressedCity: Phaser.GameObjects.Container | null = null  // Track currently selected city
  private lastFired = 0
  private score = 0
  private lives = 3
  private fireRate = DIFFICULTY_PRESETS.stormWarning.fireRate
  private isPausedForSettings = false
  private isPausedForDeath = false  // Pause game during death sequence
  private deathCount = 0  // Track number of deaths to increase power-up spawn chance
  private settings!: GameSettings
  private currentDifficultyKey: DifficultyKey = 'stormWarning'
  private currentDifficultyConfig: DifficultyPreset = DIFFICULTY_PRESETS.stormWarning
  private previousTimeScale = 1
  private facing: 'left' | 'right' = 'right'
  private groundYPosition = 0
  private isThrowing = false
  private isAiming = false  // True when shoot button is held down (cocking back)
  private isTaunting = false
  private currentTauntFrame = 1  // Toggle between 1 (taunt) and 2 (taunt2)
  private isJumping = false
  private hasDoubleJumped = false  // Track if double jump has been used in boss levels
  private jumpBufferTime: number | null = null  // Store timestamp when jump was pressed in air (for jump buffering)
  private jumpBufferWindow = 300  // Time window in ms to buffer jump input before landing
  private isCrouching = false
  private justExitedCrouch = false
  private tauntGravityDisabled = false
  private standingJumpDirection: 'left' | 'right' = 'left'
  private currentJumpDirection: 'left' | 'right' = 'left'
  private currentJumpFrameIndex = 0  // Tracks which jump frame (0 = jump2, 1 = jump3)
  private tauntKey?: Phaser.Input.Keyboard.Key
  private normalGravityY = 350
  private jumpGravityY = 200
  private isGameActive = false
  private isInvulnerable = false
  private isAdvancingLevel = false  // Prevent multiple level advances
  private shieldBubble?: Phaser.GameObjects.Image  // Visual bubble for shield power-up
  private isSlowMotion = false  // Track slow motion state
  private slowMotionTimer?: Phaser.Time.TimerEvent
  private shieldTimer?: Phaser.Time.TimerEvent
  private jetShakeTimer?: Phaser.Time.TimerEvent  // Continuous shake timer for jet
  private powerUpIndicators: Map<string, {
    text: Phaser.GameObjects.Text
    progressBar: Phaser.GameObjects.Graphics
    progressBarBg: Phaser.GameObjects.Graphics
    tween?: Phaser.Tweens.Tween
  }> = new Map()  // Support multiple power-ups (shield, slow motion)
  private lifeGainText?: Phaser.GameObjects.Text  // "+ life" text
  private invulnerabilityTimer?: Phaser.Time.TimerEvent
  private startOverlay?: Phaser.GameObjects.Rectangle
  private startPanel?: Phaser.GameObjects.Container
  private startTitleText?: Phaser.GameObjects.Text
  private startTitleBg?: Phaser.GameObjects.Graphics
  private startMessageText?: Phaser.GameObjects.Text
  private firstLineText?: Phaser.GameObjects.Text
  private firstLineUnderline?: Phaser.GameObjects.Graphics
  private victoryUnderline?: Phaser.GameObjects.Graphics
  private freeFalasteenText?: Phaser.GameObjects.Text
  private startButtonText?: Phaser.GameObjects.Text
  private scoreLabelText?: Phaser.GameObjects.Text
  private scoreNumberText?: Phaser.GameObjects.Text
  private destroyedText?: Phaser.GameObjects.Text  // Text showing "Destroyed 1 jet and 3 tanks"
  private startVolumeLabelText?: Phaser.GameObjects.Text
  private startVolumeStatusText?: Phaser.GameObjects.Text
  private unmuteText?: Phaser.GameObjects.Text
  private totalBubblesDestroyed = 0
  private basePlayerScale = 1
  private startMessageBaseY = 0
  // Removed: standingColliderWidth and standingColliderHeight
  // Now using current display dimensions in setupPlayerCollider to account for crouch scaling
  private targetFootY = 0  // Target Y position for Bittee's feet to maintain consistent alignment
  private transitionTargetY = 0  // Stored target Y during crouch exit transition to enforce consistently
  private postTransitionFrameCount = 0  // Track frames after transition to monitor position
  private postTransitionLockFrames = 0  // Lock position for N frames after transition completes
  private wasTouchingGroundWhenGravityEnabled = false  // Track if body was touching ground when gravity enabled
  private lastCrouchTime: number | null = null
  private isAirCrouching = false
  private isTransitioning = false  // Flag to prevent position adjustments during animation transitions
  private transitionFrameCount = 0  // Counter for transition frames
  // Boss level state
  private isBossLevel = false
  private bossPhase: 'jet' | 'tank1' | 'tank2' | 'tank3' | 'victory' = 'jet'
  private jet?: Phaser.Physics.Arcade.Sprite
  private jetHealth = 5
  private jetHealthBar?: Phaser.GameObjects.Graphics
  private jetHealthBarBg?: Phaser.GameObjects.Graphics
  private jetDirection: 'left' | 'right' = 'right'
  private jetY = 0
  private jetTimer?: Phaser.Time.TimerEvent
  private jetSpeed = 800  // Base speed, increases each pass
  private jetPassCount = 0  // Track number of passes to increase speed
  private jetContrail1?: Phaser.GameObjects.Image  // Active contrail1 attached to jet
  private jetContrail2?: Phaser.GameObjects.Image  // Active contrail2 attached to jet
  private jetContrails: Array<{ contrail1: Phaser.GameObjects.Image | undefined; contrail2: Phaser.GameObjects.Image; x: number; y: number; scale: number; alpha: number; fadeSpeed: number }> = []  // Left-behind contrails (visual only, no physics)
  private jetDestroyed = false  // Track if jet is destroyed to fade contrails
  private isTankPhase = false  // Track if we're in tank phase (bullets shoot down by default)
  private tanks: Phaser.Physics.Arcade.Sprite[] = []
  private tankHealthBars: Phaser.GameObjects.Graphics[] = []
  private tankHealthBarBgs: Phaser.GameObjects.Graphics[] = []
  private tankHealths: number[] = []
  private tankDirections: number[] = []  // 1 for right, -1 for left
  private tankDirectionLockTimes: number[] = []  // Timestamp when tank can move again after direction change
  private tankLastPositions: number[] = []  // Track last X position to detect stuck tanks
  private tankStuckFrames: number[] = []  // Count frames tank hasn't moved
  private tankShakeTimers: number[] = []  // Timestamp of last shake to prevent creating too many tweens
  private tanksDestroyedCount = 0  // Track how many tanks have been destroyed
  private currentTankIndex = 0
  private enemies!: Phaser.Physics.Arcade.Group
  // Audio
  private backgroundMusic1?: Phaser.Sound.BaseSound
  private backgroundMusic2?: Phaser.Sound.BaseSound
  private currentMusicTrack: 1 | 2 = 1
  private settingsMusic?: Phaser.Sound.BaseSound
  private bossMusic?: Phaser.Sound.BaseSound
  private soundEffects: Map<string, Phaser.Sound.BaseSound> = new Map()
  private runSoundPlaying = false
  private projectedHitIndicators: Map<Phaser.Physics.Arcade.Image, Phaser.GameObjects.Text> = new Map()
  private enemyHitIndicators: Map<Phaser.Physics.Arcade.Sprite, Phaser.GameObjects.Text> = new Map()  // Triangles above jet/tanks when hit
  private jetHitIndicatorActive = false  // Track if jet has an active hit indicator for current fly-by
  private tankHitIndicatorTimers: Map<number, Phaser.Time.TimerEvent> = new Map()  // Track timers for tank hit indicators
  private tankLastFlipTime: Map<number, number> = new Map()  // Track when each tank last flipped
  private bulletTargetMap: Map<Phaser.Physics.Arcade.Image, Phaser.Physics.Arcade.Image> = new Map() // bullet -> target ball
  private rockAmmo: Array<{ type: 'normal' | 'red' | 'green', ammo: number }> = []  // Queue of rock types
  private isAutoFireActive = false  // Auto-fire mode (green slingshot)
  private autoFireTimer?: Phaser.Time.TimerEvent  // Timer for auto-fire duration
  private autoFireStartTime = 0  // Track when auto-fire started
  private autoFireLastShot = 0  // Track last auto-fire shot time
  private aimingTriangles: Map<Phaser.Physics.Arcade.Image, Phaser.GameObjects.Text> = new Map()  // Transparent triangles shown when aiming/cocked back
  private trianglesCleared = false  // Flag to prevent immediate recreation after clearing
  private heartbeatSound?: Phaser.Sound.BaseSound
  private currentHeartbeatType: 'slow' | 'medium' | 'fast' | null = null
  private jetSoundCount = 0
  private timeSoundInstances: Phaser.Sound.BaseSound[] = []
  private lastMemoryCleanup: number = 0  // Track last memory cleanup time

  constructor() {
    super('MainScene')
  }

  init(data: { difficultyKey?: DifficultyKey; settings?: Partial<GameSettings> } = {}): void {
    const storedSettings = this.registry.get('game-settings') as GameSettings | undefined
    const baseSettings = storedSettings ? { ...storedSettings } : { ...DEFAULT_SETTINGS }
    this.settings = { ...baseSettings, ...data.settings }

    if (data.difficultyKey) {
      this.settings.difficulty = data.difficultyKey
    }

    if (typeof data.settings?.levelIndex === 'number') {
      this.settings.levelIndex = data.settings.levelIndex
    }

    this.currentDifficultyKey = this.settings.difficulty
    this.currentDifficultyConfig = DIFFICULTY_PRESETS[this.currentDifficultyKey]
    this.fireRate = this.currentDifficultyConfig.fireRate

    this.currentLevelIndex = Phaser.Math.Clamp(this.settings.levelIndex ?? 0, 0, LEVEL_DEFINITIONS.length - 1)
    this.settings.levelIndex = this.currentLevelIndex

    this.registry.set('game-settings', this.settings)

    // DISABLED: localStorage - volume doesn't need to be saved, levels unlocked by default
    // if (typeof window !== 'undefined' && window.localStorage) {
    // }
  }

  preload(): void {
    
    // Create loading UI
    const width = this.scale.width
    const height = this.scale.height
    const centerX = width / 2
    const centerY = height / 2

    // Loading text
    const loadingText = this.add.text(centerX, centerY - 5, 'Resisting..', {
      fontSize: '48px',
      fontFamily: 'MontserratBold',
      color: '#e0d5b6',
    })
    loadingText.setOrigin(0.5)

    // Loading bar background
    const barWidth = width * 0.6
    const barHeight = 20
    const barBg = this.add.rectangle(centerX, centerY + 50, barWidth, barHeight, 0x2a2a2a)
    barBg.setStrokeStyle(2, 0xe0d5b6)

    // Loading bar fill
    const barFill = this.add.rectangle(centerX - barWidth / 2, centerY + 50, 0, barHeight, 0xe0d5b6)
    barFill.setOrigin(0, 0.5)

    // Listen for loading progress
    this.load.on('progress', (progress: number) => {
      barFill.width = barWidth * progress
    })

    // Add error handling for failed image loads
    // DISABLED: Console logging in production - commented out for potential future use
    // this.load.on('loaderror', (file: Phaser.Loader.File) => {
    //   console.warn(`Load error for file: ${file.key}, path: ${file.url}`)
    //   // Don't retry - just log the warning and continue
    //   // Images should still load directly from URLs even if processing fails
    // })

    // DISABLED: Console error override - commented out for potential future use
    // Override console.error to suppress CSP blob URL errors during image processing
    // These are non-fatal - Phaser will fall back to direct image URLs
    // Only suppress during the loading phase to avoid hiding other important errors
    // const originalConsoleError = console.error
    // const cspErrorPattern = /Refused to load blob:|Failed to process file: image/
    // let isSuppressingErrors = true
    // 
    // console.error = (...args: unknown[]) => {
    //   if (isSuppressingErrors) {
    //     const message = String(args[0] || '')
    //     // Suppress CSP blob URL errors - they're non-fatal
    //     if (cspErrorPattern.test(message)) {
    //       // Silently ignore - images will still work via direct URLs
    //       return
    //     }
    //   }
    //   // Log other errors normally
    //   originalConsoleError.apply(console, args)
    // }

    // DISABLED: Console error restore - commented out for potential future use
    // Restore console.error after loading completes
    // this.load.once('complete', () => {
    //   isSuppressingErrors = false
    //   console.error = originalConsoleError
    // })

    // Hide loading UI when complete
    this.load.on('complete', () => {
      loadingText.destroy()
      barBg.destroy()
      barFill.destroy()
    })

    this.generateProceduralTextures()
    this.loadBitteeAssets()
    this.loadLevelAssets()
    this.loadBallAssets()
    this.loadBossAssets()
    this.loadAudioAssets()
    this.load.start()
  }

  create(): void {
    
    this.score = 0
    this.lives = this.currentDifficultyConfig.startingLives
    this.lastFired = 0
    this.fireRate = this.currentDifficultyConfig.fireRate

    // TEMPORARILY DISABLED: Image processing causes blob URL CSP issues on Neocities
    // TODO: Re-enable with a solution that doesn't create blob URLs
    // this.normalizeBitteeTextures()
    // this.prepareBallTextures()
    // Optimization #1: Don't generate all bubbles upfront - generate on-demand per level
    // this.prepareGlassBubbles()  // Removed - now lazy-loaded
    // this.cleanRockTexture()

    const worldWidth = this.scale.width
    const worldHeight = this.scale.height

    // Slightly taller gameplay area and shorter HUD, which also raises the ground line.
    this.gameplayHeight = worldHeight * 0.6
    const hudHeight = worldHeight - this.gameplayHeight

    const level = LEVEL_DEFINITIONS[this.currentLevelIndex]
    this.backgroundLayer = this.add.image(worldWidth / 2, this.gameplayHeight / 2, level.key)
    this.updateBackgroundScale()
    this.backgroundLayer.setDepth(-3)
    this.backgroundLayer.setScrollFactor(0)

    const gradientBg = this.add.graphics()
    gradientBg.setDepth(-4)
    gradientBg.setScrollFactor(0)
    const gradientSteps = 8
    const stepHeight = this.gameplayHeight / gradientSteps
    for (let i = 0; i < gradientSteps; i++) {
      const y = i * stepHeight
      const ratio = i / (gradientSteps - 1)
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x0d1b2a),
        Phaser.Display.Color.ValueToColor(0x1a2f3f),
        gradientSteps,
        Math.floor(ratio * gradientSteps)
      )
      gradientBg.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 0.6)
      gradientBg.fillRect(0, y, worldWidth, stepHeight)
    }

    this.sound.volume = VOLUME_LEVELS[this.settings.volumeIndex].value

    // Unlock audio context early (before initializing sounds)
    // This is critical for mobile browsers
    this.unlockAudioContext()

    // Initialize audio
    this.initializeAudio()
    
    // Unlock again after initialization to ensure it's active
    setTimeout(() => {
      this.unlockAudioContext()
    }, 100)

    const keyboard = this.input.keyboard
    if (!keyboard) {
      throw new Error('Keyboard input plugin not available')
    }

    this.cursors = keyboard.createCursorKeys()
    this.fireKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.tauntKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)

    keyboard.on('keydown-ESC', () => {
      if (this.isPausedForSettings) {
        // Check if any nested modal is open first
        const hasNestedModal = this.hasNestedModalOpen()
        if (hasNestedModal) {
          // Close nested modal directly (don't restore settings handlers)
          if (this.instructionsPanel && this.instructionsPanel.active) {
            this.instructionsPanel.setVisible(false)
            this.instructionsPanel.setActive(false)
            if (this.instructionsOverlay) {
              this.instructionsOverlay.setVisible(false)
              this.instructionsOverlay.disableInteractive()
            }
          }
          if (this.creditsPanel && this.creditsPanel.active) {
            this.creditsPanel.setVisible(false)
            this.creditsPanel.setActive(false)
            if (this.creditsOverlay) {
              this.creditsOverlay.setVisible(false)
              this.creditsOverlay.disableInteractive()
            }
          }
          if (this.levelSelectionPanel && this.levelSelectionPanel.active) {
            this.levelSelectionPanel.destroy()
            this.levelSelectionPanel = undefined
            this.levelButtons.forEach((btn) => {
              if (btn && btn.scene) {
                btn.destroy()
              }
            })
            this.levelButtons = []
            this.currentlyPressedCity = null
          }
          // Close boycotted modal - destroy all objects with isBoycottedModal flag
          const boycottedObjects = this.children.list.filter((child) => {
            return child && (child as any).getData && (child as any).getData('isBoycottedModal') === true
          })
          boycottedObjects.forEach((obj) => {
            if (obj && obj.scene) {
              obj.destroy()
            }
          })
          // Also destroy any description tooltips
          this.children.list.forEach((child) => {
            if (child instanceof Phaser.GameObjects.Container && child.getData('isBrandDescription')) {
              child.destroy()
            }
          })
          // Double-check: destroy any remaining graphics or text objects that might be part of the modal
          // This ensures the return button shadow and all other elements are cleaned up
          this.children.list.forEach((child) => {
            if (child && (child as any).getData && (child as any).getData('isBoycottedModal') === true) {
              if (child && child.scene) {
                child.destroy()
              }
            }
          })
          // Remove keyboard handlers
          const keyboard = this.input.keyboard
          if (keyboard) {
            keyboard.removeAllListeners('keydown-ENTER')
            keyboard.removeAllListeners('keydown-SPACE')
          }
          // Then close settings and resume game
          if (this.isPausedForSettings && this.settingsPanel) {
            this.closeSettingsPanel()
          }
        } else {
          // No nested modal - just close settings
          this.closeSettingsPanel()
        }
      } else {
        this.openSettingsPanel()
      }
    })
    
    // Enter key: Press Yella button if start modal is visible, or Configure button if game is active
    keyboard.on('keydown-ENTER', () => {
      if (this.startPanel?.visible && this.startButtonText) {
        // Actually trigger the button click by calling startGame
        const isRespawn = this.startButtonText?.getData('isRespawnButton') === true
        this.startGame(isRespawn)
      } else if (!this.isPausedForSettings && this.isGameActive && !this.startPanel?.visible) {
        // Act as configure button - same check as configure button (just !isPausedForSettings)
        this.openSettingsPanel()
      }
    })

    this.physics.world.setBounds(0, 0, worldWidth, this.gameplayHeight)
    

    // Very thin ground (1 pixel) so there's no bottom edge - only the top edge matters
    const groundThickness = 1
    // True ground: top edge at the game/HUD boundary line.
    // Use locked GROUND_Y_OFFSET constant to prevent accidental changes
    const groundTop = this.gameplayHeight + GROUND_Y_OFFSET  // Locked ground position
    // Place the physics ground so its TOP edge is exactly at groundTop
    // With 1px thickness, center is at groundTop + 0.5, so top edge is at groundTop
    // Balls bounce off the ground collider center, so we use groundTop as the reference
    const groundY = groundTop + groundThickness / 2
    this.groundYPosition = groundTop  // Top edge of ground - this is where collision box bottom should be

    if (this.ground) {
      this.ground.destroy()
    }
    this.ground = this.physics.add.staticImage(worldWidth / 2, groundY, 'ground')
    this.ground.setDisplaySize(worldWidth, groundThickness)
    this.ground.refreshBody()
    this.ground.setVisible(false)

    // Visual ground matches the physics ground
    const groundVisual = this.add.rectangle(worldWidth / 2, groundY, worldWidth, groundThickness, 0x1a2735, 1)
    groundVisual.setDepth(-1)
    
    // Add visible dark gray ground line for reference (at adjusted ground position)
    const groundLine = this.add.rectangle(worldWidth / 2, this.groundYPosition, worldWidth, 3, 0x4a4a4a, 1)
    groundLine.setDepth(5) // Above ground but below player
    
    // Debug line removed - no longer needed

    // NEW: Position sprite at ground level (body will be positioned by setupPlayerCollider)
    // Body position is source of truth, sprite follows with visual offsets
    this.player = this.physics.add.sprite(worldWidth / 2, this.groundYPosition, BITTEE_SPRITES.stand.key)
    this.player.setOrigin(0.5, 1)  // Bottom center origin
    this.player.setDepth(10)
    this.player.setCollideWorldBounds(true)

    const baseHeight = this.player.height || 1
    const targetScale = (BITTEE_TARGET_HEIGHT / baseHeight) * 1.5
    this.player.setScale(targetScale)
    this.basePlayerScale = targetScale

    // Setup collision box (NO OFFSETS - body position is collision position)
    this.setupPlayerCollider(0)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setMaxVelocity(PLAYER_SPEED, 2600)
    playerBody.setDragX(0)
    playerBody.setFriction(1, 0)
    playerBody.setGravityY(this.normalGravityY)
    
    // NEW: No syncing needed - body is source of truth, sprite follows in postUpdate()

    this.createBitteeAnimations()
    this.player.anims.play('bittee-idle')

    // Store the target foot Y position (ground level)
    this.targetFootY = this.groundYPosition
    
    // NEW: Animation listener disabled - postUpdate() handles all positioning
    // The old listener was fighting with postUpdate() and causing position mismatches
    // postUpdate() runs every frame and is the final authority on positioning
    this.player.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => {
      // Do nothing - let postUpdate() handle all positioning
      // This prevents conflicts between animation frame changes and physics positioning
    })

    this.facing = 'right'
    this.setIdlePose(true)

    this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation: Phaser.Animations.Animation) => {
      if (animation.key === 'bittee-throw') {
        this.onThrowAnimationComplete()
      } else if (animation.key === 'bittee-jump-squat-left' || animation.key === 'bittee-jump-squat-right') {
        // ensure jump transitions if squat finishes without lift-off
        if (this.isJumping) {
          const body = this.player.body as Phaser.Physics.Arcade.Body | null
          if (body && !body.blocked.down) {
            const airKey = this.currentJumpDirection === 'left' ? 'bittee-jump-air-left' : 'bittee-jump-air-right'
            if (this.anims.exists(airKey)) {
              this.player.anims.play(airKey, true)
            }
          }
        }
      }
    })

    this.enemies = this.physics.add.group()
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 20,
      allowGravity: false,
    })

    this.balls = this.physics.add.group({
      // No bounce here - we handle bounce manually per ball size
      collideWorldBounds: true,
    })

    this.powerUps = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      allowGravity: true,
    })

    // Player-ground collision with custom callback to prevent incorrect positioning
    this.physics.add.collider(
      this.player, 
      this.ground,
      undefined, // process callback
      undefined, // callback context
      (playerObj, groundObj) => {
        // Custom collision callback - prevent default resolution when idle
        // We handle positioning manually, so we don't need Phaser's automatic resolution
        const body = (playerObj as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
        if (body && !this.isJumping && !this.isCrouching) {
          // Body is already positioned correctly by our code
          // Don't let Phaser's collision resolution move it
          return false // Return false to skip default collision resolution
        }
        return true // Allow default resolution for jumps/crouches
      }
    )
    
    // Power-ups collider with ground - track when they hit the floor
    this.physics.add.collider(this.powerUps, this.ground, (powerUpObj) => {
      const powerUp = powerUpObj as Phaser.Physics.Arcade.Image
      const body = powerUp.body as Phaser.Physics.Arcade.Body
      if (!powerUp || !powerUp.active || !body) return
      
      // Check if power-up is actually touching the ground (not just colliding)
      const isTouchingGround = body.touching.down || body.blocked.down
      
      // Mark that this power-up has hit the ground and stop sliding
      if (isTouchingGround && !powerUp.getData('hasHitGround')) {
        powerUp.setData('hasHitGround', true)
        
        // Stop horizontal movement to prevent sliding
        body.setVelocityX(0)
        body.setFrictionX(1)
        body.setBounce(0, 0)  // Remove bounce after hitting ground
        
        // Start blinking after 2 seconds from hitting ground
        this.time.delayedCall(2000, () => {
          if (powerUp && powerUp.active) {
            powerUp.setData('isBlinking', true)
            // Start blinking animation
            const blinkTween = this.tweens.add({
              targets: powerUp,
              alpha: { from: 1, to: 0.3 },
              duration: 200,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            })
            powerUp.setData('blinkTween', blinkTween)
          }
        })
        
        // Disappear after 5 seconds from hitting ground
        this.time.delayedCall(5000, () => {
          if (powerUp && powerUp.active) {
            // Stop any blinking tweens before destroying
            const blinkTween = powerUp.getData('blinkTween')
            if (blinkTween) {
              this.tweens.killTweensOf(powerUp)
            }
            powerUp.destroy()
          }
        })
      }
    })
    
    // Simple bounce system: always apply correct bounce velocity when ball hits ground
    // This ensures split balls (which may fall from high up) always bounce to their set max height
    // Use processCallback to fire every frame while colliding, not just on first contact
    this.physics.add.collider(
      this.balls, 
      this.ground, 
      (ballObj) => {
        const ball = ballObj as Phaser.Physics.Arcade.Image
        const body = ball.body as Phaser.Physics.Arcade.Body
        if (!body || !ball.active) {
          return
        }
      
      // Ground bounce detection is now handled in checkBallBounces() using velocity changes
      // This is more reliable than tracking touch states

      const size = ball.getData('size') as BallSize
      const rule = BALL_RULES[size]
      // Always use the rule's bounce velocity for consistency
      // For mini balls, always use the rule's bounce velocity to ensure consistent bounce regardless of when/where they were split
      const correctBounceVelocity = rule.bounceVelocity
      
      // FIX: Use the actual ball gravity (240) for all calculations, not the default 350
      const ballGravity = body.gravity.y || 240  // Get actual gravity from body, default to 240
      
      // Ensure mini balls never bounce lower than Bittee's head
      // Bittee's head is approximately at groundYPosition - BITTEE_TARGET_HEIGHT
      const bitteeHeadY = this.groundYPosition - BITTEE_TARGET_HEIGHT
      const maxBounceHeight = (correctBounceVelocity * correctBounceVelocity) / (2 * ballGravity)
      const bounceTopY = this.groundYPosition - maxBounceHeight
      
      // If the bounce would be lower than Bittee's head, increase bounce velocity slightly
      let finalBounceVelocity = correctBounceVelocity
      if (bounceTopY < bitteeHeadY && size === 'mini') {
        // Calculate required velocity to bounce to Bittee's head level
        const requiredHeight = this.groundYPosition - bitteeHeadY
        const requiredVelocity = Math.sqrt(requiredHeight * 2 * ballGravity)
        finalBounceVelocity = Math.max(correctBounceVelocity, requiredVelocity)
      }
      
      // Always apply the exact bounce velocity for consistency (like pea shootin pete)
      // This ensures balls always bounce at their correct max height after the first bounce,
      // regardless of how high they were spawned or how they fell
      let bounceVel = finalBounceVelocity
      
      // FIX: Reduce gravity for balls to make them hang in the air longer
      // Lower gravity = slower fall = more hang time
      // Normal gravity is 350, we'll use 240 (31% reduction) for more floaty feel
      // CRITICAL: Don't modify gravity here if slow motion is active - let the slow motion system handle it
      // This prevents gravity from being set incorrectly during slow motion
      const baseGravity = 240
      const hasSlowMotion = ball.getData('slowMotionApplied') as boolean
      
      // Only set gravity if slow motion hasn't been applied yet (let slow motion system handle it)
      if (!this.isSlowMotion || !hasSlowMotion) {
        body.setGravityY(baseGravity)
      }
      // If slow motion is active and already applied, don't touch gravity here
      
      const currentVelX = body.velocity.x
      const currentVelYBefore = body.velocity.y
      
      // CRITICAL FIX: Always reset velocity on first ground contact to ensure consistent bounce height
      // The collision callback fires continuously, so we use a flag to ensure we only do this once per bounce
      const lastBounceFrame = ball.getData('lastBounceFrame') as number | undefined
      const currentFrame = this.game.loop.frame
      const isTouchingGround = body.touching.down || body.blocked.down
      const hasBouncedBefore = ball.getData('hasBounced') as boolean || false
      
      // CRITICAL: With bounce disabled, we MUST manually set velocity when ball hits ground
      // Check if ball is moving down (hitting ground) or if it's the first bounce
      const isMovingDown = currentVelYBefore > 0  // Positive Y velocity = falling down
      
      // For first bounce: Always reset velocity when touching ground (regardless of velocity direction)
      // This ensures split balls that spawn high always bounce to correct height
      // CRITICAL: Scale bounce velocity if slow motion is active to preserve trajectory
      const slowMotionFactor = this.isSlowMotion ? 0.3 : 1.0
      const scaledBounceVel = bounceVel * slowMotionFactor
      
      if (isTouchingGround && !hasBouncedBefore) {
        // First bounce - completely reset energy state
        const bounceVelY = -scaledBounceVel
        body.setVelocity(currentVelX * slowMotionFactor, bounceVelY)
        ball.setData('hasBounced', true)
        ball.setData('lastBounceFrame', currentFrame)
        
        // Reset peak height tracking
        ball.setData('peakHeight', 0)
        ball.setData('peakY', undefined)
        
        // FIX: If slow motion is active, ensure ball has slow motion flag set and apply it
        // This must happen on EVERY bounce, not just first bounce
        if (this.isSlowMotion) {
          if (!ball.getData('slowMotionApplied')) {
            // First time applying slow motion to this ball - store original values
            const originalVelX = currentVelX
            const originalVelY = -bounceVel
            const originalGravity = body.gravity.y || 240
            
            ball.setData('slowMotionApplied', true)
            ball.setData('originalVelX', originalVelX)
            ball.setData('originalVelY', originalVelY)
            ball.setData('originalGravity', originalGravity)
          }
          
          // Always apply slow motion factor to bounce velocity
          const slowMotionFactor = 0.3
          body.setVelocity(currentVelX * slowMotionFactor, bounceVelY)
          // Ensure gravity is also slowed
          const originalGravity = ball.getData('originalGravity') as number || 240
          body.setGravityY(originalGravity * slowMotionFactor)
        }
      } else if (isTouchingGround && isMovingDown) {
        // Subsequent bounces - only bounce if moving down (hitting ground)
        // Use frame check to prevent multiple corrections per bounce
        if (!lastBounceFrame || currentFrame - lastBounceFrame > 5) {
          const bounceVelY = -scaledBounceVel
          // Scale X velocity too if slow motion is active
          const scaledVelX = currentVelX * slowMotionFactor
          
          // FIX: If slow motion is active, ensure it's applied
          if (this.isSlowMotion) {
            if (!ball.getData('slowMotionApplied')) {
              // First time - store original values
              ball.setData('originalVelX', currentVelX)
              ball.setData('originalVelY', -bounceVel)
              ball.setData('originalGravity', body.gravity.y || 240)
              ball.setData('slowMotionApplied', true)
            }
            // Always apply slow motion to gravity
            const originalGravity = ball.getData('originalGravity') as number || 240
            body.setGravityY(originalGravity * slowMotionFactor)
          }
          
          body.setVelocity(scaledVelX, bounceVelY)
          ball.setData('lastBounceFrame', currentFrame)
        }
      }
      },
      undefined,  // collideCallback (not used)
      (ballObj: Phaser.GameObjects.GameObject) => {
        // processCallback - fires every frame while colliding
        const ball = ballObj as Phaser.Physics.Arcade.Image
        const body = ball.body as Phaser.Physics.Arcade.Body
        if (!body || !ball.active) return true
        
        return true  // Continue processing
      }
    )
    // Balls don't collide with each other

    this.physics.add.overlap(
      this.bullets,
      this.balls,
      (bulletObj, ballObj) => {
        if (!bulletObj || !ballObj) {
          return
        }
        this.handleBulletHit(
          bulletObj as Phaser.Physics.Arcade.Image,
          ballObj as Phaser.Physics.Arcade.Image,
        )
      },
      undefined,
      this,
    )

    // Use overlap to detect collision without physics interaction
    // This prevents balls from being affected by player collision
    this.physics.add.overlap(
      this.player,
      this.balls,
      (_playerObj, ballObj) => {
        if (!ballObj) {
          return
        }

        const ball = ballObj as Phaser.Physics.Arcade.Image

        // Handle damage / lives logic
        // FIX: Check both isInvulnerable AND shield bubble existence
        // Shield bubble should protect player even if isInvulnerable flag is somehow false
        const hasShield = this.shieldBubble && this.shieldBubble.active
        if (this.isInvulnerable || hasShield) {
          // If shield exists but isInvulnerable is false, fix it
          if (hasShield && !this.isInvulnerable) {
            this.isInvulnerable = true
          }
          return
        }

        this.handlePlayerHit(ball)
      },
      undefined,
      this,
    )

    // Boss level collisions
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bulletObj, enemyObj) => {
        if (!bulletObj || !enemyObj) {
          return
        }
        this.handleBulletHitEnemy(
          bulletObj as Phaser.Physics.Arcade.Image,
          enemyObj as Phaser.Physics.Arcade.Sprite,
        )
      },
      undefined,
      this,
    )

    // Power-up collection
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      (_playerObj, powerUpObj) => {
        if (!powerUpObj) {
          return
        }
        const powerUp = powerUpObj as Phaser.Physics.Arcade.Image
        // Prevent immediate collection - powerup must exist for at least 200ms before it can be collected
        const spawnTime = powerUp.getData('spawnTime') as number | undefined
        if (spawnTime && this.time.now - spawnTime < 200) {
          return  // Too soon after spawn, ignore collection
        }
        const powerUpType = powerUp.getData('type') as 'life' | 'shield' | 'time' | 'slingshot-red'
        this.collectPowerUp(powerUpType)
        powerUp.destroy()
      },
      undefined,
      this,
    )

    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_playerObj, enemyObj) => {
        if (!enemyObj) {
          return
        }
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite
        const enemyType = enemy.getData('enemyType') as string
        if (enemyType === 'jet') {
          // Jet instant kill - clean up contrails when bittee dies
          // Clean up active contrails
          if (this.jetContrail1) {
            this.jetContrail1.destroy()
            this.jetContrail1 = undefined
          }
          if (this.jetContrail2) {
            this.jetContrail2.destroy()
            this.jetContrail2 = undefined
          }
          // Clean up left-behind contrails
          this.jetContrails.forEach((contrail) => {
            if (contrail.contrail1) {
              contrail.contrail1.destroy()
            }
            if (contrail.contrail2) {
              contrail.contrail2.destroy()
            }
          })
          this.jetContrails = []
          this.lives = 0
          this.handleGameOver()
        } else if (enemyType === 'tank') {
          // Tank damage: any overlap with an active tank while Bittee is vulnerable kills,
          // regardless of direction. This makes tanks feel deadly on touch.
          // CRITICAL: Always check overlap, even if Bittee is standing still
          // FIX: Check both isInvulnerable AND shield bubble existence (same as ball collision)
          const hasShield = this.shieldBubble && this.shieldBubble.active
          if ((!this.isInvulnerable && !hasShield) && enemy && enemy.active) {
            // Force immediate hit - no additional checks needed
            this.handlePlayerHit(enemy as unknown as Phaser.Physics.Arcade.Image)
          } else if (hasShield && !this.isInvulnerable) {
            // Fix isInvulnerable if shield exists
            this.isInvulnerable = true
          }
        }
      },
      undefined,
      this,
    )

    this.createHud(worldWidth, hudHeight, this.gameplayHeight)
    this.updateHud()
    this.updateAmmoDisplay()  // Initialize ammo display
    this.createSettingsButton()
    this.ensureSettingsPanel()
    this.applyLevel(this.currentLevelIndex)
    this.refreshLevelLabel()
    this.applySettingsVisuals()

    this.showStartModal('start')

    if (!this.isGameActive) {
      this.time.delayedCall(150, () => {
        if (!this.isGameActive) {
          this.startGame()
        }
      })
    }
  }

  /**
   * CRITICAL: This runs AFTER Phaser's physics step.
   * Phaser's physics step recalculates body position incorrectly when offsets are set,
   * so we must fix it here by syncing body to sprite position.
   * 
   * The core issue: Phaser's physics step recalculates body.y incorrectly when body.setOffset() is used.
   * It subtracts the offset incorrectly, causing body.y to be ~200px off from sprite.y.
   * 
   * Solution: ALWAYS sync body to sprite position (body follows sprite, never vice versa).
   * Phaser corrupts the body position every frame, so we fix it every frame here.
   */
  /**
   * Correct body position after physics step
   * Called via physics world 'worldstep' event
   */
  postUpdate(): void {
    // Simple sprite-body sync with ground locking
    if (!this.isGameActive || this.isPausedForSettings || this.isPausedForDeath) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body || !body.enable) {
      return
    }

    // During jumps: sprite follows body (physics controls movement)
    if (this.isJumping) {
      this.player.x = body.x
      this.player.y = body.y + (body.height / 2)
      return
    }

    // Grounded: lock body to ground level, then sync sprite
    const bodyBottomY = this.groundYPosition
    const bodyCenterY = bodyBottomY - (body.height / 2)
    
    if (this.isCrouching) {
      // During crouch: body is disabled, just position it
      body.y = bodyCenterY
      this.player.x = body.x
      this.player.y = bodyBottomY
      return
    }
    
    // Lock body to ground level
    // CRITICAL: Keep gravity enabled so ground detection (blocked.down) works for jumps
    // We lock position manually, but gravity is needed for collision detection
    body.y = bodyCenterY
    body.setVelocityY(0)
    body.setAllowGravity(true)  // Keep enabled for ground detection

    // Apply visual offset for idle pose
    let visualOffsetY = 0
    if (!this.isThrowing && !this.isTaunting && !this.isTransitioning && !this.justExitedCrouch) {
      const currentAnim = this.player.anims.currentAnim?.key
      if (currentAnim === 'bittee-idle' || currentAnim === 'bittee-stand') {
        visualOffsetY = 10  // Stand pose visual offset
      }
    }
    
    // Sync sprite to body
    this.player.x = body.x
    this.player.y = body.y + (body.height / 2) + visualOffsetY
  }

  update(time: number): void {
    // Wrap update in try-catch to prevent crashes on mobile
    try {
      if (this.isPausedForSettings || !this.isGameActive || this.isPausedForDeath) {
        this.updateBossLevel()  // Still update boss level even when paused (for transitions)
        // CRITICAL: Lock player position during death pause to prevent jitter
        // Keep player at death position (could be in air or on ground)
        if (this.isPausedForDeath) {
          const deathY = this.player.y  // Keep current position (frozen at death location)
          this.player.setY(deathY)
          const body = this.player.body as Phaser.Physics.Arcade.Body | null
          if (body) {
            // Completely disable body during death pause
            body.enable = false
            body.setVelocity(0, 0)
            body.setAcceleration(0, 0)
            body.setImmovable(true)
            body.setAllowGravity(false)
            // Manually set body position to match sprite (without updateFromGameObject)
            body.x = this.player.x
            body.y = deathY
          }
        }
        return
      }
      
      this.updateBossLevel()
    
    // CRITICAL: Lock player position during crouch exit transition to prevent jitter
    // This must run at the very start of update to prevent any other systems from moving the player
    if (this.isTransitioning && this.justExitedCrouch && this.transitionTargetY > 0) {
      // Use stored target position to enforce consistently
      const targetY = this.transitionTargetY
      // Force position to stay locked - this prevents any physics or animation updates from moving player
      this.player.setY(targetY)
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body) {
        // During crouch exit: disable body completely to prevent any physics interference
        body.enable = false
        // Don't call updateFromGameObject - it can cause position drift
        // Just set position directly and keep body disabled
        body.setVelocity(0, 0)
        body.setAcceleration(0, 0)
        body.setImmovable(true)
        body.setAllowGravity(false)
        // Manually set body position to match sprite (without updateFromGameObject)
        body.x = this.player.x
        body.y = targetY
      }
    }
    
    // Let postUpdate() handle ALL positioning - it runs after physics step
    // Just ensure body is enabled when needed
    if (!this.isCrouching && !this.isJumping && !this.isThrowing && !this.isTaunting && !this.isTransitioning) {
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body && !body.enable) {
        body.enable = true
      }
    }
    
    // Clear transition flags after frame count expires (for non-crouch transitions)
    if (this.isTransitioning && !this.justExitedCrouch && this.transitionFrameCount > 0) {
      this.transitionFrameCount--
      if (this.transitionFrameCount <= 0) {
        this.isTransitioning = false
        this.transitionFrameCount = 0
        // Ensure body is re-enabled when transition ends
        const body = this.player.body as Phaser.Physics.Arcade.Body | null
        if (body && !body.enable) {
          body.enable = true
          body.setImmovable(false)
          body.setAllowGravity(true)
        }
      }
    }
    
    // Safety check: Ensure body is enabled when not in any transition
    if (!this.isTransitioning && !this.isCrouching && !this.isJumping) {
      const safetyBody = this.player.body as Phaser.Physics.Arcade.Body | null
      if (safetyBody && !safetyBody.enable) {
        safetyBody.enable = true
        safetyBody.setImmovable(false)
        safetyBody.setAllowGravity(true)
      }
    }
    
    // Lock collision box to sprite - but only sync position when needed
    // CRITICAL: Don't call updateFromGameObject every frame - it can reset body position incorrectly
    // Only manually set body position when we need to lock it (idle, crouch, etc.)
    // The collision box will stay attached via the offset we set in setupPlayerCollider
    // NOTE: Post-physics sync is now handled in postUpdate() which runs AFTER Phaser's physics step

    this.handleTaunt()
    this.handleJump()
    this.handlePlayerMovement()
    this.handleThrowing(time)
    this.handleAutoFire(time)  // Handle auto-fire for green slingshot
    this.cleanupBullets()
    this.updatePowerUps()
    this.updateProjectedHitIndicators()
    // Update aiming triangles if aiming, otherwise remove them
    if (this.isAiming) {
      this.updateAimingTriangle()
    } else {
      // FIX: Make sure triangles are removed when not aiming
      if (this.aimingTriangles.size > 0) {
        this.removeAimingTriangle()
      }
      // FIX: Also aggressively clean up any orphaned triangles, especially around ground level
      this.cleanupOrphanedTriangles()
    }
    this.updateHeartbeat()
    // Check ball bounces AFTER physics step but before storing velocities
    // This ensures prevVelY is from the previous frame
    this.checkBallBounces()
    // Store velocities at the END of update for next frame's comparison
    this.storeBallVelocities()
    
    // Periodic memory cleanup for mobile (every 5 seconds)
    if (!this.lastMemoryCleanup || time - this.lastMemoryCleanup > 5000) {
      this.lastMemoryCleanup = time
      // Clean up inactive/destroyed objects
      this.cleanupInactiveObjects()
    }
    
    
    // CRITICAL: Lock position again at the END of update to catch any late updates
    // This ensures position stays locked even if something runs after the initial lock
    if (this.isTransitioning && this.justExitedCrouch && this.transitionTargetY > 0) {
      const targetY = this.transitionTargetY
      this.player.setY(targetY)
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body) {
        // Manually set body position to match sprite (without updateFromGameObject)
        body.x = this.player.x
        body.y = targetY
      }
    }
    
    // CRITICAL: Lock position for a few frames after transition completes
    // This prevents the body from falling while physics settles
    if (this.postTransitionLockFrames > 0) {
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body) {
        // Position body at ground level
        const targetBodyBottomY = this.groundYPosition
        const targetBodyCenterY = targetBodyBottomY - (body.height / 2)
        body.y = targetBodyCenterY
        this.player.x = body.x
        this.player.y = targetBodyBottomY
        body.setVelocity(0, 0)
        body.setAcceleration(0, 0)
        // Don't force physics step - it can interfere with ball physics
        // Physics will update naturally on next frame
      }
      this.postTransitionLockFrames--
    }
    
    // Monitor position for a few frames after transition completes
    // Only correct drift if body is NOT touching ground (if touching, it's stable)
    if (this.postTransitionFrameCount > 0) {
      const expectedY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
      const actualY = this.player.y
      const diff = Math.abs(actualY - expectedY)
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      const isTouchingGround = body ? (body.touching.down || body.blocked.down) : false
      
      // CRITICAL: If body was touching ground when gravity was enabled, don't correct drift
      // Even if blocked.down becomes false temporarily, physics will handle it
      // Only correct if body was never touching ground
      if (diff > 0.01 && !isTouchingGround && !this.wasTouchingGroundWhenGravityEnabled) {
        // CRITICAL: Correct drift immediately to prevent falling
        // This ensures the player stays on the ground even after the lock ends
        this.player.setY(expectedY)
        if (body) {
          this.syncPlayerBodyPosition()
          body.setVelocity(0, 0)
          // Don't force physics step - it can interfere with ball physics
          // Physics will update naturally on next frame
        }
      }
      this.postTransitionFrameCount--
      
      // Clear flag after monitoring period
      if (this.postTransitionFrameCount === 0) {
        this.wasTouchingGroundWhenGravityEnabled = false
      }
    }
    
    // Update shield bubble position to follow player's center
    if (this.shieldBubble && this.shieldBubble.active) {
      this.shieldBubble.setX(this.player.x)
      // Center bubble on Bittee's center (not ground level)
      // Player origin is at bottom center (0.5, 1), so center is at player.y - (player.height / 2)
      const playerCenterY = this.player.y - (this.player.displayHeight / 2)
      this.shieldBubble.setY(playerCenterY)
    }
    
    // Apply slow motion to balls - scale velocities and gravity proportionally
    // Use a flag to only apply once per ball, then let physics run normally
    // CRITICAL: Scale velocity and gravity together to preserve trajectory
    if (this.isSlowMotion) {
      this.balls.children.entries.forEach((ballObj) => {
        const ball = ballObj as Phaser.Physics.Arcade.Image
        if (!ball || !ball.active) return
        const body = ball.body as Phaser.Physics.Arcade.Body
        if (!body) return

        const hasSlowMotion = ball.getData('slowMotionApplied') as boolean
        if (!hasSlowMotion) {
          // CRITICAL FIX: Only apply slow motion to balls that haven't been significantly affected by gravity yet
          // If a ball is already in motion with normal gravity, applying slow motion changes its trajectory
          // Check if ball is near its spawn point or just bounced (hasn't been affected by gravity much)
          const ballAge = this.time.now - (ball.getData('spawnTime') as number || this.time.now)
          const hasBounced = ball.getData('hasBounced') as boolean || false
          const isNewBall = ballAge < 100 || !hasBounced  // New ball or just bounced
          
          if (isNewBall) {
            // Apply slow motion: scale both velocity and gravity by 0.3
            // This preserves the trajectory (same path, just slower)
            const currentVelX = body.velocity.x
            const currentVelY = body.velocity.y
            const currentGravity = body.gravity.y || 240
            
            // Store original values for restoration
            ball.setData('originalVelX', currentVelX)
            ball.setData('originalVelY', currentVelY)
            ball.setData('originalGravity', currentGravity)
            
            // Apply slow motion factor (0.3 = 30% speed) to both velocity and gravity
            // This ensures the trajectory stays the same (path doesn't change, just slower)
            body.setVelocity(currentVelX * 0.3, currentVelY * 0.3)
            body.setGravityY(currentGravity * 0.3)
            ball.setData('slowMotionApplied', true)
          } else {
            // Ball is already in motion - don't apply slow motion to avoid trajectory changes
            // Mark as applied anyway to prevent repeated checks
            ball.setData('slowMotionApplied', true)
            // Store current values as "original" for restoration
            ball.setData('originalVelX', body.velocity.x)
            ball.setData('originalVelY', body.velocity.y)
            ball.setData('originalGravity', body.gravity.y || 240)
          }
        } else {
          // Ensure gravity stays scaled during slow motion (in case it was reset elsewhere)
          const originalGravity = ball.getData('originalGravity') as number | undefined
          const expectedGravity = (originalGravity ?? 240) * 0.3
          if (Math.abs(body.gravity.y - expectedGravity) > 0.1) {
            body.setGravityY(expectedGravity)
          }
        }
      })
    } else {
      // When slow motion is off, only restore gravity for balls that had slow motion applied
      // Other balls should already have normal gravity
      this.balls.children.entries.forEach((ballObj) => {
        const ball = ballObj as Phaser.Physics.Arcade.Image
        if (!ball || !ball.active) return
        const body = ball.body as Phaser.Physics.Arcade.Body
        if (!body) return

        const hasSlowMotion = ball.getData('slowMotionApplied') as boolean
        if (hasSlowMotion) {
          // This ball had slow motion, but slow motion is now off
          // restoreBallSpeeds() should have handled this, but ensure gravity is correct
          const baseGravity = 240
          if (Math.abs(body.gravity.y - baseGravity) > 0.1) {
            body.setGravityY(baseGravity)
          }
        }
      })
    }
    
    // Constrain player X position to prevent edges from going off screen
    // Also prevent running into walls by stopping velocity if at edge and trying to run that direction
    const worldWidth = this.cameras.main.width
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    if (playerBody) {
      const playerHalfWidth = this.player.displayWidth / 2
      const rightEdge = this.player.x + playerHalfWidth
      const leftEdge = this.player.x - playerHalfWidth
      const atLeftEdge = leftEdge <= 0
      const atRightEdge = rightEdge >= worldWidth
      
      // Smooth wall collision: gradually reduce velocity as approaching edge
      // This creates a soft, natural stop instead of abrupt collision
      if (atLeftEdge && playerBody.velocity.x < 0) {
        // Smoothly stop when hitting left wall
        const stopFactor = 0.3  // Reduce velocity by 70% each frame for smooth stop
        this.player.setVelocityX(playerBody.velocity.x * stopFactor)
        playerBody.setVelocityX(playerBody.velocity.x * stopFactor)
      }
      if (atRightEdge && playerBody.velocity.x > 0) {
        // Smoothly stop when hitting right wall
        const stopFactor = 0.3
        this.player.setVelocityX(playerBody.velocity.x * stopFactor)
        playerBody.setVelocityX(playerBody.velocity.x * stopFactor)
      }
      
      // Soft constraint: gently nudge player back if slightly past edge
      // This ensures left edge settles exactly on x=0 when player lets go
      if (leftEdge < 0) {
        // Smoothly move back to edge (left edge of Bittee at x=0)
        const targetX = playerHalfWidth
        const currentX = this.player.x
        const diff = targetX - currentX
        // Use a small lerp factor for smooth movement
        this.player.setX(currentX + diff * 0.2)
        // If very close to target, snap to it
        if (Math.abs(diff) < 0.5) {
          this.player.setX(targetX)
          playerBody.setVelocityX(0)
        }
      } else if (rightEdge > worldWidth) {
        // Right edge: allow small epsilon for reaching edge
        const epsilon = 1
        const targetX = worldWidth - playerHalfWidth - epsilon
        const currentX = this.player.x
        if (currentX > targetX) {
          const diff = targetX - currentX
          this.player.setX(currentX + diff * 0.2)
          if (Math.abs(diff) < 0.5) {
            this.player.setX(targetX)
            playerBody.setVelocityX(0)
          }
        }
      }
    }

    // Note: justExitedCrouch is cleared by the transition logic (line 1134-1136)
    // when the transition completes, so no need to clear it here

    // Safety: clear state if animation already returned to idle
    if (this.isThrowing && this.player.anims.currentAnim?.key !== 'bittee-throw') {
      this.isThrowing = false
    }
    if (this.isTaunting && this.player.anims.currentAnim?.key !== 'bittee-taunt') {
      this.cancelTaunt(false)
    }

    this.updateControlButtons()
    this.touchUpJustPressed = false
    
    // CRITICAL: Lock position during crouch and crouch exit transition
    // This MUST run at the very end of update() to ensure it's the last thing that happens
    // This prevents any other systems from moving the player after we lock position
    // Reuse body variable declared at start of update()
    const finalBody = this.player.body as Phaser.Physics.Arcade.Body | null
    const feetY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
    
    // Lock position during crouch exit transition
    if (this.isTransitioning && this.justExitedCrouch && !this.isJumping) {
      // CRITICAL: Body should be disabled during transition, but check anyway
      // Force Y position to stay locked - don't let physics move it
      // Lock every frame, not just when there's a difference, to prevent micro-drift
      const posBeforeLock = { x: this.player.x, y: this.player.y }
      const yDrift = posBeforeLock.y - feetY
      if (Math.abs(yDrift) > 0.1) {
      }
      this.player.setY(feetY)
      if (finalBody) {
        // CRITICAL: Ensure body is disabled during transition
        if (finalBody.enable) {
          finalBody.enable = false
        }
        const velBeforeLock = { x: finalBody.velocity.x, y: finalBody.velocity.y }
        if (Math.abs(velBeforeLock.x) > 0.1 || Math.abs(velBeforeLock.y) > 0.1) {
        }
        // Sync body to sprite position, but keep it disabled
        this.syncPlayerBodyPosition()
        // Ensure body is locked during transition to prevent any physics interference
        finalBody.setVelocity(0, 0)
        finalBody.setAcceleration(0, 0)
        finalBody.setImmovable(true)
        finalBody.setAllowGravity(false)
        finalBody.enable = false  // Keep disabled
      }
    }
    // Also lock position during active crouch to prevent any drift
    else if (this.isCrouching && !this.isJumping && finalBody) {
      this.player.setY(feetY)
      finalBody.setVelocityY(0)
      finalBody.setVelocityX(0)
      this.syncPlayerBodyPosition()
    }
    } catch (error) {
      // Prevent crashes on mobile by catching errors in update loop
      // Error in update loop - continue running
      // Continue running - don't crash the game
    }
  }

  private updateControlButton(button: Phaser.GameObjects.Container | undefined, isActive: boolean): void {
    if (!button) return

    const baseCircle = button.getData('baseCircle') as Phaser.GameObjects.Arc
    const baseShape = button.getData('baseShape') as Phaser.GameObjects.Graphics
    const highlightShape = button.getData('highlightShape') as Phaser.GameObjects.Graphics
    const borderShape = button.getData('borderShape') as Phaser.GameObjects.Graphics
    const labelText = button.getData('labelText') as Phaser.GameObjects.Text
    const infinityText = button.getData('infinityText') as Phaser.GameObjects.Text
    const baseColor = button.getData('baseColor') as number
    const activeColor = button.getData('activeColor') as number

    if (baseCircle) {
      baseCircle.setFillStyle(isActive ? activeColor : baseColor, isActive ? 1 : 0.9)
    }
    if (baseShape) {
      baseShape.clear()
      const width = button.getData('buttonWidth') as number
      const height = button.getData('buttonHeight') as number
      // Use consistent 0.3 roundness ratio for all buttons
      const cornerRadius = Math.min(width, height) * 0.3
      baseShape.fillStyle(isActive ? activeColor : baseColor, isActive ? 1 : 0.9)
      baseShape.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius)
      
      if (borderShape) {
        borderShape.clear()
        // Check if this is taunt button by checking label text
        const labelText = button.getData('labelText') as Phaser.GameObjects.Text
        const isTauntButton = labelText?.text === 'T'
        const borderColor = isTauntButton ? 0x808080 : 0xd7ddcc  // Gray for taunt, default for others
        borderShape.lineStyle(4, borderColor, 1)
        borderShape.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius)
      }
    }
    // Small gray highlight is always visible
    if (highlightShape) {
      highlightShape.setVisible(true)
    }
    // Shadow visibility - hide for all d-pad buttons when active (pressed effect)
    const shadowShape = button.getData('shadowShape') as Phaser.GameObjects.Graphics
    if (shadowShape) {
      // Hide shadow when button is active to simulate pressed effect
      shadowShape.setVisible(!isActive)
    }
    
    // Shift button into shadow when pressed (realistic button press effect)
    const originalY = button.getData('originalY') as number | undefined
    if (originalY !== undefined) {
      const pressOffset = 2  // Shift down by 2 pixels when pressed
      button.setY(isActive ? originalY + pressOffset : originalY)
    }
    
    if (infinityText) {
      infinityText.setStyle({ color: isActive ? '#0d1b2a' : '#e0d5b6' })
    }
    if (labelText) {
      const buttonText = labelText.text
      if (buttonText === 'T') {
        // Taunt button: parchment color text
        labelText.setStyle({ color: isActive ? '#0d1b2a' : '#e0d5b6' })
      } else if (buttonText === 'Jumb' || buttonText === 'Crouch') {
        labelText.setStyle({ color: isActive ? '#0d1b2a' : '#e0d5b6' })
      } else if (buttonText === '←' || buttonText === '→') {
        labelText.setStyle({ color: isActive ? '#0d1b2a' : '#e0d5b6', fontStyle: 'bold' })
      } else {
        labelText.setStyle({ color: isActive ? '#0d1b2a' : '#cbe4ff' })
      }
    }
  }

  private updateControlButtons(): void {
    if (this.leftButton) {
      const isActive = (this.cursors.left?.isDown ?? false) || this.touchLeft
      this.updateControlButton(this.leftButton, isActive)
    }

    if (this.rightButton) {
      const isActive = (this.cursors.right?.isDown ?? false) || this.touchRight
      this.updateControlButton(this.rightButton, isActive)
    }

    if (this.upButton) {
      const isActive = (this.cursors.up?.isDown ?? false) || this.touchUp
      this.updateControlButton(this.upButton, isActive)
    }

    if (this.downButton) {
      const isActive = (this.cursors.down?.isDown ?? false) || this.touchDown
      this.updateControlButton(this.downButton, isActive)
    }

    if (this.throwButton) {
      const isActive = (this.fireKey?.isDown ?? false) || this.touchThrow
      this.updateControlButton(this.throwButton, isActive)
    }

    if (this.tauntButton) {
      const isActive = this.isTaunting
      this.updateControlButton(this.tauntButton, isActive)
    }
  }

  private createHud(worldWidth: number, hudHeight: number, gameplayHeight: number): void {
    const hudY = gameplayHeight

    if (this.hudContainer) {
      this.hudContainer.destroy(true)
    }

    this.hudContainer = this.add.container(0, 0)
    this.hudContainer.setDepth(5)
    this.hudContainer.setScrollFactor(0)

    const hudBackground = this.add.rectangle(worldWidth / 2, hudY + hudHeight / 2, worldWidth, hudHeight, 0x2f3b32, 0.95)

    const padding = 24
    const topSectionHeight = 100

    this.levelText = this.add
      .text(padding, padding, LEVEL_DEFINITIONS[this.currentLevelIndex].label, {
        fontSize: '100px',
        fontFamily: 'MontserratBold',
      color: '#cbe4ff',
        fontStyle: 'underline',
      })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(10)
      .setScale(2.5)

    this.levelUnderline = this.add.rectangle(this.levelText.x + this.levelText.width / 2, padding + this.levelText.height + 20, this.levelText.width + 150, 10, 0xd7ddcc, 1)
    this.levelUnderline.setOrigin(0.5, 0)
    this.levelUnderline.setScrollFactor(0)
    this.levelUnderline.setDepth(10)

    // Initialize score text - will be updated by updateHud() based on level type
    this.scoreText = this.add.text(worldWidth - padding, padding, 'Boycotted: 0', {
      fontSize: '90px',
      fontFamily: 'MontserratBold',
      color: '#cbe4ff',
      fontStyle: 'underline',
    })
    // Enable rich text for color styling
    this.scoreText.setStyle({ color: '#cbe4ff' })
    this.scoreText.setOrigin(1, 0)
    this.scoreText.setScrollFactor(0)
    this.scoreText.setDepth(10)
    this.scoreText.setScale(2.5)
    // Don't call updateHud() here - it will be called after createHud() completes

    const controlsSectionY = hudY + topSectionHeight + 60
    const dpadButtonSize = 100
    const dpadSpacing = 16
    const dpadCenterX = worldWidth / 2
    const dpadCenterY = controlsSectionY + dpadButtonSize / 2 + 40

    const createPillButton = (
      x: number,
      y: number,
      width: number,
      height: number,
      label: string,
      fontSize: number = 32,
      _baseColor: number = 0x2f3b32,  // Unused, we use darkerBaseColor instead
    ): Phaser.GameObjects.Container => {
      const container = this.add.container(x, y)
      container.setDepth(6)
      container.setScrollFactor(0)  // Keep in screen space for mobile touch accuracy

      const baseGraphics = this.add.graphics()
      // Jump and crouch buttons use lighter background, taunt uses dark grey
      const lighterBaseColor = 0x374a3f  // Slightly lighter than default (for jump/crouch)
      const tauntBaseColor = 0x2a2a2a  // Dark grey for taunt button
      // Check if this is taunt button by checking if label is 'T'
      const isTauntButton = label === 'T'
      const buttonColor = isTauntButton ? tauntBaseColor : lighterBaseColor
      baseGraphics.fillStyle(buttonColor, 0.9)
      const cornerRadius = Math.min(width, height) * 0.3  // Same roundness as square buttons
      baseGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius)

      const borderGraphics = this.add.graphics()
      // Taunt button has gray border, others have default border
      const borderColor = isTauntButton ? 0x808080 : 0xd7ddcc
      // Use lineWidth 3 instead of 4 to reduce visible artifacts
      borderGraphics.lineStyle(3, borderColor, 1)
      // Draw border slightly inset to avoid edge artifacts
      borderGraphics.strokeRoundedRect(-width / 2 + 0.5, -height / 2 + 0.5, width - 1, height - 1, cornerRadius)

      // Add soft shadow - downward only (no side extension), same size as before
      const shadowGraphics = this.add.graphics()
      shadowGraphics.fillStyle(0x000000, 0.3)  // Same as title shadow opacity
      // Shadow downward only: 0.05 ratio offset with size increase
      const shadowOffset = Math.max(1, Math.round(height * 0.05))  // Proportional downward offset
      const shadowSizeIncrease = 4  // Size increase for taunt, jump, crouch buttons
      shadowGraphics.fillRoundedRect(-width / 2, -height / 2 + shadowOffset, width + shadowSizeIncrease, height + shadowSizeIncrease, cornerRadius)  // Shadow downward with size increase

      // Small gray-ish highlight positioned naturally, matching button dimensions
      const highlightGraphics = this.add.graphics()
      highlightGraphics.fillStyle(0xffffff, 0.2)
      const highlightWidth = width * 0.3
      const highlightHeight = height * 0.3
      const highlightRadius = Math.min(highlightWidth, highlightHeight) * 0.3  // Same roundness ratio
      // Position more naturally (not too far in corner)
      highlightGraphics.fillRoundedRect(
        -width * 0.35,
        -height * 0.35,
        highlightWidth,
        highlightHeight,
        highlightRadius
      )

      const labelText = this.add.text(0, 0, label, {
        fontSize: `${fontSize}px`,
        fontFamily: 'MontserratBold',
        color: '#cbe4ff',
      })
      labelText.setOrigin(0.5, 0.5)

      container.add([shadowGraphics, baseGraphics, borderGraphics, highlightGraphics, labelText])
      container.setSize(width, height)
      // Use container's default interactive area - works better on mobile
      container.setInteractive()

      container.setData('baseColor', buttonColor)  // Use lighter color for jump/crouch, default for taunt
      container.setData('activeColor', 0xe3be74)
      container.setData('baseShape', baseGraphics)
      container.setData('highlightShape', highlightGraphics)
      container.setData('borderShape', borderGraphics)
      container.setData('shadowShape', shadowGraphics)  // Shadow for jump/crouch/taunt buttons
      container.setData('labelText', labelText)
      container.setData('buttonWidth', width)
      container.setData('buttonHeight', height)
      container.setData('originalY', y)  // Store original Y position for pressed effect

      return container
    }

    const createRoundedSquareButton = (
      x: number,
      y: number,
      width: number,
      height: number,
      label: string,
      fontSize: number = 32,
      _baseColor: number = 0x2f3b32,  // Unused, we use darkerBaseColor instead
    ): Phaser.GameObjects.Container => {
      const container = this.add.container(x, y)
      container.setDepth(6)
      container.setScrollFactor(0)  // Keep in screen space for mobile touch accuracy

      const baseGraphics = this.add.graphics()
      // Left/right buttons use darker background
      const darkerBaseColor = 0x252f28  // Slightly darker than default
      baseGraphics.fillStyle(darkerBaseColor, 0.9)
      const cornerRadius = Math.min(width, height) * 0.3
      baseGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius)

      const borderGraphics = this.add.graphics()
      // Use lineWidth 3 instead of 4 to reduce visible artifacts
      borderGraphics.lineStyle(3, 0xd7ddcc, 1)
      // Draw border slightly inset to avoid edge artifacts
      borderGraphics.strokeRoundedRect(-width / 2 + 0.5, -height / 2 + 0.5, width - 1, height - 1, cornerRadius)

      // Add soft shadow - subtle drop shadow effect
      const shadowGraphics = this.add.graphics()
      shadowGraphics.fillStyle(0x000000, 0.4)  // Softer shadow
      // Shadow offset - left button shadow on left, right button shadow on right
      const isLeftButton = label === '←'
      const isRightButton = label === '→'
      const shadowOffset = 4  // Larger offset
      const shadowSizeIncrease = 4  // Make shadow slightly larger
      if (isLeftButton) {
        // Left button: shadow on left side, shifted further left
        // Extend shadow equally: shadowOffset to the left, shadowSizeIncrease to the right
        const leftShift = 2  // Shift shadow further to the left
        shadowGraphics.fillRoundedRect(-width / 2 - shadowOffset - leftShift, -height / 2 + shadowOffset, width + shadowOffset + shadowSizeIncrease, height + shadowSizeIncrease, cornerRadius)
      } else if (isRightButton) {
        // Right button: shadow on right side, shifted further right
        // Make it perfectly symmetric with left button: same total width calculation
        const rightShift = 2  // Shift shadow further to the right
        // Mirror of left: shadowOffset extends right, shadowSizeIncrease extends left, same total width
        shadowGraphics.fillRoundedRect(-width / 2 - shadowSizeIncrease, -height / 2 + shadowOffset, width + shadowOffset + shadowSizeIncrease, height + shadowSizeIncrease, cornerRadius)
        // Shift the entire shadow graphics object right by rightShift to mirror leftShift
        shadowGraphics.x = rightShift
      } else {
        // Default: shadow offset slightly down and to the right
        shadowGraphics.fillRoundedRect(-width / 2 + shadowOffset, -height / 2 + shadowOffset, width + shadowSizeIncrease, height + shadowSizeIncrease, cornerRadius)
      }

      // Small gray-ish highlight positioned naturally, matching button dimensions
      const smallHighlightGraphics = this.add.graphics()
      smallHighlightGraphics.fillStyle(0xffffff, 0.2)
      const highlightWidth = width * 0.3
      const highlightHeight = height * 0.3
      const highlightRadius = Math.min(highlightWidth, highlightHeight) * 0.3  // Same roundness ratio
      // Position more naturally (not too far in corner)
      smallHighlightGraphics.fillRoundedRect(
        -width * 0.35,
        -height * 0.35,
        highlightWidth,
        highlightHeight,
        highlightRadius
      )

      const labelText = this.add.text(0, 0, label, {
        fontSize: `${fontSize}px`,
        fontFamily: 'MontserratBold',
      color: '#cbe4ff',
    })
      labelText.setOrigin(0.5, 0.5)

      container.add([shadowGraphics, baseGraphics, borderGraphics, smallHighlightGraphics, labelText])
      // Set size - this defines the interactive area
      container.setSize(width, height)
      // Use container's default interactive area (based on setSize) - works better on mobile
      // The hit area will be automatically calculated from the container's size
      container.setInteractive()

      container.setData('baseColor', darkerBaseColor)  // Use darker color for left/right
      container.setData('activeColor', 0xe3be74)
      container.setData('baseShape', baseGraphics)
      container.setData('highlightShape', smallHighlightGraphics)  // Small gray highlight (always visible)
      container.setData('shadowShape', shadowGraphics)  // Shadow for left/right buttons
      container.setData('labelText', labelText)
      container.setData('buttonWidth', width)
      container.setData('buttonHeight', height)
      container.setData('originalY', y)  // Store original Y position for pressed effect

      return container
    }

    const edgePadding = 20
    const jumpCrouchWidth = worldWidth * 0.4
    const jumpCrouchHeight = 80
    const jumpButtonY = dpadCenterY - dpadButtonSize - dpadSpacing
    // Move crouch button down further
    const crouchButtonY = this.scale.height - 60

    const tauntButtonHeight = 70
    const buttonGap = 20
    const tauntButtonY = jumpButtonY - jumpCrouchHeight / 2 - buttonGap - tauntButtonHeight / 2 + 5
    const tauntButtonBottom = tauntButtonY + tauntButtonHeight / 2
    const tauntButtonWidth = 150  // Slightly less wide
    
    this.tauntButton = createPillButton(dpadCenterX, tauntButtonY, tauntButtonWidth, tauntButtonHeight, 'T', 44, 0xe3be74)

    const upButtonContainer = createPillButton(worldWidth / 2, jumpButtonY, jumpCrouchWidth, jumpCrouchHeight, 'Jumb', 36)
    const upButtonLabel = upButtonContainer.getData('labelText') as Phaser.GameObjects.Text
    upButtonLabel.setStyle({ color: '#e0d5b6' })
    this.upButton = upButtonContainer

    const downButtonContainer = createPillButton(worldWidth / 2, crouchButtonY, jumpCrouchWidth, jumpCrouchHeight, 'Crouch', 36)
    const downButtonLabel = downButtonContainer.getData('labelText') as Phaser.GameObjects.Text
    downButtonLabel.setStyle({ color: '#e0d5b6' })
    this.downButton = downButtonContainer
    
    // Calculate equal spacing for left/right buttons
    // Throw button is centered at worldWidth/2 with width jumpCrouchWidth
    const throwButtonLeftEdge = dpadCenterX - jumpCrouchWidth / 2
    const throwButtonRightEdge = dpadCenterX + jumpCrouchWidth / 2
    const equalSpacing = edgePadding  // Use edgePadding as the equal spacing value (20px)
    
    // Left button: expand right side
    // Left button left edge stays at edgePadding
    // Left button right edge should be: throwButtonLeftEdge - equalSpacing
    const leftButtonRightEdge = throwButtonLeftEdge - equalSpacing
    const leftButtonLeftEdge = edgePadding
    const newLeftButtonWidth = leftButtonRightEdge - leftButtonLeftEdge
    const leftButtonCenterX = leftButtonLeftEdge + newLeftButtonWidth / 2
    
    // Right button: expand left side
    // Right button right edge stays at worldWidth - edgePadding
    // Right button left edge should be: throwButtonRightEdge + equalSpacing
    const rightButtonLeftEdge = throwButtonRightEdge + equalSpacing
    const rightButtonRightEdge = worldWidth - edgePadding
    const newRightButtonWidth = rightButtonRightEdge - rightButtonLeftEdge
    const rightButtonCenterX = rightButtonLeftEdge + newRightButtonWidth / 2
    
    const leftRightButtonTop = tauntButtonBottom
    // Extend buttons down to almost bottom edge of screen (leave small padding)
    const bottomPadding = 20
    const leftRightButtonBottom = this.scale.height - bottomPadding
    const leftRightButtonHeight = leftRightButtonBottom - leftRightButtonTop
    const leftRightButtonCenterY = (leftRightButtonTop + leftRightButtonBottom) / 2
    const configureButtonY = (leftRightButtonTop + gameplayHeight) / 2
    
    // Configure button centered on left button, lives text centered on right button
    this.livesText = this.add.text(rightButtonCenterX, configureButtonY, '', {
      fontSize: '100px',
      fontFamily: 'MontserratBold',
      color: '#ff3b3b',
      fontStyle: 'underline',
    })
    this.livesText.setOrigin(0.5, 0.5)
    this.livesText.setScrollFactor(0)
    this.livesText.setDepth(6)
    this.livesText.setScale(3)
    
    const leftButtonContainer = createRoundedSquareButton(leftButtonCenterX, leftRightButtonCenterY, newLeftButtonWidth, leftRightButtonHeight, '←', 80)
    const leftButtonLabel = leftButtonContainer.getData('labelText') as Phaser.GameObjects.Text
    leftButtonLabel.setStyle({ color: '#e0d5b6', fontStyle: 'bold' })
    this.leftButton = leftButtonContainer
    
    const rightButtonContainer = createRoundedSquareButton(rightButtonCenterX, leftRightButtonCenterY, newRightButtonWidth, leftRightButtonHeight, '→', 80)
    const rightButtonLabel = rightButtonContainer.getData('labelText') as Phaser.GameObjects.Text
    rightButtonLabel.setStyle({ color: '#e0d5b6', fontStyle: 'bold' })
    this.rightButton = rightButtonContainer
    
    // REMOVED: Lines between left/right buttons and center - not needed
    // const innerBorderGraphics = this.add.graphics()
    // innerBorderGraphics.lineStyle(3, 0xd7ddcc, 0.6)
    // innerBorderGraphics.lineBetween(edgePadding + squareButtonWidth, leftRightButtonTop, worldWidth / 2, leftRightButtonTop)
    // innerBorderGraphics.lineBetween(edgePadding + squareButtonWidth, leftRightButtonBottom, worldWidth / 2, leftRightButtonBottom)
    // innerBorderGraphics.setDepth(6)
    // innerBorderGraphics.setScrollFactor(0)
    // this.hudContainer.add(innerBorderGraphics)

    const throwButtonWidth = jumpCrouchWidth
    // Position shoot button between jump and crouch buttons, extending its height to span between them (but shorter)
    const throwButtonTop = jumpButtonY + jumpCrouchHeight / 2 + 10  // Shorten from top
    const throwButtonBottom = crouchButtonY - jumpCrouchHeight / 2 - 10  // Shorten from bottom
    const throwButtonHeight = throwButtonBottom - throwButtonTop
    const throwButtonCenterY = (throwButtonTop + throwButtonBottom) / 2
    const throwButtonContainer = this.add.container(dpadCenterX, throwButtonCenterY)
    throwButtonContainer.setDepth(6)
    throwButtonContainer.setScrollFactor(0)  // Keep in screen space for mobile touch accuracy
    const throwBaseGraphics = this.add.graphics()
    // Shoot button uses darker background (same as left/right)
    const throwDarkerBaseColor = 0x252f28  // Slightly darker than default
    throwBaseGraphics.fillStyle(throwDarkerBaseColor, 0.9)
    const throwCornerRadius = Math.min(throwButtonWidth, throwButtonHeight) * 0.3  // Same roundness as other buttons
    throwBaseGraphics.fillRoundedRect(-throwButtonWidth / 2, -throwButtonHeight / 2, throwButtonWidth, throwButtonHeight, throwCornerRadius)
    const throwBorderGraphics = this.add.graphics()
    throwBorderGraphics.lineStyle(4, 0xd7ddcc, 1)
    throwBorderGraphics.strokeRoundedRect(-throwButtonWidth / 2, -throwButtonHeight / 2, throwButtonWidth, throwButtonHeight, throwCornerRadius)
    // Add soft shadow - downward only (no side extension)
    const throwShadowGraphics = this.add.graphics()
    throwShadowGraphics.fillStyle(0x000000, 0.3)  // Same as title shadow opacity
    // Shadow downward only: 0.05 ratio offset, no size increase on sides
    const throwShadowOffset = Math.max(1, Math.round(throwButtonHeight * 0.05))  // Proportional downward offset
    throwShadowGraphics.fillRoundedRect(-throwButtonWidth / 2, -throwButtonHeight / 2 + throwShadowOffset, throwButtonWidth, throwButtonHeight, throwCornerRadius)  // Shadow downward only (no side extension)
    // Small gray-ish highlight positioned naturally, matching button dimensions
    const throwHighlightGraphics = this.add.graphics()
    throwHighlightGraphics.fillStyle(0xffffff, 0.2)
    const throwHighlightWidth = throwButtonWidth * 0.3
    const throwHighlightHeight = throwButtonHeight * 0.3
    const throwHighlightRadius = Math.min(throwHighlightWidth, throwHighlightHeight) * 0.3  // Same roundness ratio
    // Position more naturally (not too far in corner)
    throwHighlightGraphics.fillRoundedRect(
      -throwButtonWidth * 0.35,
      -throwButtonHeight * 0.35,
      throwHighlightWidth,
      throwHighlightHeight,
      throwHighlightRadius
    )
    throwHighlightGraphics.setVisible(true)
    const throwRockIcon = this.add.image(-10, 0, ROCK_HUD_SPRITE.key)
    // Use scale instead of displaySize - new image may have much larger native dimensions
    // Set a small scale to force it to be small regardless of native image size
    throwRockIcon.setScale(0.25)  // Scale down significantly - adjust this value if needed
    // Calculate rock's actual visual width after scaling and position infinity at right edge
    // Rock center is at -10, so right edge = center + (displayWidth / 2)
    const rockVisualWidth = throwRockIcon.displayWidth
    const rockRightEdge = throwRockIcon.x + (rockVisualWidth / 2)
    
    // Position infinity symbol so its center aligns with the rock's right edge
    const throwInfinityText = this.add.text(rockRightEdge, 0, '∞', {
      fontSize: '52px',
      fontFamily: 'MontserratBold',
      color: '#e0d5b6',
    })
    throwInfinityText.setOrigin(0.5, 0.5)  // Center origin so middle point is at rockRightEdge
    throwButtonContainer.add([throwShadowGraphics, throwBaseGraphics, throwBorderGraphics, throwHighlightGraphics, throwRockIcon, throwInfinityText])
    throwButtonContainer.setSize(throwButtonWidth, throwButtonHeight)
    // Use container's default interactive area - works better on mobile
    // Overlap with left button will be handled by button positioning and event handling
    throwButtonContainer.setInteractive()
    throwButtonContainer.setData('baseColor', throwDarkerBaseColor)  // Use darker color for shoot
    throwButtonContainer.setData('activeColor', 0xe3be74)
    throwButtonContainer.setData('baseShape', throwBaseGraphics)
    throwButtonContainer.setData('highlightShape', throwHighlightGraphics)
    throwButtonContainer.setData('shadowShape', throwShadowGraphics)  // Shadow for shoot button
    throwButtonContainer.setData('buttonWidth', throwButtonWidth)
    throwButtonContainer.setData('buttonHeight', throwButtonHeight)
    throwButtonContainer.setData('rockIcon', throwRockIcon)
    throwButtonContainer.setData('infinityText', throwInfinityText)
    throwButtonContainer.setData('borderShape', throwBorderGraphics)
    throwButtonContainer.setData('originalY', throwButtonCenterY)  // Store original Y position for pressed effect
    this.throwButton = throwButtonContainer

    this.tauntButton.on('pointerdown', () => this.tryTaunt())

    // FIX: Support multiple simultaneous touches on mobile
    // Use pointer tracking instead of simple boolean flags to support multi-touch
    // Track which pointers are touching each button
    const leftButtonPointers = new Set<number>()
    const rightButtonPointers = new Set<number>()
    const upButtonPointers = new Set<number>()
    const downButtonPointers = new Set<number>()
    
    this.leftButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      leftButtonPointers.add(pointer.id)
      this.touchLeft = true
    })
    this.leftButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      leftButtonPointers.delete(pointer.id)
      this.touchLeft = leftButtonPointers.size > 0
    })
    this.leftButton.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      // Only clear if this specific pointer was touching the button
      // Don't clear if other pointers are still touching
      if (leftButtonPointers.has(pointer.id)) {
        leftButtonPointers.delete(pointer.id)
        this.touchLeft = leftButtonPointers.size > 0
      }
    })

    this.rightButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      rightButtonPointers.add(pointer.id)
      this.touchRight = true
    })
    this.rightButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      rightButtonPointers.delete(pointer.id)
      this.touchRight = rightButtonPointers.size > 0
    })
    this.rightButton.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      if (rightButtonPointers.has(pointer.id)) {
        rightButtonPointers.delete(pointer.id)
        this.touchRight = rightButtonPointers.size > 0
      }
    })

    this.upButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.touchUp) {
        this.touchUpJustPressed = true
      }
      upButtonPointers.add(pointer.id)
      this.touchUp = true
    })
    this.upButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      upButtonPointers.delete(pointer.id)
      this.touchUp = upButtonPointers.size > 0
    })
    this.upButton.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      if (upButtonPointers.has(pointer.id)) {
        upButtonPointers.delete(pointer.id)
        this.touchUp = upButtonPointers.size > 0
      }
    })

    this.downButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      downButtonPointers.add(pointer.id)
      this.touchDown = true
    })
    this.downButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      downButtonPointers.delete(pointer.id)
      this.touchDown = downButtonPointers.size > 0
    })
    this.downButton.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      if (downButtonPointers.has(pointer.id)) {
        downButtonPointers.delete(pointer.id)
        this.touchDown = downButtonPointers.size > 0
      }
    })

    // FIX: Support multiple simultaneous touches for throw button
    const throwButtonPointers = new Set<number>()
    this.throwButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      throwButtonPointers.add(pointer.id)
      this.touchThrow = true
      // Only start aiming if not already aiming (prevent multiple aim starts)
      if (!this.isAiming) {
        this.isAiming = true
        // Show throw1 (cock back) animation when button is pressed
        this.startAiming()
      }
    })
    this.throwButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      throwButtonPointers.delete(pointer.id)
      this.touchThrow = throwButtonPointers.size > 0
      // Only shoot if we were aiming and this was the last pointer
      if (this.isAiming && throwButtonPointers.size === 0) {
        this.isAiming = false
        this.releaseThrow()
      }
    })
    this.throwButton.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      // Only cancel if this was the last pointer touching the button
      if (throwButtonPointers.has(pointer.id)) {
        throwButtonPointers.delete(pointer.id)
        this.touchThrow = throwButtonPointers.size > 0
        // Cancel aim only if no pointers are touching the button
        if (this.isAiming && throwButtonPointers.size === 0) {
          this.isAiming = false
          this.cancelAiming()
        }
      }
    })

    this.hudContainer.add([
      hudBackground,
      this.livesText,
      this.tauntButton,
      this.leftButton,
      this.rightButton,
      this.upButton,
      this.downButton,
      this.throwButton,
    ])
  }

  private createSettingsButton(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
      fontFamily: 'MontserratBold',
      color: '#1b221c',
      backgroundColor: 'rgba(195, 212, 165, 0.95)',
      padding: { left: 16, right: 16, top: 10, bottom: 10 },
    }

    const hudY = this.gameplayHeight
    const topSectionHeight = 100
    const controlsSectionY = hudY + topSectionHeight + 60
    const dpadButtonSize = 100
    const dpadSpacing = 16
    const dpadCenterY = controlsSectionY + dpadButtonSize / 2 + 40
    const jumpCrouchHeight = 80
    const jumpButtonY = dpadCenterY - dpadButtonSize - dpadSpacing
    const tauntButtonHeight = 70
    const buttonGap = 20
    const tauntButtonY = jumpButtonY - jumpCrouchHeight / 2 - buttonGap - tauntButtonHeight / 2 + 5
    const tauntButtonBottom = tauntButtonY + tauntButtonHeight / 2
    const leftRightButtonTop = tauntButtonBottom
    const edgePadding = 20
    // Calculate button positions to match createHud (with expanded widths)
    const worldWidth = this.scale.width
    const jumpCrouchWidth = worldWidth * 0.4
    const throwButtonLeftEdge = worldWidth / 2 - jumpCrouchWidth / 2
    const equalSpacing = edgePadding
    
    const leftButtonRightEdge = throwButtonLeftEdge - equalSpacing
    const leftButtonLeftEdge = edgePadding
    const newLeftButtonWidth = leftButtonRightEdge - leftButtonLeftEdge
    const leftButtonCenterX = leftButtonLeftEdge + newLeftButtonWidth / 2
    
    // Configure button centered on left button
    const configureButtonY = (leftRightButtonTop + this.gameplayHeight) / 2

    // Create configure button with shadow background - downward and to the left
    const configureButtonText = 'Configure'
    const configureButtonPadding = { left: 16, right: 16, top: 10, bottom: 10 }
    const tempConfigureText = this.add.text(0, 0, configureButtonText, { fontSize: '18px', fontFamily: 'MontserratBold' })
    const configureButtonTextWidth = tempConfigureText.width
    const configureButtonTextHeight = tempConfigureText.height
    tempConfigureText.destroy()
    const configureButtonWidth = configureButtonTextWidth + configureButtonPadding.left + configureButtonPadding.right
    const configureButtonHeight = configureButtonTextHeight + configureButtonPadding.top + configureButtonPadding.bottom
    const configureButtonRadius = 6  // Same roundness as resume adventure button
    
    // Create shadow for configure button - same dimensions, beneath and to the left, matching roundness
    const configureButtonShadow = this.add.graphics()
    configureButtonShadow.fillStyle(0x000000, 0.2)  // Subtle shadow
    const shadowYOffset = 3  // Shift shadow down slightly (beneath button)
    const shadowXOffset = -2  // Shift shadow to the left
    configureButtonShadow.fillRoundedRect(-configureButtonWidth / 2 + shadowXOffset, -configureButtonHeight / 2 + shadowYOffset, configureButtonWidth, configureButtonHeight, configureButtonRadius)  // Same dimensions, matching roundness
    configureButtonShadow.setPosition(leftButtonCenterX, configureButtonY)  // Shadow at button position (offset handled in fillRoundedRect)
    configureButtonShadow.setDepth(9)
    configureButtonShadow.setScrollFactor(0)
    
    // Create rounded background for configure button
    const configureButtonBgGraphics = this.add.graphics()
    configureButtonBgGraphics.fillStyle(0x2f3b32, 1)  // Configure button background color
    configureButtonBgGraphics.fillRoundedRect(-configureButtonWidth / 2, -configureButtonHeight / 2, configureButtonWidth, configureButtonHeight, configureButtonRadius)
    configureButtonBgGraphics.setPosition(leftButtonCenterX, configureButtonY)
    configureButtonBgGraphics.setDepth(10)
    configureButtonBgGraphics.setScrollFactor(0)
    
    this.settingsButton = this.add.text(leftButtonCenterX, configureButtonY, 'Configure', style)
    this.settingsButton.setOrigin(0.5, 0.5)
    this.settingsButton.setDepth(11)  // Above background graphics
    this.settingsButton.setScrollFactor(0)
    this.settingsButton.setInteractive({ useHandCursor: true })
    this.settingsButton.on('pointerdown', () => {
      if (!this.isPausedForSettings) {
        this.openSettingsPanel()
      }
    })
  }

  private ensureSettingsPanel(): void {
    if (this.settingsPanel) {
      this.refreshSettingsPanel()
      return
    }

    const worldWidth = this.scale.width
    const worldHeight = this.scale.height

    const overlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x000000, 0.65)
    overlay.setInteractive()

    const panelWidth = Math.min(worldWidth * 0.935, 572)  // 10% larger
    const panelHeight = Math.min(worldHeight * 0.66, 572)  // 10% larger
    const panelBackground = this.add.rectangle(worldWidth / 2, worldHeight / 2, panelWidth, panelHeight, 0x2a2a2a, 0.94)  // Dark gray
    panelBackground.setStrokeStyle(2, 0xb0b0b0)  // Light gray border

    const titleY = worldHeight / 2 - panelHeight / 2 + 60
    const title = this.add
      .text(worldWidth / 2, titleY, 'Settings', {
        fontSize: '40px',  // Larger title
        fontFamily: 'MontserratBold',
        color: '#d7ddcc',  // Brighter color (light gray-green)
      })
      .setOrigin(0.5)

    // Add info icon in top left corner
    const infoIconSize = 64  // Larger icon (increased from 56)
    const infoIconX = worldWidth / 2 - panelWidth / 2 + 50  // Shifted right more (from 45 to 50)
    const infoIconY = worldHeight / 2 - panelHeight / 2 + 58  // Shifted down more (from 53 to 58)
    
    // Create shadow by duplicating icon, offset 1px right and down
    const infoIconShadow = this.add.image(infoIconX + 1, infoIconY + 1, 'info-icon')
    infoIconShadow.setDisplaySize(infoIconSize, infoIconSize)
    infoIconShadow.setTintFill(0xd0d0d0)  // Bright grey shadow color
    infoIconShadow.setAlpha(0.5)  // More visible shadow opacity
    infoIconShadow.setDepth(20)  // Behind the icon
    
    const infoIcon = this.add.image(infoIconX, infoIconY, 'info-icon')
    infoIcon.setDisplaySize(infoIconSize, infoIconSize)
    // FIX: Use brighter color for info icon
    infoIcon.setTintFill(0x4a5a4a)  // Brighter green than HUD background (0x2f3b32)
    infoIcon.setInteractive({ useHandCursor: true })
    infoIcon.setDepth(21)
    
    // Lock/attach them together by storing reference
    infoIcon.setData('shadow', infoIconShadow)
    infoIconShadow.setData('icon', infoIcon)
    infoIcon.on('pointerdown', () => {
      this.playSound('settings-sound', 1.0)
      this.openCreditsPanel()
    })

    const options: Array<{
      key: string
      label: string
      onSelect: () => void
    }> = [
      {
        key: 'volume',
        label: 'Volume:',
        onSelect: () => this.cycleVolume(),
      },
      {
        key: 'shake',
        label: 'Cam shake',
        onSelect: () => this.toggleScreenShake(),
      },
      {
        key: 'boycotted',
        label: 'Boycotted',
        onSelect: () => this.openBoycottedModal(),
      },
      {
        key: 'tips',
        label: 'Field Notes',
        onSelect: () => this.openInstructionsPanel(),
      },
      {
        key: 'level',
        label: 'Cities',
        onSelect: () => this.openLevelSelection(),
      },
    ]

    const optionStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '22px',
      fontFamily: 'Montserrat',
      color: '#ffffff',  // White
    }

    const optionStartY = titleY + 90  // Shifted down (was 70, now 90)

    options.forEach((option, index) => {
      // Add spacing between Camera Shake and Field Notes to create a gap between sections
      let yOffset = index * 56
      // Boycotted (index 2) should be centered between Cam shake (index 1) and Field Notes (index 3)
      // Add extra spacing to shift Boycotted down a bit
      if (index === 2) {  // Boycotted
        yOffset += 25  // Shift down to center it better
      } else if (index >= 3) {  // Field Notes and Cities (indices 3 and 4)
        yOffset += 50  // Add extra spacing to create gap and shift down
      }
      // Options are in correct order: Volume, Camera Shake, Boycotted, Field Notes, Cities
      
      // Create option text - we'll position it after calculating total width with status
      const optionText = this.add
        .text(0, optionStartY + yOffset, '', optionStyle)
        .setOrigin(0, 0.5)  // Left origin for now, will center after calculating total width
        optionText.setInteractive({ useHandCursor: true })
        // Store the onSelect function so status text can also trigger it
        optionText.setData('onSelect', option.onSelect)
        optionText.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          // Stop event propagation to prevent clicks from reaching other elements
          pointer.event.stopPropagation()
          this.playSound('settings-sound', 1.0)
          option.onSelect()
          this.refreshSettingsPanel()
        })
        // Set initial underline for Boycotted, Field Notes, and Cities
        if (option.key === 'boycotted' || option.key === 'tips' || option.key === 'level') {
          optionText.setStyle({ textDecoration: 'underline' })
        }
        this.settingsOptionsMap.set(option.key, optionText)
    })

    // Create "Keep Boycotting" button with shadow and press effect
    // Account for extra spacing added to Field Notes and Cities (50px each)
    const extraSpacing = 50 * 2  // 50px for each of the 2 options after Camera Shake
    const resumeButtonY = optionStartY + options.length * 56 + extraSpacing - 10  // Shifted up more (was 20, now -10)
    const resumeButtonPadding = { left: 20, right: 20, top: 12, bottom: 12 }  // Increased padding for larger button
    const tempResumeText = this.add.text(0, 0, 'Keep Boycotting', { fontSize: '28px', fontFamily: 'MontserratBold' })  // Larger font (was 24px)
    const resumeTextWidth = tempResumeText.width
    const resumeTextHeight = tempResumeText.height
    tempResumeText.destroy()
    const resumeButtonWidth = resumeTextWidth + resumeButtonPadding.left + resumeButtonPadding.right
    const resumeButtonHeight = resumeTextHeight + resumeButtonPadding.top + resumeButtonPadding.bottom
    const resumeButtonRadius = 6  // Slightly rounded (less than other buttons)
    
    // Create shadow for resume button - same dimensions, positioned above (upward direction)
    const resumeButtonShadow = this.add.graphics()
    resumeButtonShadow.fillStyle(0x000000, 0.2)  // Subtle shadow
    const resumeShadowYOffset = 6  // Shift shadow up more (above button) for more visible effect
    resumeButtonShadow.fillRoundedRect(-resumeButtonWidth / 2, -resumeButtonHeight / 2 - resumeShadowYOffset, resumeButtonWidth, resumeButtonHeight, resumeButtonRadius)  // Same dimensions, above button
    resumeButtonShadow.setPosition(worldWidth / 2, resumeButtonY)
    resumeButtonShadow.setDepth(19)  // Behind button
    
    // Create rounded background for resume button
    const resumeButtonBgGraphics = this.add.graphics()
    resumeButtonBgGraphics.fillStyle(0x195340, 1)  // Resume button background color (rgba(25, 83, 64, 0.8) -> solid)
    resumeButtonBgGraphics.fillRoundedRect(-resumeButtonWidth / 2, -resumeButtonHeight / 2, resumeButtonWidth, resumeButtonHeight, resumeButtonRadius)
    resumeButtonBgGraphics.setPosition(worldWidth / 2, resumeButtonY)
    resumeButtonBgGraphics.setDepth(20)
    
    const resumeText = this.add
      .text(worldWidth / 2, resumeButtonY, 'Keep Boycotting', {
        fontSize: '28px',  // Larger font (was 24px)
        fontFamily: 'MontserratBold',
        color: '#e0d5b6',  // Parchment color
        padding: resumeButtonPadding,
      })
      .setOrigin(0.5)
    resumeText.setDepth(21)  // Above background
    resumeText.setInteractive({ useHandCursor: true })
    // Store original Y position for pressed effect
    resumeText.setData('originalY', resumeButtonY)
    resumeText.setData('shadow', resumeButtonShadow)
    resumeText.setData('bg', resumeButtonBgGraphics)
    resumeButtonShadow.setData('originalY', resumeButtonY)
    resumeButtonBgGraphics.setData('originalY', resumeButtonY)
    resumeText.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Stop event propagation to prevent conflicts
      if (pointer && pointer.event) {
        pointer.event.stopPropagation()
      }
      // Button press effect on click - shift up into shadow above
      const originalY = resumeText.getData('originalY') as number
      const shadow = resumeText.getData('shadow') as Phaser.GameObjects.Graphics
      const bg = resumeText.getData('bg') as Phaser.GameObjects.Graphics
      const pressOffset = 5  // Shift up by 5 pixels when pressed (presses into upward shadow)
      resumeText.setY(originalY - pressOffset)
      shadow.setY(originalY - pressOffset)
      bg.setY(originalY - pressOffset)
      shadow.setVisible(false)  // Hide shadow when pressed
    })
    resumeText.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Stop event propagation to prevent conflicts
      if (pointer && pointer.event) {
        pointer.event.stopPropagation()
      }
      // Return to original position and trigger action on release
      const originalY = resumeText.getData('originalY') as number
      const shadow = resumeText.getData('shadow') as Phaser.GameObjects.Graphics
      const bg = resumeText.getData('bg') as Phaser.GameObjects.Graphics
      resumeText.setY(originalY)
      shadow.setY(originalY)
      bg.setY(originalY)
      shadow.setVisible(true)  // Show shadow again
      // Close settings panel and resume game
      // Call closeSettingsPanel first, which will handle resuming
      this.closeSettingsPanel()
    })
    resumeText.on('pointerout', () => {
      // Return button to original position if pointer leaves
      const originalY = resumeText.getData('originalY') as number
      const shadow = resumeText.getData('shadow') as Phaser.GameObjects.Graphics
      const bg = resumeText.getData('bg') as Phaser.GameObjects.Graphics
      resumeText.setY(originalY)
      shadow.setY(originalY)
      bg.setY(originalY)
      shadow.setVisible(true)  // Show shadow
    })

    const containerChildren: Phaser.GameObjects.GameObject[] = [
      overlay,
      panelBackground,
      title,
      infoIconShadow,
      infoIcon,
      ...Array.from(this.settingsOptionsMap.values()),
      resumeButtonShadow,
      resumeButtonBgGraphics,
      resumeText,
    ]
    
    // Store reference to Keep Boycotting button (used for future reference)
    this.keepBoycottingButton = resumeText
    if (this.keepBoycottingButton) {
      // Store reference for potential future use
    }

    const container = this.add.container(0, 0, containerChildren)
    container.setDepth(20)
    container.setVisible(false)
    container.setActive(false)
    // Don't make container interactive - let children handle their own input
    container.disableInteractive()

    this.settingsPanel = container
    this.refreshSettingsPanel()
  }

  private refreshSettingsPanel(): void {
    if (!this.settingsPanel) {
      return
    }

    this.settingsOptionsMap.forEach((text, key) => {
      if (key === 'volume') {
        const volumeLabel = VOLUME_LEVELS[this.settings.volumeIndex].label
        // Set base color to light gray, then add white for the status
        text.setText(`Volume: `)
        text.setStyle({ color: '#b0b0b0' })  // Light gray for label
        
        // Calculate total width of label + status for centering
        const tempStatusText = this.add.text(0, 0, volumeLabel, { fontSize: '22px', fontFamily: 'Montserrat' })
        const totalWidth = text.width + tempStatusText.width
        tempStatusText.destroy()
        
        // Center the entire option (label + status) on screen
        const worldWidth = this.scale.width
        const labelX = worldWidth / 2 - totalWidth / 2
        text.setX(labelX)
        text.setOrigin(0, 0.5)
        
        // Create status text in white, positioned right after label
        const statusText = this.add.text(
          labelX + text.width,
          text.y,
          volumeLabel,
          { fontSize: '22px', fontFamily: 'Montserrat', color: '#ffffff' }
        ).setOrigin(0, 0.5)
        // Make status text interactive and clickable
        statusText.setInteractive({ useHandCursor: true })
        const onSelect = text.getData('onSelect') as () => void
        if (onSelect) {
          statusText.on('pointerdown', () => {
            onSelect()
            this.refreshSettingsPanel()
          })
        }
        // Store status text reference and remove old one if exists
        const oldStatus = text.getData('statusText') as Phaser.GameObjects.Text
        if (oldStatus) oldStatus.destroy()
        text.setData('statusText', statusText)
        if (this.settingsPanel) {
          this.settingsPanel.add(statusText)
        }
      } else if (key === 'background') {
        const status = this.settings.showBackground ? 'On' : 'Off'
        text.setText(`Backdrop Glow: `)
        text.setStyle({ color: '#b0b0b0' })  // Light gray for label
        const statusText = this.add.text(
          text.x + text.width / 2,
          text.y,
          status,
          { fontSize: '22px', fontFamily: 'Montserrat', color: '#ffffff' }
        ).setOrigin(0, 0.5)
        // Make status text interactive and clickable
        statusText.setInteractive({ useHandCursor: true })
        const onSelect = text.getData('onSelect') as () => void
        if (onSelect) {
          statusText.on('pointerdown', () => {
            onSelect()
            this.refreshSettingsPanel()
          })
        }
        const oldStatus = text.getData('statusText') as Phaser.GameObjects.Text
        if (oldStatus) oldStatus.destroy()
        text.setData('statusText', statusText)
        if (this.settingsPanel) {
          this.settingsPanel.add(statusText)
        }
      } else if (key === 'tips') {
        text.setText('Field Notes')
        text.setStyle({ fontStyle: 'normal', textDecoration: 'underline', color: '#b0b0b0', fontFamily: 'MontserratBold', fontSize: '28px' })  // Light gray, bold, larger
        // Center Field Notes
        const worldWidth = this.scale.width
        text.setX(worldWidth / 2)
        text.setOrigin(0.5, 0.5)
        const oldStatus = text.getData('statusText') as Phaser.GameObjects.Text
        if (oldStatus) oldStatus.destroy()
      } else if (key === 'shake') {
        const status = this.settings.screenShake ? 'On' : 'Off'
        text.setText(`Cam shake: `)
        text.setStyle({ color: '#b0b0b0' })  // Light gray for label
        
        // Calculate total width of label + status for centering
        const tempStatusText = this.add.text(0, 0, status, { fontSize: '22px', fontFamily: 'Montserrat' })
        const totalWidth = text.width + tempStatusText.width
        tempStatusText.destroy()
        
        // Center the entire option (label + status) on screen
        const worldWidth = this.scale.width
        const labelX = worldWidth / 2 - totalWidth / 2
        text.setX(labelX)
        text.setOrigin(0, 0.5)
        
        // Create status text in white, positioned right after label
        const statusText = this.add.text(
          labelX + text.width,
          text.y,
          status,
          { fontSize: '22px', fontFamily: 'Montserrat', color: '#ffffff' }
        ).setOrigin(0, 0.5)
        // Make status text interactive and clickable
        statusText.setInteractive({ useHandCursor: true })
        const onSelect = text.getData('onSelect') as () => void
        if (onSelect) {
          statusText.on('pointerdown', () => {
            onSelect()
            this.refreshSettingsPanel()
          })
        }
        const oldStatus = text.getData('statusText') as Phaser.GameObjects.Text
        if (oldStatus) oldStatus.destroy()
        text.setData('statusText', statusText)
        if (this.settingsPanel) {
          this.settingsPanel.add(statusText)
        }
      } else if (key === 'boycotted') {
        // Clean up old underline if it exists
        const oldUnderline = text.getData('underlineGraphics') as Phaser.GameObjects.Graphics
        if (oldUnderline) oldUnderline.destroy()
        
        text.setText('Boycotted')
        text.setStyle({ fontStyle: 'normal', textDecoration: 'none', color: '#9b3a10', fontFamily: 'MontserratBold', fontSize: '34px' })  // Slightly brighter color, no text decoration (we'll add graphics underline)
        // Center Boycotted
        const worldWidth = this.scale.width
        text.setX(worldWidth / 2)
        text.setOrigin(0.5, 0.5)
        
        // Add underline graphics (same style as start modal)
        const underlineGraphics = this.add.graphics()
        const underlineWidth = text.width + 20  // Slightly wider than text
        const underlineY = text.y + text.height / 2 + 8  // Position below text
        // Draw shadow first (subtle shadow) - same as start modal
        underlineGraphics.lineStyle(4, 0x000000, 0.2)
        underlineGraphics.lineBetween(worldWidth / 2 - underlineWidth / 2 + 1, underlineY + 1, worldWidth / 2 + underlineWidth / 2 + 1, underlineY + 1)
        // Draw main underline (same style as start modal: lineStyle(2, 0x8b2a00, 1))
        underlineGraphics.lineStyle(2, 0x8b2a00, 1)  // Same thickness and color as start modal
        underlineGraphics.lineBetween(worldWidth / 2 - underlineWidth / 2, underlineY, worldWidth / 2 + underlineWidth / 2, underlineY)
        underlineGraphics.setDepth(text.depth + 1)
        underlineGraphics.setScrollFactor(0)
        if (this.settingsPanel) {
          this.settingsPanel.add(underlineGraphics)
        }
        text.setData('underlineGraphics', underlineGraphics)
        
        const oldStatus = text.getData('statusText') as Phaser.GameObjects.Text
        if (oldStatus) oldStatus.destroy()
      } else if (key === 'level') {
        text.setText('Cities')
        text.setStyle({ fontStyle: 'normal', textDecoration: 'underline', color: '#b0b0b0', fontFamily: 'MontserratBold', fontSize: '34px' })  // Light gray, bold, larger
        // Center Cities
        const worldWidth = this.scale.width
        text.setX(worldWidth / 2)
        text.setOrigin(0.5, 0.5)
        const oldStatus = text.getData('statusText') as Phaser.GameObjects.Text
        if (oldStatus) oldStatus.destroy()
      }
    })
  }

  private openSettingsPanel(): void {
    // Check BEFORE ensuring panel exists
    if (this.isPausedForSettings) {
      return
    }
    
    this.ensureSettingsPanel()
    if (!this.settingsPanel) {
      return
    }

    // Play configure sound and pause music
    this.playSound('configure-sound', 1.0)
    this.pauseBackgroundMusic()
    
    // Pause all powerup sounds when opening settings
    // Pause time sounds (slow motion powerup)
    this.timeSoundInstances.forEach(instance => {
      if (instance && instance.isPlaying) {
        instance.pause()
      }
    })
    // Pause shield sound if shield is active
    if (this.shieldBubble && this.shieldBubble.active) {
      const shieldSound = this.soundEffects.get('shield-sound')
      if (shieldSound && shieldSound instanceof Phaser.Sound.BaseSound && shieldSound.isPlaying) {
        shieldSound.pause()
      }
    }
    
    // Start settings music (loops automatically)
    if (this.settingsMusic && !this.settingsMusic.isPlaying) {
      this.settingsMusic.play()
    }

    this.isPausedForSettings = true
    this.physics.world.pause()
    this.tweens.pauseAll()
    this.previousTimeScale = this.time.timeScale
    this.time.timeScale = 0
    if (this.settingsButton) {
      this.settingsButton.disableInteractive()
      this.settingsButton.setAlpha(0.6)
    }

    this.refreshSettingsPanel()
    this.settingsPanel.setVisible(true)
    this.settingsPanel.setActive(true)
    
    // Record when panel was opened to prevent immediate closing
    this.settingsPanelOpenTime = this.time.now
    
    // Remove main Enter handler and add settings-specific handlers
    const settingsKeyboard = this.input.keyboard
    if (settingsKeyboard) {
      // Remove the main Enter handler (added in create())
      settingsKeyboard.removeAllListeners('keydown-ENTER')
      settingsKeyboard.removeAllListeners('keydown-SPACE')
      
      // Define the close handler
      const closeSettingsHandler = () => {
        // Prevent immediate closing if panel was just opened (within 300ms to be safe)
        const timeSinceOpen = this.time.now - (this.settingsPanelOpenTime || 0)
        if (timeSinceOpen < 300) {
          return
        }
      
        if (this.settingsPanel?.visible) {
          // Check if any nested modal is open first
          const hasNestedModal = this.hasNestedModalOpen()
          if (hasNestedModal) {
            // Close the nested modal first
            this.closeNestedModal()
          } else {
            // Act as ESC - close settings and resume game
            this.closeSettingsPanel()
          }
        }
      }
      
      // Add handlers immediately - the debounce check in the handler will prevent immediate triggering
      // This ensures handlers are always present when settings panel is visible
      settingsKeyboard.on('keydown-ENTER', closeSettingsHandler)
      settingsKeyboard.on('keydown-SPACE', closeSettingsHandler)
    }
  }

  private closeSettingsPanel(): void {
    // Prevent closing if panel was just opened (within 300ms)
    const timeSinceOpen = this.time.now - (this.settingsPanelOpenTime || 0)
    if (timeSinceOpen < 300) {
      return
    }
    
    if (!this.settingsPanel) {
      return
    }
    // Only check isPausedForSettings if we're actually paused
    // This allows the button to work even if the state is inconsistent
    if (!this.isPausedForSettings) {
      // Still resume game state in case it's needed
      this.physics.world.resume()
      this.tweens.resumeAll()
      if (this.previousTimeScale !== undefined) {
        this.time.timeScale = this.previousTimeScale
      }
    }

    // Stop settings music and resume background music when closing settings
    if (this.settingsMusic && this.settingsMusic.isPlaying) {
      this.settingsMusic.stop()
    }
    this.resumeBackgroundMusic()
    
    // Resume all powerup sounds when closing settings
    // Resume time sounds (slow motion powerup)
    this.timeSoundInstances.forEach(instance => {
      if (instance && instance.isPaused) {
        instance.resume()
      }
    })
    // Resume shield sound if shield is active
    if (this.shieldBubble && this.shieldBubble.active) {
      const shieldSound = this.soundEffects.get('shield-sound')
      if (shieldSound && shieldSound instanceof Phaser.Sound.BaseSound && shieldSound.isPaused) {
        shieldSound.resume()
      }
    }

    this.isPausedForSettings = false
    this.physics.world.resume()
    this.tweens.pauseAll()
    this.time.timeScale = this.previousTimeScale
    if (this.settingsButton) {
      this.settingsButton.setAlpha(1)
      this.settingsButton.setInteractive({ useHandCursor: true })
    }

    this.settingsPanel.setVisible(false)
    this.settingsPanel.setActive(false)
    this.applySettingsVisuals()
    this.registry.set('game-settings', this.settings)
    
    // Remove keyboard handlers when closing settings
    const closeSettingsKeyboard = this.input.keyboard
    if (closeSettingsKeyboard) {
      // Remove Enter/Space handlers that were added for settings panel
      closeSettingsKeyboard.removeAllListeners('keydown-ENTER')
      closeSettingsKeyboard.removeAllListeners('keydown-SPACE')
      
      // Delay restoring game handlers to prevent the same keydown event from triggering
      this.time.delayedCall(150, () => {
        if (closeSettingsKeyboard) {
          // Re-add Enter handler for game (if needed)
          closeSettingsKeyboard.on('keydown-ENTER', () => {
            if (this.startPanel?.visible && this.startButtonText) {
              const isRespawn = this.startButtonText?.getData('isRespawnButton') === true
              this.startGame(isRespawn)
            } else if (!this.isPausedForSettings && this.isGameActive && !this.startPanel?.visible) {
              // Act as configure button - same check as configure button (just !isPausedForSettings)
              this.openSettingsPanel()
            }
          })
          // Re-add Space handler for game (for throwing)
          if (!this.fireKey) {
            this.fireKey = closeSettingsKeyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
          }
        }
      })
    }
  }

  private applySettingsVisuals(): void {
    if (this.backgroundLayer) {
      this.updateBackgroundScale()
      this.backgroundLayer.setVisible(this.settings.showBackground)
    }
  }

  private hasNestedModalOpen(): boolean {
    // Check if any nested modal is currently open
    if (this.instructionsPanel && this.instructionsPanel.active) {
      return true
    }
    if (this.creditsPanel && this.creditsPanel.active) {
      return true
    }
    if (this.levelSelectionPanel && this.levelSelectionPanel.active) {
      return true
    }
    // Check for boycotted modal (it doesn't have a stored panel, so check for its objects)
    const hasBoycottedModal = this.children.list.some((child) => {
      return child && (child as any).getData && (child as any).getData('isBoycottedModal') === true
    })
    if (hasBoycottedModal) {
      return true
    }
    return false
  }

  private closeNestedModal(): void {
    // Close the currently open nested modal
    if (this.instructionsPanel && this.instructionsPanel.active) {
      this.closeInstructionsPanel()
      return
    }
    if (this.creditsPanel && this.creditsPanel.active) {
      this.closeCreditsPanel()
      return
    }
    if (this.levelSelectionPanel && this.levelSelectionPanel.active) {
      this.levelSelectionPanel.destroy()
      this.levelSelectionPanel = undefined
      const keyboard = this.input.keyboard
      if (keyboard) {
        keyboard.removeAllListeners('keydown-ENTER')
        keyboard.removeAllListeners('keydown-SPACE')
      }
      return
    }
    // Close boycotted modal
    const boycottedObjects = this.children.list.filter((child) => {
      return child && (child as any).getData && (child as any).getData('isBoycottedModal') === true
    })
    if (boycottedObjects.length > 0) {
      boycottedObjects.forEach((obj) => {
        if (obj && obj.scene) {
          obj.destroy()
        }
      })
      // Also destroy any description tooltips
      this.children.list.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Container && child.getData('isBrandDescription')) {
          child.destroy()
        }
      })
      const keyboard = this.input.keyboard
      if (keyboard) {
        keyboard.removeAllListeners('keydown-ENTER')
        keyboard.removeAllListeners('keydown-SPACE')
        // Re-add settings panel handler if settings panel is still open
        if (this.settingsPanel?.visible) {
          const closeSettingsHandler = () => {
            if (this.settingsPanel?.visible) {
              // Check if any nested modal is open first
              const hasNestedModal = this.hasNestedModalOpen()
              if (hasNestedModal) {
                // Close the nested modal first
                this.closeNestedModal()
              } else {
                // If no nested modal, close settings
                this.closeSettingsPanel()
              }
            }
          }
          keyboard.on('keydown-ENTER', closeSettingsHandler)
          keyboard.on('keydown-SPACE', closeSettingsHandler)
        } else {
          // If settings panel is NOT visible, we're exiting directly to game - resume game state
          if (this.isPausedForSettings) {
            // Resume game if it was paused
            this.physics.world.resume()
            this.tweens.resumeAll()
            if (this.previousTimeScale !== undefined) {
              this.time.timeScale = this.previousTimeScale
            }
            this.isPausedForSettings = false
          }
          // Restore settings button state
          if (this.settingsButton) {
            this.settingsButton.setAlpha(1)
            this.settingsButton.setInteractive({ useHandCursor: true })
          }
          // Resume background music if game is active
          if (this.isGameActive) {
            this.resumeBackgroundMusic()
          }
        }
      }
    }
  }

  private cycleVolume(): void {
    // Play sound BEFORE changing volume so it uses current volume setting
    // If currently muted, don't play sound
    const currentVolumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    if (currentVolumeMultiplier > 0) {
      this.playSound('settings-sound', 1.0)
    }
    
    const nextIndex = ((this.settings.volumeIndex + 1) % VOLUME_LEVELS.length) as VolumeLevelIndex
    this.settings = { ...this.settings, volumeIndex: nextIndex }
    const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    this.sound.volume = volumeMultiplier
    
    // Update background music - stop/pause if volume is 0, resume/start if volume > 0
    if (volumeMultiplier === 0) {
      // Mute: Stop all sounds
      this.stopBackgroundMusic()
      this.stopHeartbeat()
      // Also stop all sound effects
      this.soundEffects.forEach((sound) => {
        if (sound && sound.isPlaying) {
          sound.stop()
        }
      })
    } else {
      // Unmute: Resume sounds if game is active
      if (this.isGameActive && !this.isPausedForSettings) {
        // Check if neither track is playing, and start if needed (but not during boss level)
        if (this.isBossLevel) {
          // Explicitly stop any background music that might be playing during boss level
          if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
            this.backgroundMusic1.stop()
          }
          if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
            this.backgroundMusic2.stop()
          }
        } else {
          const isPlaying = (this.backgroundMusic1?.isPlaying) || (this.backgroundMusic2?.isPlaying)
          if (!isPlaying) {
            this.startBackgroundMusic(false) // Don't force restart, just start if not playing
          } else {
            // Resume if paused
            if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
              this.backgroundMusic1.resume()
            }
            if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
              this.backgroundMusic2.resume()
            }
          }
        }
        this.updateHeartbeat()
      }
    }
  }


  private toggleScreenShake(): void {
    this.playSound('settings-sound', 1.0)
    this.settings = { ...this.settings, screenShake: !this.settings.screenShake }
  }

  private openBoycottedModal(): void {
    // Keep game paused - don't close settings panel, just hide it
    if (this.settingsPanel) {
      this.settingsPanel.setVisible(false)
    }
    // Ensure game stays paused
    if (!this.isPausedForSettings) {
      this.isPausedForSettings = true
      this.physics.world.pause()
      this.tweens.pauseAll()
      this.previousTimeScale = this.time.timeScale
      this.time.timeScale = 0
    }
    
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height
    
    const overlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x000000, 0.8)
    overlay.setDepth(200)
    overlay.setData('isBoycottedModal', true)
    
    const panelWidth = Math.min(worldWidth * 0.99, 660)
    const panelHeight = Math.min(worldHeight * 0.935, 1100)
    const panelBackground = this.add.rectangle(worldWidth / 2, worldHeight / 2, panelWidth, panelHeight, 0x2a2a2a, 0.95)
    panelBackground.setStrokeStyle(2, 0xb0b0b0)
    panelBackground.setDepth(201)
    panelBackground.setData('isBoycottedModal', true)
    
    // Get all brands with specific order: first 10 in order, then specific order for 11-18
    const orderedBrands = ['cocacola', 'google', 'amazon', 'starbucks', 'microsoft', 'chevron', 'intel', 'mcds', 'hp', 'airbnb', 'xbox', 'pizzahut', 'dell', 'bk', 'nestle', 'zara', 'disneyplus', 'puma']
    const allBrands = orderedBrands
    
    // Calculate available space - ensure grid fits within panel
    const closeButtonHeight = 50
    const panelCenterX = worldWidth / 2
    const panelTop = worldHeight / 2 - panelHeight / 2
    
    // Grid layout: 3 columns, 6 rows (18 brands total)
    const cols = 3
    const rows = 6
    
    const horizontalPadding = 40
    const verticalPadding = 60  // Top and bottom padding
    const availableWidth = panelWidth - (horizontalPadding * 2)
    const availableHeight = panelHeight - verticalPadding * 2 - closeButtonHeight
    const gapSize = 4
    
    // Calculate brand size to fit both width and height constraints
    const maxWidthSize = Math.floor((availableWidth - (cols - 1) * gapSize) / cols)
    const maxHeightSize = Math.floor((availableHeight - (rows - 1) * gapSize) / rows)
    const brandSize = Math.min(maxWidthSize, maxHeightSize)  // Use smaller to ensure it fits
    
    const gridWidth = (cols * brandSize) + ((cols - 1) * gapSize)
    const gridHeight = (rows * brandSize) + ((rows - 1) * gapSize)
    
    const contentAreaTop = panelTop + verticalPadding
    const gridBottom = contentAreaTop + gridHeight + verticalPadding
    const closeButtonY = gridBottom + (panelTop + panelHeight - gridBottom) / 2  // Position between grid bottom and modal bottom
    const contentAreaBottom = closeButtonY - closeButtonHeight / 2 - 10  // Leave space above close button
    const contentAreaHeight = contentAreaBottom - contentAreaTop
    const contentAreaCenterY = contentAreaTop + contentAreaHeight / 2
    
    const gridRightEdge = panelCenterX + gridWidth / 2
    const gridStartX = gridRightEdge - brandSize / 2
    const gridTopEdge = contentAreaCenterY - gridHeight / 2
    const gridStartY = gridTopEdge + brandSize / 2
    
    // Store all created objects for cleanup
    const modalObjects: Phaser.GameObjects.GameObject[] = [overlay, panelBackground]
    
    // Brand descriptions
    const brandDescriptions: Record<string, string> = {
      'cocacola': 'Funded Israeli operations and maintained operations in occupied territories.',
      'mcds': 'Operates in illegal settlements and supports Israeli economy through operations.',
      'pizzahut': 'Operates in occupied territories, normalizing illegal settlements.',
      'starbucks': 'Supports Israeli operations and has been complicit in funding occupation.',
      'bk': 'Operates in illegal settlements, contributing to normalization of occupation.',
      'nestle': 'Operates in occupied territories and supports Israeli economy.',
      'amazon': 'Provides cloud services to Israeli military and government, enabling occupation.',
      'google': 'Provides technology and services to Israeli military, supporting surveillance.',
      'microsoft': 'Provides technology infrastructure to Israeli government and military.',
      'intel': 'Operates major facilities in Israel, directly funding the occupation economy.',
      'xbox': 'Microsoft subsidiary providing services that support Israeli operations.',
      'dell': 'Provides technology to Israeli military and government institutions.',
      'hp': 'Supplies technology to Israeli military and government, enabling occupation.',
      'disneyplus': 'Disney has investments and operations supporting Israeli economy.',
      'chevron': 'Major oil company with operations supporting Israeli energy sector.',
      'puma': 'Sponsors Israeli football teams, normalizing occupation through sports.',
      'zara': 'Operates in occupied territories, contributing to settlement economy.',
      'airbnb': 'Listed properties in illegal settlements, profiting from occupation.',
    }
    
    // Create brand grid
    allBrands.forEach((brandName, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = gridStartX - col * (brandSize + gapSize)
      const y = gridStartY + row * (brandSize + gapSize)
      
      const brandKey = `brand-${brandName}`
      if (!this.textures.exists(brandKey)) {
        return  // Skip if texture doesn't exist
      }
      
      // Even lighter gray background for grid box
      const bgGraphics = this.add.graphics()
      bgGraphics.fillStyle(0x6a6a6a, 1)  // Slightly more light gray background
      bgGraphics.fillRoundedRect(-brandSize / 2, -brandSize / 2, brandSize, brandSize, 8)
      bgGraphics.setDepth(0)
      
      // Shadow
      const shadowGraphics = this.add.graphics()
      shadowGraphics.fillStyle(0x000000, 0.3)
      const shadowOffset = 3
      shadowGraphics.fillRoundedRect(-brandSize / 2 + shadowOffset, -brandSize / 2 + shadowOffset, brandSize, brandSize, 8)
      shadowGraphics.setDepth(1)
      
      // Brand image - preserve aspect ratio, make smaller to fit
      const brandTexture = this.textures.get(brandKey)
      const textureWidth = brandTexture.source[0].width
      const textureHeight = brandTexture.source[0].height
      
      // Use consistent max size for all logos to ensure they're similar size
      // Calculate based on the larger dimension to ensure all logos fill similar space
      const maxDisplaySize = brandSize * 0.9  // 90% of box size to leave padding
      
      // For logos, use the larger of width or height as the base, then scale proportionally
      // This ensures all logos appear similar in size regardless of aspect ratio
      const baseSize = Math.max(textureWidth, textureHeight)
      const scaleFactor = maxDisplaySize / baseSize
      
      let displayWidth = textureWidth * scaleFactor
      let displayHeight = textureHeight * scaleFactor
      
      // Ensure neither dimension exceeds maxDisplaySize
      if (displayWidth > maxDisplaySize) {
        displayHeight = displayHeight * (maxDisplaySize / displayWidth)
        displayWidth = maxDisplaySize
      }
      if (displayHeight > maxDisplaySize) {
        displayWidth = displayWidth * (maxDisplaySize / displayHeight)
        displayHeight = maxDisplaySize
      }
      
      // No brand-specific multipliers - all brands fit the same way
      const adjustedWidth = displayWidth
      const adjustedHeight = displayHeight
      
      // Ensure we don't exceed the grid cell size (leave 5% padding)
      const maxSize = brandSize * 0.95
      let finalWidth = adjustedWidth
      let finalHeight = adjustedHeight
      
      // Maintain aspect ratio while respecting max size
      if (finalWidth > maxSize) {
        finalWidth = maxSize
        finalHeight = finalWidth * (displayHeight / displayWidth)
      }
      if (finalHeight > maxSize) {
        finalHeight = maxSize
        finalWidth = finalHeight * (displayWidth / displayHeight)
      }
      
      const brandImage = this.add.image(0, 0, brandKey)
      brandImage.setDisplaySize(finalWidth, finalHeight)
      brandImage.setOrigin(0.5, 0.5)
      brandImage.setDepth(2)
      
      // Default border
      const borderGraphics = this.add.graphics()
      const borderRadius = 8
      borderGraphics.clear()
      borderGraphics.lineStyle(4, 0x2f3b32, 1)
      borderGraphics.strokeRoundedRect(-brandSize / 2, -brandSize / 2, brandSize, brandSize, borderRadius)
      borderGraphics.setDepth(3)
      
      // Selected outline (initially hidden)
      const selectedOutline = this.add.graphics()
      selectedOutline.clear()
      selectedOutline.lineStyle(4, 0x8b2a00, 1)  // Same color as description box outline
      selectedOutline.strokeRoundedRect(-brandSize / 2, -brandSize / 2, brandSize, brandSize, borderRadius)
      selectedOutline.setDepth(4)
      selectedOutline.setVisible(false)
      
      const container = this.add.container(x, y, [bgGraphics, shadowGraphics, brandImage, borderGraphics, selectedOutline])
      container.setDepth(202 + index)
      container.setData('brandName', brandName)
      container.setData('isBoycottedModal', true)
      container.setData('selectedOutline', selectedOutline)
      container.setData('borderGraphics', borderGraphics)
      container.setInteractive(new Phaser.Geom.Rectangle(-brandSize / 2, -brandSize / 2, brandSize, brandSize), Phaser.Geom.Rectangle.Contains)
      container.setData('onSelect', () => {
        // Remove selection from all other containers
        modalObjects.forEach((obj) => {
          if (obj instanceof Phaser.GameObjects.Container && obj !== container && obj.getData('selectedOutline')) {
            const outline = obj.getData('selectedOutline') as Phaser.GameObjects.Graphics
            if (outline) outline.setVisible(false)
          }
        })
        // Show selection outline on this container
        selectedOutline.setVisible(true)
        
        const description = brandDescriptions[brandName] || 'This brand has been boycotted for supporting occupation.'
        // Show description in a tooltip or modal
        this.showBrandDescription(brandName, description, worldWidth / 2, worldHeight / 2)
      })
      container.on('pointerdown', () => {
        const onSelect = container.getData('onSelect') as () => void
        if (onSelect) onSelect()
      })
      
      modalObjects.push(container)
    })
    
    // Return button - positioned between grid bottom and modal bottom
    const returnButtonY = closeButtonY - 10  // Shift up (from closeButtonY)
    const returnButtonPadding = { left: 20, right: 20, top: 10, bottom: 10 }
    const tempReturnText = this.add.text(0, 0, 'Return', { fontSize: '28px', fontFamily: 'MontserratBold' })
    const returnButtonWidth = tempReturnText.width + returnButtonPadding.left + returnButtonPadding.right
    const returnButtonHeight = tempReturnText.height + returnButtonPadding.top + returnButtonPadding.bottom
    tempReturnText.destroy()
    const returnButtonRadius = 6
    
    // Create shadow for return button
    const returnButtonShadow = this.add.graphics()
    returnButtonShadow.fillStyle(0x000000, 0.2)  // Subtle shadow
    const returnShadowYOffset = 6
    returnButtonShadow.fillRoundedRect(-returnButtonWidth / 2, -returnButtonHeight / 2 - returnShadowYOffset, returnButtonWidth, returnButtonHeight, returnButtonRadius)
    returnButtonShadow.setPosition(worldWidth / 2, returnButtonY)
    returnButtonShadow.setDepth(249)  // Behind button
    returnButtonShadow.setData('isBoycottedModal', true)  // Ensure shadow is marked for cleanup
    
    const closeButton = this.add
      .text(worldWidth / 2, returnButtonY, 'Return', {
        fontSize: '28px',
        fontFamily: 'MontserratBold',
        color: '#e0d5b6',  // Parchment color (from #ffffff)
        backgroundColor: '#2f3b32',
        padding: returnButtonPadding,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(250)
      .setInteractive({ useHandCursor: true })
    closeButton.setData('isBoycottedModal', true)
    modalObjects.push(returnButtonShadow, closeButton)
    
    const closeBoycottedModal = () => {
      // Destroy all modal objects
      modalObjects.forEach((obj) => {
        if (obj && obj.scene) {
          obj.destroy()
        }
      })
      
      // Also destroy any description tooltips
      this.children.list.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Container && child.getData('isBrandDescription')) {
          child.destroy()
        }
      })
      
      // Remove keyboard handlers
      const keyboard = this.input.keyboard
      if (keyboard) {
        keyboard.removeAllListeners('keydown-ENTER')
        keyboard.removeAllListeners('keydown-SPACE')
        // Re-add settings panel handler if settings panel is still open
        if (this.settingsPanel?.visible) {
          const closeSettingsHandler = () => {
            if (this.settingsPanel?.visible) {
              // Check if any nested modal is open first
              const hasNestedModal = this.hasNestedModalOpen()
              if (hasNestedModal) {
                // Close the nested modal first
                this.closeNestedModal()
              } else {
                // If no nested modal, close settings
                this.closeSettingsPanel()
              }
            }
          }
          keyboard.on('keydown-ENTER', closeSettingsHandler)
          keyboard.on('keydown-SPACE', closeSettingsHandler)
        } else {
          // If settings panel is NOT visible, we should still return to settings (not exit to game)
          // This matches the behavior of info and field notes modals
          // If we're already paused for settings, just make the panel visible
          if (this.isPausedForSettings && this.settingsPanel) {
            this.settingsPanel.setVisible(true)
            this.settingsPanel.setActive(true)
            this.refreshSettingsPanel()
            
            // Restore settings panel handlers
            const closeSettingsHandler = () => {
              if (this.settingsPanel?.visible) {
                const hasNestedModal = this.hasNestedModalOpen()
                if (hasNestedModal) {
                  this.closeNestedModal()
                } else {
                  this.closeSettingsPanel()
                }
              }
            }
            keyboard.on('keydown-ENTER', closeSettingsHandler)
            keyboard.on('keydown-SPACE', closeSettingsHandler)
          } else {
            // Not paused - open settings normally
            // Ensure game is paused before opening settings
            if (!this.isPausedForSettings) {
              this.isPausedForSettings = true
              this.physics.world.pause()
              this.tweens.pauseAll()
              this.previousTimeScale = this.time.timeScale
              this.time.timeScale = 0
            }
            this.openSettingsPanel()
          }
        }
      }
    }
    
    closeButton.on('pointerdown', closeBoycottedModal)
    
    // Add keyboard handler to close boycotted modal on Enter/Space (act as Return button)
    const keyboard = this.input.keyboard
    if (keyboard) {
      // Remove any existing handlers first to prevent conflicts
      keyboard.removeAllListeners('keydown-ENTER')
      keyboard.removeAllListeners('keydown-SPACE')
      keyboard.on('keydown-ENTER', closeBoycottedModal)
      keyboard.on('keydown-SPACE', closeBoycottedModal)
    }
  }

  private showBrandDescription(brandName: string, description: string, x: number, y: number): void {
    // Destroy any existing description
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Container && child.getData('isBrandDescription')) {
        child.destroy()
      }
    })
    
    const worldWidth = this.scale.width
    
    // Description panel
    const panelWidth = Math.min(worldWidth * 0.8, 500)
    const panelHeight = 200
    const bgGraphics = this.add.graphics()
    bgGraphics.fillStyle(0x2a2a2a, 0.98)
    bgGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 12)
    bgGraphics.lineStyle(3, 0x8b2a00, 1)
    bgGraphics.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 12)
    
    // Brand full names mapping
    const brandFullNames: Record<string, string> = {
      'cocacola': 'Coca-Cola',
      'mcds': "McDonald's",
      'pizzahut': 'Pizza Hut',
      'starbucks': 'Starbucks',
      'bk': 'Burger King',
      'nestle': 'Nestlé',
      'amazon': 'Amazon',
      'google': 'Google',
      'microsoft': 'Microsoft',
      'intel': 'Intel',
      'xbox': 'Xbox',
      'dell': 'Dell',
      'hp': 'HP',
      'disneyplus': 'Disney+',
      'chevron': 'Chevron',
      'puma': 'Puma',
      'zara': 'Zara',
      'airbnb': 'Airbnb',
    }
    
    // Brand name - use full name instead of initials
    const fullName = brandFullNames[brandName] || brandName.toUpperCase()
    const brandNameText = this.add.text(0, -panelHeight / 2 + 30, fullName, {
      fontSize: '24px',
      fontFamily: 'MontserratBold',
      color: '#b03000',  // Brighter red
    }).setOrigin(0.5, 0)
    
    // Description text - slightly larger
    const descText = this.add.text(0, -panelHeight / 2 + 70, description, {
      fontSize: '20px',  // Increased from 18px
      fontFamily: 'Montserrat',
      color: '#d7ddcc',
      wordWrap: { width: panelWidth - 40 },
      align: 'center',
    }).setOrigin(0.5, 0)
    
    const container = this.add.container(x, y, [bgGraphics, brandNameText, descText])
    container.setDepth(300)
    container.setData('isBrandDescription', true)
    
    // Auto-close after 5 seconds or on click
    const autoClose = this.time.delayedCall(5000, () => {
      if (container && container.scene) {
        container.destroy()
      }
    })
    
    container.setInteractive(new Phaser.Geom.Rectangle(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight), Phaser.Geom.Rectangle.Contains)
    container.on('pointerdown', () => {
      autoClose.destroy()
      if (container && container.scene) {
        container.destroy()
      }
    })
  }

  private getUnlockedLevels(): number {
    // All levels unlocked by default
    return LEVEL_DEFINITIONS.length - 1
  }
  
  private unlockLevel(_levelIndex: number): void {
    // DISABLED: localStorage - all levels unlocked by default
    // if (typeof window !== 'undefined' && window.localStorage) {
    //   const currentUnlocked = this.getUnlockedLevels()
    //   if (levelIndex > currentUnlocked) {
    //     window.localStorage.setItem('bittee-unlocked-levels', levelIndex.toString())
    //   }
    // }
  }
  
  private openLevelSelection(): void {
    // Close any existing level selection panel first
    if (this.levelSelectionPanel) {
      this.closeLevelSelection()
    }
    
    // Keep game paused - don't close settings panel, just hide it
    if (this.settingsPanel) {
      this.settingsPanel.setVisible(false)
    }
    // Ensure game stays paused
    if (!this.isPausedForSettings) {
      this.isPausedForSettings = true
      this.physics.world.pause()
      this.tweens.pauseAll()
      this.previousTimeScale = this.time.timeScale
      this.time.timeScale = 0
    }
    
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height
    
    const overlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x000000, 0.8)
    // Don't make overlay interactive - it blocks clicks on cities
    // overlay.setInteractive()  // Removed - was blocking city clicks
    overlay.setDepth(200)  // Overlay on top visually, but doesn't block input
    
    const panelWidth = Math.min(worldWidth * 0.99, 660)  // 10% larger
    const panelHeight = Math.min(worldHeight * 0.935, 1100)  // 10% larger
    const panelBackground = this.add.rectangle(worldWidth / 2, worldHeight / 2, panelWidth, panelHeight, 0x2a2a2a, 0.95)  // Dark gray
    panelBackground.setStrokeStyle(2, 0xb0b0b0)  // Light gray border
    panelBackground.setDepth(201)  // Panel background above overlay
    panelBackground.disableInteractive()  // Ensure panel background doesn't block clicks on level buttons
    
    const unlockedLevels = this.getUnlockedLevels()
    
    // Calculate available space within panel (no title, just close button)
    const closeButtonHeight = 50
    const panelCenterX = worldWidth / 2  // Panel center X
    const panelTop = worldHeight / 2 - panelHeight / 2
    
    // Grid layout: 3 columns, 5 rows (12 regular levels + 1 boss level = 13 total)
    const cols = 3
    const rows = 5
    
    // Calculate available width (with padding on sides)
    // Expand padding a bit to give more room for the grid
    const horizontalPadding = 40  // Increased padding on left and right sides
    const availableWidth = panelWidth - (horizontalPadding * 2)
    
    // Add gap between cities (matching border width)
    const gapSize = 4  // Border width, so gap matches border visually
    
    // Calculate level size to ensure grid fits within available width
    // gridWidth = (cols * levelSize) + ((cols - 1) * gapSize)
    // We want: gridWidth <= availableWidth
    // Solve for levelSize: levelSize = (availableWidth - (cols - 1) * gapSize) / cols
    const levelSize = Math.floor((availableWidth - (cols - 1) * gapSize) / cols)
    
    // Calculate grid dimensions (with gaps between cities)
    const gridWidth = (cols * levelSize) + ((cols - 1) * gapSize)
    const gridHeight = (rows * levelSize) + ((rows - 1) * gapSize)
    
    // Center the grid horizontally and vertically within the panel
    // Calculate available content area
    const contentAreaTop = panelTop + 20  // Start of content area (with padding, no title)
    const contentAreaBottom = panelTop + panelHeight - closeButtonHeight - 20  // End of content area (with padding)
    const contentAreaHeight = contentAreaBottom - contentAreaTop
    const contentAreaCenterY = contentAreaTop + contentAreaHeight / 2
    
    // Center grid horizontally: panel center X
    // For right-to-left ordering, the first city (index 0) should be in the rightmost column
    // So gridStartX should be the center of the rightmost cell
    const gridRightEdge = panelCenterX + gridWidth / 2
    const gridStartX = gridRightEdge - levelSize / 2  // Start from rightmost cell center
    
    // Center grid vertically: content area center Y
    // The grid's top edge should be at: contentAreaCenterY - gridHeight/2
    // The first cell's center is at: top edge + levelSize/2
    const gridTopEdge = contentAreaCenterY - gridHeight / 2
    const gridStartY = gridTopEdge + levelSize / 2
    
    // Clear any existing level buttons before creating new ones
    this.levelButtons.forEach(btn => {
      if (btn && btn.scene) {
        btn.destroy()
      }
    })
    this.levelButtons = []
    
    // Layout: 12 regular levels in 3x4 grid, then boss level in middle column of row 5
    // Filter to only show regular levels (first 12) + 1 boss level entry
    const regularLevels = LEVEL_DEFINITIONS.slice(0, 12)  // First 12 regular levels
    const bossLevelEntry = { key: 'boss-level', label: 'Final Boss', textureUrl: '/assets/gaza.jpg' }  // Boss level entry
    
    // First, calculate positions for regular levels (3x4 grid)
    const cityPositions: Array<{ x: number; y: number; isBoss?: boolean }> = []
    regularLevels.forEach((_level, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      // For right-to-left ordering: index 0 should be in rightmost column
      // gridStartX is the rightmost cell center
      // Cities are positioned by center, with gaps between them:
      // - City 0 center at gridStartX (rightmost)
      // - City 1 center at gridStartX - (levelSize + gapSize)
      // - City 2 center at gridStartX - 2*(levelSize + gapSize)
      const x = gridStartX - col * (levelSize + gapSize)
      const y = gridStartY + row * (levelSize + gapSize)
      cityPositions.push({ x, y, isBoss: false })
    })
    
    // Add boss level in middle column (col 1), row 5 (after 4 rows of regular levels)
    // Middle column is at: gridStartX - 1 * (levelSize + gapSize)
    // Row 5 is at: gridStartY + 4 * (levelSize + gapSize) + extraGap
    const bossGap = gapSize * 3  // Extra gap before boss level
    const bossX = gridStartX - 1 * (levelSize + gapSize)  // Middle column
    const bossY = gridStartY + 4 * (levelSize + gapSize) + bossGap  // Row 5 with extra gap
    cityPositions.push({ x: bossX, y: bossY, isBoss: true })
    
    const levelsToShow = [...regularLevels, bossLevelEntry]
    
    // Now create the cities using the pre-calculated positions
    // cityPositions are already in world coordinates (calculated from panelCenterX/panelCenterY)
    levelsToShow.forEach((level, index) => {
      // All levels fit in the 3x4 grid + boss level
      const { x, y, isBoss } = cityPositions[index]
      
      // Boss level is always unlocked if regular levels are unlocked
      const isUnlocked = index < 12 ? index <= unlockedLevels : unlockedLevels >= 11
      
      // Level thumbnail (backdrop)
      // Position thumbnail so edges touch - if city is levelSize wide and positioned at x (center),
      // then for cities to touch, adjacent centers must be exactly levelSize apart
      // For boss level (index 12), use gaza.png texture normally, gaza5.png when selected
      // We'll update this dynamically when selected, but start with boss-transition
      const textureKey = index === 12 ? 'boss-transition' : level.key
      const thumbnail = this.add.image(0, 0, textureKey)  // Position relative to container (0,0)
      // Ensure exact size - cities should touch with no gaps
      thumbnail.setDisplaySize(levelSize, levelSize)
      thumbnail.setOrigin(0.5, 0.5)  // Center origin - position is the center of the image
      thumbnail.setAlpha(isUnlocked ? 1 : 0.3)
      thumbnail.setTint(isUnlocked ? 0xffffff : 0x666666)
      thumbnail.disableInteractive()  // Ensure thumbnail doesn't block pointer events
      
      // Add shadow for city thumbnail (positioned relative to container)
      const shadowGraphics = this.add.graphics()
      shadowGraphics.fillStyle(0x000000, 0.3)  // Subtle shadow
      const shadowOffset = 3
      shadowGraphics.fillRoundedRect(-levelSize / 2 + shadowOffset, -levelSize / 2 + shadowOffset, levelSize, levelSize, 8)
      shadowGraphics.setDepth(0)  // Behind thumbnail
      shadowGraphics.disableInteractive()  // Ensure shadow doesn't block pointer events
      
      // Add border around thumbnail (slightly rounded, thick)
      // Outline depth order: Parchment (current city) = 310 (top), Selected (pressed) = 305 (middle), Default = 300 (bottom)
      // Boss level uses orange-ish red (#ff6b35), when selected uses olive green (0x2f3b32)
      const isCurrentLevel = index === 12 ? this.isBossLevel : index === this.currentLevelIndex
      let borderColor = isCurrentLevel ? 0xe0d5b6 : 0x2f3b32  // Parchment if current, otherwise default olive greenish
      let borderWidth = 4  // Default border width
      if (isBoss) {
        borderColor = 0x5a8a5a  // Brighter olive green for boss level (was 0x2f3b32, now brighter)
        borderWidth = 6  // Slightly thinner border for boss level (was 8)
      }
      const borderGraphics = this.add.graphics()
      const borderRadius = 8  // Slightly rounded
      // Draw border - ensure lineStyle is set before drawing
      borderGraphics.clear()  // Clear any previous drawing
      borderGraphics.lineStyle(borderWidth, borderColor, 1)  // Thick border
      // Draw full border rectangle centered at (0, 0) relative to container
      borderGraphics.strokeRoundedRect(-levelSize / 2, -levelSize / 2, levelSize, levelSize, borderRadius)
      // Default depth: current city = 310 (top), others = 300 (bottom)
      // When pressed, selected city will be 305 (middle)
      borderGraphics.setDepth(isCurrentLevel ? 310 : 300)
      borderGraphics.disableInteractive()  // Ensure border doesn't block pointer events
      
      // Lock icon for locked levels (positioned relative to container)
      let lockIcon: Phaser.GameObjects.Text | null = null
      if (!isUnlocked) {
        lockIcon = this.add
          .text(0, 0, '🔒', {
            fontSize: '24px',
          })
          .setOrigin(0.5)
          .setDepth(3)  // Above border
        lockIcon.disableInteractive()  // Ensure lock icon doesn't block pointer events
      }
      
      const container = this.add.container(x, y, [
        shadowGraphics,
        thumbnail,
        borderGraphics,
        ...(lockIcon ? [lockIcon] : []),
      ])
      // Set depth to be above overlay and panel background
      // Use index-based depth to ensure proper z-ordering (higher index = higher depth)
      // This ensures that when containers overlap, the one on top gets the click
      container.setDepth(202 + index)  // Cities above panel background, with index-based offset
      // Store reference to border, level index, and dimensions for potential updates
      container.setData('borderGraphics', borderGraphics)
      container.setData('shadowGraphics', shadowGraphics)
      // Store the actual level index (12 for boss level, otherwise the regular index)
      container.setData('levelIndex', index)
      container.setData('borderRadius', borderRadius)
      container.setData('levelSize', levelSize)
      container.setData('isPressed', false)  // Track if button is being held
      // Store reference to thumbnail for boss level so we can update it when selected
      if (isBoss) {
        container.setData('thumbnail', thumbnail)
      }
      
      if (isUnlocked) {
        // Make the entire image area selectable - interactive area matches image size exactly
        // The container is positioned at (x, y) which is the center of the city
        // Don't use setSize() as it can interfere with hit area calculation
        // Instead, set the hit area directly based on the image bounds
        // Hit area is relative to container's local coordinate system (0, 0)
        // Since children are positioned at (0, 0) with origin (0.5, 0.5), they're centered
        // Cities now have gaps between them, so hit area can be full size
        // Hit area covers the entire image with small padding to ensure edges are clickable
        // This is especially important for the final level button at the bottom
        const hitAreaPadding = 5  // Increased padding to ensure edges are clickable
        // Hit area coordinates: from top-left of the image to bottom-right
        // Image is centered at (0, 0) with size levelSize, so bounds are:
        // Left: -levelSize/2, Top: -levelSize/2, Width: levelSize, Height: levelSize
        const hitArea = new Phaser.Geom.Rectangle(
          -levelSize / 2 - hitAreaPadding, 
          -levelSize / 2 - hitAreaPadding, 
          levelSize + (hitAreaPadding * 2), 
          levelSize + (hitAreaPadding * 2)
        )
        // Store container reference in levelButtons array for manual hit testing
        // Set interactive but we'll also do manual hit testing to ensure correct selection
        // IMPORTANT: For containers, we need to set the input area bounds explicitly
        // The hit area is in local coordinates, but we need to tell Phaser the input bounds
        // Set the container's size to match the hit area bounds
        // Set interactive with hit area
        // Set size to match hit area bounds for proper input detection
        container.setSize(levelSize + (hitAreaPadding * 2), levelSize + (hitAreaPadding * 2))
        container.setInteractive({
          hitArea: hitArea,
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
          useHandCursor: false,
          dropZone: false,
          pixelPerfect: false,
        })
        
        
        // Helper function to clear selection outline
        const clearSelectionOutline = (cityContainer: Phaser.GameObjects.Container) => {
          const btnBorder = cityContainer.getData('borderGraphics') as Phaser.GameObjects.Graphics
          const btnIndex = cityContainer.getData('levelIndex') as number
          const btnBorderRadius = cityContainer.getData('borderRadius') as number
          const btnLevelSize = cityContainer.getData('levelSize') as number
          const isBossBtn = btnIndex === 12
          
          if (btnBorder && btnIndex !== undefined && btnBorderRadius !== undefined && btnLevelSize !== undefined) {
            btnBorder.clear()
            const isCurrentCity = btnIndex === this.currentLevelIndex || (isBossBtn && this.isBossLevel)
            // Boss level: restore to brighter olive green if not current, otherwise parchment
            let btnBorderColor = isCurrentCity ? 0xe0d5b6 : 0x2f3b32
            if (isBossBtn) {
              btnBorderColor = isCurrentCity ? 0xe0d5b6 : 0x5a8a5a  // Brighter olive green for boss if not current
            }
            btnBorder.lineStyle(4, btnBorderColor, 1)
            btnBorder.strokeRoundedRect(-btnLevelSize / 2, -btnLevelSize / 2, btnLevelSize, btnLevelSize, btnBorderRadius)
            btnBorder.setDepth(isCurrentCity ? 310 : 300)
          }
          
          // Revert boss level thumbnail back to gaza.png if not selected
          if (isBossBtn) {
            const thumbnail = cityContainer.getData('thumbnail') as Phaser.GameObjects.Image
            const levelSize = cityContainer.getData('levelSize') as number
            if (thumbnail && levelSize) {
              // Always revert to gaza.png when clearing selection
              thumbnail.setTexture('boss-transition')
              thumbnail.setDisplaySize(levelSize, levelSize)
            }
          }
          
          cityContainer.setData('isPressed', false)
        }
        
        container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          // Only block if modal just opened AND this is the same pointer that opened it
          // Check if pointer was already down when modal opened (within 100ms)
          const timeSinceModalOpened = this.time.now - (this.levelSelectionPanel?.getData('openedAt') as number || 0)
          if (modalJustOpened && timeSinceModalOpened < 100) {
            return
          }
          
          // Clear any previously selected city (only one selection at a time)
          if (this.currentlyPressedCity && this.currentlyPressedCity !== container) {
            clearSelectionOutline(this.currentlyPressedCity)
            this.currentlyPressedCity = null
          }
          
          // Store the initial pointer position to detect drag
          container.setData('pointerDownX', pointer.worldX)
          container.setData('pointerDownY', pointer.worldY)
          
          // Manually verify which container should actually receive this click
          // Check all containers to see which one's hit area actually contains the pointer
          const pointerX = pointer.worldX
          const pointerY = pointer.worldY
          let actualContainer: Phaser.GameObjects.Container | null = null
          let actualIndex: number | null = null
          this.levelButtons.forEach((btn) => {
            const btnX = btn.x
            const btnY = btn.y
            const btnRelativeX = pointerX - btnX
            const btnRelativeY = pointerY - btnY
            const btnHitArea = btn.input?.hitArea as Phaser.Geom.Rectangle | undefined
            if (btnHitArea && Phaser.Geom.Rectangle.Contains(btnHitArea, btnRelativeX, btnRelativeY)) {
              const btnLevelIndex = btn.getData('levelIndex') as number
              // Use the container with highest depth (most recently added, highest index)
              if (actualContainer === null || (btn.getData('levelIndex') as number) > (actualContainer.getData('levelIndex') as number)) {
                actualContainer = btn
                actualIndex = btnLevelIndex
              }
            }
          })
          
          const clickedIndex = container.getData('levelIndex')
          if (actualContainer && actualIndex !== null && actualIndex !== clickedIndex) {
            // Use the correct container instead
            const correctContainer = actualContainer as Phaser.GameObjects.Container
            correctContainer.setData('isPressed', true)
            this.currentlyPressedCity = correctContainer  // Track this as the currently pressed city
            const btnBorder = correctContainer.getData('borderGraphics') as Phaser.GameObjects.Graphics
            const btnBorderRadius = correctContainer.getData('borderRadius') as number
            const btnLevelSize = correctContainer.getData('levelSize') as number
            if (btnBorder && btnBorderRadius !== undefined && btnLevelSize !== undefined) {
            btnBorder.clear()
            btnBorder.lineStyle(4, 0xb0b0b0, 1)  // Light gray when pressed (selected city outline)
            btnBorder.strokeRoundedRect(-btnLevelSize / 2, -btnLevelSize / 2, btnLevelSize, btnLevelSize, btnBorderRadius)
            // Depth order: Current city (parchment) = 310, Selected (pressed) = 305, Default = 300
            const isCurrentCity = correctContainer.getData('levelIndex') === this.currentLevelIndex
            btnBorder.setDepth(isCurrentCity ? 310 : 305)  // Selected city outline (middle layer)
            }
            // Store reference to the correct container for pointerup
            container.setData('correctContainer', correctContainer)
            return  // Don't process this container's press
          }
          
          // Change border to light gray when pressed
          container.setData('isPressed', true)
          container.setData('correctContainer', null)  // This is the correct container
          this.currentlyPressedCity = container  // Track this as the currently pressed city
          const btnBorder = container.getData('borderGraphics') as Phaser.GameObjects.Graphics
          const btnBorderRadius = container.getData('borderRadius') as number
          const btnLevelSize = container.getData('levelSize') as number
          const btnLevelIndex = container.getData('levelIndex') as number
          const isBossBtn = btnLevelIndex === 12
          
          if (btnBorder && btnBorderRadius !== undefined && btnLevelSize !== undefined) {
            btnBorder.clear()
            // Boss level: orange-ish red thicker outline when toggled (held down)
            if (isBossBtn) {
              btnBorder.lineStyle(6, 0xff6b35, 1)  // Orange-ish red (#ff6b35), thicker (6px)
            } else {
              const borderColor = 0xb0b0b0  // Light gray for others
              btnBorder.lineStyle(4, borderColor, 1)
            }
            btnBorder.strokeRoundedRect(-btnLevelSize / 2, -btnLevelSize / 2, btnLevelSize, btnLevelSize, btnBorderRadius)
            // Depth order: Current city (parchment) = 310, Selected (pressed) = 305, Default = 300
            const isCurrentCity = btnLevelIndex === this.currentLevelIndex || (isBossBtn && this.isBossLevel)
            btnBorder.setDepth(isCurrentCity ? 310 : 305)  // Selected city outline (middle layer)
          }
          
          // Update boss level thumbnail to gaza5.png when toggled (held down)
          if (isBossBtn) {
            const thumbnail = container.getData('thumbnail') as Phaser.GameObjects.Image
            const levelSize = container.getData('levelSize') as number
            if (thumbnail && levelSize) {
              // Always update to ensure it works consistently
              thumbnail.setTexture('boss-victory')  // gaza5.png
              // Ensure it fits inside the outline the same way others do
              thumbnail.setDisplaySize(levelSize, levelSize)
            }
          }
        })
        container.on('pointerup', (pointer: Phaser.Input.Pointer) => {
          // Only block if modal just opened AND pointer was already down when modal opened
          // Check if pointer was already down when modal opened (within 150ms)
          const timeSinceModalOpened = this.time.now - (this.levelSelectionPanel?.getData('openedAt') as number || 0)
          const wasPointerDown = this.levelSelectionPanel?.getData('pointerWasDown') as boolean || false
          if (modalJustOpened && timeSinceModalOpened < 150 && wasPointerDown) {
            return
          }
          // Trigger action on release
          // Check if we stored a "correct container" due to hit area mismatch
          const correctContainer = container.getData('correctContainer') as Phaser.GameObjects.Container | null
          const targetContainer = correctContainer || container
          
          // IMPORTANT: Get the levelIndex from the container's stored data, not from closure
          const containerLevelIndex = targetContainer.getData('levelIndex') as number
          const isBossLevel = containerLevelIndex === 12
          
          // Verify pointer is still within hit area to prevent accidental selections
          const pointerX = pointer.worldX
          const pointerY = pointer.worldY
          const containerX = targetContainer.x
          const containerY = targetContainer.y
          const relativeX = pointerX - containerX
          const relativeY = pointerY - containerY
          const hitArea = targetContainer.input?.hitArea as Phaser.Geom.Rectangle | undefined
          const isWithinHitArea = hitArea ? Phaser.Geom.Rectangle.Contains(hitArea, relativeX, relativeY) : false
          
          // If user released without clicking (not within hit area), revert boss level thumbnail
          const isBossBtn = containerLevelIndex === 12
          if (isBossBtn && this.currentlyPressedCity === targetContainer && !isWithinHitArea) {
            const thumbnail = targetContainer.getData('thumbnail') as Phaser.GameObjects.Image
            const levelSize = targetContainer.getData('levelSize') as number
            if (thumbnail && levelSize) {
              // Always revert to gaza.png when dragging away (not current boss level)
              thumbnail.setTexture('boss-transition')
              thumbnail.setDisplaySize(levelSize, levelSize)
            }
            // Clear the pressed state
            clearSelectionOutline(targetContainer)
            this.currentlyPressedCity = null
            return  // Don't proceed with selection
          }
          
          // Check if this container was the one that was pressed and pointer is still within hit area
          if (containerLevelIndex !== undefined && this.currentlyPressedCity === targetContainer && isWithinHitArea) {
            // Check if game is active and show confirmation if needed
            const isCurrentLevel = containerLevelIndex === this.currentLevelIndex || (isBossLevel && this.isBossLevel)
            const needsConfirmation = this.isGameActive && !this.isPausedForSettings
            
            if (needsConfirmation) {
              // Show confirmation modal
              this.showLevelChangeConfirmation(containerLevelIndex, isCurrentLevel, isBossLevel)
              // Revert boss level thumbnail if it was toggled
              if (isBossBtn) {
                const thumbnail = targetContainer.getData('thumbnail') as Phaser.GameObjects.Image
                const levelSize = targetContainer.getData('levelSize') as number
                if (thumbnail && levelSize) {
                  // Always revert to gaza.png when showing confirmation
                  thumbnail.setTexture('boss-transition')
                  thumbnail.setDisplaySize(levelSize, levelSize)
                }
              }
              clearSelectionOutline(targetContainer)
              this.currentlyPressedCity = null
              return  // Don't proceed with selection yet
            }
            
            // Update all borders when a level is selected
            this.levelButtons.forEach((btn) => {
              const btnBorder = btn.getData('borderGraphics') as Phaser.GameObjects.Graphics
              const btnIndex = btn.getData('levelIndex') as number
              const btnBorderRadius = btn.getData('borderRadius') as number
              const btnLevelSize = btn.getData('levelSize') as number
              if (btnBorder && btnIndex !== undefined && btnBorderRadius !== undefined && btnLevelSize !== undefined) {
                btnBorder.clear()
                const isSelected = btnIndex === containerLevelIndex  // Use containerLevelIndex, not closure index
                const btnBorderColor = isSelected ? 0xe0d5b6 : 0x2f3b32  // Parchment if selected
                btnBorder.lineStyle(4, btnBorderColor, 1)
                // Draw full border rectangle centered at (0, 0) relative to container
                btnBorder.strokeRoundedRect(-btnLevelSize / 2, -btnLevelSize / 2, btnLevelSize, btnLevelSize, btnBorderRadius)
                // Depth order: Current city (parchment) = 310 (top), Selected = 305 (middle), Default = 300 (bottom)
                const isCurrentCity = btnIndex === this.currentLevelIndex
                btnBorder.setDepth(isCurrentCity ? 310 : 300)  // Restore to default or current city depth
              }
            })
            
            // Clean up boss level elements if selecting a different level while in boss phase
            // This ensures tanks, health bars, etc. are removed when selecting a level
            if (this.isBossLevel) {
              this.cleanupBossLevel()
            }
            
            // Handle boss level selection - start boss level directly (don't change currentLevelIndex)
            if (isBossLevel) {
              // Don't change currentLevelIndex or applyLevel - just start boss level
              // This simulates having just beaten moon level
            } else {
              this.applyLevel(containerLevelIndex)  // Use containerLevelIndex, not closure index
            }
            // Reset game state: spawn Bittee with 3 lives
            // Reset lives and score
            this.lives = 3
            this.score = 0
            this.updateHud()
            
            // Reset Bittee position and state
            const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
            this.player.setPosition(this.scale.width / 2, this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
            this.player.setVelocity(0, 0)
            if (playerBody) {
              playerBody.setVelocity(0, 0)
              playerBody.setGravityY(this.normalGravityY)
              playerBody.setAcceleration(0, 0)
            }
            this.player.setScale(this.basePlayerScale, this.basePlayerScale)
            this.facing = 'right'
            this.isThrowing = false
            this.isTaunting = false
            this.isJumping = false
            this.hasDoubleJumped = false  // Reset double jump
            this.isCrouching = false
            this.isAirCrouching = false
            this.justExitedCrouch = false
            this.isInvulnerable = false
            if (this.invulnerabilityTimer) {
              this.invulnerabilityTimer.remove(false)
              this.invulnerabilityTimer = undefined
            }
            this.player.setAlpha(1)
            this.lastFired = 0
            // Stop all animations and reset to idle
            this.player.anims.stop()
            this.setIdlePose(true)
            this.setupPlayerCollider(0)
            if (playerBody) {
              playerBody.updateFromGameObject()
            }
            
            // Clear all balls and bullets
            this.balls.clear(true, true)
            this.bullets.clear(true, true)
            
            // Reset throw button
            if (this.throwButton) {
              const rockIcon = this.throwButton.getData('rockIcon') as Phaser.GameObjects.Image
              const infinityText = this.throwButton.getData('infinityText') as Phaser.GameObjects.Text
              if (rockIcon) {
                rockIcon.setScale(0.25)  // Match the initial scale
                rockIcon.setAlpha(1)
              }
              if (infinityText) {
                infinityText.setScale(1)
                infinityText.setAlpha(1)
              }
            }
            
            // Resume physics and time
            this.physics.world.resume()
            this.tweens.resumeAll()
            this.time.timeScale = 1
            this.isGameActive = true
            
            // Handle boss level or regular level
            if (isBossLevel) {
              // Stop ALL music before starting boss level
              this.stopBackgroundMusic()
              // Force stop and pause all background music tracks
              if (this.backgroundMusic1) {
                if (this.backgroundMusic1.isPlaying) {
                  this.backgroundMusic1.stop()
                }
                this.backgroundMusic1.pause()
                // Remove event listeners to prevent auto-playing
                this.backgroundMusic1.removeAllListeners('complete')
              }
              if (this.backgroundMusic2) {
                if (this.backgroundMusic2.isPlaying) {
                  this.backgroundMusic2.stop()
                }
                this.backgroundMusic2.pause()
                // Remove event listeners to prevent auto-playing
                this.backgroundMusic2.removeAllListeners('complete')
              }
              // Stop settings music
              if (this.settingsMusic && this.settingsMusic.isPlaying) {
                this.settingsMusic.stop()
              }
              // Stop heartbeat sound
              if (this.heartbeatSound && this.heartbeatSound.isPlaying) {
                this.heartbeatSound.stop()
              }
              // Stop time sound instances
              this.timeSoundInstances.forEach(instance => {
                if (instance && instance.isPlaying) {
                  instance.stop()
                }
              })
              this.timeSoundInstances = []
              // Stop any jet sounds
              const jetSound1 = this.soundEffects.get('jet1')
              const jetSound2 = this.soundEffects.get('jet2')
              if (jetSound1 && jetSound1.isPlaying) {
                jetSound1.stop()
              }
              if (jetSound2 && jetSound2.isPlaying) {
                jetSound2.stop()
              }
              // Start boss level (as if just beat moon level)
              // Don't change currentLevelIndex - keep it at whatever it was
              this.startBossLevel()
            } else {
              // Spawn the level wave for the selected level
              this.spawnLevelWave(containerLevelIndex)
            }
            
            this.closeLevelSelection()
            // Close settings panel and resume game immediately after selecting level
            this.closeSettingsPanel()
          } else {
            // User released without clicking - revert boss level thumbnail if it was pressed
            const btnIndex = targetContainer.getData('levelIndex') as number
            const isBossBtn = btnIndex === 12
            if (isBossBtn && this.currentlyPressedCity === targetContainer) {
              const thumbnail = targetContainer.getData('thumbnail') as Phaser.GameObjects.Image
              const levelSize = targetContainer.getData('levelSize') as number
              if (thumbnail && levelSize) {
                // Always revert to gaza.png when not pressed (same as top part)
                thumbnail.setTexture('boss-transition')
                thumbnail.setDisplaySize(levelSize, levelSize)
              }
              // Clear the pressed state
              clearSelectionOutline(targetContainer)
              this.currentlyPressedCity = null
            }
          }
          container.setData('isPressed', false)
          container.setData('correctContainer', null)  // Clear correct container reference
          // Clear the currently pressed city reference
          if (this.currentlyPressedCity === targetContainer) {
            this.currentlyPressedCity = null
          }
        })
        // Clear selection when pointer leaves the hit area (user swiped away)
        const handlePointerLeave = () => {
          // Check if this container was being pressed
          if (this.currentlyPressedCity === container) {
            // Revert boss level thumbnail before clearing outline
            const btnIndex = container.getData('levelIndex') as number
            const isBossBtn = btnIndex === 12
            if (isBossBtn) {
              const thumbnail = container.getData('thumbnail') as Phaser.GameObjects.Image
              const levelSize = container.getData('levelSize') as number
              if (thumbnail && levelSize) {
                // Always revert to gaza.png when dragging away
                thumbnail.setTexture('boss-transition')
                thumbnail.setDisplaySize(levelSize, levelSize)
              }
            }
            clearSelectionOutline(container)
            container.setData('isPressed', false)
            this.currentlyPressedCity = null
          }
        }
        
        container.on('pointerout', handlePointerLeave)
        container.on('pointerleave', handlePointerLeave)
        // Also handle when pointer moves away while still down
        container.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          if (this.currentlyPressedCity === container && container.getData('isPressed')) {
            // Check if pointer is still within hit area
            const pointerX = pointer.worldX
            const pointerY = pointer.worldY
            const containerX = container.x
            const containerY = container.y
            const relativeX = pointerX - containerX
            const relativeY = pointerY - containerY
            const hitArea = container.input?.hitArea as Phaser.Geom.Rectangle | undefined
            const isWithinHitArea = hitArea ? Phaser.Geom.Rectangle.Contains(hitArea, relativeX, relativeY) : false
            
            if (!isWithinHitArea) {
              // Pointer moved outside hit area while still pressed - revert
              handlePointerLeave()
            }
          }
        })
      }
      
      this.levelButtons.push(container)
    })
    
    // Add fallback scene-level pointer handlers for ALL level buttons
    // This catches clicks that the container's input system might miss (especially bottom/right edges)
    let fallbackPressedButton: Phaser.GameObjects.Container | null = null
    let modalJustOpened = true  // Flag to prevent clicks immediately after modal opens
    
    const fallbackDownHandler = (pointer: Phaser.Input.Pointer) => {
      // Only block if modal just opened AND pointer was down before modal opened
      // This prevents auto-clicking from the click that opened the modal, but allows new clicks
      const timeSinceModalOpened = this.time.now - (this.levelSelectionPanel?.getData('openedAt') as number || 0)
      const wasPointerDown = this.levelSelectionPanel?.getData('pointerWasDown') as boolean || false
      if (modalJustOpened && timeSinceModalOpened < 150 && wasPointerDown) {
        return
      }
      
      // Only process if level selection panel is visible and active
      if (!this.levelSelectionPanel || !this.levelSelectionPanel.visible || !this.levelSelectionPanel.active) {
        return
      }
      
      // Only process if pointer is actually down
      if (!pointer.isDown) {
        return
      }
      
      // Check all level buttons to see if the click is within any of their hit areas
      for (const button of this.levelButtons) {
        const containerX = button.x
        const containerY = button.y
        const relativeX = pointer.worldX - containerX
        const relativeY = pointer.worldY - containerY
        
        // Check if click is within the hit area (with padding for edges)
        const storedHitArea = button.input?.hitArea as Phaser.Geom.Rectangle | undefined
        
        if (storedHitArea && Phaser.Geom.Rectangle.Contains(storedHitArea, relativeX, relativeY)) {
          // Check if container already detected it to avoid double-triggering
          const alreadyHandled = button.getData('isPressed') || this.currentlyPressedCity === button
          
          if (!alreadyHandled) {
            // Click is within hit area but container didn't detect it
            // Manually trigger the container's pointerdown event
            // Track which button was pressed via fallback
            fallbackPressedButton = button
            // Trigger the container's pointerdown handler
            button.emit('pointerdown', pointer)
          }
          break  // Only handle one button per click
        }
      }
    }
    
    const fallbackMoveHandler = (pointer: Phaser.Input.Pointer) => {
      // If a button was pressed via fallback handler, check if pointer moved outside
      if (fallbackPressedButton) {
        const containerX = fallbackPressedButton.x
        const containerY = fallbackPressedButton.y
        const relativeX = pointer.worldX - containerX
        const relativeY = pointer.worldY - containerY
        const storedHitArea = fallbackPressedButton.input?.hitArea as Phaser.Geom.Rectangle | undefined
        
        // Check if pointer moved outside the hit area
        if (storedHitArea && !Phaser.Geom.Rectangle.Contains(storedHitArea, relativeX, relativeY)) {
          // Pointer moved outside - trigger pointerleave to revert image
          fallbackPressedButton.emit('pointerleave', pointer)
          fallbackPressedButton.emit('pointerout', pointer)
        }
      }
    }
    
    const fallbackUpHandler = (pointer: Phaser.Input.Pointer) => {
      // Only block if modal just opened AND pointer was already down when modal opened
      const timeSinceModalOpened = this.time.now - (this.levelSelectionPanel?.getData('openedAt') as number || 0)
      const wasPointerDown = this.levelSelectionPanel?.getData('pointerWasDown') as boolean || false
      if (modalJustOpened && timeSinceModalOpened < 150 && wasPointerDown) {
        return
      }
      // Clear the fallback pressed button when pointer is released
      if (fallbackPressedButton) {
        fallbackPressedButton.emit('pointerup', pointer)
        fallbackPressedButton = null
      }
    }
    
    this.input.on('pointerdown', fallbackDownHandler)
    this.input.on('pointermove', fallbackMoveHandler)
    this.input.on('pointerup', fallbackUpHandler)
    
    // Store handler references for cleanup
    if (this.levelSelectionPanel) {
      this.levelSelectionPanel.setData('levelButtonsFallbackDownHandler', fallbackDownHandler)
      this.levelSelectionPanel.setData('levelButtonsFallbackMoveHandler', fallbackMoveHandler)
      this.levelSelectionPanel.setData('levelButtonsFallbackUpHandler', fallbackUpHandler)
    }
    
    const returnButtonY = worldHeight / 2 + panelHeight / 2 - 40  // Shift down (from -50 to -40)
    const returnButtonPadding = { left: 28, right: 28, top: 12, bottom: 12 }
    const tempReturnText = this.add.text(0, 0, 'Return', { fontSize: '28px', fontFamily: 'MontserratBold' })
    const returnButtonWidth = tempReturnText.width + returnButtonPadding.left + returnButtonPadding.right
    const returnButtonHeight = tempReturnText.height + returnButtonPadding.top + returnButtonPadding.bottom
    tempReturnText.destroy()
    const returnButtonRadius = 6
    
    // Create shadow for return button
    const returnButtonShadow = this.add.graphics()
    returnButtonShadow.fillStyle(0x000000, 0.2)  // Subtle shadow
    const returnShadowYOffset = 6
    returnButtonShadow.fillRoundedRect(-returnButtonWidth / 2, -returnButtonHeight / 2 - returnShadowYOffset, returnButtonWidth, returnButtonHeight, returnButtonRadius)
    returnButtonShadow.setPosition(worldWidth / 2, returnButtonY)
    returnButtonShadow.setDepth(201)  // Behind button
    
    const closeButton = this.add
      .text(worldWidth / 2, returnButtonY, 'Return', {
        fontSize: '28px',  // Larger font
        fontFamily: 'MontserratBold',
        color: '#e0d5b6',  // Parchment color
        backgroundColor: '#2f3b32',  // Same as Field Notes close button
        padding: returnButtonPadding,
      })
      .setOrigin(0.5)
    closeButton.setDepth(202)  // Above cities
    closeButton.setInteractive({ useHandCursor: true })
    closeButton.on('pointerdown', () => {
      this.closeLevelSelection()
      // Show settings panel again
      if (this.settingsPanel) {
        this.settingsPanel.setVisible(true)
      }
    })
    
    // Don't add city containers to parent container - add them directly to scene
    // This ensures hit areas work correctly with world coordinates
    // When containers are children of another container, their positions become relative to parent
    // which can cause hit area misalignment. By adding them directly to scene, positions stay absolute.
    // Only add overlay, panel, and close button to the parent container
    const levelSelectionPanel = this.add.container(0, 0, [
      overlay,
      panelBackground,
      returnButtonShadow,
      closeButton,
    ])
    levelSelectionPanel.setDepth(25)
    
    // City containers are already added to scene when created with this.add.container()
    // They're NOT added to levelSelectionPanel, so their positions remain in world coordinates
    
    this.levelSelectionPanel = levelSelectionPanel
    
    // Add keyboard handler to close level selection on Enter/Space
    const keyboard = this.input.keyboard
    if (keyboard) {
      // Remove any existing handlers first to prevent conflicts
      keyboard.removeAllListeners('keydown-ENTER')
      keyboard.removeAllListeners('keydown-SPACE')
      keyboard.on('keydown-ENTER', () => {
        this.closeLevelSelection()
      })
      keyboard.on('keydown-SPACE', () => {
        this.closeLevelSelection()
      })
    }
    
    // Store when modal was opened to track if clicks are from the opening click
    const modalOpenTime = this.time.now
    const pointerWasDown = this.input.activePointer.isDown
    if (this.levelSelectionPanel) {
      this.levelSelectionPanel.setData('openedAt', modalOpenTime)
      this.levelSelectionPanel.setData('pointerWasDown', pointerWasDown)
    }
    
    // Set a delay after modal opens to prevent the click that opened the modal from also clicking a level button
    // This prevents auto-clicking when the modal first appears
    // Use a shorter delay - only block clicks that happen very soon after opening
    this.time.delayedCall(200, () => {
      modalJustOpened = false
    })
    
    // Add scene-level pointer move handler to detect when pointer leaves any city's hit area
    // This ensures deselection works in all directions, not just when pointerout fires
    const checkPointerOnMove = (pointer: Phaser.Input.Pointer) => {
      if (this.currentlyPressedCity && this.currentlyPressedCity.scene) {
        const wasPressed = this.currentlyPressedCity.getData('isPressed') as boolean
        if (wasPressed) {
          // Check if pointer is still within the hit area
          const pointerX = pointer.worldX
          const pointerY = pointer.worldY
          const containerX = this.currentlyPressedCity.x
          const containerY = this.currentlyPressedCity.y
          const relativeX = pointerX - containerX
          const relativeY = pointerY - containerY
          const hitArea = this.currentlyPressedCity.input?.hitArea as Phaser.Geom.Rectangle | undefined
          
          // If pointer is outside hit area, clear selection
          if (hitArea && !Phaser.Geom.Rectangle.Contains(hitArea, relativeX, relativeY)) {
            const clearSelectionOutline = (cityContainer: Phaser.GameObjects.Container) => {
              const btnBorder = cityContainer.getData('borderGraphics') as Phaser.GameObjects.Graphics
              const btnIndex = cityContainer.getData('levelIndex') as number
              const btnBorderRadius = cityContainer.getData('borderRadius') as number
              const btnLevelSize = cityContainer.getData('levelSize') as number
              if (btnBorder && btnIndex !== undefined && btnBorderRadius !== undefined && btnLevelSize !== undefined) {
                btnBorder.clear()
                const isCurrentCity = btnIndex === this.currentLevelIndex
                const btnBorderColor = isCurrentCity ? 0xe0d5b6 : 0x2f3b32
                btnBorder.lineStyle(4, btnBorderColor, 1)
                btnBorder.strokeRoundedRect(-btnLevelSize / 2, -btnLevelSize / 2, btnLevelSize, btnLevelSize, btnBorderRadius)
                btnBorder.setDepth(isCurrentCity ? 310 : 300)
              }
              cityContainer.setData('isPressed', false)
            }
            clearSelectionOutline(this.currentlyPressedCity)
            this.currentlyPressedCity = null
          }
        }
      }
    }
    
    // Listen to pointer move on the scene (works even when pointer is outside containers)
    this.input.on('pointermove', checkPointerOnMove)
    
    // Store the handler so we can remove it when closing the modal
    levelSelectionPanel.setData('pointerMoveHandler', checkPointerOnMove)
  }
  
  private closeLevelSelection(): void {
    if (this.levelSelectionPanel) {
      // Remove the scene-level pointer move handler
      const pointerMoveHandler = this.levelSelectionPanel.getData('pointerMoveHandler') as ((pointer: Phaser.Input.Pointer) => void) | undefined
      if (pointerMoveHandler) {
        this.input.off('pointermove', pointerMoveHandler)
      }
      // Remove the fallback handlers for all level buttons
      const fallbackDownHandler = this.levelSelectionPanel.getData('levelButtonsFallbackDownHandler') as ((pointer: Phaser.Input.Pointer) => void) | undefined
      const fallbackMoveHandler = this.levelSelectionPanel.getData('levelButtonsFallbackMoveHandler') as ((pointer: Phaser.Input.Pointer) => void) | undefined
      const fallbackUpHandler = this.levelSelectionPanel.getData('levelButtonsFallbackUpHandler') as ((pointer: Phaser.Input.Pointer) => void) | undefined
      if (fallbackDownHandler) {
        this.input.off('pointerdown', fallbackDownHandler)
      }
      if (fallbackMoveHandler) {
        this.input.off('pointermove', fallbackMoveHandler)
      }
      if (fallbackUpHandler) {
        this.input.off('pointerup', fallbackUpHandler)
      }
      
      this.levelSelectionPanel.destroy()
      this.levelSelectionPanel = undefined
    }
    
    // Remove keyboard handlers and re-add settings panel handler if needed
    const closeLevelKeyboard = this.input.keyboard
    if (closeLevelKeyboard) {
      closeLevelKeyboard.removeAllListeners('keydown-ENTER')
      closeLevelKeyboard.removeAllListeners('keydown-SPACE')
      // Re-add settings panel handler if settings panel is still open
      if (this.settingsPanel?.visible) {
        const closeSettingsHandler = () => {
          if (this.settingsPanel?.visible) {
            // Check if any nested modal is open first
            const hasNestedModal = this.hasNestedModalOpen()
            if (hasNestedModal) {
              // Close the nested modal first
              this.closeNestedModal()
            } else {
              // If no nested modal, close settings
              this.closeSettingsPanel()
            }
          }
        }
        closeLevelKeyboard.on('keydown-ENTER', closeSettingsHandler)
        closeLevelKeyboard.on('keydown-SPACE', closeSettingsHandler)
        } else {
          // If settings panel is NOT visible, we should still return to settings (not exit to game)
          // This matches the behavior of info and field notes modals
          console.log('[KEYBOARD] Cities modal closed - settings panel NOT visible')
          
          // If we're already paused for settings, just make the panel visible
          if (this.isPausedForSettings && this.settingsPanel) {
            this.settingsPanel.setVisible(true)
            this.settingsPanel.setActive(true)
            this.refreshSettingsPanel()
            
            // Restore settings panel handlers
            const closeSettingsHandler = () => {
              if (this.settingsPanel?.visible) {
                const hasNestedModal = this.hasNestedModalOpen()
                if (hasNestedModal) {
                  this.closeNestedModal()
                } else {
                  this.closeSettingsPanel()
                }
              }
            }
            closeLevelKeyboard.on('keydown-ENTER', closeSettingsHandler)
            closeLevelKeyboard.on('keydown-SPACE', closeSettingsHandler)
          } else {
            // Not paused - open settings normally
            // Ensure game is paused before opening settings
            if (!this.isPausedForSettings) {
              this.isPausedForSettings = true
              this.physics.world.pause()
              this.tweens.pauseAll()
              this.previousTimeScale = this.time.timeScale
              this.time.timeScale = 0
            }
            this.openSettingsPanel()
          }
        }
    }
    
    // Destroy all city containers
    this.levelButtons.forEach((btn) => {
      if (btn && btn.scene) {
        // Only destroy if still in scene
        btn.destroy()
      }
    })
    this.levelButtons = []  // Clear the array
    this.currentlyPressedCity = null  // Clear the currently pressed city reference
  }

  private applyLevel(index: number): void {
    // Clean up boss level if switching to a regular level
    if (this.isBossLevel && index < 12) {
      this.cleanupBossLevel()
    }
    
    this.currentLevelIndex = Phaser.Math.Clamp(index, 0, LEVEL_DEFINITIONS.length - 1)
    const level = LEVEL_DEFINITIONS[this.currentLevelIndex]
    if (this.backgroundLayer) {
      this.backgroundLayer.setTexture(level.key)
      this.updateBackgroundScale()
    }
    // Optimization #1: Generate bubbles only for this level's brands
    // TEMPORARILY DISABLED: Bubble generation uses addBase64 which may have issues
    // this.ensureBubblesForLevel(this.currentLevelIndex)
    this.settings.levelIndex = this.currentLevelIndex
    this.applySettingsVisuals()
    this.refreshLevelLabel()
  }

  private refreshLevelLabel(): void {
    if (this.levelText) {
      // Update level label based on boss phase
      let labelText = LEVEL_DEFINITIONS[this.currentLevelIndex].label
      let isBossLabel = false
      if (this.isBossLevel) {
        if (this.bossPhase === 'jet' || this.bossPhase.startsWith('tank') || this.bossPhase === 'victory') {
          labelText = 'حتى النصر'
          isBossLabel = true
        }
      }
      this.levelText.setText(labelText)
      const padding = 24
      if (isBossLabel) {
        // During boss phases (jet/tank), show Arabic text normally
        // Victory phase styling is handled in startVictoryPhase() and reset in startGame()
        // Make boss label larger and bright olive green, shift down and to the left
        this.levelText.setFontSize('140px')  // Larger font (increased from 120px for less pixelation)
        this.levelText.setScale(2.8)  // Slightly reduced scale (from 3.0) to reduce pixelation while keeping size
        this.levelText.setColor('#7fb069')  // Bright olive green
        this.levelText.setX(padding - 10)  // Shift left by 10 pixels
        this.levelText.setOrigin(0, 0)  // Ensure left origin
        this.levelText.setY(padding - 22)  // 22px higher than padding (shifted down 2px from -24)
        // Show underline for boss levels (will be hidden when last tank is destroyed)
        if (this.levelUnderline) {
          this.levelUnderline.setVisible(true)
          // Update underline position to match text position
          this.levelUnderline.setX(this.levelText.x + this.levelText.width / 2)
          this.levelUnderline.setY(this.levelText.y + this.levelText.height + 28)  // Shifted down by 8px (was 20, now 28)
          // Set underline width to text.width + 150
          this.levelUnderline.setSize(this.levelText.width + 150, 10)
        }
      } else {
        // Regular level styling - reset to original position and origin
        this.levelText.setFontSize('100px')
        this.levelText.setScale(2.5)
        this.levelText.setColor('#cbe4ff')  // Original blue color
        this.levelText.setX(padding)  // Reset to original left position
        this.levelText.setOrigin(0, 0)  // Reset to original left origin
        this.levelText.setY(padding)  // Reset to original position
      }
    }
  }

  private setIdlePose(force = false): void {
    // Don't set idle pose if in special states (except allow it to override if force is true)
    if (!force && (this.isThrowing || this.isTaunting || this.isCrouching || this.isJumping || this.isAiming)) {
      return
    }

    const idleKey = 'bittee-idle'
    const currentAnim = this.player.anims.currentAnim?.key
    const isJumpAnim = currentAnim === 'bittee-jump-air-left' || currentAnim === 'bittee-jump-air-right' || 
                       currentAnim === 'bittee-jump-squat-left' || currentAnim === 'bittee-jump-squat-right'
    if (!force && isJumpAnim) {
      return
    }
    // Always execute if force is true, or if we need to transition from non-idle state
    if (force || (currentAnim !== idleKey && currentAnim !== 'bittee-run-left' && currentAnim !== 'bittee-run-right' && currentAnim !== 'bittee-crouch')) {
      // Stop any running animation first to prevent frame conflicts
      this.player.anims.stop()
      // Set to stand texture first to ensure clean transition
      this.player.setTexture(BITTEE_SPRITES.stand.key)
      // Set position to current position (or ground if on ground) - don't force position change
      // CRITICAL: Skip position adjustments during crouch exit transition to prevent jittering
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body && this.isPlayerGrounded(body) && !this.isCrouching) {
        // Add 10px visual offset for stand pose - sprite appears 10px lower
        // This is PURELY visual - physics body stays at normal position
        const groundFeetY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
        const standPoseY = groundFeetY + 10  // +10px visual offset for stand pose
        
        // Set sprite at visual position (purely visual offset)
        this.player.setY(standPoseY)
        // Let body stay at normal position - don't interfere with physics
        // The update loop will lock the sprite position every frame
      }
      this.player.setFlipX(false)
      // Now play idle animation
      this.player.anims.play(idleKey, true)
    }
  }

  private isPlayerGrounded(body: Phaser.Physics.Arcade.Body): boolean {
    // Prioritize physics body's ground detection - most reliable
    const physicsGrounded = body.blocked.down || body.touching.down || body.onFloor?.() === true
    if (physicsGrounded) {
      // Removed excessive debug log - was spamming console every frame
      return true
    }

    // Fallback: treat as grounded when very close to the ground and moving slowly
    // Increased range to account for slight elevation during running animations
    const epsilon = 12  // Increased to 12 for better detection during running (was 10)
    const nearGround = this.player.y >= this.groundYPosition - 5 && this.player.y <= this.groundYPosition + epsilon
    const verticalVelocity = body.velocity.y
    const isMovingSlowly = verticalVelocity >= -100 && verticalVelocity <= 50
    const fallbackGrounded = nearGround && isMovingSlowly
    
    // Removed excessive debug log - was spamming console every frame
    
    return fallbackGrounded
  }

  // Lenient jump check that accounts for running animation elevation
  private canJump(body: Phaser.Physics.Arcade.Body): boolean {
    const onGround = this.isPlayerGrounded(body)
    if (onGround) {
      // Removed excessive debug log - was spamming console every frame when running
      return true
    }
    
    // Allow jump if very close to ground (within 5px above to 15px below) and moving slowly
    // This handles cases where running animation frames slightly elevate Bittee
    const nearGround = this.player.y >= this.groundYPosition - 5 && this.player.y <= this.groundYPosition + 15
    const verticalVelocity = body.velocity.y
    const isMovingSlowly = verticalVelocity >= -50 && verticalVelocity <= 50
    const canJumpNearGround = nearGround && isMovingSlowly
    
    // Only log when jump is actually needed (not grounded) - reduced frequency
    // Removed excessive debug log - was spamming console every frame when running
    
    return canJumpNearGround
  }

  // FIX: Centralized crouch exit transition function (Copilot recommendation)
  // Anchors visual origin and disables all other Y adjustments during transition
  private exitCrouchTransition(): void {
    // Apply the same reset mechanism as handlePlayerHit
    // Use a delayed call to reset everything properly
    this.time.delayedCall(200, () => {
      const body = this.player.body as Phaser.Physics.Arcade.Body
      // Keep Bittee at current X position
      // Only move Y to ground if he's on the ground, otherwise keep his current Y position (if in air)
      const isOnGround = body && (body.blocked.down || body.touching.down || body.onFloor())
      
      // Reset all state flags
      this.isThrowing = false
      this.isTaunting = false
      this.isJumping = false
      this.isCrouching = false
      this.justExitedCrouch = false
      this.isTransitioning = false
      this.transitionFrameCount = 0
      this.isAirCrouching = false
      
      // Reset scale to normal (from 85% to 100%)
      this.player.setScale(this.basePlayerScale)
      
      // Re-enable physics (in case they were disabled during crouch)
      if (body) {
        body.enable = true
        body.setImmovable(false)
        body.setAllowGravity(true)
        body.setVelocity(0, 0)
        body.setAcceleration(0, 0)
      }
      
      // Update collision box to match standing sprite size
      this.setupPlayerCollider(0)
      
      if (isOnGround) {
        this.player.setY(this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
        if (body) {
          body.updateFromGameObject()
        }
      }
      // Otherwise, keep his current Y position (he's in the air)
      
      this.setIdlePose(true)
    })
  }

  private handlePlayerMovement(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }
    
    const leftDown = (this.cursors.left?.isDown ?? false) || this.touchLeft
    const rightDown = (this.cursors.right?.isDown ?? false) || this.touchRight
    const downDown = (this.cursors.down?.isDown ?? false) || this.touchDown
    const crouchPressed = downDown
    const upDown = (this.cursors.up?.isDown ?? false) || this.touchUp
    const fireDown = (this.fireKey?.isDown ?? false) || this.touchThrow
    const isOnGround = this.isPlayerGrounded(body)
    
    // Safety reset: Clear stuck transition flags when player presses any button
    if (leftDown || rightDown || crouchPressed || upDown || fireDown) {
      if (this.isTransitioning || this.justExitedCrouch) {
        this.isTransitioning = false
        this.justExitedCrouch = false
        this.transitionFrameCount = 0
      }
    }
    
    // CRITICAL: Lock position during crouch exit transition - prevent any movement
    // But only if no buttons are pressed (safety reset above handles button presses)
    if (this.isTransitioning && this.justExitedCrouch && this.transitionTargetY > 0 && !leftDown && !rightDown && !crouchPressed && !upDown && !fireDown) {
      const targetY = this.transitionTargetY
      this.player.setY(targetY)
      body.x = this.player.x
      body.y = targetY
      body.setVelocityX(0)
      body.setVelocityY(0)
      return  // Don't process any movement during transition
    }

    if (this.isThrowing) {
      this.player.setVelocityX(0)
      if (body) {
        body.setVelocityX(0)
      }
      // If throwing while crouched, maintain current position (bottom alignment)
      if (this.isCrouching) {
        // Don't change Y position - maintain the bottom alignment from when crouch started
        // Position is already correct from crouch entry, no adjustment needed
        if (body) {
          body.setVelocityY(0)
          // Don't call updateFromGameObject here - it causes jittering
        }
      }
      return
    }

    if (this.isTaunting) {
      // Allow left/right to flip bittee horizontally while taunting
      // FIX: Right arrow button should flip it first (be the primary flip button)
      // Right flips to left (setFlipX(true)), left flips to right (setFlipX(false))
      // DEBUG: Verify this code is running
      if (rightDown) {
        this.player.setFlipX(true)  // Right button flips left (facing left)
        // Prevent any x-axis movement
        this.player.setVelocityX(0)
        if (body) {
          body.setVelocityX(0)
        }
      } else if (leftDown) {
        this.player.setFlipX(false)  // Left button flips right (facing right)
        // Prevent any x-axis movement
        this.player.setVelocityX(0)
        if (body) {
          body.setVelocityX(0)
        }
      }
      
      // Only exit taunt on up/down/fire, not left/right
      const exitTaunt = crouchPressed || upDown || fireDown
      if (exitTaunt) {
        this.cancelTaunt(false)
        return
      }
      
      // Prevent any movement while taunting
      this.player.setVelocityX(0)
      if (body) {
        body.setVelocityX(0)
        body.setVelocityY(0)
        body.setAcceleration(0, 0)
      }
      return
    }

    // Ground crouch: stop and hold crouch pose when on the floor.
    if (crouchPressed && isOnGround && !this.isJumping) {
      if (!this.isCrouching) {
        this.isCrouching = true
        // Remember when the player last entered crouch, so a jump
        // shortly after can be boosted.
        this.lastCrouchTime = this.time.now
        
        // NEW: Position body at ground level (body is source of truth)
        // Visually shrink Bittee while crouching (scale down to 85%)
        this.player.setScale(this.basePlayerScale * 0.85)
        
        // Update collision box to match crouched sprite size
        this.setupPlayerCollider(0)
        
        // Position body at ground level
        const bodyBottomY = this.groundYPosition
        if (body) {
          body.y = bodyBottomY - (body.height / 2)
          // Disable body during crouch to prevent physics interference
          body.enable = false
          body.setImmovable(true)
          body.setAllowGravity(false)
          body.setVelocity(0, 0)
          body.setAcceleration(0, 0)
        }
        
        // Sprite position will be set in postUpdate() to match body
      }
      // While crouching, Bittee holds crouch pose and doesn't move
      // Stop all movement and keep position locked
      // NOTE: Position locking is now handled in update() to prevent feedback loops
      // Don't call updateFromGameObject() here as it can cause oscillation
      this.player.setVelocityX(0)
      if (body) {
        body.setVelocityX(0)
        body.setVelocityY(0)
        body.setAcceleration(0, 0)
        // Position locking is handled in update() - don't do it here to avoid feedback loops
      }
      const currentAnim = this.player.anims.currentAnim?.key
      if (currentAnim !== 'bittee-crouch') {
        this.player.anims.play('bittee-crouch')
      }
      return
    }

    // Exit crouch when releasing down - works like taunt exit
    if (this.isCrouching && !crouchPressed) {
      this.exitCrouchTransition()
    }

    // Air crouch: allow Bittee to switch to crouch pose visually while in the air
    // without affecting physics or horizontal movement. Use a dedicated flag so
    // we only scale once when entering and once when exiting.
    // NOTE: Air crouch is purely visual - collision box stays at standing size to prevent mid-air glitches
    if (!isOnGround && this.isJumping) {
      if (crouchPressed && !this.isAirCrouching) {
        this.isAirCrouching = true
        this.player.setScale(this.basePlayerScale * 0.85)
        // Don't update collision box during air crouch - keep it at standing size to prevent glitches
        this.player.anims.play('bittee-crouch')
      } else if (!crouchPressed && this.isAirCrouching) {
        this.isAirCrouching = false
        this.player.setScale(this.basePlayerScale)
        // Collision box already at standing size, no need to update
        const airFrame =
          this.currentJumpDirection === 'left'
            ? BITTEE_SPRITES.jumpAir.left[0].key
            : BITTEE_SPRITES.jumpAir.right[0].key
        this.player.anims.stop()
        this.player.setTexture(airFrame)
      }
    } else if (this.isAirCrouching && isOnGround) {
      // Ensure we clear air crouch state once we touch the ground.
      this.isAirCrouching = false
      this.player.setScale(this.basePlayerScale)
      // Collision box should already be correct, but update to ensure consistency
      this.setupPlayerCollider(0)
    }

    // Allow horizontal movement even while jumping, but only change
    // run/idle animations when Bittee is actually on the ground.
    if (!this.isCrouching && !this.isThrowing && !this.isTaunting && !this.isAiming) {
      // Check if at screen edges - prevent running into walls
      const worldWidth = this.cameras.main.width
      const playerHalfWidth = this.player.displayWidth / 2
      const atLeftEdge = this.player.x - playerHalfWidth <= 0
      const atRightEdge = this.player.x + playerHalfWidth >= worldWidth
      
      if (leftDown) {
        // Don't allow running left if at left edge
        if (atLeftEdge) {
          this.player.setVelocityX(0)
          if (body) {
            body.setVelocityX(0)
          }
        } else {
          // Set velocity on both sprite and body to ensure movement
      this.player.setVelocityX(-PLAYER_SPEED)
          const previousFacing = this.facing
          this.facing = 'left'
          if (body) {
            body.setVelocityX(-PLAYER_SPEED)
          }
          // When in air and direction changes, switch between jump2 and jump3
          if (!isOnGround && this.isJumping && previousFacing !== 'left') {
            this.currentJumpFrameIndex = (this.currentJumpFrameIndex + 1) % 2
            const jumpFrame = BITTEE_SPRITES.jumpAir.left[this.currentJumpFrameIndex].key
            this.player.setTexture(jumpFrame)
          }
          if (isOnGround && !atLeftEdge) {
            // Simple check like throwing: only block if in special states that should override running
            if (!this.isJumping && !this.isThrowing && !this.isTaunting && !this.isCrouching) {
              // Directly play animation like throwing does - no complex currentAnim checks
              this.player.anims.play('bittee-run-left', true)
              // Ensure body is enabled
              if (body) {
                body.enable = true
                body.setImmovable(false)
                body.setAllowGravity(true)
              }
            }
            // Play run sound if not already playing
            if (!this.runSoundPlaying) {
              this.playSound('bittee-run-sound', 0.4, true)
              this.runSoundPlaying = true
            }
          }
        }
      } else if (rightDown) {
        // Don't allow running right if at right edge
        if (atRightEdge) {
          this.player.setVelocityX(0)
          if (body) {
            body.setVelocityX(0)
          }
        } else {
          // Set velocity on both sprite and body to ensure movement
      this.player.setVelocityX(PLAYER_SPEED)
          const previousFacing = this.facing
          this.facing = 'right'
          if (body) {
            body.setVelocityX(PLAYER_SPEED)
          }
          // When in air and direction changes, switch between jump2 and jump3
          if (!isOnGround && this.isJumping && previousFacing !== 'right') {
            this.currentJumpFrameIndex = (this.currentJumpFrameIndex + 1) % 2
            const jumpFrame = BITTEE_SPRITES.jumpAir.right[this.currentJumpFrameIndex].key
            this.player.setTexture(jumpFrame)
          }
          if (isOnGround && !atRightEdge) {
            // Simple check like throwing: only block if in special states that should override running
            if (!this.isJumping && !this.isThrowing && !this.isTaunting && !this.isCrouching) {
              // Directly play animation like throwing does - no complex currentAnim checks
              this.player.anims.play('bittee-run-right', true)
              // Ensure body is enabled
              if (body) {
                body.enable = true
                body.setImmovable(false)
                body.setAllowGravity(true)
              }
            }
            // Play run sound if not already playing
            if (!this.runSoundPlaying) {
              this.playSound('bittee-run-sound', 0.4, true)
              this.runSoundPlaying = true
            }
          }
        }
    } else {
      // Not moving - stop horizontal velocity
      this.player.setVelocityX(0)
      if (body) {
        body.setVelocityX(0)
      }
      // Stop run sound when not moving
      if (this.runSoundPlaying) {
        this.stopSound('bittee-run-sound')
        this.runSoundPlaying = false
      }
      
      // If in idle pose, just ensure body is enabled - postUpdate() handles positioning
      const currentAnim = this.player.anims.currentAnim?.key
      const isIdleAnim = currentAnim === 'bittee-idle' || currentAnim === 'bittee-stand'
      if (isIdleAnim && body && this.isPlayerGrounded(body) && !this.isCrouching && !this.isJumping) {
        // Just ensure body is enabled - postUpdate() will position it correctly
        if (!body.enable) {
          body.enable = true
        }
        body.setImmovable(false)  // Allow postUpdate to position it
        body.setAllowGravity(false)
        body.setVelocityX(0)
        body.setVelocityY(0)
      }
        // When we release movement on the ground and we're not jumping,
        // always return to the default standing idle pose instead of
        // leaving Bittee frozen on a run frame.
        if (isOnGround && !this.isJumping && !this.isCrouching) {
          this.player.anims.stop()
          this.setIdlePose(true)
        }
      }
    }
    
    // Check if all buttons are released (except taunt) - return to idle pose at current position
    // This ensures Bittee returns to default pose when no buttons are pressed
    // Only check if we're on ground and not in any special state
    if (!leftDown && !rightDown && !crouchPressed && !upDown && !fireDown && 
        !this.isThrowing && !this.isTaunting && !this.isCrouching && !this.isJumping && 
        !this.isAiming && isOnGround) {
      // Only set idle if not already in idle pose or running
      const currentAnim = this.player.anims.currentAnim?.key
      const isRunning = currentAnim === 'bittee-run-left' || currentAnim === 'bittee-run-right'
      if (currentAnim !== 'bittee-idle' && !isRunning) {
        this.setIdlePose(true)
      }
    }
  }

  private handleJump(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }

    if (this.isThrowing) {
      return
    }

    const leftDown = (this.cursors.left?.isDown ?? false) || this.touchLeft
    const rightDown = (this.cursors.right?.isDown ?? false) || this.touchRight
    const isMoving = leftDown || rightDown
    const jumpJustPressed =
      (this.cursors.up ? Phaser.Input.Keyboard.JustDown(this.cursors.up) : false) || this.touchUpJustPressed
    const onGround = this.isPlayerGrounded(body)
    
    // Safety reset: Clear stuck transition flags when jump is pressed
    if (jumpJustPressed && (this.isTransitioning || this.justExitedCrouch)) {
      this.isTransitioning = false
      this.justExitedCrouch = false
      this.transitionFrameCount = 0
    }

    if (this.isTaunting) {
      if (jumpJustPressed) {
        this.cancelTaunt(false)
      } else {
        return
      }
    }

    // JUMP BUFFERING: If jump is pressed while in air (but not on ground), store it
    // This allows pressing jump before landing and it will execute as soon as Bittee touches ground
    // Also allow buffering when landing (isJumping but about to land)
    if (jumpJustPressed && (!onGround || (this.isJumping && body.velocity.y >= 0)) && !this.isThrowing && !this.isCrouching) {
      // Store jump input with timestamp for buffering
      this.jumpBufferTime = this.time.now
    }

    // Check if running (need to do this early for debug logs and jump logic)
    const isRunning = isMoving && Math.abs(body.velocity.x) > 10

    // JUMP (standing or running). If the player crouched within the last second
    // before jumping, we boost the jump height.
    // Use lenient canJump check instead of strict onGround for better reliability during running
    const canJump = this.canJump(body)
    
    // In jet phase only, allow double jump (second jump while in air)
    // Tank phase: no double jump, but keep super jump
    const isJetPhase = this.isBossLevel && this.bossPhase === 'jet'
    const canDoubleJump = isJetPhase && this.isJumping && !this.hasDoubleJumped && !onGround
    
    if (jumpJustPressed && (canJump || canDoubleJump) && !this.isThrowing) {
      // Ensure body is enabled and ready for jump
      if (body) {
        if (!body.enable) {
          body.enable = true
        }
        body.setImmovable(false)
        body.setAllowGravity(true)
      }
      
      if (this.isCrouching) {
        // Reset all state flags
        this.isCrouching = false
        this.justExitedCrouch = false
        this.isTransitioning = false
        this.transitionFrameCount = 0
        this.isAirCrouching = false
        
        // Reset scale to normal (from crouch scale)
        this.player.setScale(this.basePlayerScale)
        
        // Re-enable physics (in case they were disabled during crouch)
        if (body) {
          body.enable = true  // Ensure body is enabled
          body.setImmovable(false)
          body.setAllowGravity(true)
          body.setVelocity(0, 0)
          body.setAcceleration(0, 0)
        }
        
        // Update collision box to match standing sprite size
        this.setupPlayerCollider(0)
        
        // NEW: Position body at ground level before jumping (body is source of truth)
        const bodyBottomY = this.groundYPosition
        if (body) {
          body.y = bodyBottomY - (body.height / 2)
          this.player.x = body.x
          this.player.y = bodyBottomY
        }
      }

      // isRunning is already declared above
      let jumpDirection: 'left' | 'right'

      // FIX: Check for left/right keys FIRST (even if running), then use running direction, then alternating
      // This ensures that when keys are pressed, we use that direction, and when standing still, we alternate
      if (leftDown) {
        // Left is pressed - use left direction (regardless of running state)
        jumpDirection = 'left'
        this.facing = 'left'  // Update facing to match
      } else if (rightDown) {
        // Right is pressed - use right direction (regardless of running state)
        jumpDirection = 'right'
        this.facing = 'right'  // Update facing to match
      } else if (isRunning) {
        // No keys pressed but running - use current facing direction
        jumpDirection = this.facing
      } else {
        // Neither key pressed and not running - use alternating standing direction
        jumpDirection = this.standingJumpDirection
        this.standingJumpDirection = this.standingJumpDirection === 'left' ? 'right' : 'left'
      }

      this.currentJumpDirection = jumpDirection
      
      // If this is a double jump, mark it as used
      if (canDoubleJump) {
        this.hasDoubleJumped = true
      }
      this.isJumping = true
      if (body) {
        body.setVelocityY(0)
        body.setAcceleration(0, 0)
        body.setGravityY(this.jumpGravityY)
      }

      // Determine base or boosted jump velocity.
      // On tank levels, use super jump as default
      const isTankLevel = this.isBossLevel && (this.bossPhase === 'tank1' || this.bossPhase === 'tank2' || this.bossPhase === 'tank3')
      let jumpVelocity = isTankLevel ? -JUMP_SPEED * 1.6 : -JUMP_SPEED
      // Boost any jump (standing or running) that happens shortly after a crouch.
      // Extended window to 1000ms (1 second) to make it more reliable
      // On tank levels, this is already boosted, so skip the crouch boost check
      if (!isTankLevel && this.lastCrouchTime !== null && this.time.now - this.lastCrouchTime <= 1000) {
        jumpVelocity = -JUMP_SPEED * 1.6
        // Clear lastCrouchTime after using it so it doesn't affect subsequent jumps
        this.lastCrouchTime = null
      }

      // Reset jump frame index when starting a new jump
      this.currentJumpFrameIndex = 0
      // Stop any running animations before jumping
      this.player.anims.stop()
      if (isRunning) {
        // Running jump: use the same air pose as standing, but keep horizontal speed.
        const firstAirFrame = BITTEE_SPRITES.jumpAir[jumpDirection][0].key
        this.player.setFlipX(false)
        this.player.setTexture(firstAirFrame)
        if (body) {
          body.setGravityY(this.jumpGravityY)
          body.setVelocityY(jumpVelocity)
          // CRITICAL: Preserve horizontal velocity when jumping while running
          // Set horizontal velocity based on jump direction to ensure movement continues
          if (jumpDirection === 'left') {
            body.setVelocityX(-PLAYER_SPEED)
            this.player.setVelocityX(-PLAYER_SPEED)
          } else {
            body.setVelocityX(PLAYER_SPEED)
            this.player.setVelocityX(PLAYER_SPEED)
          }
        }
      } else {
        // Standing jump: switch between jump-right2 and jump-left2
        // right: index 0 = jump-right2, left: index 1 = jump-left2
        const airFrameIndex = jumpDirection === 'right' ? 0 : 1
        const firstAirFrame = BITTEE_SPRITES.jumpAir[jumpDirection][airFrameIndex].key
        this.player.setFlipX(false)
        this.player.setTexture(firstAirFrame)
        if (body) {
          body.setGravityY(this.jumpGravityY)
          body.setVelocityY(jumpVelocity)
        }
      }
    }

    if (this.isCrouching) {
      return
    }

    if (!onGround && this.isJumping) {
      // Ensure we keep the lighter jump gravity while airborne
      if (body && body.gravity.y !== this.jumpGravityY) {
        body.setGravityY(this.jumpGravityY)
      }
    }

    if (onGround && this.isJumping && body && body.velocity.y >= 0) {
      // End jump as soon as we've landed (no longer moving upward)
      this.isJumping = false
      this.hasDoubleJumped = false  // Reset double jump when landing
      body.setGravityY(this.normalGravityY)
      
      // Check for buffered jump input - if jump was pressed before landing, execute it now
      // Do this BEFORE setting isTransitioning to allow the buffered jump to execute
      if (this.jumpBufferTime !== null && (this.time.now - this.jumpBufferTime) <= this.jumpBufferWindow) {
        // Clear buffer immediately
        this.jumpBufferTime = null
        
        // Execute buffered jump directly without checking canJump (we just landed, so we can jump)
        if (!this.isThrowing && !this.isCrouching) {
          // Execute the buffered jump
          // Get left/right state for jump direction determination
          const leftDown = (this.cursors.left?.isDown ?? false) || this.touchLeft
          const rightDown = (this.cursors.right?.isDown ?? false) || this.touchRight
          const isRunning = (leftDown || rightDown) && Math.abs(body.velocity.x) > 10
          let jumpDirection: 'left' | 'right'
          // FIX: Check for left/right keys FIRST (even if running), then use running direction, then alternating
          // This ensures that when keys are pressed, we use that direction, and when standing still, we alternate
          if (leftDown) {
            // Left is pressed - use left direction (regardless of running state)
            jumpDirection = 'left'
            this.facing = 'left'  // Update facing to match
          } else if (rightDown) {
            // Right is pressed - use right direction (regardless of running state)
            jumpDirection = 'right'
            this.facing = 'right'  // Update facing to match
          } else if (isRunning) {
            // No keys pressed but running - use current facing direction
            jumpDirection = this.facing
          } else {
            // Neither key pressed and not running - use alternating standing direction
            jumpDirection = this.standingJumpDirection
            this.standingJumpDirection = this.standingJumpDirection === 'left' ? 'right' : 'left'
          }
          this.currentJumpDirection = jumpDirection
          this.isJumping = true
          this.isTransitioning = false  // Reset transitioning since we're jumping again
          this.transitionFrameCount = 0
          body.setVelocityY(0)
          body.setAcceleration(0, 0)
          body.setGravityY(this.jumpGravityY)
          
          const isTankLevel = this.isBossLevel && (this.bossPhase === 'tank1' || this.bossPhase === 'tank2' || this.bossPhase === 'tank3')
          let jumpVelocity = isTankLevel ? -JUMP_SPEED * 1.6 : -JUMP_SPEED
          if (!isTankLevel && this.lastCrouchTime !== null && this.time.now - this.lastCrouchTime <= 1000) {
            jumpVelocity = -JUMP_SPEED * 1.6
            this.lastCrouchTime = null
          }
          
          this.currentJumpFrameIndex = 0
          // Always use air frame directly (skip jumpSquat for buffered jumps)
          if (isRunning) {
            const firstAirFrame = BITTEE_SPRITES.jumpAir[jumpDirection][0].key
            this.player.setFlipX(false)
            this.player.anims.stop()
            this.player.setTexture(firstAirFrame)
            body.setGravityY(this.jumpGravityY)
            body.setVelocityY(jumpVelocity)
            // CRITICAL: Preserve horizontal velocity when jumping while running (buffered jump)
            if (jumpDirection === 'left') {
              body.setVelocityX(-PLAYER_SPEED)
              this.player.setVelocityX(-PLAYER_SPEED)
            } else {
              body.setVelocityX(PLAYER_SPEED)
              this.player.setVelocityX(PLAYER_SPEED)
            }
          } else {
            const airFrameIndex = jumpDirection === 'right' ? 0 : 1
            const firstAirFrame = BITTEE_SPRITES.jumpAir[jumpDirection][airFrameIndex].key
            this.player.setFlipX(false)
            this.player.anims.stop()
            this.player.setTexture(firstAirFrame)
            body.setGravityY(this.jumpGravityY)
            body.setVelocityY(jumpVelocity)
          }
          // Skip the rest of landing logic since we're jumping again
          return
        }
      }
      
      // Clear expired jump buffer
      if (this.jumpBufferTime !== null && (this.time.now - this.jumpBufferTime) > this.jumpBufferWindow) {
        this.jumpBufferTime = null
      }
      
      // Set transitioning flag to prevent vibration after landing
      this.isTransitioning = true
      this.transitionFrameCount = 4
      
      // Check if left or right is still being held - if so, transition to running immediately
      const leftDown = (this.cursors.left?.isDown ?? false) || this.touchLeft
      const rightDown = (this.cursors.right?.isDown ?? false) || this.touchRight
      
      // Ensure we're not stuck on a jump frame
      const currentTexture = this.player.texture.key
      const isJumpTexture = currentTexture.includes('jump')
      
      if (leftDown || rightDown) {
        // Transition to running pose immediately if movement key is still held
        const runKey = leftDown ? 'bittee-run-left' : 'bittee-run-right'
        this.facing = leftDown ? 'left' : 'right'
        // Force animation change if we're on a jump texture
        if (isJumpTexture || this.player.anims.currentAnim?.key !== runKey) {
          this.player.anims.stop()
          this.player.anims.play(runKey, true)
        }
        // Set velocity to continue running
        const speed = leftDown ? -PLAYER_SPEED : PLAYER_SPEED
        this.player.setVelocityX(speed)
        if (body) {
          body.setVelocityX(speed)
        }
      } else {
        // No movement key held, go to idle
        const currentVelocityX = body.velocity.x
        if (Math.abs(currentVelocityX) > 10) {
          const runKey = this.facing === 'left' ? 'bittee-run-left' : 'bittee-run-right'
          // Force animation change if we're on a jump texture
          if (isJumpTexture || this.player.anims.currentAnim?.key !== runKey) {
            this.player.anims.stop()
            this.player.anims.play(runKey, true)
          }
        } else {
          this.setIdlePose(true)
        }
      }
    }

  }

  private handleThrowing(_time: number): void {
    // Handle keyboard input (spacebar) - also uses hold-to-aim
    if (this.fireKey) {
      const justPressed = Phaser.Input.Keyboard.JustDown(this.fireKey)
      const isHeld = this.fireKey.isDown

      if (this.isTaunting) {
        if (justPressed) {
          this.cancelTaunt(false)
        } else {
          return
        }
      }

      // Start aiming on key press
      if (justPressed && !this.isAiming && !this.isThrowing) {
        this.isAiming = true
        this.startAiming()
      }

      // Release throw on key release
      if (this.isAiming && !isHeld && !this.touchThrow) {
        this.isAiming = false
        this.releaseThrow()
      }
    }

    // Don't process shooting here - it's handled by releaseThrow()
    // This function now only handles keyboard input state
  }

  private startAiming(): void {
    // Can't aim if already throwing
    if (this.isThrowing) {
      return
    }

    // Show throw1 (cock back) animation
    this.player.setFlipX(false)
    this.player.anims.stop()
    this.player.setTexture(BITTEE_SPRITES.throwFrames[0].key)
    
    // Find closest ball and show transparent triangle
    this.updateAimingTriangle()
  }

  private cancelAiming(): void {
    // Remove aiming triangle immediately when cancelling
    this.removeAimingTriangle()
    
    // Return to idle/stand pose if aiming was cancelled
    // Allow returning to crouch pose if we were crouching
    if (!this.isThrowing && !this.isJumping && !this.isTaunting && !this.isAiming) {
      if (this.isCrouching) {
        // Return to crouch pose
        const currentAnim = this.player.anims.currentAnim?.key
        if (currentAnim !== 'bittee-crouch') {
          this.player.anims.play('bittee-crouch', true)
        }
      } else {
        this.setIdlePose(true)
      }
    }
  }

  private releaseThrow(): void {
    // Can't throw if already throwing
    if (this.isThrowing) {
      this.isAiming = false
      return
    }

    const time = this.time.now
    // Use faster fire rate if auto-fire is active (2x rate = half the fireRate)
    const effectiveFireRate = this.isAutoFireActive ? this.fireRate / 2 : this.fireRate
    const canFire = time > this.lastFired + effectiveFireRate
    if (!canFire) {
      this.isAiming = false
      this.cancelAiming()
      return
    }

    // Determine which rock type to use
    let rockType: 'normal' | 'red' | 'green' = 'normal'
    if (this.rockAmmo.length > 0 && this.rockAmmo[0].ammo > 0) {
      rockType = this.rockAmmo[0].type
      this.rockAmmo[0].ammo--
      if (this.rockAmmo[0].ammo <= 0) {
        this.rockAmmo.shift()  // Remove empty ammo entry
      }
      this.updateAmmoDisplay()
      // Remove Super Rock indicator when ammo is used up
      if (this.rockAmmo.length === 0 || this.rockAmmo.every(entry => entry.ammo === 0)) {
        const superRockIndicator = this.powerUpIndicators.get('super-rock')
        if (superRockIndicator) {
          if (superRockIndicator.tween) superRockIndicator.tween.remove()
          superRockIndicator.text.destroy()
          superRockIndicator.progressBar.destroy()
          superRockIndicator.progressBarBg.destroy()
          this.powerUpIndicators.delete('super-rock')
        }
      }
    }

    // Get bullet from pool
    const bullet = this.bullets.get(this.player.x, this.player.y - this.player.displayHeight + 4, ROCK_SPRITE.key) as Phaser.Physics.Arcade.Image
    if (!bullet) {
      this.isAiming = false
      this.cancelAiming()
      return
    }

    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body | null
    if (!bulletBody) {
      this.isAiming = false
      this.cancelAiming()
      return
    }

    bullet.setActive(true)
    bullet.setVisible(true)
    bullet.setTexture(ROCK_SPRITE.key)
    bullet.setOrigin(0.5, 0.5)
    
    // Set rock type data
    bullet.setData('rockType', rockType)
    
    // Calculate scale based on rock type
    const rockTexture = this.textures.get(ROCK_SPRITE.key)
    const rockSource = rockTexture?.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined
    let baseScale = 1
    if (rockSource && rockSource.width && rockSource.height) {
      const maxDim = Math.max(rockSource.width, rockSource.height)
      baseScale = maxDim > 0 ? ROCK_TARGET_SIZE / maxDim : 1
    }
    
    // Apply size modifiers
    if (rockType === 'red') {
      bullet.setScale(baseScale * 2)  // Double size
    } else {
      bullet.setScale(baseScale)
    }

    // Spawn the rock from Bittee's top-right side
    const spawnX = this.player.x + this.player.displayWidth * 0.4
    const spawnY = this.player.y - this.player.displayHeight * 0.5
    bullet.setPosition(spawnX, spawnY)

    // Determine throw direction and speed
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    const onGround = body ? this.isPlayerGrounded(body) : true
    const downDown = (this.cursors.down?.isDown ?? false) || this.touchDown

    let vx = 0
    let vy = -BULLET_SPEED  // Default: shoot up

    // Red rock always goes straight up (no tank phase or down arrow override)
    if (rockType === 'red') {
      vy = -BULLET_SPEED  // Always straight up
    } else if (this.isTankPhase) {
      // In tank phase: always shoot down
      vy = BULLET_SPEED * 1.6  // Shoot downward
    } else if (!onGround) {
      // In air (non-tank): shoot up by default, or down if down is held
      if (downDown) {
        vy = BULLET_SPEED * 1.6  // Shoot downward
      }
      // Otherwise, shoot up (vy is already set to -BULLET_SPEED)
    }

    bullet.setVelocity(vx, vy)
    bullet.setDepth(2)
    bullet.setBlendMode(Phaser.BlendModes.NORMAL)
    bullet.setCollideWorldBounds(false)

    bulletBody.enable = true
    bulletBody.setAllowGravity(false)
    
    // Set collision box based on rock type
    const texture = this.textures.get(ROCK_SPRITE.key)
    const frame = texture ? texture.get(0) : null
    const frameWidth = frame ? frame.width : bullet.width
    const sizeMultiplier = rockType === 'red' ? 2 : 1
    const collisionWidth = frameWidth * 1.0 * sizeMultiplier
    const collisionHeight = collisionWidth * 0.8
    bulletBody.setSize(collisionWidth, collisionHeight)
    
    const offsetX = (frameWidth - collisionWidth) / 2
    const offsetY = 0
    bulletBody.setOffset(offsetX, offsetY)
    
    // Mark red rocks as indestructible
    if (rockType === 'red') {
      bullet.setData('indestructible', true)
    }

    // Make aiming triangles fully opaque when throw is released
    // Convert all aiming triangles to projected hit indicators
    this.aimingTriangles.forEach((triangle, ball) => {
      triangle.setAlpha(1.0)
      // Convert aiming triangle to projected hit indicator
      this.projectedHitIndicators.set(ball, triangle)
    })
    this.aimingTriangles.clear()
    
    // Now trigger throw2 animation and shoot
    this.triggerThrowAnimation()
    this.flashRockInfinity()

    // Play random throw sound (1-3) when throwing at reduced volume
    const throwSoundNum = Phaser.Math.Between(1, 3)
    this.playSound(`throw-sound${throwSoundNum}`, 0.25)

    // Check if rock will hit a ball and create triangle indicator
    // Use a small delay to ensure velocity is properly set
    this.time.delayedCall(10, () => {
      this.checkProjectedHit(bullet)
    })

    this.lastFired = time
    this.isAiming = false
  }

  private cleanupInactiveObjects(): void {
    // Clean up inactive bullets
    this.bullets.children.entries.forEach((bulletObj) => {
      const bullet = bulletObj as Phaser.Physics.Arcade.Image
      if (bullet && !bullet.active) {
        bullet.destroy()
      }
    })
    
    // Clean up inactive balls
    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (ball && !ball.active) {
        ball.destroy()
      }
    })
    
    // Clean up inactive power-ups
    if (this.powerUps) {
      this.powerUps.children.entries.forEach((powerUpObj) => {
        const powerUp = powerUpObj as Phaser.Physics.Arcade.Image
        if (powerUp && !powerUp.active) {
          powerUp.destroy()
        }
      })
    }
    
    // Clean up inactive enemies
    if (this.enemies) {
      this.enemies.children.entries.forEach((enemyObj) => {
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite
        if (enemy && !enemy.active) {
          enemy.destroy()
        }
      })
    }
  }

  private cleanupBullets(): void {
    this.bullets.getChildren().forEach((child) => {
      const bullet = child as Phaser.Physics.Arcade.Image
      if (!bullet.active) return
      
      // Red rocks: destroy when past ceiling (y < -16)
      const isIndestructible = bullet.getData('indestructible') === true
      if (isIndestructible && bullet.y < -16) {
        // Remove any triangle indicators
        const targetBall = this.bulletTargetMap.get(bullet)
        if (targetBall) {
          this.removeProjectedHitIndicator(targetBall)
          this.bulletTargetMap.delete(bullet)
        }
        bullet.disableBody(true, true)
        return
      }
      
      // Normal cleanup for other bullets
      if (bullet.y < -16) {
        // Remove any triangle indicators for this bullet's target
        const targetBall = this.bulletTargetMap.get(bullet)
        if (targetBall) {
          this.removeProjectedHitIndicator(targetBall)
          this.bulletTargetMap.delete(bullet)
        }
        bullet.disableBody(true, true)
      }
    })
  }

  private handleBulletHit(bullet: Phaser.Physics.Arcade.Image, ball: Phaser.Physics.Arcade.Image): void {
    // Red rocks are indestructible - don't destroy on ball hit
    const isIndestructible = bullet.getData('indestructible') === true
    if (isIndestructible) {
      // Don't destroy the bullet, just hit the ball
      if (this.settings.screenShake) {
        this.cameras.main.shake(80, 0.004)
      }
      this.playSound('throw-sound4', 0.3)
      this.score += 1
      this.totalBubblesDestroyed += 1
      this.updateHud()
      this.splitBall(ball)
      return
    }
    
    if (bullet.active) {
      bullet.disableBody(true, true)
    }

    if (this.settings.screenShake) {
      this.cameras.main.shake(80, 0.004)
    }

    // Play throw-sound4 when rock actually hits ball at reduced volume
    this.playSound('throw-sound4', 0.3)

    // Remove triangle indicator if it exists for this bullet
    if (this.bulletTargetMap.has(bullet)) {
      this.removeProjectedHitIndicator(ball)
      this.bulletTargetMap.delete(bullet)
    }

    this.score += 1
    this.totalBubblesDestroyed += 1
    this.updateHud()

    this.splitBall(ball)
  }

  private handlePlayerHit(_ball: Phaser.Physics.Arcade.Image): void {
    if (this.isInvulnerable) {
      return
    }

    // Play life down sound effect
    this.playSound('life-down', 1.0)

    this.lives -= 1
    this.updateHud()
    this.updateHeartbeat()

    this.tweens.add({
      targets: this.player,
      alpha: { from: 0.2, to: 1 },
      duration: 200,
      ease: 'Sine.easeInOut',
      repeat: 4,
    })

    if (this.lives <= 0) {
      // Play heartbeat die sound
      this.playSound('heartbeat-die', 1.0)
      this.stopHeartbeat()
      
      // Stop running sound if playing
      if (this.runSoundPlaying) {
        this.stopSound('bittee-run-sound')
        this.runSoundPlaying = false
      }
      
      // FIX: Clear all triangles when player dies
      this.clearAllTriangles()
      
      this.isInvulnerable = false
      if (this.invulnerabilityTimer) {
        this.invulnerabilityTimer.remove(false)
        this.invulnerabilityTimer = undefined
      }
      
      // Death pause: Transition to stand pose, freeze everything, and fade to black/white over 3 seconds
      this.isPausedForDeath = true  // Pause game (update loop will skip)
      
      const body = this.player.body as Phaser.Physics.Arcade.Body
      
      // Freeze all balls
      this.balls.children.entries.forEach((ball) => {
        const ballBody = (ball as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.Body
        if (ballBody) {
          ballBody.setVelocity(0, 0)
          ballBody.setAcceleration(0, 0)
          ballBody.setAllowGravity(false)
          ballBody.setImmovable(true)
          ballBody.enable = false  // Completely disable physics
        }
      })
      
      // Stop all player movement and animations
      this.player.setVelocity(0)
      this.player.anims.stop()  // Stop any running animations
      
      // Reset all state flags
      this.isThrowing = false
      this.isTaunting = false
      this.isJumping = false
      this.isCrouching = false
      this.justExitedCrouch = false
      this.isTransitioning = false
      this.transitionFrameCount = 0
      this.isAirCrouching = false
      
      // Check if player is grounded - if not, keep them at current position (died in air)
      const isGrounded = body ? this.isPlayerGrounded(body) : false
      let deathY = this.player.y
      
      if (isGrounded) {
        // If grounded, position at ground level
        deathY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
        this.player.setY(deathY)
      }
      // If in air, keep current Y position (deathY already set to current position)
      
      if (body) {
        // Completely disable body to prevent any physics interference
        body.enable = false
        body.setVelocity(0, 0)
        body.setAcceleration(0, 0)
        body.setAllowGravity(false)
        body.setImmovable(true)
        // Manually set body position to match sprite (without updateFromGameObject to prevent drift)
        body.x = this.player.x
        body.y = deathY
      }
      
      // Immediately transition to bittee-1.png
      this.player.setTexture('bittee-1')
      this.player.clearTint()
      this.player.setAlpha(1)
      
      // Death sequence: Transition through bittee-1 -> bittee-2 -> bittee-3 -> bittee-4 over 2 seconds
      // Smooth crossfade transitions with longer duration and smoother easing
      const transitionDuration = 500  // 0.5 seconds per transition
      const totalDuration = 2000  // 2 seconds total
      const fadeDuration = 250  // Longer fade for smoother transition
      const fadeAlpha = 0.5  // Less dramatic fade (was 0.3, now 0.5 for smoother look)
      
      // Transition 1: bittee-1 -> bittee-2 (at 0.5s)
      this.time.delayedCall(transitionDuration, () => {
        // Smooth fade out, swap texture, then fade in
        this.tweens.add({
          targets: this.player,
          alpha: fadeAlpha,
          duration: fadeDuration,
          ease: 'Sine.easeInOut',  // Smoother easing
          onComplete: () => {
            this.player.setTexture('bittee-2')
            this.tweens.add({
              targets: this.player,
              alpha: 1,
              duration: fadeDuration,
              ease: 'Sine.easeInOut',  // Smoother easing
            })
          }
        })
      })
      
      // Transition 2: bittee-2 -> bittee-3 (at 1.0s)
      this.time.delayedCall(transitionDuration * 2, () => {
        this.tweens.add({
          targets: this.player,
          alpha: fadeAlpha,
          duration: fadeDuration,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.player.setTexture('bittee-3')
            this.tweens.add({
              targets: this.player,
              alpha: 1,
              duration: fadeDuration,
              ease: 'Sine.easeInOut',
            })
          }
        })
      })
      
      // Transition 3: bittee-3 -> bittee-4 (at 1.5s)
      this.time.delayedCall(transitionDuration * 3, () => {
        this.tweens.add({
          targets: this.player,
          alpha: fadeAlpha,
          duration: fadeDuration,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.player.setTexture('bittee-4')
            this.tweens.add({
              targets: this.player,
              alpha: 1,
              duration: fadeDuration,
              ease: 'Sine.easeInOut',
            })
          }
        })
      })
      
      // After 2 seconds, show game over modal
      this.time.delayedCall(totalDuration, () => {
        this.handleGameOver()
      })
      
      return
    }

    this.isInvulnerable = true
    if (this.invulnerabilityTimer) {
      this.invulnerabilityTimer.remove(false)
    }
    this.invulnerabilityTimer = this.time.delayedCall(1000, () => {
      this.isInvulnerable = false
      this.player.setAlpha(1)
      this.invulnerabilityTimer = undefined
    })

    this.time.delayedCall(200, () => {
      // Keep Bittee at current X position
      // Only move Y to ground if he's on the ground, otherwise keep his current Y position (if in air)
      const body = this.player.body as Phaser.Physics.Arcade.Body
      const isOnGround = body && (body.blocked.down || body.touching.down || body.onFloor())
      
      // Reset all state flags
      this.isThrowing = false
      this.isTaunting = false
      this.isJumping = false
      this.isCrouching = false
      this.justExitedCrouch = false
      this.isTransitioning = false
      this.transitionFrameCount = 0
      this.isAirCrouching = false
      
      // Reset scale to normal (in case player was crouching)
      this.player.setScale(this.basePlayerScale)
      
      // Re-enable physics (in case they were disabled during crouch)
      if (body) {
        body.setImmovable(false)
        body.setAllowGravity(true)
        body.setVelocity(0, 0)
        body.setAcceleration(0, 0)
      }
      
      // Update collision box to match standing sprite size
      this.setupPlayerCollider(0)
      
      if (isOnGround) {
        this.player.setY(this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
        if (body) {
          body.updateFromGameObject()
        }
      }
      // Otherwise, keep his current Y position (he's in the air)
      
      this.setIdlePose(true)
    })
  }

  private splitBall(ball: Phaser.Physics.Arcade.Image): void {
    // FIX 1: Clean up red triangles/indicators when ball is destroyed
    this.removeProjectedHitIndicator(ball)
    this.removeAimingTriangleForBall(ball)
    
    const size = ball.getData('size') as BallSize
    const rule = BALL_RULES[size]

    if (rule.nextSize) {
      const nextSize = rule.nextSize
      const childRule = BALL_RULES[nextSize]
      // When a ball splits, use the brand assigned to the next size for the current level
      const brandAssignments = LEVEL_BRAND_ASSIGNMENTS[this.currentLevelIndex] ?? LEVEL_BRAND_ASSIGNMENTS[0]
      const levelBrands: Record<BallSize, string> = {
        large: brandAssignments[0],
        medium: brandAssignments[1],
        small: brandAssignments[2],
        mini: brandAssignments[3],
      }
      // Get the default brand for the child size
      let childTexture = levelBrands[nextSize]
      
      // Ensure child balls have a different brand than parent
      const parentTexture = ball.getData('textureKey') as string
      const parentBrand = parentTexture.replace(/^ball-(large|medium|small|mini)-/, '')
      const childBrand = childTexture.replace(/^ball-(large|medium|small|mini)-/, '')
      
      // If child would have same brand as parent, pick a different one from the same level
      if (parentBrand === childBrand) {
        // Find a different brand for this size
        const otherSizes: BallSize[] = ['large', 'medium', 'small', 'mini']
        for (const otherSize of otherSizes) {
          if (otherSize !== nextSize) {
            const otherBrand = levelBrands[otherSize].replace(/^ball-(large|medium|small|mini)-/, '')
            if (otherBrand !== parentBrand) {
              // Use this brand for the child instead
              childTexture = `ball-${nextSize}-${otherBrand}`
              break
            }
          }
        }
      }
      
      const childBubbleKey = this.textures.exists(`${childTexture}-bubble`) ? `${childTexture}-bubble` : childTexture
      const childSize = this.getBubbleDisplaySize(childBubbleKey, childRule.displayScale)

      // Spawn child balls at parent's position with a small offset (classic arcade style)
      // This creates a natural "splitting" effect where balls emerge from the destroyed parent
      const offset = childSize * 0.5  // Smaller offset for tighter split effect
      let spawnX = ball.x
      
      // FIX 2: Ensure child balls spawn HIGH above ground with proper spacing
      // Calculate spawn Y to be well above parent's top edge
      const ballBody = ball.body as Phaser.Physics.Arcade.Body
      const ballRadius = ballBody ? ballBody.width / 2 : ball.displayWidth / 2
      const childRadius = childSize / 2
      
      // Spawn children well above parent's top to ensure they have room to bounce
      // Use parent's top (ball.y - ballRadius) minus child radius minus a larger gap
      const parentTop = ball.y - ballRadius
      let spawnY = parentTop - childRadius - 20  // 20px gap between parent top and child bottom
      
      // Ensure minimum height above ground - use a higher minimum to prevent low bounces
      // Ground Y is 768, so we want spawn Y to be at least 100px above ground for proper bounce
      // Since Y increases downward, spawnY should be LESS than (groundY - 100)
      const minSpawnHeight = 150  // Increased from 100 to 150 for better bounce height
      const minSpawnY = this.groundYPosition - minSpawnHeight - childRadius
      // ALWAYS ensure spawnY is above minimum - use the higher of the two values
      // Since Y increases downward, we want the LOWER Y value (higher on screen)
      spawnY = Math.min(spawnY, minSpawnY - 20)  // Ensure we're at least 20px above minimum
      
      // FIX: Check if spawn position would overlap with Bittee and adjust if needed
      const playerX = this.player.x
      const playerY = this.player.y
      const playerWidth = this.player.displayWidth
      const safeDistance = Math.max(childSize, playerWidth / 2 + childSize / 2 + 20)  // Minimum safe distance
      
      // Calculate distance from spawn position to player center
      const distanceToPlayer = Phaser.Math.Distance.Between(spawnX, spawnY, playerX, playerY)
      
      // If spawn position is too close to player, adjust it away from player
      if (distanceToPlayer < safeDistance) {
        // Calculate direction away from player
        const angleToPlayer = Phaser.Math.Angle.Between(playerX, playerY, spawnX, spawnY)
        // Move spawn position away from player
        spawnX = playerX + Math.cos(angleToPlayer) * safeDistance
        // Keep Y position the same (spawn at adjusted Y)
      }
      
      // Spawn both children with opposite horizontal directions
      // FIX 2: Give explicit upward velocity to ensure proper bounce
      const child1X = spawnX - offset
      const child2X = spawnX + offset
      const child1 = this.spawnBall(child1X, spawnY, nextSize, -1, childTexture)
      const child2 = this.spawnBall(child2X, spawnY, nextSize, 1, childTexture)
      
      // Mark spawn method
      if (child1) child1.setData('spawnMethod', 'split')
      if (child2) child2.setData('spawnMethod', 'split')
      
      // Immediately set gravity for split balls (before body enable)
      // CRITICAL: If slow motion is active, scale gravity accordingly
      const baseGravity = 240  // Match the gravity used in spawnBall
      const ballGravity = this.isSlowMotion ? baseGravity * 0.3 : baseGravity
      if (child1) {
        const body1 = child1.body as Phaser.Physics.Arcade.Body
        if (body1) {
          body1.setGravityY(ballGravity)
        }
        child1.setPosition(child1X, spawnY)
        if (body1) {
          body1.updateFromGameObject()
        }
      }
      if (child2) {
        const body2 = child2.body as Phaser.Physics.Arcade.Body
        if (body2) {
          body2.setGravityY(ballGravity)
        }
        child2.setPosition(child2X, spawnY)
        if (body2) {
          body2.updateFromGameObject()
        }
      }
      
      // OPTIMIZATION: Set velocity immediately instead of using delayed call
      // This reduces the 58ms delay that was causing first ball shot freeze
      // The spawnBall function already handles body enable in a delayed call, so we can set velocity here
      if (child1 && child1.active) {
        const child1Body = child1.body as Phaser.Physics.Arcade.Body
        if (child1Body && child1Body.enable) {
          // Velocity will be set by spawnBall's delayed callback, but we can optimize by setting it here too
          // This ensures the velocity is correct even if spawnBall's callback hasn't run yet
          const currentVelX = child1Body.velocity.x
          child1.setVelocity(currentVelX, -childRule.bounceVelocity)
          child1Body.setVelocity(currentVelX, -childRule.bounceVelocity)
        }
      }
      if (child2 && child2.active) {
        const child2Body = child2.body as Phaser.Physics.Arcade.Body
        if (child2Body && child2Body.enable) {
          const currentVelX = child2Body.velocity.x
          child2.setVelocity(currentVelX, -childRule.bounceVelocity)
          child2Body.setVelocity(currentVelX, -childRule.bounceVelocity)
        }
      }
      
      // Still use a delayed call as a safety net to ensure velocity is correct after body is fully enabled
      // But use 0ms delay instead of 1ms to reduce latency
      this.time.delayedCall(0, () => {
        if (child1 && child1.active) {
          const child1Body = child1.body as Phaser.Physics.Arcade.Body
          if (child1Body && child1Body.enable) {
            const currentVelX = child1Body.velocity.x
            child1.setVelocity(currentVelX, -childRule.bounceVelocity)
            child1Body.setVelocity(currentVelX, -childRule.bounceVelocity)
          }
        }
        if (child2 && child2.active) {
          const child2Body = child2.body as Phaser.Physics.Arcade.Body
          if (child2Body && child2Body.enable) {
            const currentVelX = child2Body.velocity.x
            child2.setVelocity(currentVelX, -childRule.bounceVelocity)
            child2Body.setVelocity(currentVelX, -childRule.bounceVelocity)
          }
        }
      })

    }

    // Spawn power-up with dynamic chance based on deaths and lives
    if (!this.isBossLevel) {
      // Base chance: 10%
      // Increase chance if dying a lot (each death adds 5% chance, max 50%)
      const deathBonus = Math.min(this.deathCount * 0.05, 0.4)  // Max 40% bonus from deaths
      const baseChance = 0.1
      const spawnChance = Math.min(baseChance + deathBonus, 0.5)  // Max 50% chance
      
      if (Math.random() < spawnChance) {
        // Determine power-up type with weighted chances
        let powerUpType: 'life' | 'shield' | 'time' | 'slingshot-red' | 'slingshot-green'
        
        // If lives are low (less than 3) and not at max (5), increase life power-up chance
        // If at max lives (5), never spawn life power-ups
        if (this.lives >= 5) {
          // At max lives, spawn shield, time, or slingshot powerups
          const powerUpTypes: Array<'shield' | 'time' | 'slingshot-red'> = ['shield', 'time', 'slingshot-red']
          powerUpType = Phaser.Math.RND.pick(powerUpTypes)
        } else if (this.lives < 3) {
          // 50% chance for life, 10% each for shield and time, 30% for slingshot
          const rand = Math.random()
          if (rand < 0.5) {
            powerUpType = 'life'
          } else if (rand < 0.6) {
            powerUpType = 'shield'
          } else if (rand < 0.7) {
            powerUpType = 'time'
          } else {
            powerUpType = 'slingshot-red'
          }
        } else {
          // Normal distribution: equal chance for all (including slingshot)
          const powerUpTypes: Array<'life' | 'shield' | 'time' | 'slingshot-red' | 'slingshot-green'> = ['life', 'shield', 'time', 'slingshot-red', 'slingshot-green']
          powerUpType = Phaser.Math.RND.pick(powerUpTypes)
        }
        
        this.spawnPowerUp(ball.x, ball.y, powerUpType)
      }
    }

    // FIX: Clean up triangles/indicators BEFORE destroying ball
    // This ensures cleanup happens even if ball is destroyed elsewhere
    this.removeProjectedHitIndicator(ball)
    this.removeAimingTriangleForBall(ball)
    
    // Clean up ball properly to remove debug graphics immediately
    ball.setActive(false)
    ball.setVisible(false)
    const body = ball.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.enable = false
    }
    ball.destroy()

    // Check if all balls are destroyed - with error handling for mobile crashes
    // Use a delayed check to ensure the ball is fully removed from the group
    this.time.delayedCall(50, () => {
      try {
        if (this.balls) {
          // Count active balls by iterating through children
          let activeCount = 0
          let totalCount = 0
          this.balls.children.entries.forEach((ballObj) => {
            const ball = ballObj as Phaser.Physics.Arcade.Image
            totalCount++
            if (ball && ball.active) {
              activeCount++
            }
          })
          
          if (activeCount === 0 && !this.isBossLevel && this.isGameActive) {
            // Use a flag to prevent multiple level advances
            if (!this.isAdvancingLevel) {
              this.isAdvancingLevel = true
              this.time.delayedCall(500, () => {
                try {
                  if (this.isGameActive && !this.isBossLevel && this.scene) {
                    // Reset the flag before calling so advanceLevel() can set it itself
                    this.isAdvancingLevel = false
                    this.advanceLevel()
                  } else {
                    this.isAdvancingLevel = false
                  }
                } catch (err: unknown) {
                  console.error('Error in advanceLevel:', err)
                  this.isAdvancingLevel = false
                }
              })
            }
          }
        }
      } catch (err: unknown) {
        console.error('Error checking ball count:', err)
      }
    })
  }

  private spawnPowerUp(x: number, y: number, type: 'life' | 'shield' | 'time' | 'slingshot-red' | 'slingshot-green'): void {
    const powerUp = this.powerUps.create(x, y, `powerup-${type}`) as Phaser.Physics.Arcade.Image
    if (!powerUp) {
      return
    }
    
    powerUp.setData('type', type)
    // Different scales for different power-ups
    if (type === 'shield') {
      powerUp.setScale(0.18)  // Shield icon larger
    } else if (type === 'slingshot-red') {
      powerUp.setScale(0.18)  // Slingshot icon same size as shield
    } else {
      powerUp.setScale(0.08)  // Life and time icons smaller
    }
    powerUp.setDepth(5)  // Above ground, below player
    
    // Make power-up bounce slightly
    const body = powerUp.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.setBounce(0.3, 0.3)
      body.setCollideWorldBounds(true)
      body.setFrictionX(0.5)  // Add friction to slow down sliding
      // Give it a small upward velocity to make it pop out
      body.setVelocityY(-100)
      
      // Determine horizontal velocity based on spawn position
      // If near right edge, always go left; otherwise random
      const worldWidth = this.cameras.main.width
      const rightEdgeThreshold = worldWidth * 0.7  // 70% of screen width
      let horizontalVel: number
      if (x >= rightEdgeThreshold) {
        // Near right edge: always go left
        horizontalVel = Phaser.Math.RND.between(-50, -20)  // Negative = left
      } else {
        // Elsewhere: random direction
        horizontalVel = Phaser.Math.RND.between(-50, 50)
      }
      body.setVelocityX(horizontalVel)
    }
    
    // Track spawn time and ground hit time
    powerUp.setData('spawnTime', this.time.now)  // Track when powerup was spawned
    powerUp.setData('hasHitGround', false)
    powerUp.setData('isBlinking', false)
    powerUp.setData('blinkTween', null)
    powerUp.setData('groundHitTime', null)
  }

  private updatePowerUps(): void {
    // Check all active power-ups every frame
    this.powerUps.getChildren().forEach((child) => {
      const powerUp = child as Phaser.Physics.Arcade.Image
      if (!powerUp || !powerUp.active) return
      
      const body = powerUp.body as Phaser.Physics.Arcade.Body
      if (!body) return
      
      // Check if power-up is touching the ground (multiple methods for reliability)
      // Also check if it's near ground and velocity is low (settled)
      const isNearGround = powerUp.y >= this.groundYPosition - 10 && powerUp.y <= this.groundYPosition + 10
      const isSettled = Math.abs(body.velocity.y) < 10 && Math.abs(body.velocity.x) < 50
      const isTouchingGround = body.touching.down || body.blocked.down || (isNearGround && isSettled)
      
      // If just hit the ground, mark it and start timers
      if (isTouchingGround && !powerUp.getData('hasHitGround')) {
        powerUp.setData('hasHitGround', true)
        const groundHitTime = this.time.now
        powerUp.setData('groundHitTime', groundHitTime)
        
        // Stop horizontal movement to prevent sliding
        body.setVelocityX(0)
        body.setFrictionX(1)
        body.setBounce(0, 0)  // Remove bounce after hitting ground
        
        // Start blinking after 2 seconds from hitting ground
        this.time.delayedCall(2000, () => {
          if (powerUp && powerUp.active) {
            powerUp.setData('isBlinking', true)
            // Start blinking animation
            const blinkTween = this.tweens.add({
              targets: powerUp,
              alpha: { from: 1, to: 0.3 },
              duration: 200,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            })
            powerUp.setData('blinkTween', blinkTween)
          }
        })
        
        // Disappear after 5 seconds from hitting ground
        this.time.delayedCall(5000, () => {
          if (powerUp && powerUp.active) {
            // Stop any blinking tweens before destroying
            const blinkTween = powerUp.getData('blinkTween')
            if (blinkTween) {
              this.tweens.killTweensOf(powerUp)
            }
            powerUp.destroy()
          }
        })
      }
    })
  }

  private collectPowerUp(type: 'life' | 'shield' | 'time' | 'slingshot-red' | 'slingshot-green'): void {
    // Play power-up sound effect
    this.playSound('powerup', 0.5)

    switch (type) {
      case 'life':
        // Limit max lives to 5
        if (this.lives < 5) {
          this.lives++
          this.playSound('life-up', 1.0)
          this.updateHud()
          this.updateHeartbeat()
          this.showLifeGainText()
        }
        break
        
      case 'shield':
        // Activate shield (invincibility + visual bubble)
        this.activateShield()
        this.showPowerUpIndicator('Shield', 5000)
        break
        
      case 'time':
        // Activate slow motion
        this.activateSlowMotion()
        this.showPowerUpIndicator('Slow Motion', 3000)  // Match actual slow motion duration (3 seconds)
        break
        
      case 'slingshot-red':
        // Red slingshot: 1 super rock ammo (double size, indestructible, straight up)
        this.rockAmmo.push({ type: 'red', ammo: 1 })
        // Only show indicator if we don't already have one (to prevent it from being removed by other powerups)
        if (!this.powerUpIndicators.has('super-rock')) {
          this.showPowerUpIndicator('Super Rock', 0)  // No duration, shows until ammo is used
        }
        this.updateAmmoDisplay()
        break
        
      case 'slingshot-green':
        // Green slingshot: Auto Throw - 2x fire rate, automatic, lasts 3 seconds
        // Cancel existing auto-fire if active
        if (this.autoFireTimer) {
          this.autoFireTimer.remove(false)
          this.autoFireTimer = undefined
        }
        this.isAutoFireActive = true
        this.autoFireLastShot = 0
        this.autoFireStartTime = this.time.now
        
        // Show indicator with 3 second timer
        this.showPowerUpIndicator('Auto Throw', 3000)
        
        // Set timer to disable auto-fire after 3 seconds
        this.autoFireTimer = this.time.delayedCall(3000, () => {
          this.isAutoFireActive = false
          this.autoFireTimer = undefined
          this.updateAmmoDisplay()  // Remove timer bar
        }, [], this)
        
        this.updateAmmoDisplay()
        break
    }
  }

  private showLifeGainText(): void {
    // Remove existing life gain text if any
    if (this.lifeGainText) {
      this.lifeGainText.destroy()
    }
    
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height
    const centerX = worldWidth / 2
    const centerY = worldHeight / 2
    
    this.lifeGainText = this.add.text(centerX, centerY, '+ Life', {
      fontSize: '80px',
      fontFamily: 'MontserratBold',
      color: '#7fb069',  // Bright olive green
    })
    this.lifeGainText.setOrigin(0.5)
    this.lifeGainText.setScrollFactor(0)
    this.lifeGainText.setDepth(20)
    this.lifeGainText.setScale(2.0)
    
    // Animate and fade out
    this.tweens.add({
      targets: this.lifeGainText,
      y: centerY - 100,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        if (this.lifeGainText) {
          this.lifeGainText.destroy()
          this.lifeGainText = undefined
        }
      },
    })
  }

  private showPowerUpIndicator(label: string, duration: number): void {
    const powerUpKey = label.toLowerCase().replace(' ', '-')  // "slow motion" -> "slow-motion", "shield" -> "shield"
    
    // Remove existing indicator for this power-up if any
    const existing = this.powerUpIndicators.get(powerUpKey)
    if (existing) {
      if (existing.tween) existing.tween.remove()
      existing.text.destroy()
      existing.progressBar.destroy()
      existing.progressBarBg.destroy()
      this.powerUpIndicators.delete(powerUpKey)
    }
    
    const worldWidth = this.scale.width
    const padding = 24
    const barWidth = 300
    const barHeight = 12
    const barSpacing = 20  // Space between bars when multiple power-ups are active
    
    // Calculate position based on how many power-ups are active
    const activeCount = this.powerUpIndicators.size
    const isFirst = activeCount === 0
    
    // Text position - first one at top, second one below it
    const textY = padding + 80 + (isFirst ? 0 : 100)  // Second one is 100px below first
    // Progress bar position - first one at top, second one below it
    const barY = padding + 20 + (isFirst ? 0 : barSpacing + barHeight)  // Second bar below first
    
    // Create text indicator - make "Shield" 150px font
    const fontSize = label === 'Shield' ? '125px' : '60px'  // Shield is larger
    const text = this.add.text(worldWidth / 2, textY, label, {
      fontSize: fontSize,
      fontFamily: 'MontserratBold',
      color: '#7fb069',  // Light olive green
    })
    text.setOrigin(0.5, 0)
    text.setScrollFactor(0)
    text.setDepth(20)
    text.setScale(2.0)  // Large scale to extend beyond screen edges
    
    // Create progress bar background
    const progressBarBg = this.add.graphics()
    progressBarBg.fillStyle(0x2a2a2a, 1)  // Dark background
    progressBarBg.fillRect(worldWidth / 2 - barWidth / 2, barY, barWidth, barHeight)
    progressBarBg.setScrollFactor(0)
    progressBarBg.setDepth(5)
    
    // Create progress bar (light olive green)
    const progressBar = this.add.graphics()
    progressBar.fillStyle(0x7fb069, 1)  // Light olive green
    const barX = worldWidth / 2 - barWidth / 2
    progressBar.fillRect(barX, barY, barWidth, barHeight)
    progressBar.setScrollFactor(0)
    progressBar.setDepth(6)
    
    // Animate progress bar shrinking from right to left (only if duration > 0)
    const progressData = { width: barWidth }
    let tween: Phaser.Tweens.Tween | undefined
    if (duration > 0) {
      tween = this.tweens.add({
        targets: progressData,
        width: 0,
        duration: duration,
        ease: 'Linear',
        onUpdate: () => {
          if (progressBar && progressBar.active) {
            const currentWidth = progressData.width
            progressBar.clear()
            progressBar.fillStyle(0x7fb069, 1)
            const clampedWidth = Math.max(0, Math.min(currentWidth, barWidth))
            progressBar.fillRect(barX, barY, clampedWidth, barHeight)
          }
          // Fade text as time runs out
          if (text && text.active) {
            const progress = Math.max(0, Math.min(progressData.width / barWidth, 1))
            text.setAlpha(progress)
          }
        },
        onComplete: () => {
          const indicator = this.powerUpIndicators.get(powerUpKey)
          if (indicator) {
            indicator.text.destroy()
            indicator.progressBar.destroy()
            indicator.progressBarBg.destroy()
            this.powerUpIndicators.delete(powerUpKey)
          }
        },
      })
    } else {
      // Duration 0 means it stays until manually removed (like Super Rock ammo)
      // Keep progress bar full and text visible
    }
    
    // Store the indicator
    this.powerUpIndicators.set(powerUpKey, {
      text,
      progressBar,
      progressBarBg,
      tween,
    })
  }

  private activateShield(): void {
    // Play shield sound at 25% volume (reduced from 50%)
    this.playSound('shield-sound', 0.25)

    // Cancel existing shield if active
    if (this.shieldTimer) {
      this.shieldTimer.remove(false)
    }
    if (this.shieldBubble) {
      this.shieldBubble.destroy()
    }
    
    // Create visual bubble around player using the same bubble generation as balls
    // Generate a bubble texture for the shield
    const shieldBubbleKey = 'shield-bubble'
    if (!this.textures.exists(shieldBubbleKey)) {
      // Create a bubble similar to ball bubbles but with bright olive green tint
      const bubbleSize = 200  // Size for shield bubble (larger than player)
      const canvas = document.createElement('canvas')
      canvas.width = bubbleSize
      canvas.height = bubbleSize
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const center = bubbleSize / 2
        const radius = bubbleSize / 2 - 3

        ctx.save()
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, Math.PI * 2)
        ctx.clip()

        // Create gradient similar to ball bubbles but with olive green colors
        const baseGradient = ctx.createRadialGradient(center, center, radius * 0.1, center, center, radius)
        baseGradient.addColorStop(0, 'rgba(127, 176, 105, 0.3)')  // Bright olive green center
        baseGradient.addColorStop(0.7, 'rgba(90, 140, 80, 0.15)')  // Darker olive green middle
        baseGradient.addColorStop(1, 'rgba(60, 100, 60, 0.25)')  // Dark olive green edge
        ctx.fillStyle = baseGradient
        ctx.fillRect(0, 0, bubbleSize, bubbleSize)

        // Add highlight similar to ball bubbles
        const highlightGradient = ctx.createRadialGradient(
          center - radius * 0.3,
          center - radius * 0.3,
          radius * 0.1,
          center - radius * 0.3,
          center - radius * 0.3,
          radius * 0.4
        )
        highlightGradient.addColorStop(0, 'rgba(150, 200, 130, 0.4)')  // Light olive green highlight
        highlightGradient.addColorStop(1, 'rgba(127, 176, 105, 0)')
        ctx.fillStyle = highlightGradient
        ctx.fillRect(0, 0, bubbleSize, bubbleSize)

        ctx.restore()

        // Add border
        ctx.strokeStyle = 'rgba(127, 176, 105, 0.6)'  // Bright olive green border
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, Math.PI * 2)
        ctx.stroke()

        this.textures.addCanvas(shieldBubbleKey, canvas)
      }
    }
    
    // Center bubble on Bittee's center (not ground level)
    // Player origin is at bottom center (0.5, 1), so center is at player.y - (player.height / 2)
    const playerCenterY = this.player.y - (this.player.displayHeight / 2)
    this.shieldBubble = this.add.image(this.player.x, playerCenterY, shieldBubbleKey)
    this.shieldBubble.setScale(1.3)  // A bit smaller than before
    this.shieldBubble.setAlpha(0.95)  // Less transparent (was 0.8)
    this.shieldBubble.setDepth(11)  // On top of player (player is depth 10)
    this.shieldBubble.setOrigin(0.5, 0.5)  // Ensure it's centered on Bittee
    
    // Make player invincible
    this.isInvulnerable = true
    
    // Remove shield after 5 seconds
    this.shieldTimer = this.time.delayedCall(5000, () => {
      if (this.shieldBubble) {
        this.shieldBubble.destroy()
        this.shieldBubble = undefined
      }
      this.isInvulnerable = false
      this.shieldTimer = undefined
    })
  }

  private activateSlowMotion(): void {
    // Play all time sounds simultaneously for 3 seconds only
    const sound1 = this.soundEffects.get('time-sound1')
    const sound2 = this.soundEffects.get('time-sound2')
    const sound3 = this.soundEffects.get('time-sound3')
    
    const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    if (volumeMultiplier === 0) return
    
    // Stop any existing time sounds
    this.timeSoundInstances.forEach(instance => {
      if (instance && instance.isPlaying) {
        instance.stop()
      }
    })
    this.timeSoundInstances = []
    
    if (sound1 && sound1 instanceof Phaser.Sound.BaseSound) {
      sound1.play({ volume: 0.7 * volumeMultiplier })
      this.timeSoundInstances.push(sound1)
      this.time.delayedCall(3000, () => {
        if (sound1 && sound1.isPlaying) {
          sound1.stop()
        }
      })
    }
    if (sound2 && sound2 instanceof Phaser.Sound.BaseSound) {
      sound2.play({ volume: 0.7 * volumeMultiplier })
      this.timeSoundInstances.push(sound2)
      this.time.delayedCall(3000, () => {
        if (sound2 && sound2.isPlaying) {
          sound2.stop()
        }
      })
    }
    if (sound3 && sound3 instanceof Phaser.Sound.BaseSound) {
      sound3.play({ volume: 0.7 * volumeMultiplier })
      this.timeSoundInstances.push(sound3)
      this.time.delayedCall(3000, () => {
        if (sound3 && sound3.isPlaying) {
          sound3.stop()
        }
      })
    }

    // Cancel existing slow motion if active (refresh like shield does)
    if (this.slowMotionTimer) {
      this.slowMotionTimer.remove(false)
      // Don't restore speeds - just refresh the timer
      // This prevents movement glitches when refreshing slow motion
    }
    
    // FIX: Apply slow motion to ALL balls immediately, not just on bounce
    this.isSlowMotion = true
    const slowMotionFactor = 0.3
    const baseGravity = 240
    
    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (!ball || !ball.active) return
      const ballBody = ball.body as Phaser.Physics.Arcade.Body
      if (!ballBody) return
      
      // Only apply if not already applied
      if (!ball.getData('slowMotionApplied')) {
        // Store original velocities BEFORE applying slow motion
        const currentVelX = ballBody.velocity.x
        const currentVelY = ballBody.velocity.y
        const currentGravity = ballBody.gravity.y || baseGravity
        
        // Store original values
        ball.setData('originalVelX', currentVelX)
        ball.setData('originalVelY', currentVelY)
        ball.setData('originalGravity', currentGravity)
        
        // Apply slow motion factor
        ballBody.setVelocity(currentVelX * slowMotionFactor, currentVelY * slowMotionFactor)
        ballBody.setGravityY(currentGravity * slowMotionFactor)
        ball.setData('slowMotionApplied', true)
      }
    })
    
    // Don't change physics time scale - that affects everything including Bittee
    // Instead, we'll slow down balls in the update loop and when they spawn/bounce
    this.isSlowMotion = true
    
    // Restore normal speed after 3 seconds
    this.slowMotionTimer = this.time.delayedCall(3000, () => {
      this.restoreBallSpeeds()
      this.isSlowMotion = false
      this.slowMotionTimer = undefined
    }, [], this)
  }

  private restoreBallSpeeds(): void {
    // Restore normal speed and gravity for all balls that were slowed
    // CRITICAL FIX: Use stored original velocities instead of dividing current velocity
    // This prevents amplifying extra velocity gained during slow motion (from bounces, collisions, etc.)
    const baseGravity = 240
    const slowMotionFactor = 0.3
    
    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (!ball || !ball.active) return
      const body = ball.body as Phaser.Physics.Arcade.Body
      if (!body) return

      const hasSlowMotion = ball.getData('slowMotionApplied') as boolean
      if (hasSlowMotion) {
        // Get stored original velocities (from when slow motion was first applied)
        const originalVelX = ball.getData('originalVelX') as number | undefined
        const originalVelY = ball.getData('originalVelY') as number | undefined
        const originalGravity = ball.getData('originalGravity') as number | undefined
        
        // CRITICAL FIX: Restore to original velocity, not current velocity divided by factor
        // This prevents amplifying extra velocity gained during slow motion
        let restoredVelX: number
        let restoredVelY: number
        
        if (originalVelX !== undefined && originalVelY !== undefined) {
          // FIX: Preserve CURRENT direction (ball may have bounced during slow motion)
          // but restore to original speed magnitude
          const currentVelX = body.velocity.x
          const currentVelY = body.velocity.y
          const currentDirX = Math.sign(currentVelX)
          const currentDirY = Math.sign(currentVelY)
          
          // Get original speed magnitudes
          const originalSpeedX = Math.abs(originalVelX)
          const originalSpeedY = Math.abs(originalVelY)
          
          // Use current direction (preserves bounces during slow motion) with original speed
          // If current direction is 0 (ball stopped), use original direction
          restoredVelX = originalSpeedX * (currentDirX !== 0 ? currentDirX : Math.sign(originalVelX))
          restoredVelY = originalSpeedY * (currentDirY !== 0 ? currentDirY : Math.sign(originalVelY))
        } else {
          // Fallback: if original velocities weren't stored, divide current by factor
          // This should only happen if slow motion was applied before this fix
          const currentVelX = body.velocity.x
          const currentVelY = body.velocity.y
          restoredVelX = currentVelX / slowMotionFactor
          restoredVelY = currentVelY / slowMotionFactor
        }
        
        body.setVelocity(restoredVelX, restoredVelY)
        body.setGravityY(originalGravity ?? baseGravity)
        
        // Clear flags
        ball.setData('slowMotionApplied', false)
        ball.setData('originalVelX', undefined)
        ball.setData('originalVelY', undefined)
        ball.setData('originalGravity', undefined)
      } else {
        // Just restore gravity if it's reduced
        if (body.gravity.y !== baseGravity) {
          body.setGravityY(baseGravity)
        }
      }
    })
  }

  private resetPowerUps(): void {
    // Stop all powerup sounds
    this.timeSoundInstances.forEach(instance => {
      if (instance && instance.isPlaying) {
        instance.stop()
      }
    })
    this.timeSoundInstances = []
    const shieldSound = this.soundEffects.get('shield-sound')
    if (shieldSound && shieldSound instanceof Phaser.Sound.BaseSound && shieldSound.isPlaying) {
      shieldSound.stop()
    }
    
    // Reset auto-fire
    if (this.autoFireTimer) {
      this.autoFireTimer.remove(false)
      this.autoFireTimer = undefined
    }
    this.isAutoFireActive = false
    this.autoFireStartTime = 0
    this.autoFireLastShot = 0
    
    // Reset slow motion
    if (this.slowMotionTimer) {
      this.slowMotionTimer.remove(false)
      this.slowMotionTimer = undefined
    }
    this.isSlowMotion = false
    this.restoreBallSpeeds()
    
    // Reset shield
    if (this.shieldTimer) {
      this.shieldTimer.remove(false)
      this.shieldTimer = undefined
    }
    if (this.shieldBubble) {
      this.shieldBubble.destroy()
      this.shieldBubble = undefined
    }
    this.isInvulnerable = false
    
    // Clear rock ammo
    this.rockAmmo = []
    this.updateAmmoDisplay()
    
    // Clear tank hit indicator timers
    this.tankHitIndicatorTimers.forEach((timer) => {
      timer.remove(false)
    })
    this.tankHitIndicatorTimers.clear()
    this.tankLastFlipTime.clear()
    this.jetHitIndicatorActive = false
    
    // Remove power-up indicators
    // Remove all power-up indicators
    this.powerUpIndicators.forEach((indicator) => {
      if (indicator.tween) indicator.tween.remove()
      indicator.text.destroy()
      indicator.progressBar.destroy()
      indicator.progressBarBg.destroy()
    })
    this.powerUpIndicators.clear()
  }
  
  private updateAmmoDisplay(): void {
    if (!this.throwButton) return
    
    const rockIcon = this.throwButton.getData('rockIcon') as Phaser.GameObjects.Image | undefined
    if (!rockIcon) return
    
    // Determine which rock type is next
    let nextRockType: 'normal' | 'red' | 'green' = 'normal'
    if (this.rockAmmo.length > 0 && this.rockAmmo[0].ammo > 0) {
      nextRockType = this.rockAmmo[0].type
    }
    
    // If auto-fire is active, show green tint
    if (this.isAutoFireActive) {
      rockIcon.setTint(0x00ff00)  // Green tint for auto-fire
    } else {
      // Update icon based on rock type
      if (nextRockType === 'normal') {
        rockIcon.clearTint()
      } else if (nextRockType === 'red') {
        rockIcon.setTint(0xff0000)  // Red tint
      } else if (nextRockType === 'green') {
        rockIcon.setTint(0x00ff00)  // Green tint
      }
    }
    
    // Update infinity text to show ammo count if not normal
    const infinityText = this.throwButton.getData('infinityText') as Phaser.GameObjects.Text | undefined
    if (infinityText) {
      if (nextRockType === 'normal' && !this.isAutoFireActive) {
        infinityText.setText('∞')
        infinityText.setVisible(true)
      } else {
        // Show ammo count
        const totalAmmo = this.rockAmmo.reduce((sum, entry) => sum + entry.ammo, 0)
        infinityText.setText(totalAmmo.toString())
        infinityText.setVisible(true)
      }
    }
    
    // Update timer bar for auto-fire
    let timerBar = this.throwButton.getData('timerBar') as Phaser.GameObjects.Graphics | undefined
    let timerBarBg = this.throwButton.getData('timerBarBg') as Phaser.GameObjects.Graphics | undefined
    
    if (this.isAutoFireActive) {
      // Create timer bar if it doesn't exist
      if (!timerBarBg) {
        timerBarBg = this.add.graphics()
        timerBarBg.setScrollFactor(0)
        timerBarBg.setDepth(15)
        this.throwButton.add(timerBarBg)
        this.throwButton.setData('timerBarBg', timerBarBg)
      }
      if (!timerBar) {
        timerBar = this.add.graphics()
        timerBar.setScrollFactor(0)
        timerBar.setDepth(16)
        this.throwButton.add(timerBar)
        this.throwButton.setData('timerBar', timerBar)
      }
      
      // Position timer bar below rock icon
      const rockIconY = rockIcon.y
      const rockIconHeight = rockIcon.displayHeight
      const barY = rockIconY + rockIconHeight / 2 + 5  // 5px below rock icon
      const barWidth = rockIcon.displayWidth * 0.8  // 80% of rock icon width
      const barHeight = 4
      const barX = rockIcon.x - barWidth / 2
      
      // Calculate remaining time
      const elapsed = this.time.now - this.autoFireStartTime
      const duration = 3000
      const remaining = Math.max(0, duration - elapsed)
      const progress = remaining / duration
      
      
      // Draw background
      timerBarBg.clear()
      timerBarBg.fillStyle(0x2a2a2a, 1)  // Dark background
      timerBarBg.fillRect(barX, barY, barWidth, barHeight)
      
      // Draw progress bar (green)
      timerBar.clear()
      timerBar.fillStyle(0x00ff00, 1)  // Green
      timerBar.fillRect(barX, barY, barWidth * progress, barHeight)
    } else {
      // Remove timer bar when auto-fire is not active
      if (timerBar) {
        timerBar.destroy()
        this.throwButton.setData('timerBar', undefined)
      }
      if (timerBarBg) {
        timerBarBg.destroy()
        this.throwButton.setData('timerBarBg', undefined)
      }
    }
  }

  private handleAutoFire(time: number): void {
    if (!this.isAutoFireActive || !this.autoFireTimer) {
      return
    }
    
    // Auto-fire shoots at 2x rate (half the normal fireRate)
    const autoFireRate = this.fireRate / 2
    const canFire = time > this.autoFireLastShot + autoFireRate
    
    if (canFire && !this.isThrowing && !this.isAiming && !this.isTaunting) {
      // Trigger a throw automatically
      this.autoFireLastShot = time
      this.releaseThrow()
    }
  }

  private startJetShake(): void {
    // Stop existing shake timer if any
    if (this.jetShakeTimer) {
      this.jetShakeTimer.remove(false)
    }
    
    if (!this.settings.screenShake) {
      return
    }
    
    // Continuously shake camera while jet is on screen
    const shakeInterval = 50  // Shake every 50ms
    const shakeIntensity = 0.003  // Light continuous shake
    
    this.jetShakeTimer = this.time.addEvent({
      delay: shakeInterval,
      callback: () => {
        if (this.jet && this.jet.active && this.bossPhase === 'jet') {
          const worldWidth = this.scale.width
          const offScreenDistance = 300
          const isJetOnScreen = this.jet.x > -offScreenDistance && this.jet.x < worldWidth + offScreenDistance
          
          if (isJetOnScreen) {
            this.cameras.main.shake(shakeInterval, shakeIntensity)
          } else {
            // Jet went off screen, stop shaking
            if (this.jetShakeTimer) {
              this.jetShakeTimer.remove(false)
              this.jetShakeTimer = undefined
            }
          }
        } else {
          // Jet destroyed or phase changed, stop shaking
          if (this.jetShakeTimer) {
            this.jetShakeTimer.remove(false)
            this.jetShakeTimer = undefined
          }
        }
      },
      loop: true,
    })
  }

  // Ball bounce is handled purely by Arcade Physics via setBounce and collisions.
  private spawnBall(
    x: number,
    y: number,
    size: BallSize,
    direction: number = Phaser.Math.RND.pick([-1, 1]),
    textureKey?: string,
  ): Phaser.Physics.Arcade.Image {
    const rule = BALL_RULES[size]
    let baseKey = textureKey ?? rule.textureKey
    
    // Optimization #2: If using a brand texture key, ensure we have the bubble
    // If bubble doesn't exist, generate it on-demand
    const bubbleKey = `${baseKey}-bubble`
    if (!this.textures.exists(bubbleKey) && baseKey.startsWith('ball-')) {
      // Generate bubble on-demand for this specific texture key
      const brandKey = this.getBrandKey(baseKey)
      if (this.textures.exists(brandKey)) {
        const src = this.textures.get(brandKey)
        if (src) {
          const img = src.getSourceImage() as HTMLImageElement | HTMLCanvasElement | null
          if (img) {
            const bubbleSize = Math.max(img.width, img.height) + 48
            const canvas = document.createElement('canvas')
            canvas.width = bubbleSize
            canvas.height = bubbleSize
            const ctx = canvas.getContext('2d')
            if (ctx) {
              const center = bubbleSize / 2
              const radius = bubbleSize / 2 - 3

              ctx.save()
              ctx.beginPath()
              ctx.arc(center, center, radius, 0, Math.PI * 2)
              ctx.clip()

              const baseGradient = ctx.createRadialGradient(center, center, radius * 0.1, center, center, radius)
              baseGradient.addColorStop(0, 'rgba(210, 235, 255, 0.2)')
              baseGradient.addColorStop(0.7, 'rgba(150, 195, 245, 0.08)')
              baseGradient.addColorStop(1, 'rgba(90, 135, 195, 0.2)')
              ctx.fillStyle = baseGradient
              ctx.fillRect(0, 0, bubbleSize, bubbleSize)

              // Scale brand image to fit bubble consistently - use 70% of bubble size
              const brandDisplaySize = bubbleSize * 0.7
              
              // No brand-specific multipliers - all brands fit the same way
              const adjustedDisplaySize = brandDisplaySize
              
              const brandAspectRatio = img.width / img.height
              let brandWidth = adjustedDisplaySize
              let brandHeight = adjustedDisplaySize
              
              // Preserve aspect ratio
              if (brandAspectRatio > 1) {
                // Wider than tall
                brandHeight = brandWidth / brandAspectRatio
              } else {
                // Taller than wide
                brandWidth = brandHeight * brandAspectRatio
              }
              
              // Ensure we don't exceed bubble bounds
              const maxSize = bubbleSize * 0.9  // Leave some padding
              if (brandWidth > maxSize) {
                brandWidth = maxSize
                brandHeight = brandWidth / brandAspectRatio
              }
              if (brandHeight > maxSize) {
                brandHeight = maxSize
                brandWidth = brandHeight * brandAspectRatio
              }
              
              // Draw brand image centered and scaled
              ctx.drawImage(img, center - brandWidth / 2, center - brandHeight / 2, brandWidth, brandHeight)

              const highlightGradient = ctx.createRadialGradient(
                center - radius * 0.35,
                center - radius * 0.45,
                radius * 0.05,
                center - radius * 0.35,
                center - radius * 0.45,
                radius * 0.6,
              )
              highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)')
              highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
              ctx.fillStyle = highlightGradient
              ctx.beginPath()
              ctx.ellipse(center - radius * 0.3, center - radius * 0.45, radius * 0.55, radius * 0.4, -0.35, 0, Math.PI * 2)
              ctx.fill()

              ctx.restore()

              const rimGradient = ctx.createLinearGradient(center, center - radius, center, center + radius)
              rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
              rimGradient.addColorStop(1, 'rgba(110, 170, 230, 0.4)')
              const rimWidth = Math.max(3, radius * 0.12)
              ctx.beginPath()
              ctx.arc(center, center, radius - rimWidth / 2, 0, Math.PI * 2)
              ctx.strokeStyle = rimGradient
              ctx.lineWidth = rimWidth
              ctx.stroke()

              ctx.beginPath()
              ctx.arc(center, center, radius - rimWidth - 3, 0, Math.PI * 2)
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)'
              ctx.lineWidth = 2
              ctx.stroke()

              // Use addCanvas - CSP allows blob: URLs
              this.textures.addCanvas(bubbleKey, canvas)
            }
          }
        }
      }
    }
    
    const finalKey = this.textures.exists(bubbleKey) ? bubbleKey : baseKey

    // FIX: Create ball at origin first, then move it to correct position after body is disabled
    // This prevents physics from moving it before we can disable the body
    const ball = this.physics.add.image(0, 0, finalKey)
    const targetSize = this.getBubbleDisplaySize(finalKey, rule.displayScale)
    ball.setDisplaySize(targetSize, targetSize)

    // Collider circle: slightly enlarged and centered using the physics body so the
    // green circle sits in the middle of the bubble.
    const body = ball.body as Phaser.Physics.Arcade.Body
    // FIX: Disable body IMMEDIATELY during setup to prevent physics from moving it
    if (body) {
      body.enable = false
      // Also disable gravity temporarily to prevent any movement
      body.setAllowGravity(false)
    }
    
    // FIX: NOW set the position after body is disabled
    ball.setPosition(x, y)
    
    const bodyW = body.width
    const bodyH = body.height
    const diameter = Math.max(bodyW, bodyH) * 1.04 // Reduced from 1.6 to 1.04 (35% smaller)
    const radius = diameter / 2
    const offsetX = (bodyW - diameter) / 2
    const offsetY = (bodyH - diameter) / 2
    body.setCircle(radius, offsetX, offsetY)
    this.balls.add(ball)
    
    // Set bounce to 1 - Phaser handles basic bounce, but we override velocity in checkBallBounces()
    // This ensures balls bounce, but we control the exact bounce velocity for each ball size
    ball.setBounce(1, 1)  // Enable automatic bounce - we'll override velocity to correct value
    ball.setCollideWorldBounds(true)

    // Remove speedMultiplier to ensure consistent bounces according to ball size
    const [minHorizontal, maxHorizontal] = rule.horizontalSpeedRange
    const horizontalMagnitude = Phaser.Math.Between(minHorizontal, maxHorizontal)
    const clampedDirection = direction >= 0 ? 1 : -1
    const horizontalSpeed = horizontalMagnitude * clampedDirection
    // Always start with the correct bounce velocity for this ball size
    // This ensures consistency whether spawned initially or from a split
    // The ground collision handler will ensure mini balls always use their correct bounce velocity (120)
    const verticalSpeed = -rule.bounceVelocity

    // FIX: Set position and velocity while body is disabled
    ball.setPosition(x, y)
    ball.setVelocity(horizontalSpeed, verticalSpeed)
    
    // FIX: Enable body on next tick to avoid immediate overlap correction
    // Also ensure velocity is preserved when body is enabled
    this.time.delayedCall(0, () => {
      if (body && ball.active) {
        // FIX: Re-enable gravity before enabling body (it was disabled during setup)
        body.setAllowGravity(true)
        
        // FIX: Apply slow motion BEFORE setting velocity if it's active
        let finalVelX = horizontalSpeed
        let finalVelY = verticalSpeed
        let finalGravity = 240
        
        if (this.isSlowMotion && !ball.getData('slowMotionApplied')) {
          // Store original values for restoration
          ball.setData('originalVelX', horizontalSpeed)
          ball.setData('originalVelY', verticalSpeed)
          ball.setData('originalGravity', 240)
          
          // Apply slow motion factor (0.3 = 30% speed) to both velocity and gravity
          const slowMotionFactor = 0.3
          finalVelX = horizontalSpeed * slowMotionFactor
          finalVelY = verticalSpeed * slowMotionFactor
          finalGravity = 240 * slowMotionFactor
          ball.setData('slowMotionApplied', true)
        }
        
        // FIX: Force position and velocity to be exactly what we want
        ball.setPosition(x, y)
        ball.setVelocity(finalVelX, finalVelY)
        body.setVelocity(finalVelX, finalVelY)  // Also set on body directly
        body.setGravityY(finalGravity)
        body.enable = true
        // Clear any touching/blocked flags for a clean start
        body.touching.none = true
        body.blocked.none = true
        // Update body position from game object to ensure sync
        body.updateFromGameObject()
        // Add rotation to ball so logos rotate with it (simulates fixed/attached to ball)
        // Set angular velocity AFTER body is enabled so it works properly
        // Random rotation direction and speed for variety
        const rotationSpeed = Phaser.Math.Between(50, 150) * (Phaser.Math.RND.pick([-1, 1]))
        body.setAngularVelocity(rotationSpeed)
      }
    })
    
    // Initialize velocity tracking for bounce detection
    ball.setData('prevVelX', horizontalSpeed)
    ball.setData('prevVelY', verticalSpeed)
    
    // Ensure the bounce velocity is stored immediately so ground collision can use it
    ball.setData('baseBounceVelocity', rule.bounceVelocity)
    // FIX: Mark that this ball hasn't bounced yet - first bounce will reset energy state
    ball.setData('hasBounced', false)

    ball.setData('size', size)
    ball.setData('textureKey', baseKey)
    ball.setData('spawnTime', this.time.now)  // Track when ball was created for slow motion check
    // FIX: Set lower gravity for balls to make them hang in air longer
    // CRITICAL: Don't override gravity if slow motion was already applied
    const baseGravity = 240  // 31% reduction from normal 350 for more hang time
    if (body && !ball.getData('slowMotionApplied')) {
      // Only set gravity if slow motion hasn't been applied yet
      // (slow motion system already set it to baseGravity * 0.3)
      body.setGravityY(baseGravity)
    }
    // Calculate and store max height for this ball size (h = v² / (2g) where g = 280)
    const maxHeight = (rule.bounceVelocity * rule.bounceVelocity) / (2 * baseGravity)
    ball.setData('maxHeight', maxHeight)
    // DEBUG: Mark spawn method (will be overridden if split)
    if (!ball.getData('spawnMethod')) {
      ball.setData('spawnMethod', 'level')
    }
    ball.setData('minHorizontalSpeed', minHorizontal)
    ball.setData('maxHorizontalSpeed', maxHorizontal)
    // baseBounceVelocity is already set above before setVelocity to ensure it's available immediately
    ball.setDepth(1)
    return ball
  }

  private spawnLevelWave(levelIndex: number): void {
    // Wrap in try-catch to prevent crashes on mobile
    try {
      // Don't spawn balls during boss level
      if (this.isBossLevel) {
        return
      }
      
      const wave = LEVEL_BALL_WAVES[levelIndex] ?? LEVEL_BALL_WAVES[LEVEL_BALL_WAVES.length - 1]
      const width = this.scale.width
    
    // Get brand assignments for this level
    const brandAssignments = LEVEL_BRAND_ASSIGNMENTS[levelIndex] ?? LEVEL_BRAND_ASSIGNMENTS[0]
    const levelBrands: Record<BallSize, string> = {
      large: brandAssignments[0],
      medium: brandAssignments[1],
      small: brandAssignments[2],
      mini: brandAssignments[3],
    }
    
    // Spawn balls closer to ground, at a height slightly above their max bounce height
    // This ensures they start their bounce cycle naturally
    const groundY = this.groundYPosition

    wave.forEach((entry, idx) => {
      const rule = BALL_RULES[entry.size]
      // Use the brand assigned to this size for this level
      const textureKey = levelBrands[entry.size]
      // Calculate max bounce height for this ball size (h = v² / (2g) where g = 350)
      const maxBounceHeight = (rule.bounceVelocity * rule.bounceVelocity) / (2 * 350)
      // Calculate ball radius for minimum height check
      const targetSize = this.getBubbleDisplaySize(textureKey, rule.displayScale)
      const ballRadius = targetSize / 2
      
      // Spawn at max bounce height + a small buffer (20px) so ball starts falling
      let spawnY = groundY - maxBounceHeight - 20 - (idx * 30)
      
      // FIX: Ensure minimum height above ground to prevent low bounces
      // Same logic as splitBall - ensure balls spawn at least 150px above ground
      const minSpawnHeight = 150  // Minimum height above ground
      const minSpawnY = groundY - minSpawnHeight - ballRadius
      // Since Y increases downward, we want the LOWER Y value (higher on screen)
      spawnY = Math.min(spawnY, minSpawnY - 20)  // Ensure we're at least 20px above minimum
      
      const x = Phaser.Math.Between(Math.round(width * 0.25), Math.round(width * 0.75))
      this.spawnBall(x, spawnY, entry.size, Phaser.Math.RND.pick([-1, 1]), textureKey)
    })
    } catch (error) {
      // Error in spawnLevelWave
      // Continue - don't crash the game
    }
  }

  private updateHud(): void {
    // Safety check - make sure scoreText exists
    if (!this.scoreText) {
      return
    }
    // Update score label based on boss phase
    let scoreLabel = 'Boycotted'
    const triangle = '\u25BC\ufe0f'  // Red triangle symbol (same as lives)
    if (this.isBossLevel) {
      if (this.bossPhase === 'jet') {
        scoreLabel = `${triangle} Jet`
      } else if (this.bossPhase.startsWith('tank')) {
        scoreLabel = `${triangle} Tanks`
      }
    }
    // Hide "Boycotted:" text during boss level or victory phase
    if (this.isBossLevel && (this.bossPhase === 'jet' || this.bossPhase.startsWith('tank') || this.bossPhase === 'victory')) {
      this.scoreText.setVisible(false)
    } else {
      this.scoreText.setVisible(true)
    }
    // Make triangle red in boss level score labels (but hide during victory)
    if (this.isBossLevel && (this.bossPhase === 'jet' || this.bossPhase.startsWith('tank'))) {
      // Create separate red triangle text object
      const worldWidth = this.scale.width
      const padding = 12  // Small padding for top right corner
      const scoreY = padding
      
      // FIX: Only destroy triangle if it doesn't exist or is invalid, don't recreate unnecessarily
      if (this.scoreTriangleText && (!this.scoreTriangleText.scene || !this.scoreTriangleText.active)) {
        this.scoreTriangleText = undefined
      }
      
      // Text stays in original position (top right corner)
      const textX = worldWidth - padding
      
      // Position text at original position (top right corner) first
      const restOfText = scoreLabel.replace(triangle, '').trim()  // Remove triangle from label
      this.scoreText.setText(restOfText)
      this.scoreText.setX(textX)  // Original position
      this.scoreText.setOrigin(1, 0)  // Right origin for top right corner
      this.scoreText.setY(scoreY)
      this.scoreText.setStyle({ color: '#000000' })  // Black color for boss level text
      this.scoreText.setVisible(true)  // Show text in boss level
      this.scoreText.setDepth(50)  // Set depth for score text (lower than triangle)
      
      // FIX: Position triangle immediately to the left of the text
      // Calculate triangle position based on text width
      // Calculate triangle position immediately and also in delayedCall to ensure it's visible during gameplay
      // First, calculate position immediately using estimated text width
      const estimatedTextWidth = this.scoreText.width || (this.bossPhase === 'jet' ? 40 : 60)
      const triangleSpacing = 50  // Increased spacing to shift triangle further left (from 35 to 50)
      let triangleX = textX - estimatedTextWidth - triangleSpacing
      
      // Update/create triangle immediately so it's visible during gameplay
      const existingTri = this.scoreTriangleText as Phaser.GameObjects.Text | undefined
      const hasValidTriangle = !!(existingTri && existingTri.scene && existingTri.active)
      
      if (!hasValidTriangle && this.scoreTriangleText) {
        // Only destroy if it exists but is invalid
        try {
          if (this.scoreTriangleText.scene) {
            this.scoreTriangleText.destroy()
          }
        } catch (e) {
          // Ignore errors
        }
        this.scoreTriangleText = undefined
      }
      
      if (!hasValidTriangle) {
        this.scoreTriangleText = this.add.text(triangleX, scoreY, triangle, {
          fontSize: '90px',
          fontFamily: 'MontserratBold',
          color: '#ff3b3b',  // Red color
          fontStyle: 'underline',
        })
        this.scoreTriangleText.setOrigin(1, 0)  // Right origin so it attaches to text
        this.scoreTriangleText.setScrollFactor(0)
        this.scoreTriangleText.setDepth(500)  // Very high depth (higher than hit indicators at 200) to ensure it's above everything
        this.scoreTriangleText.setScale(2.5)
        this.scoreTriangleText.setVisible(true)  // Ensure triangle is visible
        this.scoreTriangleText.setAlpha(1)  // Ensure full opacity
        this.scoreTriangleText.setActive(true)
        this.scoreTriangleText.setData('isScoreTriangle', true)  // Mark as score triangle for protection
        // Don't use bringToTop - fixed depth ensures it stays above everything
      } else {
        // Update position of existing triangle - ensure it's visible and on top
        const tri = existingTri as Phaser.GameObjects.Text
        tri.setPosition(triangleX, scoreY)
        tri.setVisible(true)
        tri.setAlpha(1)
        tri.setDepth(500)  // Very high depth (higher than hit indicators at 200) to ensure it's above everything
        tri.setActive(true)
        tri.setData('isScoreTriangle', true)  // Mark as score triangle for protection
        // Don't use bringToTop - fixed depth ensures it stays above everything
        tri.setScrollFactor(0)
      }
      
      // Also update in delayedCall to refine position based on actual text width
      // Use a small delay to ensure text has rendered and triangle is stable
      this.time.delayedCall(10, () => {
        if (!this.scoreTriangleText || !this.scoreTriangleText.scene) {
          return
        }
        
        const textWidth = this.scoreText.width
        const triangleX = textX - textWidth - triangleSpacing
        
        // Refine position based on actual text width (triangle already created above)
        if (this.scoreTriangleText && this.scoreTriangleText.scene && this.scoreTriangleText.active) {
          this.scoreTriangleText.setPosition(triangleX, scoreY)
          this.scoreTriangleText.setVisible(true)
          this.scoreTriangleText.setAlpha(1)
          this.scoreTriangleText.setDepth(500)
          this.scoreTriangleText.setActive(true)
          this.scoreTriangleText.setData('isScoreTriangle', true)  // Mark as score triangle for protection
          // Don't use bringToTop - fixed depth ensures it stays above everything
        } else {
          // Triangle was destroyed - recreate it
          if (this.isBossLevel && (this.bossPhase === 'jet' || this.bossPhase.startsWith('tank'))) {
            this.scoreTriangleText = this.add.text(triangleX, scoreY, triangle, {
              fontSize: '90px',
              fontFamily: 'MontserratBold',
              color: '#ff3b3b',
              fontStyle: 'underline',
            })
            this.scoreTriangleText.setOrigin(1, 0)
            this.scoreTriangleText.setScrollFactor(0)
            this.scoreTriangleText.setDepth(500)
            this.scoreTriangleText.setScale(2.5)
            this.scoreTriangleText.setVisible(true)
            this.scoreTriangleText.setAlpha(1)
            this.scoreTriangleText.setActive(true)
            this.scoreTriangleText.setData('isScoreTriangle', true)  // Mark as score triangle for protection
            // Don't use bringToTop - fixed depth ensures it stays above everything
          }
        }
      })
    } else if (this.isBossLevel && this.bossPhase === 'victory') {
      // Victory phase - hide score triangle and score text
      if (this.scoreTriangleText) {
        this.scoreTriangleText.setVisible(false)
      }
      this.scoreText.setVisible(false)
    } else {
      // Regular level - hide triangle text and show normal score
      if (this.scoreTriangleText) {
        this.scoreTriangleText.destroy()
        this.scoreTriangleText = undefined
      }
      this.scoreText.setText(`${scoreLabel}: ${this.score}`)
      const worldWidth = this.scale.width
      const padding = 12  // Reduced padding to match boss level positioning
      this.scoreText.setX(worldWidth - padding)  // Reset to original position
      this.scoreText.setStyle({ color: '#cbe4ff' })  // Original blue color
    }
    this.scoreText.setFontSize('90px')
    this.scoreText.setScale(2.5)
    this.livesText.setText(triangle.repeat(Math.max(0, this.lives)))
    this.livesText.setColor('#ff3b3b')
    this.livesText.setFontSize('100px')
    this.livesText.setScale(3)
  }

  private generateProceduralTextures(): void {
    this.createGroundTexture()
  }

  // TEMPORARILY DISABLED: Ball texture preparation
  // @ts-expect-error - Temporarily disabled
  private prepareBallTextures(): void {
    if (this.registry.get('ball-textures-prepared')) {
      return
    }

    // TEMPORARILY DISABLED: Ball texture trimming causes blob URL issues
    // const keys = [
    //   'ball-large',
    //   'ball-large-a',
    //   'ball-large-b',
    //   'ball-large-c',
    //   'ball-medium',
    //   'ball-small',
    //   'ball-mini',
    // ]
    // keys.forEach((key) => this.trimBallTexture(key))
    this.registry.set('ball-textures-prepared', true)
  }

  // TEMPORARILY DISABLED: Ball texture trimming
  // @ts-expect-error - Temporarily disabled
  private trimBallTexture(_key: string): void {
    // Function disabled - causes blob URL CSP issues
    return
  }

  private loadBitteeAssets(): void {
    const { stand, crouch, runRight, runLeft, throwFrames, taunt, taunt2, jumpSquat, jumpAir } = BITTEE_SPRITES

    this.load.image(stand.key, stand.path)
    this.load.image(crouch.key, crouch.path)
    runRight.forEach(({ key, path }) => this.load.image(key, path))
    runLeft.forEach(({ key, path }) => this.load.image(key, path))
    throwFrames.forEach(({ key, path }) => this.load.image(key, path))
    this.load.image(taunt.key, taunt.path)
    this.load.image(taunt2.key, taunt2.path)
    this.load.image(jumpSquat.right.key, jumpSquat.right.path)
    this.load.image(jumpSquat.left.key, jumpSquat.left.path)
    jumpAir.right.forEach(({ key, path }) => this.load.image(key, path))
    jumpAir.left.forEach(({ key, path }) => this.load.image(key, path))
    // Load death sequence textures
    this.load.image('bittee-1', getAssetPath('/assets/bittee-1.png'))
    this.load.image('bittee-2', getAssetPath('/assets/bittee-2.png'))
    this.load.image('bittee-3', getAssetPath('/assets/bittee-3.png'))
    this.load.image('bittee-4', getAssetPath('/assets/bittee-4.png'))
    this.load.image(ROCK_SPRITE.key, ROCK_SPRITE.path)
    this.load.image(ROCK_HUD_SPRITE.key, ROCK_HUD_SPRITE.path)
    
    // Load power-up images
    this.load.image('powerup-life', getAssetPath('/assets/bittee/life.png'))
    this.load.image('powerup-shield', getAssetPath('/assets/bittee/shield.png'))
    this.load.image('powerup-time', getAssetPath('/assets/bittee/time.png'))
    this.load.image('powerup-slingshot-red', getAssetPath('/assets/bittee/slingshot-red.png'))
  }

  private loadLevelAssets(): void {
    LEVEL_DEFINITIONS.forEach((level) => {
      try {
        this.load.image(level.key, level.textureUrl)
      } catch (error) {
        // Log error but don't crash - use fallback or skip
        // console.warn(`Failed to load level asset: ${level.key}`, error)
      }
    })
  }

  private loadBossAssets(): void {
    this.load.image('jet', getAssetPath('/assets/jet.png'))
    this.load.image('tank', getAssetPath('/assets/tank.png'))
    this.load.image('info-icon', getAssetPath('/assets/info.png'))
    this.load.image('contrail1', getAssetPath('/assets/contrail1.png'))
    this.load.image('contrail2', getAssetPath('/assets/contrail2.png'))
  }

  private loadAudioAssets(): void {
    // Background music - two tracks that loop sequentially
    // Audio files hosted locally (for GitHub Pages deployment)
    // Using getAudioPath() which returns full URLs for GitHub Pages
    this.load.audio('bittee-mawtini1', getAudioPath('/assets/audio/bittee-mawtini1.webm'))
    this.load.audio('bittee-mawtini2', getAudioPath('/assets/audio/bittee-mawtini2.webm'))
    this.load.audio('bittee-settings-music', getAudioPath('/assets/audio/bittee-settings-music.webm'))
    this.load.audio('palestine-8bit', getAudioPath('/assets/audio/palestine-8bit.webm'))
    this.load.audio('bittee-finallevel', getAudioPath('/assets/audio/bittee-finallevel.webm'))
    
    // Sound effects
    this.load.audio('bittee-run-sound', getAudioPath('/assets/audio/bittee-run-sound.webm'))
    this.load.audio('throw-sound1', getAudioPath('/assets/audio/throw-sound1.webm'))
    this.load.audio('throw-sound2', getAudioPath('/assets/audio/throw-sound2.webm'))
    this.load.audio('throw-sound3', getAudioPath('/assets/audio/throw-sound3.webm'))
    this.load.audio('throw-sound4', getAudioPath('/assets/audio/throw-sound4.webm'))
    this.load.audio('time-sound1', getAudioPath('/assets/audio/time-sound1.webm'))
    this.load.audio('time-sound2', getAudioPath('/assets/audio/time-sound2.webm'))
    this.load.audio('time-sound3', getAudioPath('/assets/audio/time-sound3.webm'))
    this.load.audio('shield-sound', getAudioPath('/assets/audio/shield-sound.webm'))
    this.load.audio('ball-bounce', getAudioPath('/assets/audio/ball-bounce.webm'))
    this.load.audio('life-down', getAudioPath('/assets/audio/life-down.webm'))
    this.load.audio('life-up', getAudioPath('/assets/audio/life-up.webm'))
    this.load.audio('level-complete', getAudioPath('/assets/audio/level-complete.webm'))
    this.load.audio('configure-sound', getAudioPath('/assets/audio/configure-sound.webm'))
    this.load.audio('settings-sound', getAudioPath('/assets/audio/settings-sound.webm'))
    this.load.audio('heartbeat-slow', getAudioPath('/assets/audio/heartbeat-slow.webm'))
    this.load.audio('heartbeat-medium', getAudioPath('/assets/audio/heartbeat-medium.webm'))
    this.load.audio('heartbeat-fast', getAudioPath('/assets/audio/heartbeat-fast.webm'))
    this.load.audio('heartbeat-die', getAudioPath('/assets/audio/heartbeat-die.webm'))
    this.load.audio('jet1', getAudioPath('/assets/audio/jet1.webm'))
    this.load.audio('jet2', getAudioPath('/assets/audio/jet2.webm'))
    this.load.audio('opp-hit', getAudioPath('/assets/audio/opp-hit.webm'))
    this.load.audio('opp-die', getAudioPath('/assets/audio/opp-die.webm'))
  }

  private loadBallAssets(): void {
    // Optimization #2: Load each brand PNG only once (12 images instead of 48)
    const brands = [
      { key: 'brand-amazon', path: getAssetPath('/assets/amazon.png') },
      { key: 'brand-cocacola', path: getAssetPath('/assets/cocacola.png') },
      { key: 'brand-disneyplus', path: getAssetPath('/assets/disneyplus.png') },
      { key: 'brand-microsoft', path: getAssetPath('/assets/microsoft.png') },
      { key: 'brand-chevron', path: getAssetPath('/assets/chevron.png') },
      { key: 'brand-intel', path: getAssetPath('/assets/intel.png') },
      { key: 'brand-xbox', path: getAssetPath('/assets/xbox.png') },
      { key: 'brand-google', path: getAssetPath('/assets/google.png') },
      { key: 'brand-dell', path: getAssetPath('/assets/dell.png') },
      { key: 'brand-hp', path: getAssetPath('/assets/hp.png') },
      { key: 'brand-mcds', path: getAssetPath('/assets/mcds.png') },
      { key: 'brand-pizzahut', path: getAssetPath('/assets/pizzahut.png') },
      { key: 'brand-starbucks', path: getAssetPath('/assets/starbucks.png') },
      { key: 'brand-puma', path: getAssetPath('/assets/puma.png') },
      { key: 'brand-zara', path: getAssetPath('/assets/zara.png') },
      { key: 'brand-bk', path: getAssetPath('/assets/bk.png') },
      { key: 'brand-nestle', path: getAssetPath('/assets/nestle.png') },
      { key: 'brand-airbnb', path: getAssetPath('/assets/airbnb.png') },
    ]
    
    brands.forEach(({ key, path }) => {
      this.load.image(key, path)
    })
    
    // TEMPORARILY DISABLED: Process brand textures to remove white backgrounds (especially amazon and xbox)
    // This was causing blob URL CSP issues on Neocities
    // TODO: Re-enable with a solution that doesn't create blob URLs
    // this.load.once('complete', () => {
    //   brands.forEach(({ key }) => {
    //     this.trimBrandTexture(key)
    //   })
    // })
  }
  

  // TEMPORARILY DISABLED: Brand texture trimming
  // @ts-expect-error - Temporarily disabled
  private trimBrandTexture(_key: string): void {
    // Function disabled - causes blob URL CSP issues
    return
  }

  // Helper to get base brand key from full texture key (e.g., "ball-large-amazon" -> "brand-amazon")
  private getBrandKey(textureKey: string): string {
    // Extract brand name from texture key (format: "ball-{size}-{brand}")
    const parts = textureKey.split('-')
    if (parts.length >= 3 && parts[0] === 'ball') {
      const brandName = parts.slice(2).join('-')  // Handle multi-word brands like "disneyplus"
      return `brand-${brandName}`
    }
    return textureKey  // Fallback for non-brand textures
  }

  // TEMPORARILY DISABLED: Bittee texture normalization
  // @ts-expect-error - Temporarily disabled
  private normalizeBitteeTextures(): void {
    // Function disabled - causes blob URL CSP issues
    return
  }

  // Optimization #1: Generate bubbles only for brands used in a specific level
  // @ts-expect-error - Temporarily disabled
  private ensureBubblesForLevel(_levelIndex: number): void {
    // Function disabled - causes blob URL CSP issues
    return
  }

  private createGroundTexture(): void {
    const graphics = this.add.graphics()
    graphics.setVisible(false)
    graphics.fillStyle(0x112a3b, 1)
    graphics.fillRect(0, 0, 16, 16)
    graphics.generateTexture('ground', 16, 16)
    graphics.destroy()
  }

  /**
   * Safely syncs player body position to sprite position.
   * CRITICAL: Never use updateFromGameObject() when body has an offset!
   * updateFromGameObject() doesn't work correctly with offsets and will position the body incorrectly.
   */
  private syncPlayerBodyPosition(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }
    
    // Sync body position to sprite
    body.x = this.player.x
    body.y = this.player.y
  }

  /**
   * NEW SIMPLIFIED COLLISION SETUP - NO OFFSETS
   * Body position IS the collision position - eliminates Phaser's offset bug
   * Visual offsets are applied to sprite only, not physics body
   */
  private setupPlayerCollider(_scaledFootOffset: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!playerBody) {
      return
    }

    // Use current display dimensions (accounts for crouch scaling)
    const currentWidth = this.player.displayWidth
    const currentHeight = this.player.displayHeight

    // Collision box dimensions (same as before for gameplay feel)
    const WIDENED_WIDTH_MULTIPLIER = 12
    const baseBodyWidth = currentWidth * 0.45 - 25
    const bodyWidth = baseBodyWidth * WIDENED_WIDTH_MULTIPLIER
    const HEIGHT_MULTIPLIER = 4.5
    const bodyHeight = (currentHeight - 15) * HEIGHT_MULTIPLIER
    
    // Set body size and offset
    playerBody.setSize(bodyWidth, bodyHeight)
    playerBody.setOffset(0, 0)
    
    // Position body at ground level (only if not jumping)
    if (!this.isJumping) {
      const bodyBottomY = this.groundYPosition
      playerBody.y = bodyBottomY - bodyHeight / 2
      this.player.x = playerBody.x
      this.player.y = bodyBottomY
    } else {
      // During jumps: just sync sprite to body
      this.player.x = playerBody.x
    }
  }
  

  private updateBackgroundScale(): void {
    if (!this.backgroundLayer) {
      return
    }

    const source = this.backgroundLayer.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement | null
    if (!source) {
      return
    }

    const worldWidth = this.scale.width
    const targetHeight = this.gameplayHeight > 0 ? this.gameplayHeight : this.scale.height

    const scale = Math.max(worldWidth / source.width, targetHeight / source.height)
    this.backgroundLayer.setScale(scale)
    this.backgroundLayer.setPosition(worldWidth / 2, targetHeight / 2)
  }

  private createBitteeAnimations(): void {
    if (!this.anims.exists('bittee-idle')) {
      this.anims.create({
        key: 'bittee-idle',
        frames: [{ key: BITTEE_SPRITES.stand.key }],
        frameRate: 1,
        repeat: -1,
      })
    }

    if (!this.anims.exists('bittee-run-right')) {
      this.anims.create({
        key: 'bittee-run-right',
        frames: BITTEE_SPRITES.runRight.map(({ key }) => ({ key })),
        frameRate: 15,
        repeat: -1,
      })
    }

    if (!this.anims.exists('bittee-run-left')) {
      this.anims.create({
        key: 'bittee-run-left',
        frames: BITTEE_SPRITES.runLeft.map(({ key }) => ({ key })),
        frameRate: 15,
        repeat: -1,
      })
    }

    if (!this.anims.exists('bittee-crouch')) {
      this.anims.create({ key: 'bittee-crouch', frames: [{ key: BITTEE_SPRITES.crouch.key }], frameRate: 1, repeat: -1 })
    }

    if (!this.anims.exists('bittee-throw')) {
      this.anims.create({
        key: 'bittee-throw',
        frames: BITTEE_SPRITES.throwFrames.map(({ key }) => ({ key })),
        frameRate: 16,
        repeat: 0,
      })
    }

    if (!this.anims.exists('bittee-taunt')) {
      this.anims.create({
        key: 'bittee-taunt',
        frames: [{ key: BITTEE_SPRITES.taunt.key }],
        frameRate: 1,
        repeat: -1,
      })
    }
    
    if (!this.anims.exists('bittee-taunt2')) {
      this.anims.create({
        key: 'bittee-taunt2',
        frames: [{ key: BITTEE_SPRITES.taunt2.key }],
        frameRate: 1,
        repeat: -1,
      })
    }

    if (!this.anims.exists('bittee-jump-squat-right')) {
      this.anims.create({
        key: 'bittee-jump-squat-right',
        frames: [{ key: BITTEE_SPRITES.jumpSquat.right.key }],
        frameRate: 1,
        repeat: 0,
      })
    }

    if (!this.anims.exists('bittee-jump-squat-left')) {
      this.anims.create({
        key: 'bittee-jump-squat-left',
        frames: [{ key: BITTEE_SPRITES.jumpSquat.left.key }],
        frameRate: 1,
        repeat: 0,
      })
    }

    if (!this.anims.exists('bittee-jump-air-right')) {
      this.anims.create({
        key: 'bittee-jump-air-right',
        frames: BITTEE_SPRITES.jumpAir.right.map(({ key }) => ({ key })),
        frameRate: 10,
        repeat: -1,
      })
    }

    if (!this.anims.exists('bittee-jump-air-left')) {
      this.anims.create({
        key: 'bittee-jump-air-left',
        frames: BITTEE_SPRITES.jumpAir.left.map(({ key }) => ({ key })),
        frameRate: 10,
        repeat: -1,
      })
    }
  }

  private onThrowAnimationComplete(): void {
    this.isThrowing = false
    // Set transitioning flag to prevent vibration after throw
    this.isTransitioning = true
    this.transitionFrameCount = 3
    this.setIdlePose(true)
  }

  private cancelTaunt(playIdle = true): void {
    if (!this.isTaunting) {
      return
    }

    this.isTaunting = false
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (body) {
      body.setAcceleration(0, 0)
      body.setVelocity(0, 0)
      if (this.tauntGravityDisabled) {
        body.setAllowGravity(true)
        this.tauntGravityDisabled = false
      }
    }
    this.player.setScale(this.basePlayerScale, this.basePlayerScale)
    this.setupPlayerCollider(0)
    this.player.setY(this.groundYPosition + PLAYER_FOOT_Y_OFFSET)

    if (playIdle) {
      this.setIdlePose(true)
    }
  }

  private handleTaunt(): void {
    if (!this.tauntKey || this.isThrowing) {
      return
    }

    // Allow toggling taunt on/off
    if (Phaser.Input.Keyboard.JustDown(this.tauntKey)) {
      this.tryTaunt()
    }
  }

  private triggerThrowAnimation(): void {
    this.isThrowing = true
    this.player.setFlipX(false)
    // Play throw animation starting from throw2 (skip throw1 since we already showed it)
    // The animation includes both throw1 and throw2, so we start from frame 1 (throw2)
    const throwAnim = this.anims.get('bittee-throw')
    if (throwAnim) {
      this.player.anims.play('bittee-throw')
      // Start from frame 1 (throw2) since we already showed throw1 during aiming
      this.player.anims.setCurrentFrame(throwAnim.frames[1])
    } else {
      // Fallback: just play the animation
      this.player.anims.play('bittee-throw')
    }
    // If crouching, maintain feet position when throwing
    if (this.isCrouching) {
      this.player.setY(this.targetFootY)
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body) {
        body.setVelocityY(0)
        this.syncPlayerBodyPosition()
      }
    }
  }

  private closeInstructionsPanel(): void {
    if (this.instructionsPanel) {
      this.instructionsPanel.setVisible(false)
      this.instructionsPanel.setActive(false)
    }
    if (this.instructionsOverlay) {
      this.instructionsOverlay.setVisible(false)
      this.instructionsOverlay.disableInteractive()
    }
    // Remove keyboard handlers when closing
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.removeAllListeners('keydown-ENTER')
      keyboard.removeAllListeners('keydown-SPACE')
      // Re-add settings panel handler if settings panel is still open
      if (this.settingsPanel?.visible) {
        const closeSettingsHandler = () => {
          if (this.settingsPanel?.visible) {
            // Check if any nested modal is open first
            const hasNestedModal = this.hasNestedModalOpen()
            if (hasNestedModal) {
              // Close the nested modal first
              this.closeNestedModal()
            } else {
              // If no nested modal, close settings
              this.closeSettingsPanel()
            }
          }
        }
        keyboard.on('keydown-ENTER', closeSettingsHandler)
        keyboard.on('keydown-SPACE', closeSettingsHandler)
      } else {
        // If settings panel is NOT visible, we should still return to settings (not exit to game)
        // If we're already paused for settings, just make the panel visible
        if (this.isPausedForSettings && this.settingsPanel) {
          this.settingsPanel.setVisible(true)
          this.settingsPanel.setActive(true)
          this.refreshSettingsPanel()
          
          // Restore settings panel handlers
          const closeSettingsHandler = () => {
            if (this.settingsPanel?.visible) {
              const hasNestedModal = this.hasNestedModalOpen()
              if (hasNestedModal) {
                this.closeNestedModal()
              } else {
                this.closeSettingsPanel()
              }
            }
          }
          keyboard.on('keydown-ENTER', closeSettingsHandler)
          keyboard.on('keydown-SPACE', closeSettingsHandler)
        } else {
          // Not paused - open settings normally
          // Ensure game is paused before opening settings
          if (!this.isPausedForSettings) {
            this.isPausedForSettings = true
            this.physics.world.pause()
            this.tweens.pauseAll()
            this.previousTimeScale = this.time.timeScale
            this.time.timeScale = 0
          }
          this.openSettingsPanel()
        }
      }
    }
  }

  private openInstructionsPanel(): void {
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height

    if (!this.instructionsOverlay) {
      this.instructionsOverlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x000000, 0.65)
      this.instructionsOverlay.setDepth(20)
      this.instructionsOverlay.setInteractive()
      const closeInstructions = () => {
        this.closeInstructionsPanel()
      }
      this.instructionsOverlay.on('pointerdown', closeInstructions)
      
      // Add keyboard handler to close on Enter/Space
      const keyboard = this.input.keyboard
      if (keyboard) {
        // Remove any existing handlers first to prevent conflicts
        keyboard.removeAllListeners('keydown-ENTER')
        keyboard.removeAllListeners('keydown-SPACE')
        keyboard.on('keydown-ENTER', closeInstructions)
        keyboard.on('keydown-SPACE', closeInstructions)
      }
    }

    if (!this.instructionsPanel) {
      const panelWidth = Math.min(worldWidth * 0.88, 572)  // 10% larger
      const panelHeight = Math.min(worldHeight * 0.825, 704)  // 10% larger
      const panel = this.add.container(worldWidth / 2, worldHeight / 2)
      panel.setDepth(21)

      const background = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a2a2a, 0.96)  // Dark gray
      background.setStrokeStyle(2, 0xb0b0b0)  // Light gray border

      const title = this.add.text(0, -panelHeight / 2 + 40, 'Field Notes', {
        fontSize: '48px',  // Larger and nicer
        fontFamily: 'MontserratBold',
        color: '#d7ddcc',  // Match theme color
      }).setOrigin(0.5, 0)

      // FIX: Switch order - About Bittee first, then Controls
      const aboutTitle = this.add.text(-panelWidth / 2 + 32, -panelHeight / 2 + 140, 'About Bittee', {
        fontSize: '32px',  // Larger (was 28px)
        fontFamily: 'MontserratBold',
        color: '#d7ddcc',  // Match theme color
      })

      // FIX: New About Bittee text - first sentence same color as FREE FALASTEEN
      const aboutBodyFirst = this.add.text(-panelWidth / 2 + 32, aboutTitle.y + 40,  // Added more space (from 32 to 40)
        'Bittee boycotts and fights for justice and liberation.',
        {
          fontSize: '28px',  // Larger (was 24px)
          fontFamily: 'Montserrat',
          color: '#c3d4a5',  // Same color as FREE FALASTEEN
          wordWrap: { width: panelWidth - 64 },
          lineSpacing: 6,  // Add spacing between lines
        },
      )
      
      const aboutBodySecond = this.add.text(-panelWidth / 2 + 32, aboutBodyFirst.y + aboutBodyFirst.height + 6,
        'Learn from Bittee.',
        {
          fontSize: '30px',  // Slightly larger than first sentence (was 28px)
          fontFamily: 'Montserrat',
          color: '#8b2a00',  // Orange-ish red same as info modal bottom sentence
          wordWrap: { width: panelWidth - 64 },
          lineSpacing: 6,  // Add spacing between lines
        },
      )
      
      // COMMENTED OUT: Original About Bittee text (saved for later)
      // 'Bittee stands in solidarity with the Palestinian call for freedom and dignity. Inspired by Handala and the spirit of BDS, our camp uses joyful resistance to celebrate steadfastness, refuse erasure, and imagine a liberated future.',

      // Create Controls subtitle and text separately - larger and nicer
      const controlsTitle = this.add.text(-panelWidth / 2 + 32, aboutBodySecond.y + aboutBodySecond.height + 40, 'Controls:', {
        fontSize: '28px',  // Larger
        fontFamily: 'MontserratBold',
        color: '#d7ddcc',  // Match theme color
      })
      
      // FIX: Change 'p's to 'b's: "Up" → "Ub", "Jump" → "Jumb", "Space" → "Sbace", and "T Key" → "'T' Key"
      const controls = this.add.text(-panelWidth / 2 + 32, controlsTitle.y + 40,  // Added more space (from 32 to 40)
        '- Left/Right Arrows: Move\n- Ub Arrow: Jumb\n- Sbace: Throw\n- \'T\' Key: Taunt\n\nOn touch devices, use the on-screen buttons.',
        {
          fontSize: '24px',  // Larger
          fontFamily: 'Montserrat',
          color: '#e0d5b6',  // Match theme parchment color
          wordWrap: { width: panelWidth - 64 },
          lineSpacing: 6,  // Add spacing between lines
        },
      )

      const closeButtonY = panelHeight / 2 - 32  // Shift down a tiny bit (from -36 to -32)
      const closeButtonPadding = { left: 22, right: 22, top: 8, bottom: 8 }
      const tempCloseText = this.add.text(0, 0, 'Close', { fontSize: '22px', fontFamily: 'MontserratBold' })
      const closeButtonWidth = tempCloseText.width + closeButtonPadding.left + closeButtonPadding.right
      const closeButtonHeight = tempCloseText.height + closeButtonPadding.top + closeButtonPadding.bottom
      tempCloseText.destroy()
      const closeButtonRadius = 6
      
      // Create shadow for close button
      const closeButtonShadow = this.add.graphics()
      closeButtonShadow.fillStyle(0x000000, 0.2)  // Subtle shadow
      const closeShadowYOffset = 6
      closeButtonShadow.fillRoundedRect(-closeButtonWidth / 2, -closeButtonHeight / 2 - closeShadowYOffset, closeButtonWidth, closeButtonHeight, closeButtonRadius)
      closeButtonShadow.setPosition(0, closeButtonY)
      closeButtonShadow.setDepth(200)  // Behind button
      
      const closeButton = this.add.text(0, closeButtonY, 'Close', {
        fontSize: '22px',
        fontFamily: 'MontserratBold',
        color: '#f4faff',
        backgroundColor: '#2f3b32',  // Same as configure button background
        padding: closeButtonPadding,
      }).setOrigin(0.5)
      closeButton.setInteractive({ useHandCursor: true })
      const closeHandler = () => {
        this.closeInstructionsPanel()
      }
      closeButton.on('pointerdown', closeHandler)
      
      // Add keyboard handler to close on Enter/Space
      const keyboard = this.input.keyboard
      if (keyboard) {
        keyboard.on('keydown-ENTER', closeHandler)
        keyboard.on('keydown-SPACE', closeHandler)
      }

      panel.add([background, title, aboutTitle, aboutBodyFirst, aboutBodySecond, controlsTitle, controls, closeButtonShadow, closeButton])
      this.instructionsPanel = panel
    }

    this.instructionsOverlay?.setVisible(true).setActive(true)
    this.instructionsOverlay?.setInteractive()
    this.instructionsPanel?.setVisible(true).setActive(true)
  }

  private openCreditsPanel(): void {
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height

    if (!this.creditsOverlay) {
      this.creditsOverlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x000000, 0.65)
      this.creditsOverlay.setDepth(22)
      this.creditsOverlay.setInteractive()
      const closeCreditsFromOverlay = () => {
        this.closeCreditsPanel()
        const keyboard = this.input.keyboard
        if (keyboard) {
          keyboard.removeAllListeners('keydown-ENTER')
          keyboard.removeAllListeners('keydown-SPACE')
        }
      }
      this.creditsOverlay.on('pointerdown', closeCreditsFromOverlay)
      
      // Add keyboard handler to close on Enter/Space
      const keyboard = this.input.keyboard
      if (keyboard) {
        // Remove any existing handlers first to prevent conflicts
        keyboard.removeAllListeners('keydown-ENTER')
        keyboard.removeAllListeners('keydown-SPACE')
        keyboard.on('keydown-ENTER', closeCreditsFromOverlay)
        keyboard.on('keydown-SPACE', closeCreditsFromOverlay)
      }
    }

    if (!this.creditsPanel) {
      const panelWidth = Math.min(worldWidth * 0.88, 572)
      const panelHeight = Math.min(worldHeight * 0.825, 704)
      const panel = this.add.container(worldWidth / 2, worldHeight / 2)
      panel.setDepth(23)

      const background = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a2a2a, 0.96)
      background.setStrokeStyle(2, 0xb0b0b0)

      // Credits content (removed Game Development section, smaller text, gray titles)
      // Start closer to top since we removed the title, moved up a bit more
      const creditsStartY = -panelHeight / 2 + 30
      const creditsWidth = panelWidth - 64
      let currentY = creditsStartY
      
      // Create credits text objects - titles in gray, body in normal color
      const creditsChildren: Phaser.GameObjects.GameObject[] = []
      
      const addTitle = (text: string) => {
        const titleText = this.add.text(-panelWidth / 2 + 32, currentY, text, {
          fontSize: '18px',  // Slightly larger (was 16px)
          fontFamily: 'MontserratBold',
          color: '#b0b0b0',  // Gray for titles
        })
        creditsChildren.push(titleText)
        currentY += titleText.height + 6
      }
      
      const addBody = (text: string) => {
        if (text === '') {
          currentY += 8  // Extra space for empty lines
          return
        }
        const bodyText = this.add.text(-panelWidth / 2 + 32, currentY, text, {
          fontSize: '18px',  // Slightly larger (was 16px)
          fontFamily: 'Montserrat',
          color: '#e0d5b6',
          wordWrap: { width: creditsWidth },
          lineSpacing: 4,
        })
        creditsChildren.push(bodyText)
        currentY += bodyText.height + 4
      }
      
      // Build credits
      addTitle('Art')
      // FIX: Change 'p' to 'b' in "Inspired"
      addBody('Bittee (Handala): Insbired by Naji al-Ali')
      addBody('')
      
      addTitle('Music')
      addBody('Onadekom')
      addBody('Artists: Hawa Dafi, Busher, SJ')
      addBody('Album: Our Story (2015)')
      // FIX: Change 'p' to 'b' in "Provided"
      addBody('Provibed by: DistroKid')
      addBody('')
      
      addBody('Mawtini (موطني)')
      addBody('Original: Ibrahim Tuqan, Muhammad Fulayfil (1934)')
      addBody('Instrumental (1967): Recorded by: Derovolk')
      // FIX: Change 'p' to 'b' in "Chiptune" and "Provided"
      addBody('Chibtune - Provibed by: Boo! Bros.')
      addBody('')
      
      // FIX: Keep 'p' in "Palestine National Anthem"
      addBody('Palestine National Anthem')
      addBody('Fida\'i - Revolutionary - فدائي')
      addBody('Original: Said Al Muzayin, Ali Ismael (1965)')
      addBody('Provided by: KSO 8-Bit Anthems')
      addBody('')
      
      addBody('Ounadikom (Music I)')
      addBody('Artist: Ahmad Kaabour')
      addBody('Released: 2019')
      addBody('')
      addBody('')  // Extra space before last sentence
      
      // Last sentence in orange-ish red, centered, much larger font
      const lastSentence = this.add.text(0, currentY + 10, 'Bittee is inspired by the steadfast resilience of the Palestinian people and is committed to boycott the colonizers and fight for liberation and justice.', {
        fontSize: '24px',  // Much larger (was 18px)
        fontFamily: 'Montserrat',
        color: '#8b2a00',  // Orange-ish red from start modal
        wordWrap: { width: creditsWidth },
        align: 'center',
      }).setOrigin(0.5, 0)
      creditsChildren.push(lastSentence)

      const closeButton = this.add.text(0, panelHeight / 2 - 36, 'Close', {
        fontSize: '22px',
        fontFamily: 'MontserratBold',
        color: '#f4faff',
        backgroundColor: '#2f3b32',
        padding: { left: 22, right: 22, top: 8, bottom: 8 },
      }).setOrigin(0.5)
      closeButton.setInteractive({ useHandCursor: true })
      const closeCredits = () => {
        this.closeCreditsPanel()
      }
      closeButton.on('pointerdown', closeCredits)
      
      // Add keyboard handler to close on Enter/Space (act as Return button)
      const keyboard = this.input.keyboard
      if (keyboard) {
        // Remove any existing handlers first to prevent conflicts
        keyboard.removeAllListeners('keydown-ENTER')
        keyboard.removeAllListeners('keydown-SPACE')
        keyboard.on('keydown-ENTER', closeCredits)
        keyboard.on('keydown-SPACE', closeCredits)
      }

      panel.add([background, ...creditsChildren, closeButton])
      this.creditsPanel = panel
    }

    this.creditsOverlay?.setVisible(true).setActive(true)
    this.creditsOverlay?.setInteractive()
    this.creditsPanel?.setVisible(true).setActive(true)
  }

  private closeCreditsPanel(): void {
    if (this.creditsPanel) {
      this.creditsPanel.setVisible(false)
      this.creditsPanel.setActive(false)
    }
    if (this.creditsOverlay) {
      this.creditsOverlay.setVisible(false)
      this.creditsOverlay.disableInteractive()
    }
    // Remove keyboard handlers
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.removeAllListeners('keydown-ENTER')
      keyboard.removeAllListeners('keydown-SPACE')
      // Re-add settings panel handler if settings panel is still open
      if (this.settingsPanel?.visible) {
        const closeSettingsHandler = () => {
          if (this.settingsPanel?.visible) {
            // Check if any nested modal is open first
            const hasNestedModal = this.hasNestedModalOpen()
            if (hasNestedModal) {
              // Close the nested modal first
              this.closeNestedModal()
            } else {
              // If no nested modal, close settings
              this.closeSettingsPanel()
            }
          }
        }
        keyboard.on('keydown-ENTER', closeSettingsHandler)
        keyboard.on('keydown-SPACE', closeSettingsHandler)
      } else {
        // If settings panel is NOT visible, we should still return to settings (not exit to game)
        // If we're already paused for settings, just make the panel visible
        if (this.isPausedForSettings && this.settingsPanel) {
          this.settingsPanel.setVisible(true)
          this.settingsPanel.setActive(true)
          this.refreshSettingsPanel()
          
          // Restore settings panel handlers
          const closeSettingsHandler = () => {
            if (this.settingsPanel?.visible) {
              const hasNestedModal = this.hasNestedModalOpen()
              if (hasNestedModal) {
                this.closeNestedModal()
              } else {
                this.closeSettingsPanel()
              }
            }
          }
          keyboard.on('keydown-ENTER', closeSettingsHandler)
          keyboard.on('keydown-SPACE', closeSettingsHandler)
        } else {
          // Not paused - open settings normally
          // Ensure game is paused before opening settings
          if (!this.isPausedForSettings) {
            this.isPausedForSettings = true
            this.physics.world.pause()
            this.tweens.pauseAll()
            this.previousTimeScale = this.time.timeScale
            this.time.timeScale = 0
          }
          this.openSettingsPanel()
        }
      }
    }
  }

  private flashRockInfinity(): void {
    if (!this.throwButton) {
      return
    }

    const rockIcon = this.throwButton.getData('rockIcon') as Phaser.GameObjects.Image
    const infinityText = this.throwButton.getData('infinityText') as Phaser.GameObjects.Text

    if (!rockIcon || !infinityText) {
      return
    }

    this.tweens.killTweensOf([rockIcon, infinityText])

    // Reset rock icon scale before tween to ensure it starts at correct size
    const baseRockScale = 0.25  // Base scale for rock icon
    rockIcon.setScale(baseRockScale)  // Match the initial scale set during creation
    // Tween should scale relative to base scale, not absolute
    // Scale from 1.2x base (slightly bigger) to 1x base (normal)
    this.tweens.add({
      targets: [rockIcon],
      scale: { from: baseRockScale * 1.2, to: baseRockScale },
      alpha: { from: 0.6, to: 1 },
      duration: 220,
      ease: 'Quad.easeOut',
    })
    // Infinity text scales normally (from 1.3 to 1)
    this.tweens.add({
      targets: [infinityText],
      scale: { from: 1.3, to: 1 },
      alpha: { from: 0.6, to: 1 },
      duration: 220,
      ease: 'Quad.easeOut',
    })
  }

  private showStartModal(mode: 'start' | 'gameOver' | 'victory' = 'start'): void {
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height
    const isGameOver = mode === 'gameOver'
    const isVictory = mode === 'victory'
    const isEndModal = isGameOver || isVictory

    // Shift modal panel up by 200px (but keep overlay at center)
    const modalY = worldHeight / 2 - 200
    
    if (!this.startOverlay) {
      // Overlay stays at center - don't shift it
      this.startOverlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x0d0f12, 0.82)
      this.startOverlay.setDepth(40)
    }

    if (!this.startPanel) {
      // Make modal larger for victory mode
      const baseWidth = isVictory ? 0.95 : 0.902
      const baseHeight = isVictory ? 0.90 : 0.87  // Expanded victory modal bottom border (from 0.95 to 0.90)
      const baseMax = isVictory ? 700 : 670  // Increased max height for victory modal (from 750 to 700)
      const panelWidth = Math.min(worldWidth * baseWidth, baseMax)
      const panelHeight = Math.min(worldHeight * baseHeight, baseMax)
      const panel = this.add.container(worldWidth / 2, modalY)
      panel.setDepth(41)

      const bgGraphics = this.add.graphics()
      // Dark gray background only when score >= 10, otherwise default
      const bgColor = isEndModal && this.score >= 10 ? 0x2a2a2a : 0x2f3b32
      bgGraphics.fillStyle(bgColor, 0.96)
      bgGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 28)
      bgGraphics.lineStyle(3, 0xd7ddcc, 1)
      bgGraphics.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 28)

      // For gameOver modal, shift title down more
      const titleY = isGameOver ? -panelHeight / 2 + 90 : -panelHeight / 2 + 60  // Shifted down more for gameOver (from 60 to 90)
      const title = this.add.text(0, titleY, '', {
        fontSize: '72px',  // Larger title
        fontFamily: 'MontserratBold',
        color: '#4d564a',  // Slightly brighter (#4a5348 -> #4d564a)
      }).setOrigin(0.5, 0.5)
      // Add subtle inside shadow (same color as title background shadow: black with 0.4 opacity, downward)
      title.setShadow(0, 2, 'rgba(0, 0, 0, 0.4)', 3, true, true)  // Inside shadow, downward, blur 3, slightly more visible
      title.setInteractive({ useHandCursor: true })
      title.on('pointerdown', () => {
        this.hideStartModal()
        this.openInstructionsPanel()
      })

      const titleBg = this.add.graphics()
      titleBg.fillStyle(0xb0b0b0, 0.9)  // Light gray background

      const messageY = -60  // Moved up more (from -20 to -60)
      const message = this.add.text(0, messageY, '', {
        fontSize: '24px',
        fontFamily: 'Montserrat',
        color: '#e0d5b6',
        align: 'center',
        wordWrap: { width: panelWidth - 80 },
        lineSpacing: 8,  // Add more space between lines
      }).setOrigin(0.5)
      this.startMessageBaseY = messageY

      // First line in dark gray - positioned 2 lines up from message
      const firstLine = this.add.text(0, messageY, 'Destroy every boycotted brand.', {
        fontSize: '30px',
        fontFamily: 'MontserratBold',
        color: '#121212',  // Slightly darker gray (was #1a1a1a)
        align: 'center',
        wordWrap: { width: panelWidth - 20 },  // Increased width to prevent wrapping
        lineSpacing: 8,  // Match the main message lineSpacing
      }).setOrigin(0.5)
      // Add very subtle gray shadow to text
      firstLine.setShadow(1, 1, 'rgba(100, 100, 100, 0.3)', 1)
      firstLine.setVisible(false)  // Initially hidden, shown when message is shown

      // Underline for first line - dark red with hint of dark orange
      const firstLineUnderline = this.add.graphics()
      firstLineUnderline.lineStyle(2, 0x8b2a00, 1)  // Dark red with hint of dark orange
      firstLineUnderline.setVisible(false)  // Initially hidden
      firstLineUnderline.setDepth(42)  // Above text

      // "FREE FALASTEEN" text - positioned below message with three line breaks
      const freeFalasteenY = messageY + 175  // Moved up a bit
      const freeFalasteen = this.add.text(0, freeFalasteenY, 'FREE FALASTEEN', {
        fontSize: '28px',
        fontFamily: 'MontserratBold',
        color: '#c3d4a5',  // Same color as start button background (0xc3d4a5)
        align: 'center',
      }).setOrigin(0.5)
      freeFalasteen.setVisible(false)  // Initially hidden, shown when message is shown

      // Score label and number for game over modal
      const scoreLabelY = -60
      const scoreLabel = this.add.text(0, scoreLabelY, 'Boycotted:', {
        fontSize: '48px',
        fontFamily: 'MontserratBold',
        color: '#e0d5b6',
        align: 'center',
      }).setOrigin(0.5, 0.5)
      scoreLabel.setVisible(false)
      // Add shadow to "Boycotted:" text
      scoreLabel.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2)

      const scoreNumberY = scoreLabelY + 90  // Shifted down a bit
      const scoreNumber = this.add.text(0, scoreNumberY, '0', {
        fontSize: '120px',
        fontFamily: 'MontserratBold',
        color: '#8b0000',  // Default dark red (will be updated based on score)
        align: 'center',
      }).setOrigin(0.5, 0.5)
      scoreNumber.setVisible(false)

      // Volume option - positioned above Yella button, centered as one unit
      const volumeOptionY = panelHeight / 2 - 100  // Raised up (from -120 to -100)
      // Create combined text for volume (label + status) centered as one unit
      const volumeLabelText = this.add.text(0, volumeOptionY, 'Volume: ', {
        fontSize: '22px',
        fontFamily: 'Montserrat',
        color: '#b0b0b0',  // Light gray for label
        align: 'center',
      }).setOrigin(0.5, 0.5)  // Center origin for centering
      volumeLabelText.setVisible(false)  // Initially hidden, shown when in start mode
      
      // Volume status text (will be updated) - positioned right after label, centered together
      const volumeStatusText = this.add.text(0, volumeOptionY, '', {
        fontSize: '22px',
        fontFamily: 'Montserrat',
        color: '#ffffff',  // White for status
        align: 'center',
      }).setOrigin(0.5, 0.5)  // Center origin
      volumeStatusText.setVisible(false)  // Initially hidden
      volumeStatusText.setInteractive({ useHandCursor: true })
      volumeStatusText.on('pointerdown', () => {
        this.playSound('settings-sound', 1.0)
        this.cycleVolume()
        this.updateStartModalVolumeOption()
      })

      // Create a copy of the volume button above Yella button
      const volumeButtonCopyY = panelHeight / 2 - 80  // Positioned above Yella button
      const volumeLabelTextCopy = this.add.text(0, volumeButtonCopyY, 'Volume: ', {
        fontSize: '22px',
        fontFamily: 'Montserrat',
        color: '#b0b0b0',  // Light gray for label
        align: 'center',
      }).setOrigin(0.5, 0.5)  // Center origin for centering
      volumeLabelTextCopy.setVisible(false)  // Initially hidden, shown when in start mode
      
      // Volume status text copy (will be updated) - positioned right after label, centered together
      const volumeStatusTextCopy = this.add.text(0, volumeButtonCopyY, '', {
        fontSize: '22px',
        fontFamily: 'Montserrat',
        color: '#ffffff',  // White for status
        align: 'center',
      }).setOrigin(0.5, 0.5)  // Center origin
      volumeStatusTextCopy.setVisible(false)  // Initially hidden
      volumeStatusTextCopy.setInteractive({ useHandCursor: true })
      volumeStatusTextCopy.on('pointerdown', () => {
        this.playSound('settings-sound', 1.0)
        this.cycleVolume()
        this.updateStartModalVolumeOption()
        // Also update the copy
        const volumeLabel = VOLUME_LEVELS[this.settings.volumeIndex].label
        volumeStatusTextCopy.setText(volumeLabel)
      })
      
      // Store references to both the original and copy for updating
      // Keep original references
      this.startVolumeLabelText = volumeLabelText
      this.startVolumeStatusText = volumeStatusText

      // Create button with shadow background - upward direction
      const buttonY = panelHeight / 2 - 75  // Moved up a bit
      const buttonPadding = { left: 32, right: 32, top: 12, bottom: 12 }
      const buttonText = 'Yella'
      const buttonFontSize = 36
      // Calculate button dimensions based on text and padding
      const tempText = this.add.text(0, 0, buttonText, { fontSize: `${buttonFontSize}px`, fontFamily: 'MontserratBold' })
      const buttonTextWidth = tempText.width
      const buttonTextHeight = tempText.height
      tempText.destroy()
      const buttonWidth = buttonTextWidth + buttonPadding.left + buttonPadding.right
      const buttonHeight = buttonTextHeight + buttonPadding.top + buttonPadding.bottom
      const buttonRadius = 6  // Slightly rounded (less than other buttons)
      
      // Create shadow as separate graphics object - same dimensions as button, positioned above (upward direction)
      const buttonShadow = this.add.graphics()
      buttonShadow.fillStyle(0x000000, 0.2)  // Subtle shadow
      // Shadow with exactly same dimensions as button, positioned above and shifted up more
      const shadowYOffset = 6  // Shift shadow up more (above button) for more visible effect
      buttonShadow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2 - shadowYOffset, buttonWidth, buttonHeight, buttonRadius)  // Same dimensions, above button
      buttonShadow.setPosition(0, buttonY)
      buttonShadow.setDepth(39)  // Behind button
      
      // Create rounded background for button
      const buttonBgGraphics = this.add.graphics()
      buttonBgGraphics.fillStyle(0xc3d4a5, 1)  // Button background color
      buttonBgGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius)
      buttonBgGraphics.setPosition(0, buttonY)
      buttonBgGraphics.setDepth(40)
      
      const startButton = this.add.text(0, buttonY, 'Yella', {
        fontSize: '36px',
        fontFamily: 'MontserratBold',
        color: '#1a1a1a',  // Super dark gray (same as before, but ensuring it's not black)
        padding: buttonPadding,
      }).setOrigin(0.5)
      startButton.setDepth(40)  // Above shadow
      // Store original Y position for pressed effect
      startButton.setData('originalY', buttonY)
      buttonShadow.setData('originalY', buttonY)
      startButton.setData('isRespawnButton', false)
      startButton.setInteractive({ useHandCursor: true })
      startButton.on('pointerdown', () => {
        // Button press effect on click - shift up into shadow above
        const originalY = startButton.getData('originalY') as number
        const pressOffset = 5  // Shift up by 5 pixels when pressed (presses into upward shadow)
        startButton.setY(originalY - pressOffset)
        buttonShadow.setY(originalY - pressOffset)
        buttonBgGraphics.setY(originalY - pressOffset)
        buttonShadow.setVisible(false)  // Hide shadow when pressed
      })
      startButton.on('pointerup', () => {
        // Return to original position and trigger action on release
        const originalY = startButton.getData('originalY') as number
        startButton.setY(originalY)
        buttonShadow.setY(originalY)
        buttonBgGraphics.setY(originalY)
        buttonShadow.setVisible(true)  // Show shadow again
        // Check if this is a respawn (game over) or new game
        const isRespawn = this.startButtonText?.getData('isRespawnButton') === true
        // Ensure button stays interactive
        if (!startButton.input) {
          startButton.setInteractive({ useHandCursor: true })
        }
        this.startGame(isRespawn)
      })
      startButton.on('pointerout', () => {
        // Return button to original position if pointer leaves (without triggering action)
        const originalY = startButton.getData('originalY') as number
        startButton.setY(originalY)
        buttonShadow.setY(originalY)
        buttonBgGraphics.setY(originalY)
        buttonShadow.setVisible(true)  // Show shadow
      })

      // Add gray text under Yella button about unmuting phone
      // Position it in the middle between bottom of button and bottom edge of modal
      const buttonBottom = buttonY + buttonHeight / 2
      const modalBottom = panelHeight / 2
      const unmuteTextY = (buttonBottom + modalBottom) / 2  // Middle point
      const unmuteText = this.add.text(0, unmuteTextY, '(Unmute phone to hear game sound)', {
        fontSize: '16px',  // Larger font
        fontFamily: 'Montserrat',
        color: '#808080',  // Gray
        align: 'center',
      }).setOrigin(0.5, 0.5)
      unmuteText.setVisible(false)  // Initially hidden, shown when in start mode
      
      panel.add([bgGraphics, titleBg, title, message, firstLine, firstLineUnderline, freeFalasteen, scoreLabel, scoreNumber, volumeLabelText, volumeStatusText, buttonShadow, buttonBgGraphics, startButton, unmuteText])
      
      // Store reference to startButton for later use
      panel.setData('startButton', startButton)
      panel.setData('buttonShadow', buttonShadow)  // Store reference to update shadow when button text changes
      panel.setData('buttonBgGraphics', buttonBgGraphics)  // Store reference to update button background

      this.startPanel = panel
      this.startTitleText = title
      this.startMessageText = message
      this.firstLineText = firstLine
      this.firstLineUnderline = firstLineUnderline
      this.freeFalasteenText = freeFalasteen
      this.startButtonText = startButton
      this.startTitleBg = titleBg
      this.scoreLabelText = scoreLabel
      this.scoreNumberText = scoreNumber
      this.startVolumeLabelText = volumeLabelText
      this.startVolumeStatusText = volumeStatusText
      this.unmuteText = unmuteText
      panel.setData('bgGraphics', bgGraphics)  // Store reference to update background color
    }

    const introMessage = 'Run, jumb, & crouch with arrows.\nThrow stones with sbace.\nTaunt with \'T\''

    this.startTitleText?.setText('BITTEE')
    this.startTitleText?.setStyle({ fontFamily: 'MontserratBold', color: '#6a7368' })  // Brighter (#5a6358 -> #6a7368)
    // Add subtle inside shadow (same color as title background shadow: black with 0.4 opacity, downward)
    this.startTitleText?.setShadow(0, 2, 'rgba(0, 0, 0, 0.4)', 3, true, true)  // Inside shadow, downward, blur 3, slightly more visible
    if (this.startTitleBg && this.startTitleText) {
      this.startTitleBg.clear()
      const titleBgColor = 0x3a3a3a  // Same dark gray for all modals (start, end, victory)
      const titleWidth = this.startTitleText.width + 50  // Increased padding for larger title
      const titleHeight = 80  // Increased height for larger title
      // Use the actual panel height from the modal (victory or regular)
      const isVictory = this.startPanel?.getData('isVictory') === true
      const isGameOver = this.startPanel?.getData('isGameOver') === true
      const baseHeight = isVictory ? 0.90 : isGameOver ? 0.85 : 0.87
      const baseMax = isVictory ? 700 : isGameOver ? 650 : 670
      const panelHeight = Math.min(worldHeight * baseHeight, baseMax)
      // For gameOver modal, shift title down more
      const titleY = isGameOver ? -panelHeight / 2 + 90 : -panelHeight / 2 + 60  // Shifted down more for gameOver
      // Draw shadow first (behind) - downward only, extended more
      this.startTitleBg.fillStyle(0x000000, 0.3)
      this.startTitleBg.fillRoundedRect(-titleWidth / 2, titleY - titleHeight / 2 + 6, titleWidth, titleHeight, 12)  // Extended shadow (was +3, now +6)
      // Draw main title background on top - centered on title text
      this.startTitleBg.fillStyle(titleBgColor, 0.9)
      this.startTitleBg.fillRoundedRect(-titleWidth / 2, titleY - titleHeight / 2, titleWidth, titleHeight, 12)
      // Ensure title text is centered within its background
      if (this.startTitleText) {
        this.startTitleText.setOrigin(0.5, 0.5)
        this.startTitleText.setY(titleY)
      }
    }

    const respawnPadding = { left: 24, right: 24, top: 8, bottom: 8 }  // Smaller padding for respawn button
    const startPadding = { left: 28, right: 28, top: 10, bottom: 10 }

    if (isGameOver) {
      // Set flag so title positioning knows it's gameOver mode
      if (this.startPanel) {
        this.startPanel.setData('isGameOver', true)
      }
      
      // Update background color: dark gray only when score >= 10
      const bgGraphics = this.startPanel?.getData('bgGraphics') as Phaser.GameObjects.Graphics
      if (bgGraphics) {
        bgGraphics.clear()
        const bgColor = this.score >= 10 ? 0x2a2a2a : 0x2f3b32
        // Expand top and bottom borders for game over modal
        const panelWidth = Math.min(worldWidth * 0.902, 572)
        const panelHeight = Math.min(worldHeight * 0.85, 650)  // Expanded from 0.77/572 to 0.85/650
        bgGraphics.fillStyle(bgColor, 0.96)
        bgGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 28)
        bgGraphics.lineStyle(3, 0xd7ddcc, 1)
        bgGraphics.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 28)
      }
      
      // Show destroyed tanks count if in tank phase
      if (this.isBossLevel && this.bossPhase.startsWith('tank') && this.destroyedText) {
        // Calculate actual destroyed count from tank healths
        const actualDestroyedCount = this.tankHealths.filter(health => health <= 0).length
        const tanksText = `${actualDestroyedCount} tank${actualDestroyedCount !== 1 ? 's' : ''}`
        this.destroyedText.setText(`Destroyed 1 jet and ${tanksText}`)
        this.destroyedText.setVisible(true)
        // Position it between title and "Boycotted:" text
        // Get panelHeight from bgGraphics or calculate it
        const panelHeight = Math.min(worldHeight * 0.85, 650)
        const titleY = isGameOver ? -panelHeight / 2 + 90 : -panelHeight / 2 + 60
        const titleHeight = 80
        const titleBottom = titleY + titleHeight / 2
        const scoreLabelY = -60
        const destroyedY = (titleBottom + scoreLabelY) / 2  // Position between title and "Boycotted:"
        this.destroyedText.setY(destroyedY)
      }
      
      // Hide intro message, show score label and number
      this.startMessageText?.setVisible(false)
      this.firstLineText?.setVisible(false)
      this.firstLineUnderline?.setVisible(false)
      this.victoryUnderline?.setVisible(false)
      this.freeFalasteenText?.setVisible(false)
      this.scoreLabelText?.setVisible(true)
      this.scoreNumberText?.setVisible(true)
      // Hide volume option and unmute text in gameOver mode
      this.startVolumeLabelText?.setVisible(false)
      this.startVolumeStatusText?.setVisible(false)
      this.unmuteText?.setVisible(false)
      this.scoreNumberText?.setText(`${this.score}`)
      
      // Set number color based on score: dark red if 0, orange if under 10, green if over 10
      let numberColor = '#8b0000'  // Dark red for 0
      if (this.score > 0 && this.score < 10) {
        numberColor = '#ff8c00'  // Orange
      } else if (this.score >= 10) {
        numberColor = '#228b22'  // Green (dark olive green)
      }
      this.scoreNumberText?.setStyle({ color: numberColor })
      // Add gray shadow to the score number (darker)
      this.scoreNumberText?.setShadow(2, 2, 'rgba(50, 50, 50, 0.8)', 2)
      
      this.updateStartButtonAppearance('Resbawn', respawnPadding, true)
    } else if (isVictory) {
      // Make modal larger for victory mode to fit destroyed text
      // Use same larger size as initial creation for victory mode
      const panelWidth = Math.min(worldWidth * 0.95, 650)
      const panelHeight = Math.min(worldHeight * 0.90, 700)  // Expanded bottom border (from 0.85/650 to 0.90/700)
      
      // Set flag so updateStartButtonAppearance knows it's victory mode
      if (this.startPanel) {
        this.startPanel.setData('isVictory', true)
      }
      
      const bgGraphics = this.startPanel?.getData('bgGraphics') as Phaser.GameObjects.Graphics
      if (bgGraphics) {
        bgGraphics.clear()
        bgGraphics.fillStyle(0x2f3b32, 0.96)
        bgGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 28)
        bgGraphics.lineStyle(3, 0xd7ddcc, 1)
        bgGraphics.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 28)
      }

      // Calculate positions - shift "Good work!" and "Boycotted:" down more
      const titleY = -panelHeight / 2 + 40
      const titleHeight = 80
      const titleBottom = titleY + titleHeight / 2
      const spacing = 60  // Spacing between elements
      const shiftDown = 50  // Additional shift down for "Good work!" and "Boycotted:"
      
      const goodWorkY = titleBottom + spacing + shiftDown
      // Position "Destroyed" text between "Good work!" and "Boycotted:"
      const labelY = goodWorkY + spacing + shiftDown  // "Boycotted:" position (shifted down)
      const destroyedY = (goodWorkY + labelY) / 2  // Position between "Good work!" and "Boycotted:"

      if (this.startMessageText) {
        this.startMessageText.setVisible(true)
        this.startMessageText.setText('Good work!')
        this.startMessageText.setFontSize(34)
        this.startMessageText.setFontFamily('MontserratBold')
        this.startMessageText.setStyle({ color: '#c3d4a5' })  // Same color as "FREE FALASTEEN"
        this.startMessageText.setY(goodWorkY)
      }
      this.firstLineText?.setVisible(false)
      this.firstLineUnderline?.setVisible(false)

        // Hide score text in top right during victory
        this.scoreText?.setVisible(false)
        this.scoreTriangleText?.setVisible(false)
        
        if (this.scoreLabelText && this.scoreNumberText) {
        // Calculate positions first - shift "Boycotted:" and number down more
        const boycottY = panelHeight / 2 - 160  // Shifted up more to be above respawn button (from -140 to -160)
        // Position number between "Boycotted:" and "Now boycott these irl..", shifted down more
        const numberY = (labelY + boycottY) / 2 + 20  // Midpoint between label and boycott text, shifted down 20px

        this.scoreLabelText.setVisible(true)
        this.scoreLabelText.setY(labelY)
        this.scoreLabelText.setOrigin(0.5, 0.5)  // Ensure centered

        this.scoreNumberText.setVisible(true)
        this.scoreNumberText.setText(`${this.score}`)
        // Make number gray if score is 0, otherwise use normal color
        const numberColor = this.score === 0 ? '#888888' : '#e0d5b6'
        this.scoreNumberText.setStyle({ color: numberColor })
        this.scoreNumberText.setY(numberY)
        this.scoreNumberText.setOrigin(0.5, 0.5)  // Ensure centered
        // Add gray shadow to the score number (darker)
        this.scoreNumberText.setShadow(2, 2, 'rgba(50, 50, 50, 0.8)', 2)
        
        // Hide volume option and unmute text in victory mode
        this.startVolumeLabelText?.setVisible(false)
        this.startVolumeStatusText?.setVisible(false)
        this.unmuteText?.setVisible(false)

        // Add text showing destroyed count - use actual count for tanks if in boss level
        // Calculate actual destroyed count from tank healths
        const actualDestroyedCount = this.isBossLevel && this.bossPhase.startsWith('tank')
          ? this.tankHealths.filter(health => health <= 0).length
          : 3
        const tanksText = `${actualDestroyedCount} tank${actualDestroyedCount !== 1 ? 's' : ''}`
        const destroyedTextContent = `Destroyed 1 jet and ${tanksText}`
        if (!this.destroyedText) {
          this.destroyedText = this.add.text(0, destroyedY, destroyedTextContent, {
            fontSize: '32px',
            fontFamily: 'MontserratBold',
            color: '#cc4a2a',  // Darker orange-ish red color
            align: 'center',
          }).setOrigin(0.5, 0.5)
          this.destroyedText.setScrollFactor(0)
          this.destroyedText.setDepth(42)
          this.destroyedText.setVisible(false)
          // Add shadow
          this.destroyedText.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2)
          // Add to panel container
          const panel = this.startPanel
          if (panel) {
            panel.add(this.destroyedText)
          }
        }
        // Update text with actual count if in tank phase
        if (this.isBossLevel && this.bossPhase.startsWith('tank')) {
          const actualCount = this.tankHealths.filter(health => health <= 0).length
          const tanksText = `${actualCount} tank${actualCount !== 1 ? 's' : ''}`
          this.destroyedText.setText(`Destroyed 1 jet and ${tanksText}`)
        }
        this.destroyedText.setVisible(true)
        this.destroyedText.setY(destroyedY)  // Position with equal spacing

        if (this.freeFalasteenText) {
          this.freeFalasteenText.setVisible(true)
          this.freeFalasteenText.setText('Now boycott these irl..')
          // Original styling (reverted from larger/darker)
          this.freeFalasteenText.setStyle({ color: '#1a1a1a', fontFamily: 'MontserratBold', fontSize: '30px' })
          // Add same shadow as "Destroy every..." in start modal
          this.freeFalasteenText.setShadow(1, 1, 'rgba(100, 100, 100, 0.3)', 1)
          this.freeFalasteenText.setY(boycottY)
          this.freeFalasteenText.setX(0)  // Center horizontally (0 is center of panel)
          this.freeFalasteenText.setOrigin(0.5, 0.5)  // Center the text

          // Destroy underline completely during victory
          if (this.victoryUnderline) {
            this.victoryUnderline.destroy()
            this.victoryUnderline = undefined
          }
        }
      }

      this.updateStartButtonAppearance('Resbawn', respawnPadding, false)
    } else {
      // Show intro message, hide score label and number
      this.startMessageText?.setVisible(true)
      this.startMessageText?.setText(introMessage)
      this.startMessageText?.setFontSize(26)
      // Show first line in dark gray, shifted up 2 lines worth
      if (this.firstLineText) {
        this.firstLineText.setVisible(true)
        this.firstLineText.setFontSize(30)
        // Shift up by 2 lines: each line is approximately 26px + 8px lineSpacing = 34px
        const lineHeight = 34
        const firstLineY = this.startMessageBaseY - (lineHeight * 2)
        this.firstLineText.setY(firstLineY)
        
        // Draw underline below first line with shadow
        if (this.firstLineUnderline) {
          this.firstLineUnderline.clear()
          const underlineY = firstLineY + (this.firstLineText.height / 2) + 4  // 4px below text
          const underlineWidth = this.firstLineText.width + 10  // Slightly wider than text
          
          // Draw shadow first (slightly offset and darker)
          this.firstLineUnderline.lineStyle(4, 0x000000, 0.2)  // Subtle shadow
          this.firstLineUnderline.lineBetween(-underlineWidth / 2 + 1, underlineY + 1, underlineWidth / 2 + 1, underlineY + 1)
          
          // Draw main underline (twice as thick: 4px instead of 2px)
          this.firstLineUnderline.lineStyle(4, 0x8b2a00, 1)  // Dark red with hint of dark orange
          this.firstLineUnderline.lineBetween(-underlineWidth / 2, underlineY, underlineWidth / 2, underlineY)
          this.firstLineUnderline.setVisible(true)
        }
      }
      // Position main message at the same Y as before (it will naturally be below first line)
      // The original message had all lines together, so we need to position the remaining lines
      // to match where they would have been if the first line was still part of it
      if (this.startMessageText) {
        // Calculate where the second line would be: first line height + lineSpacing
        const firstLineHeight = this.firstLineText ? this.firstLineText.height : 30
        const lineSpacing = 8
        this.startMessageText.setY(this.startMessageBaseY + firstLineHeight + lineSpacing)
      }
      if (this.freeFalasteenText) {
        this.freeFalasteenText.setVisible(true)
        this.freeFalasteenText.setText('FREE FALASTEEN')
        this.freeFalasteenText.setStyle({ color: '#c3d4a5', fontFamily: 'MontserratBold', fontSize: '28px' })
      }
      
      // Show volume option in start mode
      this.updateStartModalVolumeOption()
      this.startVolumeLabelText?.setVisible(true)
      this.startVolumeStatusText?.setVisible(true)
      this.unmuteText?.setVisible(true)
      this.scoreLabelText?.setVisible(false)
      this.scoreNumberText?.setVisible(false)
      this.victoryUnderline?.setVisible(false)
      this.updateStartButtonAppearance('Yella', startPadding, false)
    }

    this.startOverlay?.setVisible(true).setActive(true).setInteractive()
    this.startPanel?.setVisible(true).setActive(true)
    
    // Ensure button is interactive when modal is shown
    if (this.startButtonText) {
      this.startButtonText.setInteractive({ useHandCursor: true })
    }

    // Add keyboard handler for Spacebar to press Yella button when start modal is visible
    const keyboard = this.input.keyboard
    if (keyboard && this.startPanel?.visible) {
      // Remove Spacebar handler for throwing temporarily while modal is visible
      keyboard.removeAllListeners('keydown-SPACE')
      // Spacebar: Press Yella button when start modal is visible
      keyboard.on('keydown-SPACE', () => {
        if (this.startPanel?.visible && this.startButtonText) {
          // Actually trigger the button click by calling startGame
          const isRespawn = this.startButtonText?.getData('isRespawnButton') === true
          this.startGame(isRespawn)
        }
      })
      
      // Enter key: Also press Yella button when start modal is visible
      keyboard.on('keydown-ENTER', () => {
        if (this.startPanel?.visible && this.startButtonText) {
          // Actually trigger the button click by calling startGame
          const isRespawn = this.startButtonText?.getData('isRespawnButton') === true
          this.startGame(isRespawn)
        } else if (this.settingsPanel?.visible) {
          // If settings panel is visible, close it
          this.closeSettingsPanel()
        }
      })
    }

    this.physics.world.pause()
    this.tweens.pauseAll()
    this.time.timeScale = 0
    this.isGameActive = false
  }

  private hideStartModal(): void {
    this.startOverlay?.setVisible(false).disableInteractive()
    this.startPanel?.setVisible(false).setActive(false)
    
    // Remove Spacebar handler when modal is hidden so it doesn't interfere with throwing
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.removeAllListeners('keydown-SPACE')
      // Re-add Spacebar for throwing in game
      if (!this.fireKey) {
        this.fireKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      }
    }
    
    // Re-enable start button when modal is hidden (in case it was disabled)
    const startButton = this.startPanel?.getData('startButton') as Phaser.GameObjects.Text
    if (startButton) {
      startButton.setInteractive({ useHandCursor: true })
    }
  }

  private confirmationModal?: Phaser.GameObjects.Container
  private confirmationOverlay?: Phaser.GameObjects.Rectangle
  private pendingLevelIndex?: number
  private pendingIsBossLevel?: boolean

  private showLevelChangeConfirmation(levelIndex: number, isCurrentLevel: boolean, isBossLevel: boolean): void {
    // Store pending level selection
    this.pendingLevelIndex = levelIndex
    this.pendingIsBossLevel = isBossLevel
    
    const worldWidth = this.scale.width
    const worldHeight = this.scale.height
    
    // Create overlay
    this.confirmationOverlay = this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x000000, 0.8)
    this.confirmationOverlay.setDepth(200)
    this.confirmationOverlay.setInteractive()
    
    // Create panel (matching theme with other modals)
    const panelWidth = Math.min(worldWidth * 0.82, 520)
    const panelHeight = Math.min(worldHeight * 0.5, 400)
    
    const panelBackground = this.add.graphics()
    panelBackground.fillStyle(0x2f3b32, 0.96)
    panelBackground.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 20)
    panelBackground.lineStyle(3, 0xd7ddcc, 1)
    panelBackground.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 20)
    panelBackground.setDepth(201)
    
    // Title
    const titleText = this.add.text(0, -panelHeight / 2 + 50, isCurrentLevel ? 'Reset Level?' : 'End Current Session?', {
      fontSize: '36px',
      fontFamily: 'MontserratBold',
      color: '#e0d5b6',
      align: 'center',
    }).setOrigin(0.5, 0.5)
    titleText.setDepth(202)
    titleText.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2)
    
    // Message
    const messageText = this.add.text(0, 0, isCurrentLevel 
      ? 'This will reset your progress on this level.'
      : 'This will end your current game session and start a fresh game.', {
      fontSize: '24px',
      fontFamily: 'Montserrat',
      color: '#c3d4a5',
      align: 'center',
      wordWrap: { width: panelWidth - 60 },
    }).setOrigin(0.5, 0.5)
    messageText.setDepth(202)
    
    // Buttons
    const buttonY = panelHeight / 2 - 60
    const buttonSpacing = 120
    const buttonPadding = { x: 20, y: 10 }
    
    // Cancel button
    const cancelButtonBg = this.add.graphics()
    cancelButtonBg.fillStyle(0x3a3a3a, 1)
    cancelButtonBg.fillRoundedRect(-buttonSpacing / 2 - 60, buttonY - 20, 100, 40, 8)
    cancelButtonBg.setDepth(202)
    
    const cancelButton = this.add.text(-buttonSpacing / 2, buttonY, 'Cancel', {
      fontSize: '28px',
      fontFamily: 'MontserratBold',
      color: '#e0d5b6',
      padding: buttonPadding,
    }).setOrigin(0.5, 0.5)
    cancelButton.setDepth(203)
    cancelButton.setInteractive({ useHandCursor: true })
    cancelButton.on('pointerup', () => {
      this.hideLevelChangeConfirmation()
    })
    
    // Confirm button
    const confirmButtonBg = this.add.graphics()
    confirmButtonBg.fillStyle(0x8b2a00, 1)
    confirmButtonBg.fillRoundedRect(buttonSpacing / 2 - 40, buttonY - 20, 100, 40, 8)
    confirmButtonBg.setDepth(202)
    
    const confirmButton = this.add.text(buttonSpacing / 2, buttonY, isCurrentLevel ? 'Reset' : 'Start Fresh', {
      fontSize: '28px',
      fontFamily: 'MontserratBold',
      color: '#e0d5b6',
      padding: buttonPadding,
    }).setOrigin(0.5, 0.5)
    confirmButton.setDepth(203)
    confirmButton.setInteractive({ useHandCursor: true })
    confirmButton.on('pointerup', () => {
      this.hideLevelChangeConfirmation()
      // Proceed with level selection
      if (this.pendingLevelIndex !== undefined) {
        this.startLevelFromSelection(this.pendingLevelIndex, this.pendingIsBossLevel || false)
      }
    })
    
    // Create container
    this.confirmationModal = this.add.container(worldWidth / 2, worldHeight / 2, [
      panelBackground,
      titleText,
      messageText,
      cancelButtonBg,
      cancelButton,
      confirmButtonBg,
      confirmButton,
    ])
    this.confirmationModal.setDepth(201)
  }

  private hideLevelChangeConfirmation(): void {
    if (this.confirmationModal) {
      this.confirmationModal.destroy()
      this.confirmationModal = undefined
    }
    if (this.confirmationOverlay) {
      this.confirmationOverlay.destroy()
      this.confirmationOverlay = undefined
    }
    this.pendingLevelIndex = undefined
    this.pendingIsBossLevel = undefined
  }

  private startLevelFromSelection(levelIndex: number, isBossLevel: boolean): void {
    // Wrap in try-catch to prevent crashes on mobile
    try {
      // Close level selection first
      this.closeLevelSelection()
      
      // CRITICAL: Comprehensive cleanup before loading new level to prevent memory leaks
      // Stop all audio to prevent memory buildup
      this.stopBackgroundMusic()
      if (this.settingsMusic && this.settingsMusic.isPlaying) {
        this.settingsMusic.stop()
      }
      if (this.heartbeatSound && this.heartbeatSound.isPlaying) {
        this.heartbeatSound.stop()
      }
      // Stop all time sound instances
      this.timeSoundInstances.forEach(instance => {
        if (instance && instance.isPlaying) {
          instance.stop()
        }
      })
      this.timeSoundInstances = []
      
      // Clean up all tweens and timers
      this.tweens.killAll()
      if (this.slowMotionTimer) {
        this.slowMotionTimer.remove(false)
        this.slowMotionTimer = undefined
      }
      if (this.shieldTimer) {
        this.shieldTimer.remove(false)
        this.shieldTimer = undefined
      }
      if (this.jetShakeTimer) {
        this.jetShakeTimer.remove(false)
        this.jetShakeTimer = undefined
      }
      if (this.invulnerabilityTimer) {
        this.invulnerabilityTimer.remove(false)
        this.invulnerabilityTimer = undefined
      }
      
      // Clean up power-up indicators
      this.powerUpIndicators.forEach((indicator) => {
        if (indicator.tween) {
          indicator.tween.stop()
        }
        if (indicator.text && indicator.text.scene) {
          indicator.text.destroy()
        }
        if (indicator.progressBar && indicator.progressBar.scene) {
          indicator.progressBar.destroy()
        }
        if (indicator.progressBarBg && indicator.progressBarBg.scene) {
          indicator.progressBarBg.destroy()
        }
      })
      this.powerUpIndicators.clear()
      
      // Clean up aiming triangles and hit indicators
      this.aimingTriangles.forEach((triangle) => {
        if (triangle && triangle.scene) {
          triangle.destroy()
        }
      })
      this.aimingTriangles.clear()
      this.projectedHitIndicators.forEach((indicator) => {
        if (indicator && indicator.scene) {
          indicator.destroy()
        }
      })
      this.projectedHitIndicators.clear()
      this.bulletTargetMap.clear()
      
      // Clean up boss level entities if switching away from boss level
      if (this.isBossLevel && !isBossLevel) {
        this.cleanupBossLevel()
      }
      
      // Update all borders
      this.levelButtons.forEach((btn) => {
        const btnBorder = btn.getData('borderGraphics') as Phaser.GameObjects.Graphics
        const btnIndex = btn.getData('levelIndex') as number
        const btnBorderRadius = btn.getData('borderRadius') as number
        const btnLevelSize = btn.getData('levelSize') as number
        if (btnBorder && btnIndex !== undefined && btnBorderRadius !== undefined && btnLevelSize !== undefined) {
          btnBorder.clear()
          const isSelected = btnIndex === levelIndex
          const btnBorderColor = isSelected ? 0xe0d5b6 : 0x2f3b32
          btnBorder.lineStyle(4, btnBorderColor, 1)
          btnBorder.strokeRoundedRect(-btnLevelSize / 2, -btnLevelSize / 2, btnLevelSize, btnLevelSize, btnBorderRadius)
          const isCurrentCity = btnIndex === this.currentLevelIndex
          btnBorder.setDepth(isCurrentCity ? 310 : 300)
        }
      })
      
      // Handle boss level or regular level
      if (isBossLevel) {
        // Don't change currentLevelIndex - just start boss level
      } else {
        this.applyLevel(levelIndex)
      }
      
      // Reset game state
      this.lives = 3
      this.score = 0
      this.updateHud()
      
      // Reset Bittee
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
      this.player.setPosition(this.scale.width / 2, this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
      this.player.setVelocity(0, 0)
      if (playerBody) {
        playerBody.setVelocity(0, 0)
        playerBody.setGravityY(this.normalGravityY)
        playerBody.setAcceleration(0, 0)
      }
      this.player.setScale(this.basePlayerScale, this.basePlayerScale)
      this.facing = 'right'
      this.isThrowing = false
      this.isTaunting = false
      this.isJumping = false
      this.isCrouching = false
      this.isAirCrouching = false
      this.justExitedCrouch = false
      this.isInvulnerable = false
      this.isSlowMotion = false
      if (this.shieldBubble && this.shieldBubble.scene) {
        this.shieldBubble.destroy()
        this.shieldBubble = undefined
      }
      this.player.setAlpha(1)
      this.lastFired = 0
      this.player.anims.stop()
      this.setIdlePose(true)
      this.setupPlayerCollider(0)
      // setupPlayerCollider already syncs body position, no need to call updateFromGameObject
      
      // Clear all balls and bullets
      this.balls.clear(true, true)
      this.bullets.clear(true, true)
      
      // Reset throw button
      if (this.throwButton) {
        const rockIcon = this.throwButton.getData('rockIcon') as Phaser.GameObjects.Image
        const infinityText = this.throwButton.getData('infinityText') as Phaser.GameObjects.Text
        if (rockIcon) {
          rockIcon.setScale(0.25)
          rockIcon.setAlpha(1)
          rockIcon.clearTint()  // Clear any tint from previous ammo
        }
        if (infinityText) {
          infinityText.setScale(1)
          infinityText.setAlpha(1)
          infinityText.setText('∞')  // Reset to infinity
        }
      }
      
      // Reset ammo display
      this.updateAmmoDisplay()
      
      // Resume physics and time
      this.physics.world.resume()
      this.tweens.resumeAll()
      this.time.timeScale = 1
      this.isGameActive = true
      
      // Handle boss level or regular level
      if (isBossLevel) {
        // Stop background music completely before starting boss level
        this.stopBackgroundMusic()
        // Force stop and pause all background music tracks
        if (this.backgroundMusic1) {
          if (this.backgroundMusic1.isPlaying) {
            this.backgroundMusic1.stop()
          }
          if (!this.backgroundMusic1.isPaused) {
            this.backgroundMusic1.pause()
          }
          // Remove ALL event listeners to prevent auto-playing
          this.backgroundMusic1.removeAllListeners('complete')
        }
        if (this.backgroundMusic2) {
          if (this.backgroundMusic2.isPlaying) {
            this.backgroundMusic2.stop()
          }
          if (!this.backgroundMusic2.isPaused) {
            this.backgroundMusic2.pause()
          }
          // Remove ALL event listeners to prevent auto-playing
          this.backgroundMusic2.removeAllListeners('complete')
        }
        this.startBossLevel()
      } else {
        this.spawnLevelWave(levelIndex)
      }
      
      // Close settings panel
      this.closeSettingsPanel()
      
      // Force garbage collection hint for mobile (if available)
      if (typeof window !== 'undefined' && (window as any).gc) {
        try {
          (window as any).gc()
        } catch (e) {
          // Ignore if gc is not available
        }
      }
    } catch (error) {
      console.error('Error in startLevelFromSelection:', error)
      // Try to recover by at least clearing game objects
      try {
        this.balls.clear(true, true)
        this.bullets.clear(true, true)
        this.isGameActive = true
      } catch (recoveryError) {
        // Recovery failed
      }
    }
  }

  private updateStartModalVolumeOption(): void {
    if (!this.startVolumeLabelText || !this.startVolumeStatusText) {
      return
    }
    
    const volumeLabel = VOLUME_LEVELS[this.settings.volumeIndex].label
    // Update label text to include status, centered as one unit
    this.startVolumeLabelText.setText(`Volume: ${volumeLabel}`)
    // Hide status text since it's now part of the label
    this.startVolumeStatusText.setVisible(false)
    // Make the combined label text interactive
    if (!this.startVolumeLabelText.input) {
      this.startVolumeLabelText.setInteractive({ useHandCursor: true })
      this.startVolumeLabelText.on('pointerdown', () => {
        this.playSound('settings-sound', 1.0)
        this.cycleVolume()
        this.updateStartModalVolumeOption()
      })
    }
  }

  private updateStartButtonAppearance(
    label: string,
    padding: { left: number; right: number; top: number; bottom: number },
    isRespawnButton: boolean,
  ): void {
    if (!this.startButtonText) {
      return
    }
    const buttonShadow = this.startPanel?.getData('buttonShadow') as Phaser.GameObjects.Graphics
    const buttonBgGraphics = this.startPanel?.getData('buttonBgGraphics') as Phaser.GameObjects.Graphics
    if (!buttonShadow || !buttonBgGraphics) {
      return
    }

    this.startButtonText.setText(label)
    this.startButtonText.setData('isRespawnButton', isRespawnButton)
    
    // Make respawn button smaller
    if (isRespawnButton) {
      this.startButtonText.setFontSize(28)  // Smaller font for respawn button
    } else {
      this.startButtonText.setFontSize(36)  // Normal font for start button
    }

    const textWidth = this.startButtonText.width
    const textHeight = this.startButtonText.height
    const buttonWidth = textWidth + padding.left + padding.right
    const buttonHeight = textHeight + padding.top + padding.bottom
    const buttonRadius = 6
    // For victory modal, use larger panel height
    const isVictory = this.startPanel?.getData('isVictory') === true
    const isGameOver = this.startPanel?.getData('isGameOver') === true
    const panelHeight = isVictory 
      ? Math.min(this.scale.height * 0.90, 700)  // Expanded from 0.85/650 to 0.90/700 for victory
      : isGameOver
      ? Math.min(this.scale.height * 0.85, 650)  // Expanded for gameOver
      : Math.min(this.scale.height * 0.77, 572)
    
    // Position button below "Now boycott these irl.." text
    // For victory modal, position it below boycott text (shifted up)
    let buttonY
    if (isVictory) {
      const boycottY = panelHeight / 2 - 260  // Match updated boycottY (shifted up from -140)
      buttonY = boycottY + 185  // Button below boycott text (shifted down from 50 to 80)
    } else if (isGameOver) {
      buttonY = panelHeight / 2 - 80  // Shifted up more (from -40 to -60) for gameOver modal
    } else {
      buttonY = panelHeight / 2 - 40  // Moved up from -60 to -40
    }
    const shadowYOffset = 6

    buttonShadow.clear()
    buttonShadow.fillStyle(0x000000, 0.2)
    buttonShadow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2 - shadowYOffset, buttonWidth, buttonHeight, buttonRadius)
    buttonShadow.setPosition(0, buttonY)
    buttonShadow.setData('originalY', buttonY)

    buttonBgGraphics.clear()
    buttonBgGraphics.fillStyle(0xc3d4a5, 1)
    buttonBgGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius)
    buttonBgGraphics.setPosition(0, buttonY)

    this.startButtonText.setY(buttonY)
    this.startButtonText.setData('originalY', buttonY)
  }

  private startGame(respawnOnCurrentLevel: boolean = false): void {
    this.hideStartModal()
    this.physics.world.resume()
    this.tweens.resumeAll()
    this.time.timeScale = 1
    this.isGameActive = true  // Set game as active so music can play

    // Unlock audio context for mobile (required for sound to work)
    this.unlockAudioContext()

    // Ensure sound system is not muted
    if (this.sound) {
      this.sound.setMute(false)
    }
    
    // Start background music when game starts (but not during boss level)
    if (!this.isBossLevel) {
      if (respawnOnCurrentLevel) {
        // Respawn: Resume music if paused, or start if not playing
        const track1Playing = this.backgroundMusic1 && this.backgroundMusic1.isPlaying
        const track2Playing = this.backgroundMusic2 && this.backgroundMusic2.isPlaying
        
        if (track2Playing) {
          this.currentMusicTrack = 2
          if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
            this.backgroundMusic2.resume()
          }
        } else if (track1Playing) {
          this.currentMusicTrack = 1
          if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
            this.backgroundMusic1.resume()
          }
        } else {
          if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
            this.currentMusicTrack = 1
            this.backgroundMusic1.resume()
          } else if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
            this.currentMusicTrack = 2
            this.backgroundMusic2.resume()
          } else {
            this.startBackgroundMusic(false)
          }
        }
      } else {
        // New game start: Start background music
        this.startBackgroundMusic(true)
      }
    }

    // Reset player position to center and clear transition flags
    if (this.player) {
      const worldWidth = this.scale.width
      this.player.setX(worldWidth / 2)
      const body = this.player.body as Phaser.Physics.Arcade.Body | null
      if (body) {
        body.x = worldWidth / 2
        // Ensure body is enabled and ready for movement
        body.enable = true
        body.setImmovable(false)
        body.setAllowGravity(true)
      }
      // Clear any stuck transition flags
      this.isTransitioning = false
      this.justExitedCrouch = false
      this.transitionFrameCount = 0
      // Ensure animation is properly initialized
      this.player.anims.stop()
      this.player.anims.play('bittee-idle', true)
    }
    
    // FIX: Clear all triangles when starting/respawning game (but preserve scoreTriangleText for boss levels)
    this.clearAllTriangles()
    // After clearing, if we're in a boss level, the triangle will be recreated in updateHud

    // Stop celebration music (palestine-8bit) if respawning from victory modal
    if (this.bossPhase === 'victory' && this.bossMusic && this.bossMusic.isPlaying) {
      this.bossMusic.stop()
    }
    
    // Reset levelText styling if respawning from victory (reset Arabic text to normal boss styling)
    if (this.bossPhase === 'victory' && this.levelText) {
      const padding = 24
      // Reset to normal boss level styling (not centered, not huge)
      this.levelText.setX(padding)  // Reset to original left position
      this.levelText.setOrigin(0, 0)  // Reset to original left origin
      this.levelText.setFontSize('140px')  // Normal boss level size (increased for less pixelation)
      this.levelText.setScale(2.8)  // Normal boss level scale (reduced for less pixelation)
      this.levelText.setColor('#7fb069')  // Bright olive green (normal boss color)
      this.levelText.setY(padding + 10)  // Normal boss level position (shifted down)
      this.levelText.setX(padding - 10)  // Shift left
      // Show underline for boss levels
      if (this.levelUnderline) {
        this.levelUnderline.setVisible(true)
        this.levelUnderline.setX(this.levelText.x + this.levelText.width / 2)
        this.levelUnderline.setY(this.levelText.y + this.levelText.height + 20)
      }
      // Reset boss phase to jet so it starts fresh
      this.bossPhase = 'jet'
      this.isBossLevel = true  // Keep as boss level
    }

    // FIX: Start background music when game starts (but not during boss level)
    // When respawning, continue existing music instead of restarting
    // CRITICAL: For new game starts, wait for iOS HTML5 audio activation before starting music
    if (!this.isBossLevel) {
      if (respawnOnCurrentLevel) {
        // Respawn: Resume music if paused, or start if not playing
        const track1Playing = this.backgroundMusic1 && this.backgroundMusic1.isPlaying
        const track2Playing = this.backgroundMusic2 && this.backgroundMusic2.isPlaying
        
        // IMPORTANT: Check track2 first to prevent track1 from starting over track2
        if (track2Playing) {
          this.currentMusicTrack = 2
          // Track 2 is already playing - don't touch it
          // Only resume if paused
          if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
            this.backgroundMusic2.resume()
          }
        } else if (track1Playing) {
          this.currentMusicTrack = 1
          // Track 1 is already playing - don't touch it
          // Only resume if paused
          if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
            this.backgroundMusic1.resume()
          }
        } else {
          // No music playing - check if paused and resume, or start fresh
          if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
            this.currentMusicTrack = 1
            this.backgroundMusic1.resume()
          } else if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
            this.currentMusicTrack = 2
            this.backgroundMusic2.resume()
          } else {
            // No music at all - start it (respawn, so iOS should already be activated)
            this.startBackgroundMusic(false)
          }
        }
      } else {
        // New game start: Start background music
        // Stop any existing music first
        if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
          this.backgroundMusic1.stop()
        }
        if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
          this.backgroundMusic2.stop()
        }
        
        // Start fresh
        this.startBackgroundMusic(true)
      }
    }

    // If respawning, keep current level; otherwise reset everything
    if (respawnOnCurrentLevel) {
      // Keep current level and boss level state, but reset score when respawning after game over
      this.score = 0
      this.lives = this.currentDifficultyConfig.startingLives
      
      // Reset special powers when respawning
      this.resetPowerUps()
      
      // Don't reset contrails on respawn - keep them so player can still use them
      // Don't reset level index or cleanup boss level
        // Preserve boss level state
        if (this.isBossLevel) {
          // Keep boss level background - don't call applyLevel which would reset it
          // Boss level background is already set, just ensure it's correct based on phase
          if (this.backgroundLayer) {
            if (this.bossPhase === 'jet') {
              this.backgroundLayer.setTexture('boss-jet')
            } else if (this.bossPhase.startsWith('tank')) {
              const tankNum = parseInt(this.bossPhase.replace('tank', ''))
              this.backgroundLayer.setTexture(`boss-tank${tankNum}`)
              // Ensure tank health bar exists and is visible when respawning during tank phases
              if (!this.tankHealthBarBgs[0]) {
                this.createTankHealthBar()
              } else {
                // Make sure health bar is visible
                this.tankHealthBarBgs[0].setVisible(true)
              }
              // Reset tank healths only for tanks that haven't been destroyed yet
              // Tank 0 (1st tank) -> section 2 (right), Tank 1 (2nd tank) -> section 1 (middle), Tank 2 (3rd tank) -> section 0 (left)
              // If we're in tank 2 phase, tank 0 is destroyed (keep at 0), reset tank 1 and 2
              // If we're in tank 3 phase, tanks 0 and 1 are destroyed (keep at 0), reset tank 2
              const currentTankIndex = tankNum - 1  // tankNum is 1-based, currentTankIndex is 0-based
              this.currentTankIndex = currentTankIndex  // Update currentTankIndex to match the phase
              for (let i = 0; i < 3; i++) {
                if (i < currentTankIndex) {
                  // This tank has been destroyed, keep health at 0
                  this.tankHealths[i] = 0
                } else {
                  // This tank hasn't been destroyed yet, reset to full health
                  this.tankHealths[i] = 2
                }
              }
              // Ensure health bars exist (they might have been destroyed)
              if (!this.tankHealthBars[0] || !this.tankHealthBars[1] || !this.tankHealthBars[2]) {
                this.createTankHealthBar()
              }
              this.updateTankHealthBar()
            } else if (this.bossPhase === 'victory') {
              this.backgroundLayer.setTexture('boss-victory')
            }
            this.updateBackgroundScale()
          }
        } else {
          // Regular level - apply it normally
          this.applyLevel(this.currentLevelIndex)
        }
    } else {
      // New game - reset everything
      this.score = 0
      this.currentLevelIndex = 0
      this.settings.levelIndex = 0
      this.cleanupBossLevel()
      this.lives = this.currentDifficultyConfig.startingLives
      this.deathCount = 0  // Reset death count for new game
      this.applyLevel(this.currentLevelIndex)
    }
    this.refreshSettingsPanel()
    this.updateHud()

    // Reset Bittee so his feet sit exactly on the new ground line (top blue line).
    this.player.setPosition(this.scale.width / 2, this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
    this.player.setVelocity(0)
    this.player.setScale(this.basePlayerScale, this.basePlayerScale)
    this.facing = 'right'
    this.isThrowing = false
    this.isTaunting = false
    this.isJumping = false
    this.hasDoubleJumped = false
    this.jumpBufferTime = null  // Reset jump buffer
    this.isCrouching = false
    this.justExitedCrouch = false
    this.isInvulnerable = false
    if (this.invulnerabilityTimer) {
      this.invulnerabilityTimer.remove(false)
      this.invulnerabilityTimer = undefined
    }
    this.isPausedForDeath = false  // Reset death pause flag
    this.player.setAlpha(1)
    this.player.clearTint()  // Reset tint in case death fade was active
    this.lastFired = 0
    this.setIdlePose(true)
    this.setupPlayerCollider(0)
    
    // Ensure gravity is enabled when starting/respawning
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
    if (playerBody) {
      playerBody.enable = true  // Re-enable physics body
      playerBody.setImmovable(false)
      playerBody.setAllowGravity(true)
    }

    this.startOverlay?.setVisible(false).disableInteractive()

    this.balls.clear(true, true)
    this.bullets.clear(true, true)
    
    // Only cleanup boss level if starting a new game, not respawning
    if (!respawnOnCurrentLevel) {
      this.cleanupBossLevel()
    }

    if (this.throwButton) {
      const rockIcon = this.throwButton.getData('rockIcon') as Phaser.GameObjects.Image
      const infinityText = this.throwButton.getData('infinityText') as Phaser.GameObjects.Text
      if (rockIcon) {
        rockIcon.setScale(0.25)  // Match the initial scale
        rockIcon.setAlpha(1)
      }
      if (infinityText) {
        infinityText.setScale(1)
        infinityText.setAlpha(1)
      }
    }

    this.isGameActive = true
    
    // If respawning in boss level, restart the current boss phase
    if (respawnOnCurrentLevel && this.isBossLevel) {
      // Reset jet speed and pass count on respawn
      this.jetSpeed = 800
      this.jetPassCount = 0
      
      if (this.bossPhase === 'jet') {
        // Restart jet phase
        this.startJetPhase()
      } else if (this.bossPhase.startsWith('tank')) {
        // Restart current tank phase
        const tankNum = parseInt(this.bossPhase.replace('tank', ''))
        this.startTankPhase(tankNum)
      }
    } else if (!this.isBossLevel) {
      // Spawn level wave for regular levels
      this.spawnLevelWave(this.currentLevelIndex)
    }
    this.totalBubblesDestroyed = 0
  }

  private handleGameOver(): void {
    // Reset death pause flag so modal and buttons work properly
    this.isPausedForDeath = false
    
    this.stopHeartbeat()
    // Stop all powerup sounds when Bittee dies
    this.timeSoundInstances.forEach(instance => {
      if (instance && instance.isPlaying) {
        instance.stop()
      }
    })
    this.timeSoundInstances = []
    const shieldSound = this.soundEffects.get('shield-sound')
    if (shieldSound && shieldSound instanceof Phaser.Sound.BaseSound && shieldSound.isPlaying) {
      shieldSound.stop()
    }
    // Clean up powerups including indicators and sounds
    this.resetPowerUps()
    
    // Increment death count when player dies
    this.deathCount++
    this.lives = 0
    this.updateHud()
    this.balls.clear(true, true)
    this.bullets.clear(true, true)
    // Don't cleanup boss level - keep it so respawn is at same level
    // Only cleanup if not in boss level
    if (!this.isBossLevel) {
      // Cleanup is handled elsewhere for regular levels
    }
    
    // Reset player tint to normal (in case death fade is still active)
    this.player.clearTint()
    
    // Re-enable physics for player (was frozen during death pause)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.enable = true  // Re-enable physics body
      body.setImmovable(false)
      body.setAllowGravity(true)
    }
    
    this.player.setVelocity(0)
    this.setIdlePose(true)

    this.showStartModal('gameOver')
  }

  private handleCampaignComplete(): void {
    this.updateHud()
    this.balls.clear(true, true)
    this.bullets.clear(true, true)
    this.cleanupBossLevel()
    this.player.setVelocity(0)
    this.setIdlePose(true)
    this.showStartModal('victory')
  }

  private advanceLevel(): void {
    try {
      // Prevent multiple calls
      if (this.isAdvancingLevel) {
        return
      }
      this.isAdvancingLevel = true

      // Play level complete sound with error handling
      try {
        this.playSound('level-complete', 0.6)
      } catch (err: unknown) {
        console.warn('Error playing level complete sound:', err)
      }

      if (!this.isGameActive || !this.scene) {
        this.isAdvancingLevel = false
        return
      }
      
      // End powerups (shield and slow motion) when transitioning to next level
      // Use resetPowerUps to clean up everything including indicators and sounds
      try {
        this.resetPowerUps()
      } catch (err: unknown) {
        console.warn('Error resetting powerups:', err)
      }
      
      // Check if we're at moon level (index 11) - transition to boss level
      if (this.currentLevelIndex === 11 && !this.isBossLevel) {
        try {
          this.startBossLevel()
        } catch (err: unknown) {
          console.error('Error starting boss level:', err)
        } finally {
          this.isAdvancingLevel = false
        }
        return
      }
      
      // If in boss level, handle boss phase progression
      if (this.isBossLevel) {
        try {
          this.advanceBossPhase()
        } catch (err: unknown) {
          console.error('Error advancing boss phase:', err)
        } finally {
          this.isAdvancingLevel = false
        }
        return
      }
      
      const lastLevelIndex = 11  // Moon is the last regular level
      if (this.currentLevelIndex >= lastLevelIndex) {
        try {
          this.handleCampaignComplete()
        } catch (err: unknown) {
          console.error('Error handling campaign complete:', err)
        } finally {
          this.isAdvancingLevel = false
        }
        return
      }

      const nextIndex = this.currentLevelIndex + 1
      try {
        this.applyLevel(nextIndex)
        this.refreshSettingsPanel()
        if (this.balls) {
          this.balls.clear(true, true)
        }
        
        // FIX: Clear all triangles when advancing to new level
        this.clearAllTriangles()
        
        this.spawnLevelWave(this.currentLevelIndex)
        
        // Unlock the next level
        this.unlockLevel(nextIndex)
      } catch (err: unknown) {
        console.error('Error advancing level:', err)
      } finally {
        this.isAdvancingLevel = false
      }
    } catch (err: unknown) {
      console.error('Fatal error in advanceLevel:', err)
      this.isAdvancingLevel = false
    }
  }

  private getBubbleDisplaySize(_textureKey: string, scale: number): number {
    // Use a fixed base size for all brands to ensure consistent sizing
    // This prevents different brand PNGs (which may have different dimensions) from displaying at different sizes
    const sourceSize = 256  // Fixed base size - all brands normalized to this
    
    // No brand-specific multipliers - all brands fit the same way
    return sourceSize * scale
  }

  private tryTaunt(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }

    // Safety reset: Clear stuck transition flags when taunt is pressed
    if (this.isTransitioning || this.justExitedCrouch) {
      this.isTransitioning = false
      this.justExitedCrouch = false
      this.transitionFrameCount = 0
    }

    // If already taunting, toggle it off
    if (this.isTaunting) {
      this.isTaunting = false
      body.setAllowGravity(true)
      this.tauntGravityDisabled = false
      this.player.anims.stop()
      // Return to standing animation and ensure position is correct
      this.player.setTexture(BITTEE_SPRITES.stand.key)
      this.player.setY(this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
      if (body) {
        body.updateFromGameObject()
      }
      this.player.anims.play('bittee-stand')
      return
    }

    // Can't start taunt if throwing or jumping
    if (this.isThrowing || this.isJumping) {
      return
    }

    const onGround = this.isPlayerGrounded(body)
    if (!onGround) {
      return
    }

    // Directly set taunt state and play animation like throwing does
    this.isTaunting = true
    this.player.setVelocityX(0)
    if (body) {
      body.setVelocity(0, 0)
      body.setAcceleration(0, 0)
      if (!this.tauntGravityDisabled) {
        body.setAllowGravity(false)
        this.tauntGravityDisabled = true
      }
    }
    this.player.setScale(this.basePlayerScale, this.basePlayerScale)
    this.setupPlayerCollider(0)
    // Ensure Bittee is positioned correctly on ground for taunt
    this.player.setY(this.groundYPosition + PLAYER_FOOT_Y_OFFSET)
    if (body) {
      this.syncPlayerBodyPosition()
    }
    // Directly play taunt like throwing does - stop animation and set texture
    this.player.setFlipX(false)
    // Toggle between taunt and taunt2 each time taunt is triggered
    const tauntKey = this.currentTauntFrame === 1 ? 'bittee-taunt' : 'bittee-taunt2'
    const tauntSprite = this.currentTauntFrame === 1 ? BITTEE_SPRITES.taunt : BITTEE_SPRITES.taunt2
    // Toggle for next time (1 -> 2, 2 -> 1)
    this.currentTauntFrame = this.currentTauntFrame === 1 ? 2 : 1
    // Stop any current animation first (like throwing does)
    this.player.anims.stop()
    // Set texture directly (like throwing does with throw1)
    this.player.setTexture(tauntSprite.key)
    // Play the animation if it exists
    if (this.anims.exists(tauntKey)) {
      this.player.anims.play(tauntKey)
    }
  }

  private startBossLevel(): void {
    // Set isBossLevel FIRST before stopping music to prevent any race conditions
    this.isBossLevel = true
    this.bossPhase = 'jet'
    
    // Stop ALL music except palestine-8bit (boss music)
    // Stop background music completely
    this.stopBackgroundMusic()
    // Force stop and pause all background music tracks to ensure they don't play
    if (this.backgroundMusic1) {
      // Stop multiple times to be sure
      if (this.backgroundMusic1.isPlaying) {
        this.backgroundMusic1.stop()
      }
      this.backgroundMusic1.stop()  // Stop again to be absolutely sure
      if (!this.backgroundMusic1.isPaused) {
        this.backgroundMusic1.pause()
      }
      // Remove ALL event listeners to prevent auto-playing
      this.backgroundMusic1.removeAllListeners('complete')
      // Also remove any other listeners that might exist
      this.backgroundMusic1.removeAllListeners()
    }
    if (this.backgroundMusic2) {
      // Stop multiple times to be sure
      if (this.backgroundMusic2.isPlaying) {
        this.backgroundMusic2.stop()
      }
      this.backgroundMusic2.stop()  // Stop again to be absolutely sure
      if (!this.backgroundMusic2.isPaused) {
        this.backgroundMusic2.pause()
      }
      // Remove ALL event listeners to prevent auto-playing
      this.backgroundMusic2.removeAllListeners('complete')
      // Also remove any other listeners that might exist
      this.backgroundMusic2.removeAllListeners()
    }
    // Stop settings music
    if (this.settingsMusic && this.settingsMusic.isPlaying) {
      this.settingsMusic.stop()
    }
    // Stop heartbeat sound
    if (this.heartbeatSound && this.heartbeatSound.isPlaying) {
      this.heartbeatSound.stop()
    }
    // Stop time sound instances
    this.timeSoundInstances.forEach(instance => {
      if (instance && instance.isPlaying) {
        instance.stop()
      }
    })
    this.timeSoundInstances = []
    // Stop any jet sounds
    const jetSound1 = this.soundEffects.get('jet1')
    const jetSound2 = this.soundEffects.get('jet2')
    if (jetSound1 && jetSound1.isPlaying) {
      jetSound1.stop()
    }
    if (jetSound2 && jetSound2.isPlaying) {
      jetSound2.stop()
    }
    // Start boss music (bittee-finallevel) with proper volume
    if (this.bossMusic && !this.bossMusic.isPlaying) {
      const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
      if (volumeMultiplier > 0) {
        this.bossMusic.play({ volume: 0.25 * volumeMultiplier })
      }
    }
    
    // Clear all balls and bullets
    this.balls.clear(true, true)
    this.bullets.clear(true, true)
    
    // Keep game active during transition so Bittee can move
    this.isGameActive = true
    // Don't pause physics - allow player movement during transition
    
    // Update level label immediately to show "حتى النصر"
    this.refreshLevelLabel()
    
    // Update HUD to hide "Boycotted:" text in boss level
    this.updateHud()
    
    // Transition to gaza.png
    if (this.backgroundLayer) {
      this.backgroundLayer.setTexture('boss-transition')
      this.updateBackgroundScale()
    }
    
    // Use Phaser's camera fade for reliable fade to black
    // Fade to black over 3 seconds
    this.cameras.main.fadeOut(3000, 0, 0, 0)
    
    // After fade to black completes, wait 1 second, then fade back in and start jet phase
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Change background to jet level background while black
      if (this.backgroundLayer) {
        this.backgroundLayer.setTexture('boss-jet')
        this.updateBackgroundScale()
      }
      
      // Wait 1 second while black
      this.time.delayedCall(1000, () => {
        // Fade back in over 1 second
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        
        // Start jet phase when fade in completes
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
          this.startJetPhase()
          this.refreshLevelLabel()  // Update level label to show "حتى النصر"
        })
      })
    })
  }

  private startJetPhase(): void {
    this.bossPhase = 'jet'
    this.isTankPhase = false  // Reset flag - jet phase shoots up
    this.jetHealth = 5
    this.jetDirection = 'right'
    this.jetY = 80  // Start at top of screen
    this.jetSpeed = 800  // Reset speed
    this.jetPassCount = 0  // Reset pass count
    this.jetDestroyed = false  // Reset destroyed flag
    
    // Update level label to show "حتى النصر"
    this.refreshLevelLabel()
    
    // Clean up existing jet and contrails before creating new one
    if (this.jet) {
      this.jet.disableBody(true, true)
      this.jet = undefined
    }
    if (this.jetContrail1) {
      this.jetContrail1.destroy()
      this.jetContrail1 = undefined
    }
    if (this.jetContrail2) {
      this.jetContrail2.destroy()
      this.jetContrail2 = undefined
    }
    if (this.jetTimer) {
      this.jetTimer.remove(false)
      this.jetTimer = undefined
    }
    
    // Change background to gaza1.png
    if (this.backgroundLayer) {
      this.backgroundLayer.setTexture('boss-jet')
      this.updateBackgroundScale()
    }
    
    // Create jet - start off-screen left
    // Check if jet texture exists
    if (!this.textures.exists('jet')) {
      return
    }
    
    this.jet = this.physics.add.sprite(-150, this.jetY, 'jet')
    if (!this.jet) {
      return
    }
    this.jet.setScale(0.4)  // Smaller scale
    this.jet.setVisible(true)
    this.jet.setActive(true)
    this.jet.setDepth(5)  // Above ground, below player
    this.jet.setFlipX(false)  // Start facing right
    this.jet.setData('enemyType', 'jet')
    this.jet.setData('health', this.jetHealth)
    this.enemies.add(this.jet)
    
    // Enable physics body
    const jetBody = this.jet.body as Phaser.Physics.Arcade.Body
    if (jetBody) {
      jetBody.enable = true
      jetBody.setAllowGravity(false)
      jetBody.setCollideWorldBounds(false)
    }
    
    // Create contrail1 and contrail2 attached to jet (spawn immediately)
    this.jetContrail1 = this.add.image(0, 0, 'contrail1')
    this.jetContrail1.setScale(0.6)  // Larger so it's more visible
    this.jetContrail1.setDepth(4)  // Behind jet
    this.jetContrail1.setVisible(true)
    
    this.jetContrail2 = this.add.image(0, 0, 'contrail2')
    this.jetContrail2.setScale(0.4)  // Smaller than contrail1
    this.jetContrail2.setDepth(3)  // Behind contrail1
    this.jetContrail2.setAlpha(0.3)  // Start with some alpha
    this.jetContrail2.setVisible(true)
    
    // Create health bar
    this.createJetHealthBar()
    
    // Start jet movement immediately - fly left to right
    this.jet.setVelocityX(this.jetSpeed)
    this.jet.setX(-300)  // Start further off-screen
    this.jet.setY(this.jetY)
    
    // Play jet1 sound on first pass
    this.jetSoundCount = 0
    this.playJetSound()
    
    // Start continuous camera shake while jet is on screen
    this.startJetShake()
  }

  private createJetHealthBar(): void {
    if (this.jetHealthBar) {
      this.jetHealthBar.destroy()
    }
    if (this.jetHealthBarBg) {
      this.jetHealthBarBg.destroy()
    }
    
    const barWidth = 200
    const barHeight = 20
    const x = this.scale.width / 2
    const y = 50
    
    // Background
    this.jetHealthBarBg = this.add.graphics()
    this.jetHealthBarBg.fillStyle(0x000000, 0.5)
    this.jetHealthBarBg.fillRect(x - barWidth / 2, y - barHeight / 2, barWidth, barHeight)
    this.jetHealthBarBg.setDepth(100)
    
    // Health bar
    this.jetHealthBar = this.add.graphics()
    this.updateJetHealthBar()
  }

  private updateJetHealthBar(): void {
    if (!this.jetHealthBar || !this.jetHealthBarBg) return
    
    const barWidth = 200
    const barHeight = 20
    const x = this.scale.width / 2
    const y = 50
    const healthPercent = this.jetHealth / 5
    
    this.jetHealthBar.clear()
    this.jetHealthBar.fillStyle(0x8b0000, 1)  // Dark red to match end modal score color
    this.jetHealthBar.fillRect(x - barWidth / 2, y - barHeight / 2, barWidth * healthPercent, barHeight)
    this.jetHealthBar.setDepth(101)
  }

  private handleBulletHitEnemy(bullet: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Sprite): void {
    if (!bullet.active || !enemy.active) {
      return
    }
    
    // Only process if bullet hasn't been disabled already
    if (!bullet.body || !bullet.body.enable) {
      return
    }
    
    bullet.disableBody(true, true)
    
    const enemyType = enemy.getData('enemyType') as string
    
    if (enemyType === 'jet') {
      this.jetHealth--
      enemy.setData('health', this.jetHealth)
      this.updateJetHealthBar()
      
      // Make jet blink when hit
      if (enemy && enemy.active) {
        // Blink effect: quickly fade out and back in
        this.tweens.add({
          targets: enemy,
          alpha: { from: 1, to: 0.3 },
          duration: 50,
          yoyo: true,
          repeat: 1,
          ease: 'Power2',
        })
      }
      
      // FIX: Create triangle indicator above jet when hit (only one per fly-by)
      if (!this.jetHitIndicatorActive) {
        this.createEnemyHitIndicator(enemy, 1.2)
        this.jetHitIndicatorActive = true
      }
      
      // Play opp hit sound
      this.playSound('opp-hit', 0.25)
      
      if (this.jetHealth <= 0) {
        // Play opp die sound
        this.playSound('opp-die', 1.0)
        
        // Jet destroyed - start fading contrails
        this.jetDestroyed = true
        if (this.jetTimer) {
          this.jetTimer.remove(false)
        }
        enemy.disableBody(true, true)
        if (this.jetHealthBar) {
          this.jetHealthBar.destroy()
        }
        if (this.jetHealthBarBg) {
          this.jetHealthBarBg.destroy()
        }
        this.jet = undefined
        
        // Transition to tank phase
        this.time.delayedCall(500, () => {
          this.startTankPhase(1)
        })
      }
    } else if (enemyType === 'tank') {
      const tankIndex = enemy.getData('tankIndex') as number
      if (tankIndex === undefined || tankIndex === null || !this.tankHealths[tankIndex]) {
        return
      }
      this.tankHealths[tankIndex]--
      this.updateTankHealthBar()  // Update all sections
      
      // Make tank blink when hit
      const tank = this.tanks[tankIndex]
      if (tank && tank.active) {
        // Blink effect: quickly fade out and back in
        this.tweens.add({
          targets: tank,
          alpha: { from: 1, to: 0.3 },
          duration: 50,
          yoyo: true,
          repeat: 1,
          ease: 'Power2',
        })
      }
      
      // FIX: Create triangle indicator above tank when hit
      // Remove existing indicator and timer if any
      const existingTimer = this.tankHitIndicatorTimers.get(tankIndex)
      if (existingTimer) {
        existingTimer.remove(false)
        this.tankHitIndicatorTimers.delete(tankIndex)
      }
      this.removeEnemyHitIndicator(enemy)
      this.createEnemyHitIndicator(enemy, 1.2)
      
      // Play opp hit sound
      this.playSound('opp-hit', 0.25)
      
      if (this.tankHealths[tankIndex] <= 0) {
        // Play opp die sound
        this.playSound('opp-die', 1.0)
        
        // Tank destroyed
        this.tanksDestroyedCount++  // Increment destroyed count
        enemy.disableBody(true, true)
        this.tanks[tankIndex] = undefined as unknown as Phaser.Physics.Arcade.Sprite
        
        // Don't destroy health bar graphics - just update the combined bar
        // The health bar will show 0 health for this tank section
        // Destroy debug graphics for this tank
        
        // Move to next tank or victory
        if (tankIndex < 2) {
          // Next tank
          this.time.delayedCall(500, () => {
            this.startTankPhase(tankIndex + 2)
          })
        } else {
          // All tanks destroyed - automatically enter taunt mode, then victory!
          // Hide level underline when last tank is destroyed
          if (this.levelUnderline) {
            this.levelUnderline.setVisible(false)
          }
          
          // Destroy tank health bar immediately when last tank is destroyed
          for (let i = 0; i < 3; i++) {
            if (this.tankHealthBars[i]) {
              this.tankHealthBars[i].destroy()
              this.tankHealthBars[i] = undefined as unknown as Phaser.GameObjects.Graphics
            }
            if (this.tankHealthBarBgs[i]) {
              this.tankHealthBarBgs[i].destroy()
              this.tankHealthBarBgs[i] = undefined as unknown as Phaser.GameObjects.Graphics
            }
          }
          
          // Center Arabic text at top, make it larger, and animate it getting darker
          if (this.levelText) {
            const worldWidth = this.scale.width
            this.levelText.setText('حتى النصر')
            this.levelText.setFontSize('220px')  // Much larger (increased to 220px as requested)
            this.levelText.setScale(3.0)  // Adjusted scale to reduce pixelation while keeping size
            this.levelText.setX(worldWidth / 2)  // Center horizontally
            this.levelText.setOrigin(0.5, 0)  // Center origin
            this.levelText.setY(24)  // Top padding
            this.levelText.setColor('#7fb069')  // Start with bright olive green
            
            // Animate text getting darker over time until victory modal shows
            // Start from bright olive green (#7fb069) and fade to dark olive green (#4a5d3f)
            // Use manual color interpolation since Phaser doesn't support color tweening directly
            const startColorObj = Phaser.Display.Color.ValueToColor(0x7fb069)
            const endColorObj = Phaser.Display.Color.ValueToColor(0x4a5d3f)  // Dark olive green
            // Access RGB properties from the Color object
            const startR = (startColorObj as any).r ?? ((startColorObj as any).color >> 16) & 0xff
            const startG = (startColorObj as any).g ?? ((startColorObj as any).color >> 8) & 0xff
            const startB = (startColorObj as any).b ?? (startColorObj as any).color & 0xff
            const endR = (endColorObj as any).r ?? ((endColorObj as any).color >> 16) & 0xff
            const endG = (endColorObj as any).g ?? ((endColorObj as any).color >> 8) & 0xff
            const endB = (endColorObj as any).b ?? (endColorObj as any).color & 0xff
            const colorData = { r: startR, g: startG, b: startB }
            
            this.tweens.add({
              targets: colorData,
              r: endR,
              g: endG,
              b: endB,
              duration: 2000,  // 2 seconds to fade to black
              ease: 'Linear',
              onUpdate: () => {
                const colorValue = Phaser.Display.Color.GetColor(
                  Math.round(colorData.r),
                  Math.round(colorData.g),
                  Math.round(colorData.b)
                )
                this.levelText.setColor(`#${colorValue.toString(16).padStart(6, '0')}`)
              },
            })
          }
          
          // FIX: Enter taunt mode when final tank (tank3, index 2) is destroyed
          // Force taunt mode immediately - don't wait for ground check
          const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
          
          // Force taunt mode but allow gravity so Bittee falls to ground
          this.isTaunting = true
          this.player.setVelocityX(0)
          if (playerBody) {
            playerBody.setVelocityX(0)  // Only stop horizontal velocity
            playerBody.setAcceleration(0, 0)
            playerBody.setAllowGravity(true)  // Allow gravity so Bittee falls
          }
          this.tauntGravityDisabled = false  // Allow gravity during victory taunt
          
          // Play taunt animation
          const tauntKey = this.currentTauntFrame === 1 ? 'bittee-taunt' : 'bittee-taunt2'
          const tauntSprite = this.currentTauntFrame === 1 ? BITTEE_SPRITES.taunt : BITTEE_SPRITES.taunt2
          this.player.setTexture(tauntSprite.key)
          this.player.anims.play(tauntKey, true)
          
          // Prevent any movement - only allow flipping with arrow keys
          this.player.setFlipX(false)  // Start facing right
          
          // Start victory phase after a short delay
          this.time.delayedCall(500, () => {
            this.startVictoryPhase()
          })
        }
      }
    }
  }

  private startTankPhase(tankNumber: number): void {
    this.bossPhase = `tank${tankNumber}` as 'tank1' | 'tank2' | 'tank3'
    this.currentTankIndex = tankNumber - 1
    this.isTankPhase = true  // Enable down-shooting mode for tank phase
    // Reset tanks destroyed count when starting new tank phase (only reset on first tank)
    if (tankNumber === 1) {
      this.tanksDestroyedCount = 0
    }
    
    // FIX: Update HUD immediately when phase changes to show correct triangle text
    this.updateHud()
    
    // Destroy all previous tanks - only show current tank (keep the bottom one)
    for (let i = 0; i < this.tanks.length; i++) {
      if (this.tanks[i]) {
        this.tanks[i].disableBody(true, true)
        this.tanks[i].destroy()
        this.tanks[i] = undefined as unknown as Phaser.Physics.Arcade.Sprite
        // Destroy health bars for previous tanks
        if (this.tankHealthBars[i]) {
          this.tankHealthBars[i].destroy()
          this.tankHealthBars[i] = undefined as unknown as Phaser.GameObjects.Graphics
        }
        if (this.tankHealthBarBgs[i]) {
          this.tankHealthBarBgs[i].destroy()
          this.tankHealthBarBgs[i] = undefined as unknown as Phaser.GameObjects.Graphics
        }
        // Destroy debug graphics for previous tanks
      }
    }
    
    // Change background
    const bgKey = `boss-tank${tankNumber}`
    if (this.backgroundLayer) {
      this.backgroundLayer.setTexture(bgKey)
      this.updateBackgroundScale()
    }
    
    // Create tank - positioned on ground level, 15% larger, spawn at edge opposite from Bittee
    const worldWidth = this.scale.width
    const playerX = this.player.x
    // Spawn further inside (100px from edge) to give tank room to move
    const minSpawnX = 100
    const maxSpawnX = worldWidth - 100
    const spawnX = playerX < worldWidth / 2 ? maxSpawnX : minSpawnX  // Spawn at allowed edge
    
    // Create tank sprite
    const tank = this.physics.add.sprite(spawnX, 0, 'tank')
    if (!tank) {
      return
    }
    // Set scale first (15% larger than 0.4)
    tank.setScale(0.46)  // 15% larger than 0.4 (0.4 * 1.15 = 0.46)
    // Set origin to bottom center
    tank.setOrigin(0.5, 1)
    // Position tank so bottom sits on ground
    // Since origin is at bottom (0.5, 1), Y position represents where the bottom of the tank is
    // groundYPosition is the top of the ground, move down to sit on ground
    tank.setY(this.groundYPosition + 170)  // Move down 170 pixels to sit on ground
    tank.setVisible(true)
    // Face toward Bittee on spawn (flip when tank is to the right of Bittee)
    tank.setFlipX(spawnX > playerX)
    tank.setActive(true)
    tank.setAlpha(1)  // Ensure solid, no transparency
    tank.setDepth(5)  // Above ground, below player
    tank.setData('enemyType', 'tank')
    tank.setData('tankIndex', this.currentTankIndex)
    tank.setData('health', 2)
    this.tanks[this.currentTankIndex] = tank
    this.tankHealths[this.currentTankIndex] = 2
    // Initialize direction based on spawn position relative to player
    const initialDirection = spawnX > playerX ? -1 : 1  // If tank is to the right of player, move left
    this.tankDirections[this.currentTankIndex] = initialDirection
    this.tankDirectionLockTimes[this.currentTankIndex] = 0  // Initialize lock time (no lock initially)
    this.tankShakeTimers[this.currentTankIndex] = 0  // Initialize shake timer
    this.enemies.add(tank)
    
    // Enable physics body - use full collision box for bullet detection
    const tankBody = tank.body as Phaser.Physics.Arcade.Body
    if (tankBody) {
      tankBody.enable = true
      // Let the tank move under our manual velocity control, but make it solid
      tankBody.setAllowGravity(false)
      tankBody.setImmovable(true)  // Tank acts like a solid obstacle for Bittee
      tankBody.setCollideWorldBounds(false)
      tankBody.setBounce(0, 0)
      // Ensure body is active and can move - initialize velocity
      tankBody.setVelocity(0, 0)
      
      // Create debug graphics to show hit area
      
      // Initialize collider and debug box for the initial direction
      this.updateTankCollider(this.currentTankIndex, initialDirection)
    }
    // We no longer use a physics collider with the ground for tanks.
    // Instead, we manually keep the tank's Y locked to ground level in moveTank().
    
    // Create combined health bar for all tanks (only create once)
    if (tankNumber === 1) {
      // Initialize all tank healths to 2 (full health)
      this.tankHealths[0] = 2
      this.tankHealths[1] = 2
      this.tankHealths[2] = 2
      this.createTankHealthBar()
    } else {
      // Ensure health bars exist (they might have been destroyed)
      if (!this.tankHealthBarBgs[0] || !this.tankHealthBars[0] || !this.tankHealthBars[1] || !this.tankHealthBars[2]) {
        this.createTankHealthBar()
      }
      // Just update the existing combined bar
      this.updateTankHealthBar()
    }
    
    // Ensure body is properly positioned after setting offset
    if (tankBody) {
      tankBody.updateFromGameObject()
    }
    
    // Set initial velocity immediately to ensure tank starts moving
    // Use both tank.setVelocityX() and tankBody.setVelocityX() to ensure it works
    const speed = 120
    const velocityX = initialDirection > 0 ? speed : -speed
    tank.setVelocityX(velocityX)
    if (tankBody) {
      tankBody.setVelocityX(velocityX)
      // Force update to ensure velocity is applied
      tankBody.updateFromGameObject()
    }
    
    // Call moveTank() immediately to ensure movement starts
    // This will be called again in update() loop, but calling it here ensures immediate movement
    this.moveTank(this.currentTankIndex)
  }

  private createTankHealthBar(): void {
    // Destroy existing health bars if they exist
    for (let i = 0; i < 3; i++) {
      if (this.tankHealthBars[i]) {
        this.tankHealthBars[i].destroy()
        this.tankHealthBars[i] = undefined as unknown as Phaser.GameObjects.Graphics
      }
      if (this.tankHealthBarBgs[i]) {
        this.tankHealthBarBgs[i].destroy()
        this.tankHealthBarBgs[i] = undefined as unknown as Phaser.GameObjects.Graphics
      }
    }
    
    // Create one combined health bar with 3 sections
    const totalBarWidth = 300  // Wider bar (was 150)
    const barHeight = 15
    const x = this.scale.width / 2
    const y = 60  // Single bar at fixed position
    
    // Create background for entire bar
    this.tankHealthBarBgs[0] = this.add.graphics()
    this.tankHealthBarBgs[0].fillStyle(0x000000, 0.5)
    this.tankHealthBarBgs[0].fillRect(x - totalBarWidth / 2, y - barHeight / 2, totalBarWidth, barHeight)
    this.tankHealthBarBgs[0].setDepth(100)
    
    // Create health bar graphics for each section
    for (let i = 0; i < 3; i++) {
      this.tankHealthBars[i] = this.add.graphics()
    }
    
    // Update all sections
    this.updateTankHealthBar()
  }

  private updateTankHealthBar(): void {
    if (!this.tankHealthBarBgs[0]) return
    
    const totalBarWidth = 300  // Wider bar
    const barHeight = 15
    const gapWidth = 4  // Small gap between sections
    const sectionWidth = (totalBarWidth - (gapWidth * 2)) / 3  // Each section is 1/3 of total width minus gaps
    const x = this.scale.width / 2
    const y = 60  // Single bar at fixed position
    
    // Clear all health bar graphics
    for (let i = 0; i < 3; i++) {
      if (this.tankHealthBars[i]) {
        this.tankHealthBars[i].clear()
      }
    }
    
    // Draw each section (1/3 of the bar for each tank)
    // Health bar mapping: Tank 0 -> Section 2 (right), Tank 1 -> Section 1 (middle), Tank 2 -> Section 0 (left)
    // When tanks are destroyed, remove from right side: first tank destroyed removes section 2, second removes section 1, third removes section 0
    for (let i = 0; i < 3; i++) {
      if (!this.tankHealthBars[i]) continue
      
      // Map tank index to section: tank 0 -> section 2 (right), tank 1 -> section 1 (middle), tank 2 -> section 0 (left)
      const sectionIndex = 2 - i  // Reverse order: 2, 1, 0
      
      // Get health for this tank (use health value, not existence check)
      const tankHealth = this.tankHealths[i] || 0
      const healthPercent = tankHealth / 2  // Each tank has 2 health
      const sectionHealthWidth = sectionWidth * healthPercent
      
      // Calculate position of this section
      // Section 0: left, Section 1: middle, Section 2: right
      const sectionX = x - totalBarWidth / 2 + (sectionIndex * (sectionWidth + gapWidth))
      
      // Draw health for this section (only if has health)
      if (sectionHealthWidth > 0) {
        this.tankHealthBars[i].fillStyle(0x8b0000, 1)  // Dark red to match end modal score color
        this.tankHealthBars[i].fillRect(sectionX, y - barHeight / 2, sectionHealthWidth, barHeight)
        this.tankHealthBars[i].setDepth(101)
      }
    }
  }

  private moveTank(tankIndex: number): void {
    const tank = this.tanks[tankIndex]
    if (!tank || !tank.active) return
    // If game is not active (Bittee dead / respawn modal) or paused, stop moving tanks
    if (!this.isGameActive || this.isPausedForSettings) {
      tank.setVelocityX(0)
      const body = tank.body as Phaser.Physics.Arcade.Body | undefined
      if (body) {
        body.setVelocityX(0)
      }
      return
    }
    
    const speed = 120  // Tank horizontal speed (increased for faster movement)
    const tankBody = tank.body as Phaser.Physics.Arcade.Body
    
    // Track position to detect if tank is truly stuck (not moving despite velocity)
    const lastTankX = this.tankLastPositions[tankIndex] ?? tank.x
    const tankMoved = Math.abs(tank.x - lastTankX) > 0.1
    this.tankLastPositions[tankIndex] = tank.x
    this.tankStuckFrames[tankIndex] = tankMoved ? 0 : (this.tankStuckFrames[tankIndex] || 0) + 1
    
    // Determine desired direction based on player position
    const playerX = this.player.x
    const tankX = tank.x
    const distance = playerX - tankX
    let direction = distance >= 0 ? 1 : -1
    
    // If the body is blocked by world bounds or other collisions, flip direction
    if (tankBody) {
      if (tankBody.blocked.left) {
        direction = 1
      } else if (tankBody.blocked.right) {
        direction = -1
      }
    }
    
    // Apply horizontal velocity based on final direction
    const targetVelX = direction * speed
    tank.setVelocityX(targetVelX)
    if (tankBody) {
      tankBody.setVelocityX(targetVelX)
    }
    
    // Store direction so other logic (like bullets) can reference it
    const previousDirection = this.tankDirections[tankIndex] ?? direction
    const currentTime = this.time.now
    const flipDelay = 400  // Less than half a second (400ms)
    
    // Check if direction changed (tank needs to flip)
    const directionChanged = previousDirection !== direction
    const lockTime = this.tankDirectionLockTimes[tankIndex] ?? 0
    
    if (directionChanged && currentTime < lockTime) {
      // Direction changed but we're still in lock period - keep previous direction
      // Don't update stored direction yet, keep moving in previous direction
      const lockedDirection = previousDirection
      this.tankDirections[tankIndex] = lockedDirection
      // Keep velocity in locked direction
      const lockedVelX = lockedDirection * speed
      tank.setVelocityX(lockedVelX)
      if (tankBody) {
        tankBody.setVelocityX(lockedVelX)
      }
      // Don't flip yet - keep current flip state
    } else {
      // Direction didn't change OR lock period expired - update direction and flip
      this.tankDirections[tankIndex] = direction
      
      if (directionChanged) {
        // Direction changed and lock expired - set new lock time and flip
        this.tankDirectionLockTimes[tankIndex] = currentTime + flipDelay
        // Track flip time for hit indicator removal
        this.tankLastFlipTime.set(tankIndex, currentTime)
        
        // Remove hit indicator a couple seconds after flip
        const tank = this.tanks[tankIndex]
        if (tank && tank.active) {
          // Cancel existing timer if any
          const existingTimer = this.tankHitIndicatorTimers.get(tankIndex)
          if (existingTimer) {
            existingTimer.remove(false)
          }
          // Create new timer to remove indicator after 2 seconds
          const removeTimer = this.time.delayedCall(2000, () => {
            this.removeEnemyHitIndicator(tank)
            this.tankHitIndicatorTimers.delete(tankIndex)
          })
          this.tankHitIndicatorTimers.set(tankIndex, removeTimer)
        }
      }
      
      // Flip sprite based on direction
      tank.setFlipX(direction < 0)
    }
    
    // Update collider and debug box for current direction:
    // - Shifted down toward tank tracks (bottom-aligned)
    // - Positioned on the "front" side of the tank (opposite ends when flipped)
    this.updateTankCollider(tankIndex, direction)
    
    // Camera shake while tank is moving (keep this, but REMOVE tank tween shake so physics can move freely)
    const worldWidth = this.scale.width
    const atEdge = tank.x <= 50 || tank.x >= worldWidth - 50
    if (!atEdge && Math.abs(distance) > 10) {
      // Subtle camera shake while tank is moving
      this.cameras.main.shake(50, 0.0015)
    }
  }

  // Update a tank's collider so that:
  // - The hit box is shifted down toward the tracks (bottom-aligned to ground)
  // - The box is at the BACK of the tank, but:
  //   * For facing right (default): use the original position the user liked
  //   * For facing left (flipped): mirror that position horizontally
  private updateTankCollider(tankIndex: number, _direction: number): void {
    const tank = this.tanks[tankIndex]
    if (!tank || !tank.active) return
    
    const body = tank.body as Phaser.Physics.Arcade.Body | undefined
    if (!body) return
    
    const tankWidth = tank.displayWidth
    const tankHeight = tank.displayHeight
    
    // Hit area covers most of the tank, but we keep it a bit inset
    const hitAreaWidth = tankWidth * 0.8
    const hitAreaHeight = tankHeight * 0.58
    
    // Bottom-align vertically so bottom edge visually hugs the ground
    // Push even lower so the box sits right on the ground line
    const extraBottomOffset = tankHeight * 0.45  // Increased more to push down further
    const offsetY = tankHeight - hitAreaHeight + extraBottomOffset
    
    // Horizontal placement:
    // For facing RIGHT (flipX === false): shift right more
    // For facing LEFT (flipX === true): shift RIGHT even more (opposite side)
    const centerOffsetX = (tankWidth - hitAreaWidth) / 2
    const baseRightShift = tankWidth * 0.24  // Increased base rightward shift for both directions
    const additionalShift = tankWidth * 0.75  // Increased additional shift when facing left
    // When facing right: shift right more (center + base shift)
    // When facing left: shift right even more (center + base shift + additional shift)
    const offsetX = tank.flipX ? centerOffsetX + baseRightShift + additionalShift : centerOffsetX + baseRightShift
    
    body.setSize(hitAreaWidth, hitAreaHeight)
    body.setOffset(offsetX, offsetY)
  }

  private startVictoryPhase(): void {
    this.bossPhase = 'victory'
    
    // Hide score text in top right during victory celebration
    this.scoreText?.setVisible(false)
    this.scoreTriangleText?.setVisible(false)
    
    // Ensure level underline is hidden during victory
    if (this.levelUnderline) {
      this.levelUnderline.setVisible(false)
    }
    
    // Ensure Arabic text is large, dark, and centered at top
    if (this.levelText) {
      const worldWidth = this.scale.width
      this.levelText.setText('حتى النصر')
      this.levelText.setFontSize('220px')  // Much larger (increased to 220px as requested)
      this.levelText.setScale(3.0)  // Adjusted scale to reduce pixelation while keeping size
      this.levelText.setX(worldWidth / 2)
      this.levelText.setOrigin(0.5, 0)
      this.levelText.setY(24)
      this.levelText.setColor('#4a5d3f')  // Dark olive green
    }
    
    // Stop final level music and start celebration music (palestine-8bit)
    if (this.bossMusic && this.bossMusic.isPlaying) {
      this.bossMusic.stop()
    }
    // Play palestine-8bit for celebration
    if (this.cache.audio.exists('palestine-8bit')) {
      const celebrationMusic = this.sound.add('palestine-8bit', {
        loop: true,
        volume: 0.25, // Same volume as other music
      })
      const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
      if (volumeMultiplier > 0) {
        celebrationMusic.play({ volume: 0.25 * volumeMultiplier })
      }
      // Store reference to stop it later if needed
      this.bossMusic = celebrationMusic
    }
    
    // Hide tank health bar during victory celebration
    if (this.tankHealthBarBgs[0]) {
      this.tankHealthBarBgs[0].setVisible(false)
    }
    for (let i = 0; i < 3; i++) {
      if (this.tankHealthBars[i]) {
        this.tankHealthBars[i].setVisible(false)
      }
    }
    
    // Clear all contrails when transitioning to victory phase
    // Clean up active contrails
    if (this.jetContrail1) {
      this.jetContrail1.destroy()
      this.jetContrail1 = undefined
    }
    if (this.jetContrail2) {
      this.jetContrail2.destroy()
      this.jetContrail2 = undefined
    }
    // Clean up left-behind contrails
    this.jetContrails.forEach((contrail) => {
      if (contrail.contrail1) {
        contrail.contrail1.destroy()
      }
      if (contrail.contrail2) {
        contrail.contrail2.destroy()
      }
    })
    this.jetContrails = []
    
    // Change background to gaza5.png
    if (this.backgroundLayer) {
      this.backgroundLayer.setTexture('boss-victory')
      this.updateBackgroundScale()
    }
    
    // Stop player movement and make bittee taunt
    const body = this.player.body as Phaser.Physics.Arcade.Body | null
    if (body) {
      body.setVelocity(0, 0)
      body.setAcceleration(0, 0)
    }
    this.player.setVelocity(0, 0)
    
    // Force taunt pose
    if (!this.isTaunting) {
      this.tryTaunt()
    }
    
    // After 1 second, transition to gaza6
    this.time.delayedCall(1000, () => {
      if (this.backgroundLayer) {
        this.backgroundLayer.setTexture('boss-victory2')
        this.updateBackgroundScale()
      }
      
      // After 1 second, transition to gaza7
      this.time.delayedCall(1000, () => {
        if (this.backgroundLayer) {
          this.backgroundLayer.setTexture('boss-victory3')
          this.updateBackgroundScale()
        }
        
        // After 1 second, show victory modal
        this.time.delayedCall(1000, () => {
          this.handleCampaignComplete()
        })
      })
    })
  }

  private advanceBossPhase(): void {
    // This is called when a boss phase completes
    // Phases are handled individually in handleBulletHitEnemy
  }

  private cleanupBossLevel(): void {
    this.isBossLevel = false
    // Don't reset bossPhase if we're in victory phase - keep it as 'victory' so music continues
    if (this.bossPhase !== 'victory') {
      this.bossPhase = 'jet'
    }
    this.isTankPhase = false  // Reset flag
    
    // Don't stop boss music if we're in victory phase (celebration music should keep playing)
    // Only stop if not in victory phase
    if (this.bossPhase !== 'victory') {
      if (this.bossMusic && this.bossMusic.isPlaying) {
        this.bossMusic.stop()
      }
      // Only resume background music if game is active (not in settings or start modal, and not during boss level)
      if (this.isGameActive && !this.isPausedForSettings && !this.isBossLevel) {
        this.startBackgroundMusic()
      }
    }
    
    // Clean up jet
    if (this.jet) {
      this.jet.disableBody(true, true)
      this.jet = undefined
    }
    if (this.jetTimer) {
      this.jetTimer.remove(false)
      this.jetTimer = undefined
    }
    if (this.jetHealthBar) {
      this.jetHealthBar.destroy()
      this.jetHealthBar = undefined
    }
    if (this.jetHealthBarBg) {
      this.jetHealthBarBg.destroy()
      this.jetHealthBarBg = undefined
    }
    if (this.jetContrail1) {
      this.jetContrail1.destroy()
      this.jetContrail1 = undefined
    }
    if (this.jetContrail2) {
      this.jetContrail2.destroy()
      this.jetContrail2 = undefined
    }
    // Clean up left-behind contrails
    this.jetContrails.forEach((contrail) => {
      if (contrail.contrail1) {
        contrail.contrail1.destroy()
      }
      if (contrail.contrail2) {
        contrail.contrail2.destroy()
      }
    })
    this.jetContrails = []
    this.jetSpeed = 800
    this.jetPassCount = 0
    this.jetDestroyed = false
    
    // Clean up tanks
    for (let i = 0; i < this.tanks.length; i++) {
      if (this.tanks[i]) {
        this.tanks[i].disableBody(true, true)
        this.tanks[i] = undefined as unknown as Phaser.Physics.Arcade.Sprite
      }
      if (this.tankHealthBars[i]) {
        this.tankHealthBars[i].destroy()
        this.tankHealthBars[i] = undefined as unknown as Phaser.GameObjects.Graphics
      }
      if (this.tankHealthBarBgs[i]) {
        this.tankHealthBarBgs[i].destroy()
        this.tankHealthBarBgs[i] = undefined as unknown as Phaser.GameObjects.Graphics
      }
      // Destroy debug graphics
    }
    this.tanks = []
    this.tankHealthBars = []
    this.tankHealthBarBgs = []
    this.tankHealths = []
    this.tankDirections = []
    this.tankDirectionLockTimes = []
    this.tankShakeTimers = []
    this.currentTankIndex = 0
    
    // Clear enemies group
    if (this.enemies) {
      this.enemies.clear(true, true)
    }
  }

  private updateBossLevel(): void {
    if (!this.isBossLevel) return
    
    // Update jet movement and edge detection
    if (this.jet && this.jet.active && this.bossPhase === 'jet') {
      const worldWidth = this.scale.width
      const playerY = this.player.y
      const bitteeHeadY = playerY - BITTEE_TARGET_HEIGHT
      
      // Keep jet at current Y
      this.jet.setY(this.jetY)
      
      // Update contrail1 and contrail2 positions to follow jet (update every frame for smooth following)
      if (this.jetContrail1 && this.jet && this.jet.active) {
        // Position contrail1 so its side/edge is attached to the back of the jet
        // Get the jet's width (accounting for scale) and contrail1's width
        const jetWidth = this.jet.displayWidth  // Actual displayed width
        const contrail1Width = this.jetContrail1.displayWidth  // Actual displayed width
        // Position so the front edge of contrail1 touches the back edge of jet
        const offsetX1 = this.jetDirection === 'right' 
          ? -(jetWidth / 2 + contrail1Width / 2)  // Back of jet (left side) + half contrail width
          : (jetWidth / 2 + contrail1Width / 2)    // Back of jet (right side) + half contrail width
        this.jetContrail1.setX(this.jet.x + offsetX1)
        this.jetContrail1.setY(this.jet.y)
        this.jetContrail1.setFlipX(this.jet.flipX)
        // Ensure contrail1 is always visible when jet is active
        if (!this.jetContrail1.visible) {
          this.jetContrail1.setVisible(true)
        }
      }
      
      if (this.jetContrail2 && this.jet && this.jet.active) {
        // Position contrail2 even further behind the jet
        const offsetX2 = this.jetDirection === 'right' ? -120 : 120  // Pull back even more behind jet
        this.jetContrail2.setX(this.jet.x + offsetX2)
        this.jetContrail2.setY(this.jet.y)
        this.jetContrail2.setFlipX(this.jet.flipX)
        // Ensure contrail2 is always visible when jet is active
        if (!this.jetContrail2.visible) {
          this.jetContrail2.setVisible(true)
        }
      }
      
      // Check if jet reached edge (completely off screen)
      const offScreenDistance = 300  // Distance off screen before triggering
      if (this.jetDirection === 'right' && this.jet.x >= worldWidth + offScreenDistance) {
        // Reached right edge, create contrail and wait 2 seconds, then reverse
        this.jet.setVelocityX(0)
        if (this.jetContrail1) {
          // Leave contrail1 behind (Bittee can jump on it), create contrail2 that will fade away
          const contrail1X = this.jetContrail1.x
          const contrail1Y = this.jetContrail1.y
          // Create a physics-enabled contrail1 that Bittee can jump on
          const leftBehindContrail1 = this.physics.add.image(contrail1X, contrail1Y, 'contrail1')
          leftBehindContrail1.setScale(0.6)  // Same scale as active contrail1
          leftBehindContrail1.setAlpha(1)
          leftBehindContrail1.setDepth(4)
          leftBehindContrail1.setFlipX(this.jet.flipX)
          // Enable physics body for contrail1 so Bittee can jump on it
          const contrail1Body = leftBehindContrail1.body as Phaser.Physics.Arcade.Body
          if (contrail1Body) {
            contrail1Body.enable = true
            contrail1Body.setImmovable(true)
            contrail1Body.setAllowGravity(false)
            // Make collision box match the visual size
            contrail1Body.setSize(leftBehindContrail1.displayWidth, leftBehindContrail1.displayHeight)
          }
          // Add one-way platform collider: can jump up through, can land on, can crouch down through
          this.physics.add.collider(
            this.player,
            leftBehindContrail1,
            undefined,  // No callback needed
            (playerObj: any, contrailObj: any) => {
              // Custom collision check for one-way platform behavior
              const player = playerObj as Phaser.Physics.Arcade.Sprite
              const contrail = contrailObj as Phaser.Physics.Arcade.Image
              if (!player || !contrail) return false
              
              const playerBody = player.body as Phaser.Physics.Arcade.Body
              const contrailBody = contrail.body as Phaser.Physics.Arcade.Body
              
              if (!playerBody || !contrailBody) return false
              
              // Get player position relative to contrail
              const playerBottom = playerBody.y + playerBody.height / 2
              const playerTop = playerBody.y - playerBody.height / 2
              const contrailTop = contrailBody.y - contrailBody.height / 2
              const contrailBottom = contrailBody.y + contrailBody.height / 2
              
              // Disable collision if:
              // 1. Player is moving up (jumping up through) - always allow passing through
              if (playerBody.velocity.y < 0) {
                // Moving up - allow passing through
                return false
              }
              
              // 2. Player is crouching (going down through)
              if (this.isCrouching) {
                return false
              }
              
              // 3. Player is completely below the contrail (shouldn't collide from below)
              if (playerTop > contrailBottom + 5) {
                return false
              }
              
              // Only allow collision if player is falling onto or standing on the contrail
              // Player must be above or overlapping with the contrail
              if (playerBottom > contrailTop - 10) {
                // Player is at or above contrail top (with buffer)
                // Allow collision if falling or at rest (not jumping up)
                if (playerBody.velocity.y >= 0) {
                  // Falling or at rest - allow collision
                  return true
                }
              }
              
              // Default: no collision
              return false
            }
          )
          
          // Create contrail2 that will fade away
          const contrail2 = this.add.image(contrail1X, contrail1Y, 'contrail2')
          contrail2.setScale(0.3)
          contrail2.setAlpha(0.3)  // Start with some alpha so it shows earlier
          contrail2.setDepth(4)
          // Flip contrail2 to match jet direction
          contrail2.setFlipX(this.jet.flipX)
          // Add fade speed (faster fade for contrail2s)
          const fadeSpeed = 0.02  // Faster fade for contrail2s
          this.jetContrails.push({ contrail1: leftBehindContrail1, contrail2, x: contrail1X, y: contrail1Y, scale: 0.3, alpha: 1, fadeSpeed })
          
          // Hide active contrails
          if (this.jetContrail1) {
            this.jetContrail1.setVisible(false)
          }
          if (this.jetContrail2) {
            this.jetContrail2.setVisible(false)
          }
        }
        
        if (!this.jetTimer) {
          this.jetTimer = this.time.delayedCall(2000, () => {
            if (this.jet && this.jet.active) {
              this.jetDirection = 'left'
              // Increase speed for next pass
              this.jetPassCount++
              this.jetSpeed = 800 + (this.jetPassCount * 100)  // Increase by 100 each pass
              
              // Move down more each pass (closer to player) - larger gaps between contrails
              // After 3 passes, on 4th pass jet should be low enough to hit player
              // For first 3 passes, move down progressively: pass 1->2: 100px, pass 2->3: 120px, pass 3->4: 140px
              if (this.jetPassCount < 3) {
                // First 3 passes: move down progressively
                const downAmount = 80 + (this.jetPassCount * 40)  // Pass 1->2: 120, Pass 2->3: 160
                this.jetY = Math.min(this.jetY + downAmount, bitteeHeadY - 20)
              } else {
                // On 4th pass (jetPassCount = 3), position jet low enough to hit player
                this.jetY = bitteeHeadY - 10  // Just above bittee's head, will hit on collision
              }
              // Play jet sound (alternate between jet1 and jet2)
              this.playJetSound()
              // Start flying right to left, flipped horizontally
              this.jet.setFlipX(true)
              this.jet.setVelocityX(-this.jetSpeed)
              this.jet.setX(worldWidth + offScreenDistance)
              this.jet.setY(this.jetY)
              
              // Reset hit indicator flag for new fly-by
              this.jetHitIndicatorActive = false
              // Remove any existing hit indicator when jet turns around
              if (this.jet) {
                this.removeEnemyHitIndicator(this.jet)
              }
              
              // Start continuous camera shake while jet is on screen
              this.startJetShake()
              
              // Show contrails again
              if (this.jetContrail1) {
                this.jetContrail1.setVisible(true)
              }
              if (this.jetContrail2) {
                this.jetContrail2.setVisible(true)
              }
              
              this.jetTimer = undefined
            }
          })
        }
      } else if (this.jetDirection === 'left' && this.jet.x <= -offScreenDistance) {
        // Reached left edge, create contrail and wait 2 seconds, then reverse
        this.jet.setVelocityX(0)
        if (this.jetContrail1) {
          // Leave contrail1 behind (visual only), create contrail2 that will fade away
          const contrail1X = this.jetContrail1.x
          const contrail1Y = this.jetContrail1.y
          // Create visual-only contrail1 (no physics/collision)
          const leftBehindContrail1 = this.add.image(contrail1X, contrail1Y, 'contrail1')
          leftBehindContrail1.setScale(0.6)  // Same scale as active contrail1
          leftBehindContrail1.setAlpha(1)
          leftBehindContrail1.setDepth(4)
          leftBehindContrail1.setFlipX(this.jet.flipX)
          
          // Create contrail2 that will fade away
          const contrail2 = this.add.image(contrail1X, contrail1Y, 'contrail2')
          contrail2.setScale(0.3)
          contrail2.setAlpha(0.3)  // Start with some alpha so it shows earlier
          contrail2.setDepth(4)
          // Flip contrail2 to match jet direction
          contrail2.setFlipX(this.jet.flipX)
          // Add fade speed (faster fade for contrail2s)
          const fadeSpeed = 0.02  // Faster fade for contrail2s
          this.jetContrails.push({ contrail1: leftBehindContrail1, contrail2, x: contrail1X, y: contrail1Y, scale: 0.3, alpha: 1, fadeSpeed })
          
          // Hide active contrails
          if (this.jetContrail1) {
            this.jetContrail1.setVisible(false)
          }
          if (this.jetContrail2) {
            this.jetContrail2.setVisible(false)
          }
        }
        
        if (!this.jetTimer) {
          this.jetTimer = this.time.delayedCall(2000, () => {
            if (this.jet && this.jet.active) {
              this.jetDirection = 'right'
              // Increase speed for next pass
              this.jetPassCount++
              this.jetSpeed = 800 + (this.jetPassCount * 100)  // Increase by 100 each pass
              
              // Move down more each pass (closer to player) - larger gaps between contrails
              // After 3 passes, on 4th pass jet should be low enough to hit player
              // For first 3 passes, move down progressively: pass 1->2: 100px, pass 2->3: 120px, pass 3->4: 140px
              if (this.jetPassCount < 3) {
                // First 3 passes: move down progressively
                const downAmount = 80 + (this.jetPassCount * 40)  // Pass 1->2: 120, Pass 2->3: 160
                this.jetY = Math.min(this.jetY + downAmount, bitteeHeadY - 20)
              } else {
                // On 4th pass (jetPassCount = 3), position jet low enough to hit player
                this.jetY = bitteeHeadY - 10  // Just above bittee's head, will hit on collision
              }
              // Play jet sound (alternate between jet1 and jet2)
              this.playJetSound()
              // Start flying left to right, not flipped
              this.jet.setFlipX(false)
              this.jet.setVelocityX(this.jetSpeed)
              this.jet.setX(-offScreenDistance)
              this.jet.setY(this.jetY)
              
              // Reset hit indicator flag for new fly-by
              this.jetHitIndicatorActive = false
              // Remove any existing hit indicator when jet turns around
              if (this.jet) {
                this.removeEnemyHitIndicator(this.jet)
              }
              
              // Start continuous camera shake while jet is on screen
              this.startJetShake()
              
              // Show contrails again
              if (this.jetContrail1) {
                this.jetContrail1.setVisible(true)
              }
              if (this.jetContrail2) {
                this.jetContrail2.setVisible(true)
              }
              
              this.jetTimer = undefined
            }
          })
        }
      }
      
      // Update left-behind contrails: keep contrail1, expand contrail2 slowly (simulate clouds)
      // Don't expand contrails if game is paused for settings
      if (!this.isPausedForSettings) {
        this.jetContrails.forEach((contrail) => {
          // Keep contrail2 visible and slowly expand it (simulate clouds expanding)
          if (!this.jetDestroyed) {
            // Only expand if jet is still active
            contrail.scale += 0.001  // Slow expansion rate to simulate clouds
            contrail.contrail2.setScale(contrail.scale)
            contrail.contrail2.setAlpha(1.0)  // Keep fully visible
          } else {
            // If jet is destroyed, fade contrail2 away slowly
            const currentAlpha = contrail.contrail2.alpha
            if (currentAlpha > 0) {
              contrail.contrail2.setAlpha(Math.max(0, currentAlpha - 0.01))  // Slow fade
            }
          }
          
          // Keep contrail1 visible (if it exists)
          if (contrail.contrail1) {
            if (contrail.contrail1 instanceof Phaser.GameObjects.Image) {
              contrail.contrail1.setAlpha(1.0)  // Keep contrail1 fully visible
            }
            // If it's a physics image, it's already visible and solid
          }
        })
      }
      
      // Remove fully faded contrail2s (but keep contrail1)
      this.jetContrails = this.jetContrails.filter((contrail) => {
        if (contrail.contrail2.alpha <= 0) {
          contrail.contrail2.destroy()
          // Keep contrail1 even if contrail2 is gone
          return contrail.contrail1 !== undefined  // Keep entry if contrail1 exists
        }
        return true
      })
      
      // Fade active contrail1 and contrail2 when jet is destroyed
      if (this.jetDestroyed) {
        if (this.jetContrail1) {
          const currentAlpha = this.jetContrail1.alpha
          if (currentAlpha > 0) {
            this.jetContrail1.setAlpha(Math.max(0, currentAlpha - 0.05))  // Faster fade for contrail1
            if (this.jetContrail1.alpha <= 0) {
              this.jetContrail1.destroy()
              this.jetContrail1 = undefined
            }
          }
        }
        if (this.jetContrail2) {
          const currentAlpha = this.jetContrail2.alpha
          if (currentAlpha > 0) {
            this.jetContrail2.setAlpha(Math.max(0, currentAlpha - 0.01))  // Slower fade for contrail2
            if (this.jetContrail2.alpha <= 0) {
              this.jetContrail2.destroy()
              this.jetContrail2 = undefined
            }
          }
        }
      }
    }
    
    // Update tank movements - only move the current active tank
    if (this.tanks[this.currentTankIndex] && this.tanks[this.currentTankIndex].active) {
      this.moveTank(this.currentTankIndex)
    }
  }

  private initializeAudio(): void {
    // Initialize background music tracks at 50% of base volume (0.5 * 0.5 = 0.25) - reduced another 10%
    if (this.cache.audio.exists('bittee-mawtini1')) {
      this.backgroundMusic1 = this.sound.add('bittee-mawtini1', {
        loop: false, // We'll handle looping manually
        volume: 0.25, // 50% of 50% = 25% volume for background music
        mute: false, // Ensure not muted
      })
      
      // Set up listener to play track 2 when track 1 ends (only if not in boss level)
      // Store reference to handler so we can remove it if needed
      // Remove any existing listeners first to prevent duplicates
      this.backgroundMusic1.removeAllListeners('complete')
      this.backgroundMusic1.on('complete', () => {
        // FIX: When track 1 completes, automatically play track 2
        // Only switch if not in boss level and game is active
        if (!this.isBossLevel && this.isGameActive) {
          this.playNextMusicTrack()
        }
      })
    }

    if (this.cache.audio.exists('bittee-mawtini2')) {
      this.backgroundMusic2 = this.sound.add('bittee-mawtini2', {
        loop: false, // We'll handle looping manually
        volume: 0.25, // 50% of 50% = 25% volume for background music
        mute: false, // Ensure not muted
      })
      
      // Set up listener to play track 1 when track 2 ends (loops back, only if not in boss level)
      // Store reference to handler so we can remove it if needed
      // Remove any existing listeners first to prevent duplicates
      this.backgroundMusic2.removeAllListeners('complete')
      this.backgroundMusic2.on('complete', () => {
        // FIX: Double check isBossLevel and ensure track 2 actually finished
        // Only loop back to track 1 if track 2 actually finished (not if it was stopped)
        if (!this.isBossLevel && this.backgroundMusic2 && !this.backgroundMusic2.isPlaying && this.isGameActive) {
          this.playNextMusicTrack()
        }
      })
    }

    // Initialize settings music at same volume as background music (25%)
    if (this.cache.audio.exists('bittee-settings-music')) {
      this.settingsMusic = this.sound.add('bittee-settings-music', {
        loop: true,
        volume: 0.25, // Same volume as background music
      })
    }

    // Initialize boss level music at same volume as background music (25%)
    // Use new final level music instead of palestine-8bit
    if (this.cache.audio.exists('bittee-finallevel')) {
      this.bossMusic = this.sound.add('bittee-finallevel', {
        loop: true,
        volume: 0.25, // Same volume as background music
      })
    }

    // Initialize sound effects at 70% volume (reduced another 10%)
    const soundEffectKeys = [
      'bittee-run-sound',
      'throw-sound1',
      'throw-sound2',
      'throw-sound3',
      'throw-sound4',
      'time-sound1',
      'time-sound2',
      'time-sound3',
      'shield-sound',
      'ball-bounce',
      'life-down',
      'life-up',
      'level-complete',
      'configure-sound',
      'settings-sound',
      'heartbeat-slow',
      'heartbeat-medium',
      'heartbeat-fast',
      'heartbeat-die',
      'jet1',
      'jet2',
      'opp-hit',
      'opp-die',
    ]
    soundEffectKeys.forEach((key) => {
      if (this.cache.audio.exists(key)) {
        // Ball bounce gets 25% volume (reduced from 50%), everything else 70%
        const baseVolume = key === 'ball-bounce' ? 0.25 : 0.7
        this.soundEffects.set(key, this.sound.add(key, { volume: baseVolume }))
      }
    })

    // Initialize heartbeat sounds separately for looping at 70%
    if (this.cache.audio.exists('heartbeat-slow')) {
      this.soundEffects.set('heartbeat-slow', this.sound.add('heartbeat-slow', { volume: 0.7, loop: true }))
    }
    if (this.cache.audio.exists('heartbeat-medium')) {
      this.soundEffects.set('heartbeat-medium', this.sound.add('heartbeat-medium', { volume: 0.7, loop: true }))
    }
    if (this.cache.audio.exists('heartbeat-fast')) {
      this.soundEffects.set('heartbeat-fast', this.sound.add('heartbeat-fast', { volume: 0.7, loop: true }))
    }
    
  }

  private unlockAudioContext(): void {
    // Call the global unlock function if available
    const globalUnlock = (window as any).unlockAudioContext
    if (globalUnlock) {
      globalUnlock(true)
    }
    
    // Resume Phaser's audio context if suspended
    try {
      const soundManager = this.sound as any
      if (soundManager && soundManager.context) {
        const context = soundManager.context
        if (context.state === 'suspended') {
          context.resume().catch(() => {})
        }
      }
    } catch (err: unknown) {
      // Ignore errors
    }
  }
  

  private playSound(key: string, volume: number = 1.0, loop: boolean = false): void {
    // Respect volume settings
    const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    if (volumeMultiplier === 0) {
      return // Silent mode
    }

    const sound = this.soundEffects.get(key)
    if (sound && sound instanceof Phaser.Sound.BaseSound) {
      // Sound effects base volume: ball-bounce is 25% (0.25), others are 70% (0.7)
      const baseVolume = key === 'ball-bounce' ? 0.25 : 0.7
      const finalVolume = volume * baseVolume * volumeMultiplier
      if (loop && !sound.isPlaying) {
        sound.play({ volume: finalVolume, loop: true })
      } else if (!loop) {
        sound.play({ volume: finalVolume })
      }
    }
  }

  private stopSound(key: string): void {
    const sound = this.soundEffects.get(key)
    if (sound && sound instanceof Phaser.Sound.BaseSound && sound.isPlaying) {
      sound.stop()
    }
  }

  private startBackgroundMusic(forceRestart: boolean = false): void {
    // Don't play background music during boss level (boss music plays instead)
    if (this.isBossLevel) {
      // Explicitly stop any background music that might be playing
      if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
        this.backgroundMusic1.stop()
      }
      if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
        this.backgroundMusic2.stop()
      }
      return
    }
    
    const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    if (volumeMultiplier === 0) {
      return // Silent mode
    }
    
    // Ensure sound system is not muted
    if (this.sound) {
      this.sound.setMute(false)
    }

    // FIX: If forceRestart is true, skip the "already playing" check and force a fresh start
    if (!forceRestart) {
      // Check which track is currently playing and continue it instead of restarting
      // This prevents track 1 from playing on top of track 2 when respawning
      // Check isPlaying status more reliably
      const track1Playing = this.backgroundMusic1 && (this.backgroundMusic1.isPlaying || !this.backgroundMusic1.isPaused)
      const track2Playing = this.backgroundMusic2 && (this.backgroundMusic2.isPlaying || !this.backgroundMusic2.isPaused)
      
      if (track2Playing) {
        // Track 2 is playing - keep it playing, don't restart track 1
        this.currentMusicTrack = 2
        // Ensure it's actually playing (resume if paused)
        if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
          this.backgroundMusic2.resume()
        }
        return
      } else if (track1Playing) {
        // Track 1 is playing - keep it playing
        this.currentMusicTrack = 1
        // Ensure it's actually playing (resume if paused)
        if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
          this.backgroundMusic1.resume()
        }
        return
      }
    } else {
      // Force restart - stop everything first
      if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
        this.backgroundMusic1.stop()
      }
      if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
        this.backgroundMusic2.stop()
      }
    }

    // No track is playing - start with track 1
    // FIX: Always stop and restart to ensure it actually plays (might be in false "playing" state)
    this.currentMusicTrack = 1
    if (this.backgroundMusic1) {
      const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
      
      if (volumeMultiplier > 0) {
        // Always stop first to clear any weird state, then play fresh
        this.backgroundMusic1.stop()
        
        // Small delay to ensure stop completes, then play
        this.time.delayedCall(50, () => {
          if (this.backgroundMusic1) {
            try {
              const playResult = this.backgroundMusic1.play({ volume: 0.25 * volumeMultiplier })
              // play() might return a Promise or boolean
              if (playResult && typeof playResult === 'object' && 'catch' in playResult) {
                (playResult as Promise<void>).catch((e: unknown) => {
                  console.warn('Background music play promise rejected:', e)
                  // Try again after a short delay
                  this.time.delayedCall(200, () => {
                    if (this.backgroundMusic1) {
                      const retryResult = this.backgroundMusic1.play({ volume: 0.25 * volumeMultiplier })
                      if (retryResult && typeof retryResult === 'object' && 'catch' in retryResult) {
                        (retryResult as Promise<void>).catch((e: unknown) => {
                          console.warn('Background music play failed on retry:', e)
                        })
                      }
                    }
                  })
                })
              }
              
              // Set up complete event listener to switch to track 2 when track 1 ends
              if (this.backgroundMusic1) {
                this.backgroundMusic1.removeAllListeners('complete')
                this.backgroundMusic1.on('complete', () => {
                  if (!this.isBossLevel && this.isGameActive) {
                    this.playNextMusicTrack()
                  }
                })
              }
              
            } catch (err: unknown) {
              console.warn('Failed to play background music:', err)
              // Try again after a short delay
              this.time.delayedCall(200, () => {
                if (this.backgroundMusic1) {
                  try {
                    this.backgroundMusic1.play({ volume: 0.25 * volumeMultiplier })
                  } catch (e: unknown) {
                    console.warn('Background music play failed on retry:', e)
                  }
                }
              })
            }
          }
        })
      } else {
        console.warn('Background music not starting - volume multiplier is 0 (silent mode)')
      }
    } else {
      console.warn('Background music not starting - backgroundMusic1 is not initialized')
    }
    
    // Start heartbeat when game starts
    this.updateHeartbeat()
  }

  private playNextMusicTrack(): void {
    // Don't play background music during boss level (boss music plays instead)
    if (this.isBossLevel) {
      // Explicitly stop any background music that might be playing
      if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
        this.backgroundMusic1.stop()
      }
      if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
        this.backgroundMusic2.stop()
      }
      return
    }
    
    const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    if (volumeMultiplier === 0) {
      return // Silent mode
    }

    // Switch to the next track - always stop current track first to prevent overlap
    if (this.currentMusicTrack === 1) {
      // Track 1 just finished - switch to track 2
      // Stop track 1 first to prevent overlap
      if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
        this.backgroundMusic1.stop()
      }
      
      // Small delay to ensure stop completes before starting next track
      this.time.delayedCall(50, () => {
        if (this.backgroundMusic2 && !this.backgroundMusic2.isPlaying) {
          this.currentMusicTrack = 2
          const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
          if (volumeMultiplier > 0) {
            const playResult = this.backgroundMusic2.play({ volume: 0.25 * volumeMultiplier })
            // Handle Promise or boolean return
            if (playResult && typeof playResult === 'object' && 'catch' in playResult) {
              (playResult as Promise<void>).catch((e: unknown) => {
                console.warn('Track 2 play promise rejected:', e)
              })
            }
            // Set up complete event listener for track 2
            this.backgroundMusic2.removeAllListeners('complete')
            this.backgroundMusic2.on('complete', () => {
              if (!this.isBossLevel && this.isGameActive) {
                this.playNextMusicTrack()
              }
            })
          }
        }
      })
    } else {
      // Track 2 just finished - loop back to track 1
      // Stop track 2 first to prevent overlap
      if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
        this.backgroundMusic2.stop()
      }
      
      // Small delay to ensure stop completes before starting next track
      this.time.delayedCall(50, () => {
        if (this.backgroundMusic1 && !this.backgroundMusic1.isPlaying) {
          this.currentMusicTrack = 1
          const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
          if (volumeMultiplier > 0) {
            const playResult = this.backgroundMusic1.play({ volume: 0.25 * volumeMultiplier })
            // Handle Promise or boolean return
            if (playResult && typeof playResult === 'object' && 'catch' in playResult) {
              (playResult as Promise<void>).catch((e: unknown) => {
                console.warn('Track 1 play promise rejected:', e)
              })
            }
            // Set up complete event listener for track 1
            this.backgroundMusic1.removeAllListeners('complete')
            this.backgroundMusic1.on('complete', () => {
              if (!this.isBossLevel && this.isGameActive) {
                this.playNextMusicTrack()
              }
            })
          }
        }
      })
    }
  }

  private stopBackgroundMusic(): void {
    if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
      this.backgroundMusic1.stop()
    }
    if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
      this.backgroundMusic2.stop()
    }
  }

  private checkProjectedHit(bullet: Phaser.Physics.Arcade.Image): void {
    // Improved raycast with physics prediction to find the first ball the bullet will hit
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body
    if (!bulletBody || !bullet.active) return

    const bulletX = bullet.x
    const bulletY = bullet.y
    const vx = bulletBody.velocity.x
    const vy = bulletBody.velocity.y
    const bulletSpeed = Math.sqrt(vx * vx + vy * vy)
    
    if (bulletSpeed === 0) return

    // Check all active balls
    let closestBall: Phaser.Physics.Arcade.Image | null = null
    let closestTime = Infinity

    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (!ball || !ball.active) return

      const ballBody = ball.body as Phaser.Physics.Arcade.Body
      if (!ballBody) return

      // Get ball's current velocity
      // IMPORTANT: If slow motion is active, the ball's velocity has already been
      // reduced by the 0.3 multiplier, so ballBody.velocity already contains the slowed velocity.
      // This means our collision prediction automatically accounts for slow motion.
      let ballVx = ballBody.velocity.x
      let ballVy = ballBody.velocity.y
      
      // Note: We don't need to adjust these velocities further because:
      // - If slow motion is active and applied to the ball, velocity is already 0.3x
      // - If slow motion is not active, velocity is at normal speed
      // The physics body stores the actual current velocity, so we use it directly

      // Calculate relative position and velocity
      const relX = ball.x - bulletX
      const relY = ball.y - bulletY
      const relVx = ballVx - vx
      const relVy = ballVy - vy

      const ballRadius = ball.displayWidth / 2
      const bulletRadius = bullet.displayWidth / 2
      const collisionRadius = ballRadius + bulletRadius
      const collisionRadiusSq = collisionRadius * collisionRadius

      // Use precise quadratic collision prediction only
      const a = relVx * relVx + relVy * relVy
      const b = 2 * (relX * relVx + relY * relVy)
      const c = relX * relX + relY * relY

      let collisionTime: number | null = null

      // Check if collision is possible
      if (a === 0) {
        // No relative motion - check if already colliding (strict check)
        if (c <= collisionRadiusSq) {
          collisionTime = 0
        }
      } else {
        // Solve quadratic: discriminant = b^2 - 4*a*(c - collisionRadiusSq)
        const discriminant = b * b - 4 * a * (c - collisionRadiusSq)
        
        if (discriminant >= 0) {
          const sqrtDisc = Math.sqrt(discriminant)
          const t1 = (-b - sqrtDisc) / (2 * a)
          const t2 = (-b + sqrtDisc) / (2 * a)
          
          // Find the earliest positive time
          if (t1 >= 0 && t2 >= 0) {
            collisionTime = Math.min(t1, t2)
          } else if (t1 >= 0) {
            collisionTime = t1
          } else if (t2 >= 0) {
            collisionTime = t2
          }
        }
      }
      
      // Only consider collisions that will happen (positive time)
      // and within reasonable range (not too far in the future)
      // Use stricter time limit to avoid false positives
      if (collisionTime !== null && collisionTime >= 0 && collisionTime < 3.0 && collisionTime < closestTime) {
        // Additional validation: verify the collision will actually happen
        // by checking if the paths will intersect within the collision radius
        const futureBallX = ball.x + ballVx * collisionTime
        const futureBallY = ball.y + ballVy * collisionTime
        const futureBulletX = bulletX + vx * collisionTime
        const futureBulletY = bulletY + vy * collisionTime
        const futureDist = Math.sqrt(
          (futureBallX - futureBulletX) ** 2 + (futureBallY - futureBulletY) ** 2
        )
        
        // Only accept if future positions are within collision radius
        if (futureDist <= collisionRadius * 1.1) { // Small tolerance for floating point errors
          closestTime = collisionTime
          closestBall = ball
        }
      }
    })

    // If we found a target ball that will be hit, create triangle indicator
    if (closestBall) {
      this.createProjectedHitIndicator(closestBall)
      // Store reference: bullet -> target ball
      this.bulletTargetMap.set(bullet, closestBall)
    }
  }

  private updateAimingTriangle(): void {
    // FIX: Don't create triangles if we just cleared them
    if (this.trianglesCleared) {
      return
    }
    
    // Get Bittee's Y level (ground level) and X position
    const playerY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
    const playerX = this.player.x
    const playerWidth = this.player.displayWidth
    const yRange = 200 // Show triangles for balls within 200 pixels above/below Bittee on Y axis
    const xRange = playerWidth * 1.5 // Show triangles for balls within 1.5x Bittee's width on X axis (a bit wider)
    
    // Track which balls should have triangles
    const ballsToShow = new Set<Phaser.Physics.Arcade.Image>()
    
    // Find all balls within range
    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (!ball || !ball.active) return
      
      const ballX = ball.x
      const ballY = ball.y
      
      // Check if ball is within Y range (above or below Bittee)
      const yDistance = Math.abs(ballY - playerY)
      const withinYRange = yDistance <= yRange
      
      // Check if ball is within X range (horizontally aligned with Bittee, a bit wider)
      const xDistance = Math.abs(ballX - playerX)
      const withinXRange = xDistance <= xRange
      
      if (withinYRange && withinXRange) {
        ballsToShow.add(ball)
      }
    })
    
    // FIX: Remove triangles for balls that are no longer in range, inactive, or destroyed
    // Also check if triangles are stuck (especially around ground level)
    const ballsToRemove: Phaser.Physics.Arcade.Image[] = []
    const playerYForCleanup = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
    const playerHeadYForCleanup = playerYForCleanup - this.player.displayHeight  // Approximate head level
    
    this.aimingTriangles.forEach((triangle, ball) => {
      // FIX: Check if triangle still exists and is valid
      const triangleExists = triangle && triangle.scene
      const triangleActive = triangle && triangle.active
      const ballValid = ball && ball.active && ball.scene && this.balls.contains(ball)
      const ballInRange = ballsToShow.has(ball)
      
      // FIX: Also check if triangle is stuck (orphaned) - especially around ground/head level
      let isStuck = false
      if (triangle && triangle.scene) {
        const triangleY = triangle.y
        // Check if triangle is in the problematic zone (between ground and head level)
        if (triangleY >= playerHeadYForCleanup && triangleY <= playerYForCleanup + 50) {
          // Check if ball is actually near this triangle
          if (ball && ball.scene) {
            const ballY = ball.y
            const distance = Math.abs(ballY - triangleY)
            // If triangle is far from ball, it's likely stuck
            if (distance > 100) {
              isStuck = true
            }
          } else {
            // Ball doesn't exist but triangle does - definitely stuck
            isStuck = true
          }
        }
      }
      
      // Remove triangle if:
      // 1. Triangle itself is destroyed/inactive
      // 2. Ball is not in range
      // 3. Ball is not active
      // 4. Ball's scene is null (destroyed)
      // 5. Ball is not in the balls group anymore
      // 6. Triangle is stuck (orphaned)
      if (!triangleExists || !triangleActive || !ballValid || !ballInRange || isStuck) {
        if (triangle && triangle.scene) {
          try {
            triangle.destroy()
          } catch (e) {
            // Ignore errors if already destroyed
          }
        }
        ballsToRemove.push(ball)
      }
    })
    // FIX: Immediately remove triangles for balls that are out of range or invalid
    ballsToRemove.forEach(ball => {
      // Destroy triangle immediately if it exists
      const triangle = this.aimingTriangles.get(ball)
      if (triangle && triangle.scene) {
        try {
          triangle.destroy()
        } catch (e) {
          // Ignore errors if already destroyed
        }
      }
      this.aimingTriangles.delete(ball)
      
      // FIX: Also clean up ball's attached indicator
      if (ball && ball.scene) {
        const attachedTriangle = ball.getData('aimIndicator') as Phaser.GameObjects.Text | undefined
        if (attachedTriangle && attachedTriangle.scene) {
          try {
            attachedTriangle.destroy()
          } catch (e) {
            // Ignore errors
          }
          ball.setData('aimIndicator', undefined)
        }
      }
    })
    
    // Create or update triangles for balls in range
    ballsToShow.forEach(ball => {
      if (!ball.active || !ball.scene) return
      
      let triangle = this.aimingTriangles.get(ball)
      
      if (!triangle) {
        // Create transparent triangle - centered on ball's X position
        const ballX = ball.x
        const ballY = ball.y
        const ballHeight = ball.displayHeight
        triangle = this.add.text(ballX, ballY - ballHeight / 2 - 20, '\u25BC\ufe0f', {
          fontSize: '24px',
          fontFamily: 'MontserratBold',
          color: '#ff0000', // Red color
        })
        triangle.setOrigin(0.5, 0.5)  // Center origin for proper centering
        triangle.setDepth(15) // Above most things
        triangle.setScrollFactor(0) // Fixed to camera - Phaser converts world coords to camera coords
        triangle.setAlpha(0.6) // Less transparent for better visibility
        this.aimingTriangles.set(ball, triangle)
        
        // FIX: Attach triangle to ball and add destroy listener for automatic cleanup
        // Use 'once' to ensure cleanup happens when ball is destroyed, regardless of code path
        ball.setData('aimIndicator', triangle)
        // Remove any existing listener first to avoid duplicates
        ball.removeAllListeners('destroy')
        ball.once('destroy', () => {
          this.removeAimingTriangleForBall(ball)
        })
        // Also listen for removedfromscene as a backup
        ball.once('removedfromscene', () => {
          this.removeAimingTriangleForBall(ball)
        })
      }
      
      // Update position every frame to keep it centered above the ball
      const ballX = ball.x
      const ballY = ball.y
      const ballHeight = ball.displayHeight
      // Use world coordinates - Phaser will convert to camera coordinates automatically with scrollFactor 0
      // Center on ball's X position
      triangle.setPosition(ballX, ballY - ballHeight / 2 - 20)
    })
  }
  
  private removeAimingTriangle(): void {
    // FIX: Remove all aiming triangles and clean up orphaned ones
    this.aimingTriangles.forEach((triangle, ball) => {
      if (triangle && triangle.scene) {
        triangle.destroy()
      }
      // Also check ball's attached indicator
      if (ball && ball.scene) {
        const attachedTriangle = ball.getData('aimIndicator') as Phaser.GameObjects.Text | undefined
        if (attachedTriangle && attachedTriangle.scene) {
          attachedTriangle.destroy()
          ball.setData('aimIndicator', undefined)
        }
      }
    })
    this.aimingTriangles.clear()
    
    // FIX: Also clean up any orphaned triangles in the scene
    // IMPORTANT: Protect scoreTriangleText and enemyHitIndicators
    const scoreTriangleRef = this.scoreTriangleText
    const enemyHitIndicatorRefs = new Set(Array.from(this.enemyHitIndicators.values()))
    
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        const text = child as Phaser.GameObjects.Text
        // Check if this text is a triangle (contains the triangle emoji)
        if (text.text && text.text.includes('\u25BC')) {
          // Don't destroy scoreTriangleText or enemyHitIndicators
          const isScoreTriangle = text === scoreTriangleRef
          const isEnemyHitIndicator = enemyHitIndicatorRefs.has(text) || text.getData('isEnemyHitIndicator') === true
          if (isScoreTriangle || isEnemyHitIndicator) {
            return  // Skip this triangle - it's protected
          }
          
          // Check if it's NOT in our Maps
          let foundInMap = false
          this.aimingTriangles.forEach((tri) => {
            if (tri === text) foundInMap = true
          })
          this.projectedHitIndicators.forEach((ind) => {
            if (ind === text) foundInMap = true
          })
          this.enemyHitIndicators.forEach((ind) => {
            if (ind === text) foundInMap = true
          })
          
          if (!foundInMap && text.scene) {
            try {
              text.destroy()
            } catch (e) {
              // Ignore errors if already destroyed
            }
          }
        }
      }
    })
  }
  
  // DEBUG: Create visual debug lines showing max bounce height for each ball size
  // FIX: Clear all triangles (aiming and projected hit indicators)
  private clearAllTriangles(): void {
    // FIX: Find ALL triangle text objects in the scene, not just ones in Maps
    // This catches orphaned triangles that aren't in the Maps
    // IMPORTANT: Protect scoreTriangleText and enemyHitIndicators from being destroyed
    const scoreTriangleRef = this.scoreTriangleText  // Store reference to protect it
    const enemyHitIndicatorRefs = new Set(Array.from(this.enemyHitIndicators.values()))  // Store all enemy hit indicators
    
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        const text = child as Phaser.GameObjects.Text
        // Check if this text is a triangle (contains the triangle emoji)
        if (text.text && text.text.includes('\u25BC')) {
          // Don't destroy scoreTriangleText (HUD element for boss levels) or enemy hit indicators
          const isScoreTriangle = text === scoreTriangleRef || text.getData('isScoreTriangle') === true
          const isEnemyHitIndicator = enemyHitIndicatorRefs.has(text) || text.getData('isEnemyHitIndicator') === true
          if (isScoreTriangle || isEnemyHitIndicator) {
            return  // Skip this triangle - it's protected
          }
          
          // Check if it's NOT in our Maps
          let foundInMap = false
          this.aimingTriangles.forEach((tri) => {
            if (tri === text) foundInMap = true
          })
          this.projectedHitIndicators.forEach((ind) => {
            if (ind === text) foundInMap = true
          })
          this.enemyHitIndicators.forEach((ind) => {
            if (ind === text) foundInMap = true
          })
          
          if (!foundInMap) {
            try {
              text.destroy()
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }
    })
    
    // Set flag to prevent immediate recreation
    this.trianglesCleared = true
    
    // Clear all aiming triangles - destroy even if inactive
    const aimingTrianglesToDestroy: Phaser.GameObjects.Text[] = []
    this.aimingTriangles.forEach((triangle) => {
      if (triangle) {
        aimingTrianglesToDestroy.push(triangle)
      }
    })
    aimingTrianglesToDestroy.forEach(triangle => {
      try {
        if (triangle.scene) {
          triangle.destroy()
        }
      } catch (e) {
        // Ignore errors
      }
    })
    this.aimingTriangles.clear()
    
    // Clear all projected hit indicators - destroy even if inactive
    const indicatorsToDestroy: Phaser.GameObjects.Text[] = []
    this.projectedHitIndicators.forEach((indicator) => {
      if (indicator) {
        indicatorsToDestroy.push(indicator)
      }
    })
    indicatorsToDestroy.forEach(indicator => {
      try {
        if (indicator.scene) {
          indicator.destroy()
        }
      } catch (e) {
        // Ignore errors
      }
    })
    this.projectedHitIndicators.clear()
    
    // Clear bullet target map
    this.bulletTargetMap.clear()
    
    // FIX: Double-check for any remaining triangles after clearing Maps
    // But protect scoreTriangleText and enemyHitIndicators (reuse variables declared at top of function)
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        const text = child as Phaser.GameObjects.Text
        if (text.text && text.text.includes('\u25BC') && text.active) {
          // Don't destroy scoreTriangleText or enemyHitIndicators
          const isScoreTriangle = text === scoreTriangleRef || text.getData('isScoreTriangle') === true
          const isEnemyHitIndicator = enemyHitIndicatorRefs.has(text) || text.getData('isEnemyHitIndicator') === true
          if (!isScoreTriangle && !isEnemyHitIndicator) {
            try {
              text.destroy()
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }
    })
    
    // Clear flag after a short delay to allow update loop to skip recreation
    this.time.delayedCall(100, () => {
      this.trianglesCleared = false
    })
  }

  private createProjectedHitIndicator(ball: Phaser.Physics.Arcade.Image): void {
    // FIX: Don't create indicators if we just cleared them
    if (this.trianglesCleared) {
      return
    }
    
    // Remove existing indicator for this ball if any
    this.removeProjectedHitIndicator(ball)

    // Create red triangle (same as life symbol)
    const triangle = this.add.text(ball.x, ball.y - ball.displayHeight / 2 - 20, '\u25BC\ufe0f', {
      fontSize: '24px',
      fontFamily: 'MontserratBold',
      color: '#ff0000', // Red color
    })
    triangle.setOrigin(0.5, 0.5)
    triangle.setDepth(15) // Above most things
    triangle.setScrollFactor(0) // Fixed to camera

    this.projectedHitIndicators.set(ball, triangle)
    
    // FIX: Attach triangle to ball and add destroy listener for automatic cleanup
    // Use 'once' to ensure cleanup happens when ball is destroyed, regardless of code path
    ball.setData('projectedHitIndicator', triangle)
    // Remove any existing listener first to avoid duplicates, then add new one
    ball.removeAllListeners('destroy')
    ball.once('destroy', () => {
      this.removeProjectedHitIndicator(ball)
    })
    // Also listen for removedfromscene as a backup
    ball.once('removedfromscene', () => {
      this.removeProjectedHitIndicator(ball)
    })
  }

  private removeProjectedHitIndicator(ball: Phaser.Physics.Arcade.Image): void {
    const indicator = this.projectedHitIndicators.get(ball)
    if (indicator) {
      // FIX: Always destroy the GameObject, even if it's already inactive
      if (indicator.scene) {
        indicator.destroy()
      }
      this.projectedHitIndicators.delete(ball)
    } else {
      // FIX: Also check if triangle exists in scene but not in Map (orphaned)
      // Check ball's data for attached indicator
      const attachedIndicator = ball.getData('projectedHitIndicator') as Phaser.GameObjects.Text | undefined
      if (attachedIndicator && attachedIndicator.scene) {
        attachedIndicator.destroy()
        ball.setData('projectedHitIndicator', undefined)
      }
    }
  }
  
  private createEnemyHitIndicator(enemy: Phaser.Physics.Arcade.Sprite, _scaleMultiplier: number = 1.2): void {
    // Remove existing indicator for this enemy if any
    this.removeEnemyHitIndicator(enemy)
    
    // Position triangle above enemy - closer for jet, further for tanks
    const enemyType = enemy.getData('enemyType')
    const offsetY = enemyType === 'jet' ? 60 : 100  // Closer to jet (60px), further from tanks (100px)
    const triangleY = Math.max(40, enemy.y - enemy.displayHeight / 2 - offsetY)
    
    // Create red triangle above enemy - 25% smaller than before (was 1.8, now 1.35)
    const triangle = this.add.text(enemy.x, triangleY, '\u25BC\ufe0f', {
      fontSize: '32px',  // Reduced from 42px (25% smaller)
      fontFamily: 'MontserratBold',
      color: '#ff0000', // Red color
    })
    triangle.setOrigin(0.5, 0.5)
    triangle.setDepth(200) // Lower than scoreTriangleText (500) to ensure separation
    triangle.setScrollFactor(0) // Fixed to camera
    triangle.setScale(1.35)  // Reduced from 1.8 (25% smaller: 1.8 * 0.75 = 1.35)
    triangle.setVisible(true)
    triangle.setAlpha(1)  // Ensure full opacity
    triangle.setData('isEnemyHitIndicator', true)  // Mark as enemy hit indicator for protection
    
    this.enemyHitIndicators.set(enemy, triangle)
    
    // Attach triangle to enemy and add destroy listener for automatic cleanup
    enemy.setData('enemyHitIndicator', triangle)
    enemy.removeAllListeners('destroy')
    enemy.once('destroy', () => {
      this.removeEnemyHitIndicator(enemy)
    })
    enemy.once('removedfromscene', () => {
      this.removeEnemyHitIndicator(enemy)
    })
    
    // FIX: Update triangle position every frame to follow enemy movement
    // Account for tank flipping - position triangle above center, accounting for flipX
    const updatePosition = () => {
      if (triangle && triangle.scene && enemy && enemy.active && enemy.scene) {
        // Ensure triangle stays above enemy, but clamp Y to be visible (not negative)
        const enemyType = enemy.getData('enemyType')
        const offsetY = enemyType === 'jet' ? 60 : 100  // Closer to jet, further from tanks
        const newY = Math.max(40, enemy.y - enemy.displayHeight / 2 - offsetY)
        // For tanks, account for flipX - position triangle above center regardless of flip
        // For jet, just use center X
        let newX = enemy.x
        if (enemyType === 'tank' && enemy.flipX) {
          // Tank is flipped - triangle should still be centered above tank
          // No X offset needed since we want it centered
          newX = enemy.x
        }
        triangle.setPosition(newX, newY)
      } else {
        // Clean up if enemy or triangle is gone
        this.removeEnemyHitIndicator(enemy)
      }
    }
    
    // Update position every frame while enemy is active
    const updateEvent = this.events.on('update', updatePosition)
    
    // Auto-remove after a longer time (800ms instead of 500ms for better visibility)
    this.time.delayedCall(800, () => {
      if (updateEvent) {
        this.events.off('update', updatePosition)
      }
      this.removeEnemyHitIndicator(enemy)
    })
  }
  
  private removeEnemyHitIndicator(enemy: Phaser.Physics.Arcade.Sprite): void {
    const indicator = this.enemyHitIndicators.get(enemy)
    if (indicator) {
      if (indicator.scene) {
        indicator.destroy()
      }
      this.enemyHitIndicators.delete(enemy)
    }
    
    // Also check if indicator exists in scene but not in Map (orphaned)
    const attachedIndicator = enemy.getData('enemyHitIndicator') as Phaser.GameObjects.Text | undefined
    if (attachedIndicator && attachedIndicator.scene) {
      attachedIndicator.destroy()
      enemy.setData('enemyHitIndicator', undefined)
    }
  }

  private cleanupOrphanedTriangles(): void {
    // FIX: Aggressively clean up orphaned triangles, especially around ground/head level
    const playerYForOrphanCleanup = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
    const playerHeadYForOrphanCleanup = playerYForOrphanCleanup - this.player.displayHeight
    
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        const text = child as Phaser.GameObjects.Text
        if (text.text && text.text.includes('\u25BC')) {
          const textY = text.y
          
          // Check if it's in our Maps
          let foundInMap = false
          this.aimingTriangles.forEach((tri) => {
            if (tri === text) foundInMap = true
          })
          this.projectedHitIndicators.forEach((ind) => {
            if (ind === text) foundInMap = true
          })
          
          // FIX: If not in Maps OR if it's in the problematic zone (ground to head level)
          // Don't destroy scoreTriangleText or enemy hit indicators
          const isScoreTriangle = text === this.scoreTriangleText || text.getData('isScoreTriangle') === true
          const isEnemyHitIndicator = Array.from(this.enemyHitIndicators.values()).includes(text) || text.getData('isEnemyHitIndicator') === true
          if (isScoreTriangle || isEnemyHitIndicator) {
            return  // Skip this triangle - it's protected
          }
          const inProblemZone = textY >= playerHeadYForOrphanCleanup && textY <= playerYForOrphanCleanup + 50
          if ((!foundInMap || inProblemZone) && text.scene && text.active) {
            // Double-check it's really orphaned by checking if any ball is near it
            let ballNearby = false
            this.balls.children.entries.forEach((ballObj) => {
              const ball = ballObj as Phaser.Physics.Arcade.Image
              if (ball && ball.active && ball.scene) {
                const distance = Phaser.Math.Distance.Between(text.x, text.y, ball.x, ball.y)
                if (distance < 50) {
                  ballNearby = true
                }
              }
            })
            
            // If no ball is nearby, it's definitely orphaned - destroy it
            if (!ballNearby) {
              try {
                text.destroy()
              } catch (e) {
                // Ignore errors
              }
            }
          }
        }
      }
    })
  }

  private removeAimingTriangleForBall(ball: Phaser.Physics.Arcade.Image): void {
    // FIX: More thorough cleanup to prevent stuck triangles
    const triangle = this.aimingTriangles.get(ball)
    if (triangle) {
      // Always destroy the GameObject, even if it's already inactive
      if (triangle.scene) {
        try {
          triangle.destroy()
        } catch (e) {
          // Ignore errors if already destroyed
        }
      }
      this.aimingTriangles.delete(ball)
    }
    
    // FIX: Also check if triangle exists in scene but not in Map (orphaned)
    // Check ball's data for attached indicator
    if (ball && ball.scene) {
      const attachedTriangle = ball.getData('aimIndicator') as Phaser.GameObjects.Text | undefined
      if (attachedTriangle && attachedTriangle.scene) {
        try {
          attachedTriangle.destroy()
        } catch (e) {
          // Ignore errors if already destroyed
        }
        ball.setData('aimIndicator', undefined)
      }
    }
    
    // FIX: Also search scene for any orphaned triangles, especially around ground/head level
    if (ball && ball.scene) {
      const ballX = ball.x
      const ballY = ball.y
      const playerY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
      const playerHeadY = playerY - this.player.displayHeight
      
      this.children.list.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Text) {
          const text = child as Phaser.GameObjects.Text
          if (text.text && text.text.includes('\u25BC')) {
            const textY = text.y
            const textX = text.x
            
            // Check if triangle is near this ball (likely orphaned)
            const distance = Phaser.Math.Distance.Between(textX, textY, ballX, ballY)
            
            // FIX: Also check if triangle is in problematic zone (ground to head level)
            const inProblemZone = textY >= playerHeadY && textY <= playerY + 50
            
            if (distance < 100 || inProblemZone) {
              // Check if it's not in our Maps
              let foundInMap = false
              this.aimingTriangles.forEach((tri) => {
                if (tri === text) foundInMap = true
              })
              this.projectedHitIndicators.forEach((ind) => {
                if (ind === text) foundInMap = true
              })
              
              if (!foundInMap && text.scene) {
                try {
                  text.destroy()
                } catch (e) {
                  // Ignore errors if already destroyed
                }
              }
            }
          }
        }
      })
    }
  }

  private updateProjectedHitIndicators(): void {
    // FIX: Don't update/create indicators if we just cleared them
    if (this.trianglesCleared) {
      return
    }
    
    // Update positions of all triangle indicators and clean up if bullets are gone
    const bulletsToRemove: Phaser.Physics.Arcade.Image[] = []
    
    this.bulletTargetMap.forEach((ball, bullet) => {
      // Check if bullet is still active and in flight
      if (!bullet || !bullet.active) {
        // Bullet is gone, remove indicator
        if (ball) {
          this.removeProjectedHitIndicator(ball)
        }
        bulletsToRemove.push(bullet)
        return
      }

      // Check if ball is still active or exists
      if (!ball || !ball.active || !ball.scene || !this.balls.contains(ball)) {
        // Ball is gone or destroyed, remove indicator
        if (ball) {
          this.removeProjectedHitIndicator(ball)
        }
        bulletsToRemove.push(bullet)
        return
      }

      // Update triangle position to stay above ball
      const indicator = this.projectedHitIndicators.get(ball)
      if (indicator) {
        // Also check if indicator itself is still active
        if (!indicator.active || !indicator.scene) {
          this.projectedHitIndicators.delete(ball)
          bulletsToRemove.push(bullet)
          return
        }
        indicator.setPosition(ball.x, ball.y - ball.displayHeight / 2 - 20)
      }
    })

    // Clean up removed bullets from map
    bulletsToRemove.forEach(bullet => {
      this.bulletTargetMap.delete(bullet)
    })

    // Also clean up any orphaned indicators (balls that no longer have bullets targeting them)
    // Also clean up indicators for balls that are below Bittee's head level
    const playerY = this.groundYPosition + PLAYER_FOOT_Y_OFFSET
    const orphanedBalls: Phaser.Physics.Arcade.Image[] = []
    this.projectedHitIndicators.forEach((indicator, ball) => {
      // Check if indicator itself is destroyed/inactive
      if (!indicator || !indicator.active || !indicator.scene) {
        orphanedBalls.push(ball)
        return
      }
      
      // Check if ball is still active, in scene, and in balls group
      if (!ball || !ball.active || !ball.scene || !this.balls.contains(ball)) {
        orphanedBalls.push(ball)
        return
      }
      
      // FIX: Check if ball has passed below Bittee's head level - remove triangle immediately
      const ballY = ball.y
      if (ballY > playerY + 50) { // Ball is below Bittee's head level (with small buffer)
        // Destroy triangle immediately
        if (indicator && indicator.scene) {
          indicator.destroy()
        }
        orphanedBalls.push(ball)
        return
      }
      
      // Check if any bullet is still targeting this ball
      let hasActiveBullet = false
      this.bulletTargetMap.forEach((targetBall, bullet) => {
        if (targetBall === ball && bullet && bullet.active) {
          hasActiveBullet = true
        }
      })
      
      if (!hasActiveBullet) {
        orphanedBalls.push(ball)
      }
    })

    orphanedBalls.forEach(ball => {
      this.removeProjectedHitIndicator(ball)
    })

    // Re-check bullets that don't have targets yet (catch missed initial detections)
    this.bullets.children.entries.forEach((child) => {
      const bullet = child as Phaser.Physics.Arcade.Image
      if (!bullet || !bullet.active) return
      
      // If this bullet doesn't have a target yet, check again
      if (!this.bulletTargetMap.has(bullet)) {
        this.checkProjectedHit(bullet)
      }
    })
  }

  private playJetSound(): void {
    if (this.jetSoundCount === 0) {
      // First time: play jet1
      this.playSound('jet1', 1.0)
      this.jetSoundCount = 1
    } else {
      // Alternate between jet1 and jet2
      const soundKey = this.jetSoundCount % 2 === 1 ? 'jet2' : 'jet1'
      this.playSound(soundKey, 1.0)
      this.jetSoundCount++
    }
  }

  private updateHeartbeat(): void {
    if (!this.isGameActive || this.lives <= 0) {
      this.stopHeartbeat()
      return
    }

    let targetHeartbeat: 'slow' | 'medium' | 'fast' | null = null
    if (this.lives >= 3) {
      targetHeartbeat = 'slow'
    } else if (this.lives === 2) {
      targetHeartbeat = 'medium'
    } else if (this.lives === 1) {
      targetHeartbeat = 'fast'
    }

    // Only change if different
    if (targetHeartbeat !== this.currentHeartbeatType) {
      this.stopHeartbeat()
      if (targetHeartbeat) {
        this.startHeartbeat(targetHeartbeat)
      }
    }
  }

  private startHeartbeat(type: 'slow' | 'medium' | 'fast'): void {
    this.stopHeartbeat()
    this.currentHeartbeatType = type
    const sound = this.soundEffects.get(`heartbeat-${type}`)
    if (sound && sound instanceof Phaser.Sound.BaseSound) {
      const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
      if (volumeMultiplier > 0) {
        this.heartbeatSound = sound
        sound.play({ volume: 0.7 * volumeMultiplier, loop: true })
      }
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatSound && this.heartbeatSound.isPlaying) {
      this.heartbeatSound.stop()
    }
    this.heartbeatSound = undefined
    this.currentHeartbeatType = null
  }

  private pauseBackgroundMusic(): void {
    // Also pause boss music if playing
    if (this.bossMusic && this.bossMusic.isPlaying) {
      this.bossMusic.pause()
    }
    if (this.backgroundMusic1 && this.backgroundMusic1.isPlaying) {
      this.backgroundMusic1.pause()
    }
    if (this.backgroundMusic2 && this.backgroundMusic2.isPlaying) {
      this.backgroundMusic2.pause()
    }
    // Also pause heartbeat when pausing
    this.stopHeartbeat()
  }

  private resumeBackgroundMusic(): void {
    const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
    if (volumeMultiplier === 0) {
      return // Silent mode
    }

    // Resume boss music if in boss level, otherwise resume background music
    if (this.isBossLevel && this.bossMusic) {
      if (this.bossMusic.isPaused) {
        this.bossMusic.resume()
      } else if (!this.bossMusic.isPlaying) {
        this.bossMusic.play()
      }
    } else {
      // FIX: Always prioritize resuming paused tracks, regardless of currentMusicTrack value
      // This fixes the issue where currentMusicTrack might be wrong but a track is paused
      if (this.backgroundMusic1 && this.backgroundMusic1.isPaused) {
        this.currentMusicTrack = 1
        this.backgroundMusic1.resume()
      } else if (this.backgroundMusic2 && this.backgroundMusic2.isPaused) {
        this.currentMusicTrack = 2
        this.backgroundMusic2.resume()
      } else {
        // Neither track is paused - check currentMusicTrack and resume/start that one
        if (this.currentMusicTrack === 1 && this.backgroundMusic1) {
          if (!this.backgroundMusic1.isPlaying) {
            this.backgroundMusic1.play()
          }
        } else if (this.currentMusicTrack === 2 && this.backgroundMusic2) {
          if (!this.backgroundMusic2.isPlaying) {
            this.backgroundMusic2.play()
          }
        }
      }
    }
    
    // Resume heartbeat when resuming
    if (this.isGameActive) {
      this.updateHeartbeat()
    }
  }

  private playBallBounceSound(): void {
    // Play ball bounce at 25% volume (reduced from 50%)
    const bounceSound = this.soundEffects.get('ball-bounce')
    if (bounceSound && bounceSound instanceof Phaser.Sound.BaseSound) {
      const volumeMultiplier = VOLUME_LEVELS[this.settings.volumeIndex].value
      if (volumeMultiplier > 0) {
        bounceSound.play({ volume: 0.25 * volumeMultiplier })
      }
    } else {
      // Fallback: try playing directly from cache at 25% volume
      if (this.cache.audio.exists('ball-bounce')) {
        this.sound.play('ball-bounce', { volume: 0.25 * VOLUME_LEVELS[this.settings.volumeIndex].value })
      }
    }
  }

  private checkBallBounces(): void {
    // Check all balls for bounces by tracking velocity changes
    // This works for ground, walls, and ceiling
    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (!ball || !ball.active) return

      const body = ball.body as Phaser.Physics.Arcade.Body
      if (!body) return

      const prevVelX = ball.getData('prevVelX') as number | undefined
      const prevVelY = ball.getData('prevVelY') as number | undefined
      const currentVelX = body.velocity.x
      const currentVelY = body.velocity.y
      const lastWallBounceTime = ball.getData('lastWallBounceTime') as number | undefined
      const lastGroundBounceTime = ball.getData('lastGroundBounceTime') as number | undefined
      const lastCeilingBounceTime = ball.getData('lastCeilingBounceTime') as number | undefined
      const currentTime = this.time.now

      // Check for ground bounce: velocity Y changed from downward (positive) to upward (negative)
      // This happens when ball hits ground and bounces up
      if (prevVelY !== undefined) {
        if (prevVelY > 0 && currentVelY < 0) {
          // Ball hit ground and is now bouncing up
          if (body.blocked.down || body.touching.down) {
            // CRITICAL FIX: Override bounce velocity to ensure consistent bounce height
            const size = ball.getData('size') as BallSize
            const rule = BALL_RULES[size]
            const correctBounceVelocity = rule.bounceVelocity
            const ballGravity = body.gravity.y || 240
            
            // Ensure mini balls never bounce lower than Bittee's head
            let finalBounceVelocity = correctBounceVelocity
            if (size === 'mini') {
              const bitteeHeadY = this.groundYPosition - BITTEE_TARGET_HEIGHT
              const maxBounceHeight = (correctBounceVelocity * correctBounceVelocity) / (2 * ballGravity)
              const bounceTopY = this.groundYPosition - maxBounceHeight
              if (bounceTopY < bitteeHeadY) {
                const requiredHeight = this.groundYPosition - bitteeHeadY
                const requiredVelocity = Math.sqrt(requiredHeight * 2 * ballGravity)
                finalBounceVelocity = Math.max(correctBounceVelocity, requiredVelocity)
              }
            }
            
            // Check if this is the first bounce
            const hasBouncedBefore = ball.getData('hasBounced') as boolean || false
            
            // CRITICAL: Set bounce velocity immediately and ensure it persists
            // Phaser's automatic bounce might interfere, so we need to override it aggressively
            const preservedVelX = body.velocity.x
            const targetVelY = -finalBounceVelocity
            
            // Set velocity immediately
            const currentFrame = this.game.loop.frame
            body.setVelocity(preservedVelX, targetVelY)
            ball.setData('lastBounceFrame', currentFrame)
            
            // Set it a few times over the next 3 frames to ensure it persists
            // Phaser's bounce system might be overriding it, so we need to be persistent
            // But don't do it too many times as it can cause jitter when shooting/moving
            for (let i = 0; i < 3; i++) {
              this.time.delayedCall(i, () => {
                if (ball && ball.active && body) {
                  const currentVel = body.velocity.y
                  // Only restore if velocity is significantly lower than target (more than 10% off)
                  // This prevents constant corrections that can cause jitter
                  if (currentVel < targetVelY * 0.9) {
                    body.setVelocity(preservedVelX, targetVelY)
                  }
                }
              })
            }
            
            // For first bounce: Track that we've bounced
            if (!hasBouncedBefore) {
              ball.setData('hasBounced', true)
              
              // Reset peak height tracking
              ball.setData('peakHeight', 0)
              ball.setData('peakY', undefined)
            }
            
            // Simulate friction: reduce spin when hitting ground
            const currentAngularVel = body.angularVelocity
            const frictionFactor = 0.85  // Reduce spin by 15% on ground hit
            body.setAngularVelocity(currentAngularVel * frictionFactor)
            
            // Debounce to prevent multiple plays
            if (!lastGroundBounceTime || currentTime - lastGroundBounceTime > 150) {
              this.playBallBounceSound()
              ball.setData('lastGroundBounceTime', currentTime)
            }
          }
        }
      }

      // Check for wall bounce (left/right): velocity X changed sign
      if (prevVelX !== undefined) {
        if ((prevVelX < 0 && currentVelX > 0) || (prevVelX > 0 && currentVelX < 0)) {
          // Ball hit a wall (left or right)
          if (body.blocked.left || body.blocked.right || body.touching.left || body.touching.right) {
            // Simulate friction: reverse and reduce spin when hitting wall
            const currentAngularVel = body.angularVelocity
            const frictionFactor = 0.7  // Reduce spin by 30% on wall hit
            body.setAngularVelocity(-currentAngularVel * frictionFactor)
            
            // Debounce to prevent multiple plays
            if (!lastWallBounceTime || currentTime - lastWallBounceTime > 150) {
              this.playBallBounceSound()
              ball.setData('lastWallBounceTime', currentTime)
            }
          }
        }
      }

      // Check for ceiling bounce: velocity Y changed from upward (negative) to downward (positive)
      if (prevVelY !== undefined) {
        if (prevVelY < 0 && currentVelY > 0) {
          // Ball hit ceiling - make it a soft bounce
          if (body.blocked.up || body.touching.up) {
            // Soft bounce: reduce downward velocity significantly (keep only 30% of current velocity)
            // This applies to all balls regardless of size to prevent hard ceiling bounces
            const softBounceFactor = 0.3
            const newVelY = Math.abs(currentVelY) * softBounceFactor
            // Preserve X velocity when bouncing off ceiling
            body.setVelocity(body.velocity.x, newVelY)
            
            // Simulate friction: reduce spin when hitting ceiling
            const currentAngularVel = body.angularVelocity
            const frictionFactor = 0.8  // Reduce spin by 20% on ceiling hit
            body.setAngularVelocity(currentAngularVel * frictionFactor)
            
            // Debounce to prevent multiple plays
            if (!lastCeilingBounceTime || currentTime - lastCeilingBounceTime > 150) {
              this.playBallBounceSound()
              ball.setData('lastCeilingBounceTime', currentTime)
            }
          }
        }
      }

      // Don't store velocities here - that's done in storeBallVelocities() at end of update
    })
  }

  private storeBallVelocities(): void {
    // Store velocities at the end of update for next frame's comparison
    // This ensures prevVelY in collision handlers is from the previous frame
    this.balls.children.entries.forEach((ballObj) => {
      const ball = ballObj as Phaser.Physics.Arcade.Image
      if (!ball || !ball.active) return

      const body = ball.body as Phaser.Physics.Arcade.Body
      if (!body) return

      // Only update if not touching ground (ground handler manages its own prevVelY)
      // Actually, let's always update it - the ground handler will use it before we overwrite
      const prevVelY = ball.getData('prevVelY') as number | undefined
      ball.setData('prevVelX', body.velocity.x)
      // Don't overwrite prevVelY if ground handler just set it - but actually we want to store it for next frame
      // The ground handler reads prevVelY (from last frame) then writes currentVelY to it
      // Then we read it again here and... wait, that's wrong
      // Let me think: ground handler reads prevVelY (last frame), then writes currentVelY to it
      // Then we read currentVelY and write it to prevVelY - that's redundant
      // Actually, the ground handler should NOT write to prevVelY, we should do it here
      const currentVelY = body.velocity.y
      
      // CRITICAL FIX: Maintain bounce velocity if it's too low after a bounce
      // Phaser's automatic bounce might reduce velocity, so we need to restore it
      const lastBounceTime = ball.getData('lastGroundBounceTime') as number | undefined
      const currentTime = this.time.now
      if (lastBounceTime && currentTime - lastBounceTime < 200) {
        // Recently bounced - ensure velocity is correct
        const size = ball.getData('size') as BallSize
        const rule = BALL_RULES[size]
        const correctBounceVelocity = rule.bounceVelocity
        
        // If ball is moving upward but velocity is too low, restore it aggressively
        // Use a higher threshold (95% instead of 80%) and restore more frequently
        if (currentVelY < 0 && Math.abs(currentVelY) < correctBounceVelocity * 0.95) {
          const preservedVelX = body.velocity.x
          body.setVelocity(preservedVelX, -correctBounceVelocity)
        }
      }
      
      // Only update prevVelY if ground handler hasn't already set it this frame
      // Actually, let's just always update it - the ground handler reads it before we update
      ball.setData('prevVelY', currentVelY)
      
      // Track peak height reached
      const currentY = ball.y
      const heightAboveGround = this.groundYPosition - currentY
      const peakHeight = ball.getData('peakHeight') as number | undefined
      
      // If ball is moving upward (negative Y velocity), track the peak
      if (currentVelY < 0) {
        // Ball is going up - update peak if this is higher
        if (!peakHeight || heightAboveGround > peakHeight) {
          ball.setData('peakHeight', heightAboveGround)
          ball.setData('peakY', currentY)
        }
      } else if (currentVelY > 0 && prevVelY !== undefined && prevVelY < 0) {
        // Ball just reached peak (was going up, now going down)
        // Reset peak tracking for next bounce
        ball.setData('peakHeight', 0)
        ball.setData('peakY', undefined)
      }
    })
  }
}
