import { useEffect } from 'react';
import { useGame } from './state/GameStore';
import { IntroScreen } from './screens/IntroScreen';
import { NamingScreen } from './screens/NamingScreen';
import { FactionScreen } from './screens/FactionScreen';
import { TownScreen } from './screens/TownScreen';
import { LocationScreen } from './screens/LocationScreen';
import { BattleSetupScreen } from './screens/BattleSetupScreen';
import { CombatScreen } from './screens/CombatScreen';
import { PostFightScreen } from './screens/PostFightScreen';
import { StableScreen } from './screens/StableScreen';
import { AssignItemScreen } from './screens/AssignItemScreen';
import { RankingScreen } from './screens/RankingScreen';
import { MedalsScreen } from './screens/MedalsScreen';
import { LearnMoveScreen } from './screens/LearnMoveScreen';
import { CaptureChoiceScreen } from './screens/CaptureChoiceScreen';
import { DialogOverlay } from './components/DialogOverlay';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';

/**
 * Scene router. Each scene has one top-level component.
 * The DialogOverlay and Toast are always mounted on top.
 */
export function App() {
  const { state, dispatch } = useGame();

  // If a move-learn is queued and we're on a normal non-combat scene, redirect
  // to the LearnMoveScreen. This makes the prompt feel mandatory but only
  // appears when the player isn't mid-fight.
  useEffect(() => {
    if (state.pendingMoveLearns.length > 0
        && state.scene !== 'learnMove'
        && state.scene !== 'combat'
        && state.scene !== 'postfight'
        && state.scene !== 'battleSetup') {
      dispatch({ type: 'GO_SCENE', scene: 'learnMove' });
    }
    // And conversely — when the queue empties while on the learn screen, return to town.
    if (state.pendingMoveLearns.length === 0 && state.scene === 'learnMove') {
      dispatch({ type: 'GO_SCENE', scene: 'town' });
    }
  }, [state.pendingMoveLearns.length, state.scene, dispatch]);

  // Capture/salvage redirect — same idea for wild-mecha-after-fight prompt.
  useEffect(() => {
    if (state.pendingCapture
        && state.scene !== 'captureChoice'
        && state.scene !== 'combat'
        && state.scene !== 'postfight'
        && state.scene !== 'naming') {
      dispatch({ type: 'GO_SCENE', scene: 'captureChoice' });
    }
    if (!state.pendingCapture && state.scene === 'captureChoice') {
      dispatch({ type: 'GO_SCENE', scene: 'location' });
    }
  }, [state.pendingCapture, state.scene, dispatch]);

  let body;
  switch (state.scene) {
    case 'intro':         body = <IntroScreen />; break;
    case 'naming':        body = <NamingScreen />; break;
    case 'faction_pick':  body = <FactionScreen />; break;
    case 'town':          body = <TownScreen />; break;
    case 'location':      body = <LocationScreen />; break;
    case 'battleSetup':   body = <BattleSetupScreen />; break;
    case 'combat':        body = <CombatScreen />; break;
    case 'postfight':     body = <PostFightScreen />; break;
    case 'stable':        body = <StableScreen />; break;
    case 'assignItem':    body = <AssignItemScreen />; break;
    case 'ranking':       body = <RankingScreen />; break;
    case 'medals':        body = <MedalsScreen />; break;
    case 'learnMove':     body = <LearnMoveScreen />; break;
    case 'captureChoice': body = <CaptureChoiceScreen />; break;
    default:              body = <IntroScreen />;
  }

  return (
    <>
      {body}
      <BottomNav />
      <DialogOverlay />
      <Toast />
    </>
  );
}
