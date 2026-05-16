import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { GameStore } from './state/GameStore';
import { CityPaletteProvider } from './styles/cityPalette';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameStore>
      <CityPaletteProvider>
        <App />
      </CityPaletteProvider>
    </GameStore>
  </React.StrictMode>
);
