/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameLobby } from '../lobby/GameLobby';
import { CharacterAppearance, DEFAULT_PLAYER_APPEARANCE } from '../character/characterModel';
import { PlayerStats } from '../types';

interface TitleScreenProps {
  onStartGame: (mode: 'single' | 'multiplayer') => void;
  onOpenInstallModal: () => void;
  onOpenPublishGuide: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenCharacterSelect: () => void;
  onOpenInventory?: () => void;
  onOpenSettings?: () => void;
  onOpenMultiplayer?: () => void;
  onOpenStats?: () => void;
  onOpenRankings?: () => void;
  onOpenChat?: () => void;
  appearance?: CharacterAppearance;
  playerStats?: PlayerStats;
  currentRoom?: string;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenInstallModal,
  onOpenPublishGuide,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenCharacterSelect,
  onOpenInventory = () => {},
  onOpenSettings = () => {},
  onOpenStats = () => {},
  onOpenRankings = () => {},
  onOpenChat = () => {},
  appearance = DEFAULT_PLAYER_APPEARANCE,
  playerStats = {
    money: 350,
    exp: 0,
    level: 1,
    stamina: 100,
    maxStamina: 100,
    health: 100,
    maxHealth: 100,
  },
  currentRoom = 'Dhaka-Hub-1',
}) => {
  return (
    <GameLobby
      appearance={appearance}
      playerStats={playerStats}
      currentRoom={currentRoom}
      onStartGame={onStartGame}
      onOpenCharacterSelect={onOpenCharacterSelect}
      onOpenInventory={onOpenInventory}
      onOpenSettings={onOpenSettings}
      onOpenProfile={onOpenProfile}
      onOpenLeaderboard={onOpenLeaderboard}
      onOpenStats={onOpenStats}
      onOpenRankings={onOpenRankings}
      onOpenChat={onOpenChat}
      onOpenInstallModal={onOpenInstallModal}
      onOpenPublishGuide={onOpenPublishGuide}
    />
  );
};
