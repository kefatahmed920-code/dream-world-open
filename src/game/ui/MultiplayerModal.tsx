/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Send,
  Wifi,
  WifiOff,
  Globe,
  Sparkles,
  MessageSquare,
  Server,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { MultiplayerManager } from '../multiplayer/multiplayerManager';
import { soundManager } from '../audio/soundManager';
import { NetworkConfig, DEFAULT_PRODUCTION_BACKEND } from '../config/networkConfig';

interface MultiplayerModalProps {
  multiplayerManager: MultiplayerManager;
  isOpen: boolean;
  onClose: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  multiplayerManager,
  isOpen,
  onClose,
}) => {
  const [playerName, setPlayerName] = useState(multiplayerManager.localPlayerName);
  const [roomName, setRoomName] = useState(multiplayerManager.currentRoom);
  const [chatInput, setChatInput] = useState('');
  const [isOnline, setIsOnline] = useState(multiplayerManager.isOnlineMode);
  const [isConnected, setIsConnected] = useState(multiplayerManager.isConnected);
  const [playerCount, setPlayerCount] = useState(multiplayerManager.serverPlayerCount);
  const [statusMessage, setStatusMessage] = useState(multiplayerManager.connectionMessage);
  const [latencyMs, setLatencyMs] = useState(multiplayerManager.latencyMs);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [backendUrl, setBackendUrl] = useState(NetworkConfig.getCustomBackendUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverPingStatus, setServerPingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [pingMessage, setPingMessage] = useState('');

  // Auto-connect to production backend when multiplayer modal opens
  useEffect(() => {
    if (isOpen) {
      if (!multiplayerManager.isOnlineMode) {
        multiplayerManager.startOnlineMultiplayer();
        setIsOnline(true);
      }
      setRoomName(multiplayerManager.currentRoom);
      setPlayerName(multiplayerManager.localPlayerName);
      setIsConnected(multiplayerManager.isConnected);
      setPlayerCount(multiplayerManager.serverPlayerCount);
      setStatusMessage(multiplayerManager.connectionMessage);
    }
  }, [isOpen, multiplayerManager]);

  // Subscribe to connection updates from manager
  useEffect(() => {
    const handleConn = (conn: boolean, count: number, msg?: string) => {
      setIsConnected(conn);
      setPlayerCount(count);
      setRoomName(multiplayerManager.currentRoom);
      setLatencyMs(multiplayerManager.latencyMs);
      if (msg) setStatusMessage(msg);
    };

    multiplayerManager.onConnectionChanged = handleConn;

    const interval = setInterval(() => {
      setIsConnected(multiplayerManager.isConnected);
      setPlayerCount(multiplayerManager.serverPlayerCount);
      setRoomName(multiplayerManager.currentRoom);
      setLatencyMs(multiplayerManager.latencyMs);
      setStatusMessage(multiplayerManager.connectionMessage);
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [multiplayerManager]);

  const handleTestBackend = async () => {
    soundManager.playUiClick();
    setServerPingStatus('testing');
    setPingMessage('Testing connection to backend...');
    try {
      NetworkConfig.setCustomBackendUrl(backendUrl);
      const testUrl = NetworkConfig.getApiUrl('/api/health');
      const start = performance.now();
      const res = await fetch(testUrl);
      const ms = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        setServerPingStatus('success');
        setPingMessage(`Connected! Ping: ${ms}ms (${data.activePlayers || 0} online)`);
      } else {
        setServerPingStatus('error');
        setPingMessage(`Server responded with HTTP ${res.status}`);
      }
    } catch {
      setServerPingStatus('error');
      setPingMessage('Could not reach server. If sleeping, Render wakes up in ~30s.');
    }
  };

  const handleResetToDefault = () => {
    soundManager.playUiClick();
    NetworkConfig.resetToDefaultBackend();
    setBackendUrl('');
    setPingMessage('Reset to permanent production backend (dream-world-open.onrender.com)');
    setServerPingStatus('success');
    multiplayerManager.stopOnlineMultiplayer();
    setTimeout(() => {
      multiplayerManager.startOnlineMultiplayer();
      setIsOnline(true);
    }, 300);
  };

  if (!isOpen) return null;

  const handleToggleOnline = (enable: boolean) => {
    soundManager.playUiClick();
    if (enable) {
      multiplayerManager.startOnlineMultiplayer(roomName, playerName);
      setIsOnline(true);
    } else {
      multiplayerManager.stopOnlineMultiplayer();
      setIsOnline(false);
      setIsConnected(false);
      setPlayerCount(1);
      setStatusMessage('Offline');
    }
  };

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !isOnline) return;
    soundManager.playUiClick();
    multiplayerManager.sendChat(chatInput.trim());

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
    setChatMessages((prev) => [
      ...prev.slice(-15),
      { sender: playerName, text: chatInput.trim(), time: timeStr },
    ]);
    setChatInput('');
  };

  const quickMessages = [
    'Assalamu Alaikum! (আসসালামু আলাইকুম)',
    'Welcome to Dhaka! (স্বাগতম)',
    'Let’s race to the Padma Bridge! (সেতুতে রেস হবে)',
    'Heading to the Waterfall Grotto! (ঝর্ণায় যাচ্ছি)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-5 md:p-6 flex flex-col gap-3.5 text-white overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg transition-colors ${
                isConnected
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400'
                  : isOnline
                  ? 'bg-amber-950/90 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                ONLINE MULTIPLAYER · <span className="text-emerald-400 font-medium">মাল্টিপ্লেয়ার</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                {isOnline ? (
                  <>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                      }`}
                    />
                    <span>
                      {isConnected
                        ? `Room: ${roomName} (${playerCount} Online)`
                        : statusMessage || 'Connecting to Render Backend...'}
                    </span>
                  </>
                ) : (
                  'Currently in Single-Player / Offline Mode'
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Controls */}
        <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => handleToggleOnline(false)}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              !isOnline
                ? 'bg-slate-800 text-white shadow-md border border-slate-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <WifiOff className="w-4 h-4 text-slate-400" />
            <span>অফলাইন মোড (Offline)</span>
          </button>

          <button
            onClick={() => handleToggleOnline(true)}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isOnline
                ? 'bg-emerald-600 text-white shadow-md border border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4 text-emerald-300" />
            <span>অনলাইন মোড (Online)</span>
          </button>
        </div>

        {/* Room & Nickname Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Player Nickname (নাম):</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Active Room (রুম):</label>
            <input
              type="text"
              value={roomName}
              disabled={isOnline}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none disabled:opacity-70"
              placeholder="Dhaka-Hub-1"
            />
          </div>
        </div>

        {/* Backend Status & Optional Advanced Configure */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Production Backend:</span>
              <span className="font-mono text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                dream-world-open.onrender.com
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowServerConfig((prev) => !prev)}
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {showServerConfig ? 'Close' : 'Advanced'}
            </button>
          </div>

          {showServerConfig && (
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 leading-relaxed">
                The game automatically uses the deployed Render backend with secure WSS. You only need this setting if you run a custom local or private dedicated server.
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://dream-world-open.onrender.com"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestBackend}
                  disabled={serverPingStatus === 'testing'}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5"
                >
                  {serverPingStatus === 'testing' ? 'Testing...' : 'Test'}
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  title="Reset to permanent Render production server"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>

              {pingMessage && (
                <div
                  className={`text-[11px] flex items-center gap-1.5 ${
                    serverPingStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {serverPingStatus === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{pingMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Multiplayer Status & Chat */}
        {isOnline ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span className="flex items-center gap-1.5 font-bold">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span className={isConnected ? 'text-emerald-400' : 'text-amber-300'}>
                  {isConnected
                    ? `Live Server Connected (${playerCount} Explorers in ${roomName})`
                    : statusMessage || 'Connecting to Render backend...'}
                </span>
              </span>
              {isConnected && latencyMs > 0 && (
                <span className="font-mono text-[11px] text-emerald-400">{latencyMs}ms ping</span>
              )}
            </div>

            {/* Render Free Tier Wake-up Advisory */}
            {!isConnected && (
              <div className="text-[11px] bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-200 leading-relaxed flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span>
                  Render Free Tier: If the server was idle, spin-up takes ~30-40 seconds. Automatic connection will establish as soon as the service responds.
                </span>
              </div>
            )}

            {/* Quick Chat Presets */}
            <div className="flex flex-wrap gap-1.5">
              {quickMessages.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    multiplayerManager.sendChat(msg);
                    setChatMessages((prev) => [
                      ...prev.slice(-15),
                      { sender: playerName, text: msg, time: 'Now' },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div className="h-28 bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 overflow-y-auto space-y-1.5 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-[11px]">
                  No chat messages yet. Send a greeting to other online players!
                </div>
              ) : (
                chatMessages.map((c, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="font-bold text-emerald-400 shrink-0">{c.sender}:</span>
                    <span className="text-slate-200">{c.text}</span>
                    <span className="text-[9px] text-slate-500 ml-auto shrink-0">{c.time}</span>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message to other players..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
            <Globe className="w-7 h-7 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-slate-200">এক ক্লিকে অনলাইনে যোগ দিন</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              অনলাইন মোড চালু করলে অন্যান্য খেলোয়াড়দের সাথে একই ঢাকা সিটি ও পদ্মার জগতে একসঙ্গে গাড়ি চালানো এবং ঘোরাঘুরি করা যাবে।
            </p>
            <button
              onClick={() => handleToggleOnline(true)}
              className="mt-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-colors inline-flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              <span>Connect to Online Multiplayer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
