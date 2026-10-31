/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveNPC } from '../character/npcManager';
import { DIALOGUE_DATABASE } from '../quests/questManager';
import { QuestManager } from '../quests/questManager';
import { soundManager } from '../audio/soundManager';
import { MessageSquare, X, CheckCircle2 } from 'lucide-react';

interface DialogueModalProps {
  npc: ActiveNPC;
  questManager: QuestManager;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  questManager,
  onClose,
}) => {
  const defaultDialogueId = npc.config.dialogueId || 'dialogue_ped_generic';
  const [currentNodeId, setCurrentNodeId] = useState<string>(defaultDialogueId);
  const node = DIALOGUE_DATABASE[currentNodeId] || DIALOGUE_DATABASE[defaultDialogueId];

  if (!node) return null;

  const handleOptionClick = (option: typeof node.options[0]) => {
    soundManager.playUiClick();

    if (option.action === 'acceptQuest' && option.questId) {
      questManager.acceptQuest(option.questId);
    } else if (option.action === 'giveItem' && option.questId) {
      const q = questManager.quests.find((item) => item.id === option.questId);
      if (q) {
        questManager.completeCurrentObjective(q);
      }
    }

    if (option.nextNodeId && DIALOGUE_DATABASE[option.nextNodeId]) {
      setCurrentNodeId(option.nextNodeId);
    } else if (option.action === 'close' || !option.nextNodeId) {
      onClose();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl pointer-events-auto select-none animate-fade-in">
      <div className="w-full bg-slate-950/85 backdrop-blur-md border-2 border-emerald-500/70 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3">
        {/* Header: NPC Identity */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-bold text-white tracking-wide">{node.speaker}</span>
                <span className="text-xs text-emerald-400 font-semibold">({npc.config.nameBn})</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{node.speakerTitle}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Dialogue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle Dialogue Speech Body - Cinematic Large Clear Typography */}
        <div className="space-y-1.5 py-1">
          <div className="text-base md:text-xl text-white font-bold leading-relaxed drop-shadow-sm">
            "{node.text}"
          </div>
          {node.textBn && (
            <div className="text-sm md:text-base text-emerald-300 font-semibold leading-relaxed drop-shadow-sm">
              "{node.textBn}"
            </div>
          )}
        </div>

        {/* Interactive Response Options */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          {node.options.map((opt: typeof node.options[0], idx: number) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className="flex-1 min-w-[200px] text-left px-3.5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-emerald-900/40 border border-slate-700/80 hover:border-emerald-500/80 text-xs md:text-sm text-slate-100 hover:text-emerald-200 font-semibold flex items-center justify-between transition-all group"
            >
              <span>{opt.label}</span>
              <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 font-mono ml-2">
                [CLICK]
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
