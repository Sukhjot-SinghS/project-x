'use client'
import { useState, useEffect, useRef } from 'react';
import { X, Send, Users } from 'lucide-react';
import { Avatar } from '@/components/Shared/Avatar';
import { getUserById } from '@/lib/mockData/users';
import { mockChatMessages } from '@/lib/mockData/chat';
import type { Squad, ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  squad: Squad | null;
  onClose: () => void;
}

export function ChatPanel({ squad, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (squad) {
      setMessages(mockChatMessages);
    }
  }, [squad]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!squad) return null;

  const captain = getUserById(squad.captainId);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: 'temp-' + Date.now(),
      userId: 'me',
      name: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'reply-' + Date.now(),
          userId: squad.captainId,
          name: captain?.name || 'Member',
          message: 'Sounds good! Looking forward to it.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-cream h-full shadow-warm-lg animate-slide-in-right flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-charcoal/8 bg-white">
          <Avatar src={captain?.avatar || ''} alt={captain?.name || ''} size="md" />
          <div className="flex-1">
            <h3 className="font-serif text-base font-semibold text-charcoal">{squad.name}</h3>
            <p className="text-xs text-charcoal/55 flex items-center gap-1">
              <Users className="w-3 h-3" /> {squad.members.length} members
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-charcoal/5 text-charcoal/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.isMe ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  msg.isMe
                    ? 'bg-terracotta text-white rounded-br-md'
                    : 'bg-white text-charcoal border border-charcoal/5 rounded-bl-md',
                )}
              >
                {!msg.isMe && (
                  <p className="text-[10px] font-semibold text-dusty-teal mb-0.5">{msg.name}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <p className={cn('text-[10px] mt-1', msg.isMe ? 'text-white/60' : 'text-charcoal/40')}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-charcoal/5 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-charcoal/8 bg-white flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-cream border border-charcoal/10 text-sm focus:outline-none focus:border-terracotta transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shadow-soft hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

