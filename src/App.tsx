/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { HUD } from './game/ui/HUD';
import { MobileControls } from './game/ui/MobileControls';
import { DialogueModal } from './game/ui/DialogueModal';
import { WorldMapModal } from './game/ui/WorldMapModal';
import { InventoryModal } from './game/ui/InventoryModal';
import { SettingsModal } from './game/ui/SettingsModal';
import { TitleScreen } from './game/ui/TitleScreen';
import { MultiplayerModal } from './game/ui/MultiplayerModal';
import { PWAInstallModal } from './game/pwa/PWAInstallModal';
import { PublishGuideModal } from './game/ui/PublishGuideModal';
import { OfflineIndicator } from './game/pwa/OfflineIndicator';
import { AuthModal } from './game/ui/AuthModal';
import { ProfileModal } from './game/ui/ProfileModal';
import { CharacterSelectModal } from './game/ui/CharacterSelectModal';
import { LeaderboardModal } from './game/ui/LeaderboardModal';
import { authManager, PlayerAccount } from './game/auth/authManager';
import { CharacterAppearance, DEFAULT_PLAYER_APPEARANCE } from './game/character/characterModel';
import { ActiveNPC } from './game/character/npcManager';
import { ActiveVehicle } from './game/vehicles/vehicleManager';
import { Quest, PlayerStats, GameSettings, WeatherType } from './game/types';
import { soundManager } from './game/audio/soundManager';
import { Bell, X } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game States
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused'>('title');
  const [activeDialogueNPC, setActiveDialogueNPC] = useState<ActiveNPC | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCharacterSelectOpen, setIsCharacterSelectOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<PlayerAccount | null>(authManager.getCurrentUser());
  const [playerAppearance, setPlayerAppearance] = useState<CharacterAppearance>(() => {
    try {
      const saved = localStorage.getItem('dream_player_appearance');
      return saved ? JSON.parse(saved) : DEFAULT_PLAYER_APPEARANCE;
    } catch {
      return DEFAULT_PLAYER_APPEARANCE;
    }
  });

  useEffect(() => {
    const unsub = authManager.subscribe((acc) => setCurrentUser(acc));
    return () => unsub();
  }, []);

  // Dynamic HUD tracking state
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    money: 350,
    exp: 0,
    level: 1,
    stamina: 100,
    maxStamina: 100,
    health: 100,
    maxHealth: 100,
  });
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [activeVehicle, setActiveVehicle] = useState<ActiveVehicle | null>(null);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<number>(10.5);
  const [playerPos, setPlayerPos] = useState({ x: 6, y: 0, z: 12 });
  const [playerYaw, setPlayerYaw] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [toastNotification, setToastNotification] = useState<{ title?: string; msg: string } | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check touch / mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth <= 1024;
      setIsMobile(isTouch || isNarrow);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show Toast Notification
  const showToast = useCallback((msg: string, title?: string) => {
    setToastNotification({ msg, title });
    setTimeout(() => {
      setToastNotification((curr) => (curr?.msg === msg ? null : curr));
    }, 4500);
  }, []);

  // Initialize Game Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(canvasMountRef.current, {
      onInteractionPrompt: (prompt) => setInteractionPrompt(prompt),
      onOpenDialogue: (npc) => setActiveDialogueNPC(npc),
      onNotification: (msg, title) => showToast(msg, title),
      onVehicleStateChanged: (veh) => setActiveVehicle(veh),
      onTimeUpdated: (t) => setTimeOfDay(t),
      onFPSUpdated: (val) => setFps(val),
    });

    engineRef.current = engine;
    setActiveQuest(engine.questManager.getActiveQuest());
    setPlayerStats({ ...engine.questManager.playerStats });

    // Sync HUD state interval (position, vitals)
    const hudInterval = setInterval(() => {
      if (!engineRef.current) return;
      const eng = engineRef.current;
      const p = eng.playerRig.group.position;
      setPlayerPos({ x: p.x, y: p.y, z: p.z });
      setPlayerYaw(eng.playerRotation);
      setActiveQuest(eng.questManager.getActiveQuest());
      setPlayerStats({ ...eng.questManager.playerStats });
    }, 80);

    // Global Key Handlers for M (Map), I (Inventory), Esc (Settings/Pause)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsMapOpen((prev) => !prev);
      } else if (e.code === 'KeyI') {
        setIsInventoryOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        if (
          activeDialogueNPC ||
          isMapOpen ||
          isInventoryOpen ||
          isMultiplayerOpen ||
          isInstallModalOpen ||
          isPublishGuideOpen ||
          isAuthOpen ||
          isProfileOpen ||
          isCharacterSelectOpen ||
          isLeaderboardOpen
        ) {
          setActiveDialogueNPC(null);
          setIsMapOpen(false);
          setIsInventoryOpen(false);
          setIsMultiplayerOpen(false);
          setIsInstallModalOpen(false);
          setIsPublishGuideOpen(false);
          setIsAuthOpen(false);
          setIsProfileOpen(false);
          setIsCharacterSelectOpen(false);
          setIsLeaderboardOpen(false);
        } else {
          setIsSettingsOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Start engine loop
    engine.start();

    return () => {
      clearInterval(hudInterval);
      window.removeEventListener('keydown', handleKeyDown);
      engine.dispose();
      engineRef.current = null;
    };
  }, [showToast]);

  const handleStartGame = (mode: 'single' | 'multiplayer') => {
    setGameState('playing');
    if (mode === 'multiplayer') {
      engineRef.current?.multiplayerManager.startOnlineMultiplayer();
      showToast('Connected to Online Multiplayer Room! Other players will appear nearby.', 'ONLINE CO-OP');
    } else {
      showToast('Welcome to Bangladesh Open World! Meet Rahim Bhai at the tea stall.', 'ADVENTURE BEGUN');
    }
  };

  const handleTeleport = (x: number, z: number) => {
    engineRef.current?.teleport(x, z);
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    if (!engineRef.current) return;
    engineRef.current.settings = { ...engineRef.current.settings, ...newSettings };
    if (newSettings.shadows !== undefined && !engineRef.current.isSoftwareGl) {
      engineRef.current.renderer.shadowMap.enabled = newSettings.shadows;
    }
  };

  const handleSetTimeOfDay = (time: number) => {
    if (!engineRef.current) return;
    engineRef.current.weatherManager.timeOfDay = time;
    setTimeOfDay(time);
  };

  const handleSetWeather = (weather: WeatherType) => {
    if (!engineRef.current) return;
    engineRef.current.weatherManager.setWeather(weather);
  };

  const handleSaveGame = () => {
    engineRef.current?.saveGame();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Container - Isolated Ref container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenPublishGuide={() => setIsPublishGuideOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenCharacterSelect={() => setIsCharacterSelectOpen(true)}
        />
      )}

      {/* In-Game Playing HUD */}
      {gameState === 'playing' && (
        <>
          <HUD
            stats={playerStats}
            activeQuest={activeQuest}
            activeVehicle={activeVehicle}
            interactionPrompt={interactionPrompt}
            timeOfDay={timeOfDay}
            playerPos={playerPos}
            playerYaw={playerYaw}
            fps={fps}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenCharacterSelect={() => setIsCharacterSelectOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />

          {/* On-Screen Mobile Joystick Controls */}
          {isMobile && engineRef.current && (
            <MobileControls
              inputManager={engineRef.current.inputManager}
              isDriving={!!activeVehicle}
              canInteract={!!interactionPrompt && interactionPrompt.includes('Talk')}
              canDrive={!!interactionPrompt && interactionPrompt.includes('Drive')}
              onOpenMap={() => setIsMapOpen(true)}
            />
          )}
        </>
      )}

      {/* Floating Notification Toast */}
      {toastNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="bg-slate-900/95 border-2 border-emerald-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in max-w-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              {toastNotification.title && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {toastNotification.title}
                </div>
              )}
              <div className="text-xs font-medium text-slate-100">{toastNotification.msg}</div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialogue Modal */}
      {activeDialogueNPC && engineRef.current && (
        <DialogueModal
          npc={activeDialogueNPC}
          questManager={engineRef.current.questManager}
          onClose={() => setActiveDialogueNPC(null)}
        />
      )}

      {/* Interactive World Map Modal */}
      {isMapOpen && (
        <WorldMapModal
          playerPos={playerPos}
          playerYaw={playerYaw}
          activeQuest={activeQuest}
          onClose={() => setIsMapOpen(false)}
          onTeleport={handleTeleport}
        />
      )}

      {/* Inventory Bag Modal */}
      {isInventoryOpen && engineRef.current && (
        <InventoryModal
          inventory={engineRef.current.questManager.inventory}
          onClose={() => setIsInventoryOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && engineRef.current && (
        <SettingsModal
          settings={engineRef.current.settings}
          timeOfDay={timeOfDay}
          onUpdateSettings={handleUpdateSettings}
          onSetTimeOfDay={handleSetTimeOfDay}
          onSetWeather={handleSetWeather}
          onSaveGame={handleSaveGame}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Online Multiplayer Modal */}
      {isMultiplayerOpen && engineRef.current && (
        <MultiplayerModal
          multiplayerManager={engineRef.current.multiplayerManager}
          isOpen={isMultiplayerOpen}
          onClose={() => setIsMultiplayerOpen(false)}
        />
      )}

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Free Share & Publishing Guide Modal */}
      <PublishGuideModal
        isOpen={isPublishGuideOpen}
        onClose={() => setIsPublishGuideOpen(false)}
      />

      {/* Auth Modal (Login / Register / Guest / Reset) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(acc) => {
          setCurrentUser(acc);
          showToast(`Signed in as ${acc.displayName} (${acc.uid})`, 'WELCOME');
        }}
      />

      {/* Player Profile & Stats Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        user={currentUser}
        onClose={() => setIsProfileOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 3D Turntable Character Customizer & Presets */}
      <CharacterSelectModal
        isOpen={isCharacterSelectOpen}
        currentAppearance={playerAppearance}
        onSave={(newApp) => {
          setPlayerAppearance(newApp);
          engineRef.current?.setPlayerAppearance(newApp);
        }}
        onClose={() => setIsCharacterSelectOpen(false)}
      />

      {/* Global Live Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        currentUser={currentUser}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
