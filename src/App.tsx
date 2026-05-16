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
import { DialogOverlay } from './components/DialogOverlay';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';

/**
 * Scene router. Each scene has one top-level component.
 * The DialogOverlay and Toast are always mounted on top.
 *
 * To add a new screen:
 *   1. Add the scene id to src/state/types.ts (Scene type)
 *   2. Create the screen file in src/screens/
 *   3. Add a case here
 */
export function App() {
  const { state } = useGame();

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
