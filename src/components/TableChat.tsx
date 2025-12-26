'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TableChat } from '@/lib/agents';
import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store';
import { speakWithPersonality, VOICE_PRESETS } from '@/lib/audio';

interface TableChatProps {
  messages: TableChat[];
  maxMessages?: number;
}

const toneStyles: Record<TableChat['tone'], { bg: string; border: string; text: string }> = {
  confident: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-200' },
  nervous: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-200' },
  aggressive: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-200' },
  friendly: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-200' },
  neutral: { bg: 'bg-gray-500/10', border: 'border-gray-500/50', text: 'text-gray-200' },
};

const toneEmojis: Record<TableChat['tone'], string> = {
  confident: '😎',
  nervous: '😰',
  aggressive: '😤',
  friendly: '😊',
  neutral: '🙂',
};

export function TableChatPanel({ messages, maxMessages = 10 }: TableChatProps) {
  const audioEnabled = useSettingsStore(state => state.audioEnabled);
  const chatRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Speak new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastMessageIdRef.current && audioEnabled) {
        lastMessageIdRef.current = lastMessage.id;
        speakWithPersonality(
          `${lastMessage.agentName} says: ${lastMessage.message}`,
          lastMessage.tone as keyof typeof VOICE_PRESETS
        );
      }
    }
  }, [messages, audioEnabled]);

  const displayMessages = messages.slice(-maxMessages);

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 h-72 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-700/50">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span>Table Talk</span>
        </h3>
      </div>
      
      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {displayMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No messages yet...</p>
            </div>
          ) : (
            displayMessages.map((message) => {
              const style = toneStyles[message.tone];
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className={`
                    rounded-xl p-3 border-l-4
                    ${style.bg} ${style.border}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{toneEmojis[message.tone]}</span>
                    <span className="text-white font-semibold text-sm">
                      {message.agentName}
                    </span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className={`text-sm italic ${style.text}`}>"{message.message}"</p>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
