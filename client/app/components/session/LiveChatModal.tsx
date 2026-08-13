"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User } from "lucide-react";
import { ChatMessage, listenToChatMessages, sendChatMessage } from "@/app/lib/firebase/rtdb";

interface LiveChatModalProps {
  bookingId: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatModal({
  bookingId,
  currentUserId,
  currentUserName,
  otherPartyName,
  isOpen,
  onClose
}: LiveChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to messages
  useEffect(() => {
    if (!isOpen) return;
    
    const unsubscribe = listenToChatMessages(bookingId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [bookingId, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || sending) return;

    setSending(true);
    try {
      await sendChatMessage(bookingId, {
        senderId: currentUserId,
        senderName: currentUserName,
        text: chatInput.trim(),
      });
      setChatInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:p-6 p-0 sm:items-end items-stretch pointer-events-none">
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/50 md:hidden pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Chat Box */}
      <div className="bg-white dark:bg-[#131824] w-full md:w-[400px] h-full md:h-[600px] md:max-h-[80vh] flex flex-col md:rounded-2xl shadow-2xl border border-gray-200 dark:border-white/[0.08] pointer-events-auto animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between bg-gray-50 dark:bg-[#0A0D14] md:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{otherPartyName}</h3>
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#131824]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 space-y-3">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm">No messages yet.<br/>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-400 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div 
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 dark:bg-[#1C2333] dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-white/[0.05]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] bg-white dark:bg-[#131824] md:rounded-b-2xl">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-gray-50 dark:bg-[#0A0D14] p-1.5 rounded-full border border-gray-200 dark:border-white/[0.08]"
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-gray-900 dark:text-white"
              disabled={sending}
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || sending}
              className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
