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
import { ChatModal, ChatMessage } from './game/ui/ChatModal';
import { PlayerListModal, PlayerInfo } from './game/ui/PlayerListModal';
import { StatsModal } from './game/ui/StatsModal';
import { NetworkConfig } from './game/config/networkConfig';
import { RankingsModal } from './game/ui/RankingsModal';
import { CyberTeslaModal } from './game-house/CyberTeslaModal';
import { GameDoorMetadata } from './game-house/gameRegistry';
import { GameSignboardModal } from './game/ui/GameSignboardModal';
import { ReturnHomeModal } from './game/ui/ReturnHomeModal';
import { GameSignboardConfig } from './game/world/GameSignboard';
import { SmartphoneModal } from './game/smartphone/SmartphoneModal';
import { FishingChallengeModal } from './game/fishing/FishingChallengeModal';
import { VillageSpeakerModal } from './game/village/VillageSpeakerModal';
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [isCyberTeslaOpen, setIsCyberTeslaOpen] = useState(false);
  const [isSignboardModalOpen, setIsSignboardModalOpen] = useState(false);
  const [activeSignboard, setActiveSignboard] = useState<GameSignboardConfig | null>(null);
  const [isReturnHomeModalOpen, setIsReturnHomeModalOpen] = useState(false);
  const [isSmartphoneOpen, setIsSmartphoneOpen] = useState(false);
  const [isFishingChallengeOpen, setIsFishingChallengeOpen] = useState(false);
  const [isVillageSpeakerOpen, setIsVillageSpeakerOpen] = useState(false);
  const [playerLocation, setPlayerLocation] = useState<'PRIVATE_HOME' | 'SHARED_CITY'>('PRIVATE_HOME');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [currentPlaytimeSeconds, setCurrentPlaytimeSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<PlayerInfo[]>([
    { id: 'local', name: 'Explorer (You)', isSelf: true, isOnline: true },
  ]);
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
  const [playerStance, setPlayerStance] = useState<'stand' | 'crouch' | 'prone' | 'swim'>('stand');
  const [isSwimming, setIsSwimming] = useState<boolean>(false);
  const [isDiving, setIsDiving] = useState<boolean>(false);
  const [customWaypoint, setCustomWaypoint] = useState<{ x: number; z: number } | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);
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
      onFPSUpdated: (val, ft) => {
        setFps(val);
        if (ft !== undefined) setFrameTime(ft);
      },
      onMultiplayerConnectionChanged: (_conn, count) => {
        setOnlineCount(count);
        if (engineRef.current) {
          setConnectedPlayers(engineRef.current.multiplayerManager.getConnectedPlayersList());
        }
      },
      onMultiplayerChatReceived: (sender, text) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).slice(2, 9),
            sender,
            text,
            time: timeStr,
            isSelf: false,
          },
        ]);
        setUnreadChatCount((prev) => prev + 1);
        soundManager.playCollectCoin();
      },
      onEnterGameDoor: (door: GameDoorMetadata) => {
        if (door.id === 'game_cyber_tesla') {
          setIsCyberTeslaOpen(true);
          soundManager.playVehicleDoor();
        } else {
          showToast(`${door.title} (${door.category}) is coming soon!`, 'GAMES');
        }
      },
      onOpenCharacterCustomizer: () => {
        setIsCharacterSelectOpen(true);
      },
      onOpenGameSignboard: (sign) => {
        setActiveSignboard(sign);
        setIsSignboardModalOpen(true);
      },
      onPlayerLocationChanged: (loc) => {
        setPlayerLocation(loc);
      },
      onStartFishingChallenge: () => {
        setIsFishingChallengeOpen(true);
      },
      onOpenVillageSpeaker: () => {
        setIsVillageSpeakerOpen(true);
      },
    });

    engine.voiceChatManager.onStateChanged = (state) => {
      setIsVoiceActive(state.enabled);
      setIsMicMuted(state.muted);
      setIsDeafened(state.deafened);
      setAutoplayBlocked(!!state.autoplayBlocked);
      const isLocalSpeaking = state.speakers.includes(engine.multiplayerManager.localPlayerId);
      setIsSpeaking(isLocalSpeaking);
      if (state.error) {
        showToast(state.error, 'VOICE CHAT');
      }
      setConnectedPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          isSpeaking: state.speakers.includes(p.id),
          isMuted: p.isSelf ? state.muted : p.isMuted,
        })),
      );
    };

    engineRef.current = engine;
    setActiveQuest(engine.questManager.getActiveQuest());
    setPlayerStats({ ...engine.questManager.playerStats });

    // Sync HUD state interval (position, vitals, stance, location)
    const hudInterval = setInterval(() => {
      if (!engineRef.current) return;
      const eng = engineRef.current;
      const p = eng.playerRig.group.position;
      setPlayerPos({ x: p.x, y: p.y, z: p.z });
      setPlayerYaw(eng.playerRotation);
      setActiveQuest(eng.questManager.getActiveQuest());
      setPlayerStats({ ...eng.questManager.playerStats });
      setPlayerStance(eng.playerStance);
      setIsSwimming(eng.isSwimming);
      setIsDiving(eng.isDiving);
      setPlayerLocation(eng.playerLocation);
    }, 80);

    // Start engine loop
    engine.start();

    return () => {
      clearInterval(hudInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, [showToast]);

  // Global Keyboard shortcuts with non-restarting functional state updates
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsMapOpen((prev) => !prev);
      } else if (e.code === 'KeyI') {
        setIsInventoryOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        let anyClosed = false;
        setActiveDialogueNPC((curr) => { if (curr) anyClosed = true; return null; });
        setIsMapOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsInventoryOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsMultiplayerOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsInstallModalOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsPublishGuideOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsAuthOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsProfileOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsCharacterSelectOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsLeaderboardOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsChatOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsPlayerListOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsStatsOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsRankingsOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsCyberTeslaOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsSignboardModalOpen((curr) => { if (curr) anyClosed = true; return false; });
        setIsReturnHomeModalOpen((curr) => { if (curr) anyClosed = true; return false; });

        setIsSettingsOpen((curr) => (curr ? false : anyClosed ? false : true));
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Active playtime tracking & server sync
  useEffect(() => {
    if (gameState !== 'playing') return;

    // 1-second local increment for real-time responsiveness
    const secondTimer = setInterval(() => {
      setCurrentPlaytimeSeconds((s) => s + 1);
    }, 1000);

    // Heartbeat every 30 seconds
    const sendHeartbeat = () => {
      const uid = currentUser?.uid || engineRef.current?.multiplayerManager.localPlayerId || 'guest';
      const name = currentUser?.displayName || engineRef.current?.multiplayerManager.localPlayerName || 'Explorer';
      fetch(NetworkConfig.getApiUrl('/api/player/heartbeat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          name,
          elapsedSeconds: 30,
        }),
      }).catch(() => {});

      if (engineRef.current) {
        const stats = engineRef.current.questManager.playerStats;
        const questsCompleted = engineRef.current.questManager.quests.filter((q) => q.status === 'completed').length;
        fetch(NetworkConfig.getApiUrl('/api/rankings/competitive/update'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            name,
            level: stats.level,
            quests: questsCompleted,
            taka: stats.money,
            distanceTraveled: Math.round(stats.exp),
          }),
        }).catch(() => {});
      }
    };

    sendHeartbeat();
    const heartbeatTimer = setInterval(sendHeartbeat, 30000);

    return () => {
      clearInterval(secondTimer);
      clearInterval(heartbeatTimer);
    };
  }, [gameState, currentUser]);

  const handleStartGame = (mode: 'single' | 'multiplayer') => {
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast('গেম খেলার আগে অনুগ্রহ করে আপনার নাম ও ইমেইল দিয়ে সাইন ইন করুন', 'SIGN IN REQUIRED');
      return;
    }

    setGameState('playing');
    // Automatically connect to the production multiplayer backend on start
    engineRef.current?.multiplayerManager.startOnlineMultiplayer();

    // Register active game play session with server
    fetch(NetworkConfig.getApiUrl('/api/sessions/start'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.uid || engineRef.current?.multiplayerManager.localPlayerId,
        name: currentUser?.displayName || engineRef.current?.multiplayerManager.localPlayerName,
      }),
    }).catch(() => {});

    if (mode === 'multiplayer') {
      showToast('Connected to Online Multiplayer! Other players will appear nearby.', 'ONLINE CO-OP');
    } else {
      showToast('Welcome to Bangladesh Open World! Connected to Dhaka Hub.', 'ADVENTURE BEGUN');
    }
  };

  const handleToggleVoice = async () => {
    if (!engineRef.current) return;
    const vm = engineRef.current.voiceChatManager;
    if (!vm.isVoiceEnabled) {
      const ok = await vm.enableVoiceChat();
      if (ok) {
        showToast('Microphone live. Voice chat connected!', 'VOICE CHAT');
      }
    } else {
      const muted = vm.toggleMute();
      showToast(muted ? 'Microphone muted' : 'Microphone unmuted', 'VOICE CHAT');
    }
  };

  const handleToggleDeafen = () => {
    if (!engineRef.current) return;
    const deafened = engineRef.current.voiceChatManager.toggleDeafen();
    showToast(
      deafened ? 'Audio deafened (remote voices muted)' : 'Voice audio restored',
      'VOICE AUDIO',
    );
  };

  const handleSendMessage = (text: string) => {
    if (!engineRef.current) return;
    engineRef.current.multiplayerManager.sendChat(text);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        sender: engineRef.current?.multiplayerManager.localPlayerName || 'You',
        text,
        time: timeStr,
        isSelf: true,
      },
    ]);
  };

  const handleTeleport = (x: number, z: number) => {
    engineRef.current?.teleport(x, z);
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    if (!engineRef.current) return;
    engineRef.current.settings = { ...engineRef.current.settings, ...newSettings };
    if (newSettings.quality) {
      engineRef.current.applyGraphicsQuality(newSettings.quality);
      showToast(`Graphics preset set to ${newSettings.quality.toUpperCase()}`, 'SETTINGS');
    } else if (newSettings.shadows !== undefined && !engineRef.current.isSoftwareGl) {
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

      {/* Title Screen Overlay / 3D Lobby */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenPublishGuide={() => setIsPublishGuideOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenCharacterSelect={() => setIsCharacterSelectOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
        />
      )}

      {/* In-Game Playing HUD */}
      {gameState === 'playing' && (
        <>
          <HUD
            stats={playerStats}
            activeVehicle={activeVehicle}
            interactionPrompt={interactionPrompt}
            playerPos={playerPos}
            playerYaw={playerYaw}
            onlineCount={onlineCount}
            isVoiceActive={isVoiceActive}
            isMicMuted={isMicMuted}
            isDeafened={isDeafened}
            isSpeaking={isSpeaking}
            unreadChatCount={unreadChatCount}
            customWaypoint={customWaypoint}
            autoplayBlocked={autoplayBlocked}
            fps={fps}
            frameTime={frameTime}
            playerStance={playerStance}
            isDiving={isDiving}
            playerLocation={playerLocation}
            onReturnHome={() => setIsReturnHomeModalOpen(true)}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenChat={() => {
              setIsChatOpen(true);
              setUnreadChatCount(0);
            }}
            onOpenPlayers={() => setIsPlayerListOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenRankings={() => setIsRankingsOpen(true)}
            onToggleVoice={handleToggleVoice}
            onToggleDeafen={handleToggleDeafen}
            onUnlockAudio={() => {
              engineRef.current?.voiceChatManager.unlockAudio();
              setAutoplayBlocked(false);
              showToast('Voice audio enabled', 'VOICE CHAT');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenSmartphone={() => setIsSmartphoneOpen(true)}
          />

          {/* On-Screen Mobile Joystick & Tactical HUD Controls */}
          {isMobile && engineRef.current && (
            <MobileControls
              inputManager={engineRef.current.inputManager}
              isDriving={!!activeVehicle}
              canInteract={!!interactionPrompt && interactionPrompt.includes('Talk')}
              canDrive={!!interactionPrompt && interactionPrompt.includes('Drive')}
              interactionPrompt={interactionPrompt}
              playerStance={playerStance}
              isSwimming={isSwimming}
              onOpenInventory={() => setIsInventoryOpen(true)}
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
          customWaypoint={customWaypoint}
          onSetWaypoint={(pt) => setCustomWaypoint(pt)}
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

      {/* Real-time Room Text Chat Modal */}
      {isChatOpen && (
        <ChatModal
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Online Room Players Modal */}
      {isPlayerListOpen && (
        <PlayerListModal
          roomName={engineRef.current?.multiplayerManager.currentRoom || 'Dhaka-Hub-1'}
          players={connectedPlayers}
          onClose={() => setIsPlayerListOpen(false)}
        />
      )}

      {/* Game Statistics & Leaderboard Modal */}
      {isStatsOpen && (
        <StatsModal
          playerStats={playerStats}
          onlineCount={onlineCount}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {/* Dual Player Rankings Modal (Playtime & Competitive) */}
      {isRankingsOpen && (
        <RankingsModal
          currentUser={currentUser}
          playerStats={playerStats}
          currentPlaytimeSeconds={currentPlaytimeSeconds}
          onClose={() => setIsRankingsOpen(false)}
        />
      )}

      {/* Game House Module 02 — Bangladeshi Tesla Highway Challenge */}
      <CyberTeslaModal
        isOpen={isCyberTeslaOpen}
        onClose={() => {
          setIsCyberTeslaOpen(false);
          soundManager.playUiClick();
        }}
      />

      {/* Return to Private Home Confirmation Modal */}
      <ReturnHomeModal
        isOpen={isReturnHomeModalOpen}
        onConfirm={() => {
          engineRef.current?.returnHome();
          setPlayerLocation('PRIVATE_HOME');
          setIsReturnHomeModalOpen(false);
          soundManager.playCollectCoin();
        }}
        onCancel={() => setIsReturnHomeModalOpen(false)}
      />

      {/* 3D Game Signboard Entry Panel */}
      <GameSignboardModal
        isOpen={isSignboardModalOpen}
        signboard={activeSignboard}
        onPlayNow={(gameId) => {
          setIsSignboardModalOpen(false);
          if (gameId === 'game_cyber_tesla') {
            setIsCyberTeslaOpen(true);
            soundManager.playVehicleDoor();
          } else {
            showToast('Game coming soon!', 'GAMES');
          }
        }}
        onClose={() => setIsSignboardModalOpen(false)}
      />

      {/* In-Game Smartphone (iPhone Style with Dynamic Island & Garage App) */}
      <SmartphoneModal
        isOpen={isSmartphoneOpen}
        playerName={currentUser?.displayName || 'Explorer'}
        playerMoney={playerStats.money}
        timeString={`${Math.floor(timeOfDay).toString().padStart(2, '0')}:${Math.floor((timeOfDay % 1) * 60).toString().padStart(2, '0')}`}
        onSpawnVehicle={(type) => {
          engineRef.current?.spawnVehicleNearPlayer(type);
          showToast(`${type.toUpperCase()} গাড়ি রোডে স্পন হয়েছে!`, 'GARAGE');
        }}
        onOpenCustomizer={() => {
          setIsSmartphoneOpen(false);
          setIsCharacterSelectOpen(true);
        }}
        onOpenMap={() => {
          setIsSmartphoneOpen(false);
          setIsMapOpen(true);
        }}
        onOpenRankings={() => {
          setIsSmartphoneOpen(false);
          setIsRankingsOpen(true);
        }}
        onOpenChat={() => {
          setIsSmartphoneOpen(false);
          setIsChatOpen(true);
        }}
        onOpenSettings={() => {
          setIsSmartphoneOpen(false);
          setIsSettingsOpen(true);
        }}
        onStartFishing={() => {
          setIsSmartphoneOpen(false);
          setIsFishingChallengeOpen(true);
        }}
        onClose={() => setIsSmartphoneOpen(false)}
      />

      {/* 2-Minute Padma River Fishing Challenge Modal */}
      <FishingChallengeModal
        isOpen={isFishingChallengeOpen}
        onFinishChallenge={(playerFish, rivalFish, rewardTaka, rewardExp) => {
          if (playerFish > rivalFish) {
            if (engineRef.current) {
              engineRef.current.questManager.playerStats.money += rewardTaka;
              engineRef.current.questManager.playerStats.exp += rewardExp;
            }
            showToast(`মাছ ধরার প্রতিযোগিতায় জয়ী হয়েছেন! পুরস্কার: ${rewardTaka} টাকা`, 'VICTORY');
          } else if (playerFish === rivalFish) {
            showToast('প্রতিযোগিতা ড্র হয়েছে! চমৎকার লড়াই।', 'DRAW');
          } else {
            showToast('কাসেম মাঝি জিতে গেছে! আবার চেষ্টা করুন।', 'FISHING FINISHED');
          }
        }}
        onClose={() => setIsFishingChallengeOpen(false)}
      />

      {/* Central Plaza Outdoor Music Speaker System Modal */}
      <VillageSpeakerModal
        isOpen={isVillageSpeakerOpen}
        onClose={() => setIsVillageSpeakerOpen(false)}
      />
    </div>
  );
}
