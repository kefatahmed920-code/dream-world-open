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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        {/* Header: NPC Identity */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{node.speaker}</span>
                <span className="text-xs text-emerald-400 font-medium">({npc.config.nameBn})</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">{node.speakerTitle}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialogue Speech Body */}
        <div className="space-y-2 py-1">
          <div className="text-sm md:text-base text-slate-100 leading-relaxed">
            "{node.text}"
          </div>
          {node.textBn && (
            <div className="text-xs md:text-sm text-emerald-300/90 font-medium leading-relaxed italic">
              "{node.textBn}"
            </div>
          )}
        </div>

        {/* Interactive Response Options */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
          {node.options.map((opt: typeof node.options[0], idx: number) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className="w-full text-left p-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-500/80 text-xs md:text-sm text-slate-200 hover:text-emerald-300 font-semibold flex items-center justify-between transition-all group"
            >
              <span>{opt.label}</span>
              <span className="text-xs text-slate-500 group-hover:text-emerald-400">
                [Select]
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
