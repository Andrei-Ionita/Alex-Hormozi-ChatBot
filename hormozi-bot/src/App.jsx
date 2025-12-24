import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  Zap,
  RefreshCw,
  ShieldAlert,
  Mic,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SYSTEM_INSTRUCTION } from './data/system-prompt';
import { CORE_COURSE_CONTENT } from './data/core-course';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * UTILITY: Quick Chips
 */
const QuickChip = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="whitespace-nowrap px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-emerald-500/50 rounded-full text-xs font-medium text-gray-300 hover:text-emerald-400 transition-all duration-200 shadow-sm"
  >
    {label}
  </button>
);

/**
 * COMPONENT: Message Bubble
 */
const Message = ({ text, isBot, isError }) => (
  <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
    <div className={`flex max-w-[85%] md:max-w-[75%] ${isBot ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${isBot
        ? isError ? 'bg-rose-900 border-rose-500' : 'bg-gray-900 border-emerald-500'
        : 'bg-gray-800 border-gray-700'
        }`}>
        {isBot ? (
          <Zap className={`w-5 h-5 fill-current ${isError ? 'text-rose-500' : 'text-emerald-500'}`} />
        ) : (
          <User className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${isBot
          ? isError ? 'bg-rose-900/20 border border-rose-800 text-rose-200' : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
          : 'bg-emerald-600 text-white rounded-tr-none'
          }`}>
          {text}
        </div>
      </div>
    </div>
  </div>
);

/**
 * MAIN APP
 */
export default function HormoziChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      isBot: true,
      text: "I'm the Hormozi AI. I've analyzed the entire 2025 Sales Course. \n\nI can write scripts, handle specific energy-trade objections, or roast your closing rate. What do you need?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const callGemini = async (userQuery) => {
    setIsTyping(true);

    // Construct history from previous messages
    // NOTE: 'messages' here is the state BEFORE the current userQuery was added to the UI
    // because setMessages is async. So we map the existing 'messages', then add the new userQuery.
    const conversationHistory = messages
      .filter(msg => !msg.isError) // Filter out error messages
      .map(msg => ({
        role: msg.isBot ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

    // Append the current new message
    conversationHistory.push({
      role: "user",
      parts: [{ text: userQuery }]
    });

    // Construct the payload
    const payload = {
      contents: conversationHistory,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      }
    };

    try {
      // NOTE: This URL is for the standard Gemini API. 
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Gemini");
      }

      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Volume negates luck... but right now the API is down.";

      setMessages(prev => [...prev, {
        id: Date.now(),
        isBot: true,
        text: botText
      }]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        isBot: true,
        isError: true,
        text: "My connection to the sales matrix is fuzzy. Check your API Key in the environment variables (VITE_GEMINI_API_KEY)."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // Add User Message immediately
    setMessages(prev => [...prev, { id: Date.now(), isBot: false, text: textToSend }]);
    setInput("");

    // Call API
    callGemini(textToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100 font-sans selection:bg-emerald-500/30 overflow-hidden">

      {/* Header */}
      <header className="h-16 flex-shrink-0 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 relative z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sparkles className="text-white w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none flex items-center gap-2">
              Hormozi<span className="text-emerald-500">AI</span>
              <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/50">GEMINI POWERED</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider mt-1">CONTEXT: SALES COURSE 2025 + EXT</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-[10px] text-gray-400 hover:text-white transition-colors"
            title="Knowledge Base Status"
          >
            <BookOpen className="w-3 h-3" />
            <span>Knowledge: {CORE_COURSE_CONTENT.length > 0 ? 'Active' : 'Empty'}</span>
          </button>
          <button
            onClick={() => setMessages([{ id: Date.now(), isBot: true, text: "Let's restart. What obstacle is in your way?" }])}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Reset Chat"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">

          {/* Welcome / Empty State */}
          {messages.length === 1 && (
            <div className="mb-12 text-center opacity-60">
              <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                I am connected to the Gemini LLM and trained on the "Ultimate Sales Training 2025". I can generate <span className="text-gray-300 font-bold">unique scripts</span> and <span className="text-gray-300 font-bold">strategies</span> on the fly.
              </p>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex w-full mb-6 justify-start animate-pulse">
              <div className="flex max-w-[80%] flex-row gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-emerald-500/50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-500/50 fill-current" />
                </div>
                <div className="bg-gray-900 border border-gray-800 text-gray-400 p-4 rounded-2xl rounded-tl-none text-sm flex items-center gap-1">
                  <span>Analyzing sales data</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 bg-gray-950 border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
            <QuickChip label="💸 Write a text for an expired lead" onClick={() => handleSend("Write a 2-sentence text message to re-engage a lead who ghosted us 3 weeks ago. Use a 'Meme' style or the Kevin Hart strategy.")} />
            <QuickChip label="🛑 Handle 'It's too expensive'" onClick={() => handleSend("The client said our energy rates are too high compared to the competition. How do I use the Mechanic Close?")} />
            <QuickChip label="👔 Explain Support vs Permission" onClick={() => handleSend("Explain 'Support Not Permission' for a client who needs to ask their board.")} />
          </div>

          {/* Input Bar */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Alex anything (e.g., 'Script a cold opener for energy')..."
                className="w-full bg-gray-900 text-gray-100 border border-gray-700 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-none h-[54px] max-h-32 transition-all scrollbar-hide"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <div className="w-px h-4 bg-gray-700 mx-1"></div>
                <Mic className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="h-[54px] w-[54px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-gray-600">
              Powered by Gemini 2.0 Flash Exp • "Volume Negates Luck"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
