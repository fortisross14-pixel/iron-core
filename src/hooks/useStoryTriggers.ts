import { useEffect } from 'react';
import { useGame } from '../state/GameStore';
import { STORY_SCENES } from '../data/story';

/**
 * Auto-fires story scenes when the player enters a location whose trigger
 * conditions are met. Conditions:
 *   - scene.trigger.locationId matches the new currentLocationId
 *   - all requireFlags are set
 *   - no forbidFlags are set
 *   - the oncePerFlag (if defined) isn't already set
 */
export function useStoryTriggers() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (!state.currentLocationId) return;
    if (state.dialogStack.length > 0) return;  // don't pile dialogs

    for (const scene of Object.values(STORY_SCENES)) {
      const t = scene.trigger;
      if (!t) continue;
      if (t.locationId !== state.currentLocationId) continue;
      if (t.oncePerFlag && state.storyFlags.has(t.oncePerFlag)) continue;
      if (t.requireFlags?.some(f => !state.storyFlags.has(f))) continue;
      if (t.forbidFlags?.some(f => state.storyFlags.has(f))) continue;
      dispatch({ type: 'OPEN_DIALOG', sceneId: scene.id });
      return;
    }
  }, [state.currentLocationId, state.storyFlags, state.dialogStack.length, dispatch]);
}
