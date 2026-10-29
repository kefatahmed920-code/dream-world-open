/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
}

interface ChatModalProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  messages,
  onSendMessage,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    soundManager.playUiClick();
    onSendMessage(clean);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs pointer-events-auto select-none">
      <div className="w-full max-w-md h-[460px] bg-slate-950/95 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-600/40 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Room Chat · <span className="text-sky-400">রুম চ্যাট</span>
              </div>
              <div className="text-[10px] text-slate-400">Real-time room messaging</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mb-1.5 opacity-40" />
              <span>No messages in this room yet.</span>
              <span className="text-[10px] text-slate-600">Say hello to nearby players!</span>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 mb-0.5">
                  <span className={`font-bold ${m.isSelf ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {m.sender}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-500">{m.time}</span>
                </div>
                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-xs font-medium break-words shadow-md ${
                    m.isSelf
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-2.5 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message..."
            maxLength={140}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
