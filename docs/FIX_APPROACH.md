# Suggested Approach for Fixing Movement Physics Issues

## Strategy: Centralized Position Management with State Guards

### Phase 1: Fix Jump Detection (Highest Priority)
**Problem:** Jump input ignored during running due to strict ground detection

**Solution:**
1. Implement proper lenient `canJump` check that accounts for running animation elevation
2. Add jump input buffering - allow jump input to be registered even if slightly above ground
3. Increase ground detection epsilon for running scenarios

**Changes:**
- Replace strict `onGround` check in `handleJump()` with lenient `canJump` check
- Add jump buffer system that stores jump input for 1-2 frames
- Improve `isPlayerGrounded()` to be more lenient during running

---

### Phase 2: Fix Settling Delay (High Priority)
**Problem:** Brief delay when stopping running due to conflicting position adjustments

**Solution:**
1. Add "transitioning" state flag to prevent ANIMATION_UPDATE adjustments during animation changes
2. Ensure `setIdlePose()` sets position immediately and locks it for 1-2 frames
3. Add debounce/threshold to ANIMATION_UPDATE listener

**Changes:**
- Add `isTransitioning` flag
- Set flag when stopping movement, clear after 2 frames
- Skip ANIMATION_UPDATE adjustments when `isTransitioning` is true
- Increase threshold from 3px to 5px for more stability

---

### Phase 3: Fix Crouch Positioning (Medium Priority)
**Problem:** Bittee goes below ground when crouching

**Solution:**
1. Verify ground alignment BEFORE scaling
2. Use `groundYPosition` directly instead of current Y position
3. Add safety check before AND after scaling

**Changes:**
- Before scaling: Ensure `this.player.y <= this.groundYPosition`
- After scaling: Verify position again and correct if needed
- Use `groundYPosition` as the target, not `currentBottomY`

---

### Phase 4: Reduce System Conflicts (Medium Priority)
**Problem:** Too many systems adjusting position simultaneously

**Solution:**
1. Centralize position management - create a single `maintainGroundPosition()` method
2. Reduce `updateFromGameObject()` calls - only call when absolutely necessary
3. Add state transition guards

**Changes:**
- Create `maintainGroundPosition()` helper method
- Replace scattered position adjustments with calls to this method
- Add state machine to prevent invalid state combinations
- Document when `updateFromGameObject()` is actually needed

---

## Implementation Order

1. **First:** Fix jump detection (most user-visible issue)
2. **Second:** Fix settling delay (affects responsiveness)
3. **Third:** Fix crouch positioning (visual issue)
4. **Fourth:** Reduce conflicts (long-term stability)

## Testing Strategy

After each phase:
- Test jumping while running (should work reliably)
- Test stopping running (should be instant, no settling)
- Test crouching on ground (should stay on ground)
- Test all combinations (run→jump, crouch→jump, stop→jump, etc.)

