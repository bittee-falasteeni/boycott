# Code Update Instructions for GitHub Pages Audio

After setting up the GitHub repository and enabling GitHub Pages, update the audio loading code:

## Step 1: Add Audio Base URL Constant

At the top of `MainScene.ts`, add:

```typescript
// Audio files hosted on GitHub Pages (Neocities free tier doesn't allow audio files)
const AUDIO_BASE_URL = 'https://bittee-falasteeni.github.io/bittee/'
```

## Step 2: Update loadAudioAssets() Method

Change all audio paths from:
```typescript
this.load.audio('bittee-mawtini1', '/assets/audio/bittee-mawtini1.webm')
```

To:
```typescript
this.load.audio('bittee-mawtini1', `${AUDIO_BASE_URL}bittee-mawtini1.webm`)
```

## Example Updated Method

```typescript
private loadAudioAssets(): void {
  const AUDIO_BASE_URL = 'https://bittee-falasteeni.github.io/bittee/'
  
  // Background music
  this.load.audio('bittee-mawtini1', `${AUDIO_BASE_URL}bittee-mawtini1.webm`)
  this.load.audio('bittee-mawtini2', `${AUDIO_BASE_URL}bittee-mawtini2.webm`)
  // ... etc for all files
}
```

## Testing

1. Test locally first (GitHub Pages URL should work from anywhere)
2. Rebuild: `npm run build`
3. Test the built version
4. Upload to Neocities

