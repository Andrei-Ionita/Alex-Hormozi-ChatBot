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

/**
 * GEMINI API CONFIGURATION
 * * FOR RAILWAY/PRODUCTION DEPLOYMENT:
 * The 'process' variable is not available in this browser preview, causing the error.
 * * 1. For this preview to work: Keep apiKey = "".
 * 2. When deploying to Railway:
 * - If using Create React App: Uncomment the process.env line below.
 * - If using Vite: Use import.meta.env.VITE_GEMINI_API_KEY.
 */

// const apiKey = process.env.REACT_APP_GEMINI_API_KEY || ""; // Uncomment for Railway (CRA)
const apiKey = ""; // Keep empty for this preview environment

/**
 * KNOWLEDGE BASE
 * 1. CORE_COURSE_CONTENT: The base logic from the course.
 * 2. EXTENDED_KNOWLEDGE: Paste new transcripts/notes here.
 */

const CORE_COURSE_CONTENT = `
1. SALES MULTIPLIERS:
- Speed to Lead: Contact within 60 seconds = 391% increase in close rate. If >5 mins, likelihood drops 80%.
- Availability: Sell 7 days/week (especially Sat/Sun). 15-minute slots on calendar, not 1 hour.
- "Feed The Killers": Give the best leads to the best closers. Don't round robin fairly.

2. THE C.L.O.S.E.R. FRAMEWORK (Live Call):
- C (Clarify): Why are they here? 
- L (Label): Establish the Gap (Current Pain vs Future Gain).
- O (Overview): The Pain Cycle. deprivation = motivation.
- S (Sell): 3-Pillar Pitch. Use metaphors (e.g., "Investment Account vs Paycheck").
- E (Explain): Objection handling.
- R (Reinforce): BAMFAM (Book A Meeting From A Meeting). Handshake to onboarding.

3. OBJECTION HANDLING (The "AAA" Method):
- Acknowledge (buy time, build rapport).
- Associate (tell a story of someone else or a "foil").
- Ask (The person asking questions is closing).
- "The Mechanic Close": If they ask for price early, say "I can't ethically tell you until I look under the hood."
- "Spouse/Boss Objection": It's "Support not Permission". Ask: "Are you looking for their permission or their support?"

4. MINDSET:
- "Volume Negates Luck": If you suck, do double the volume.
- "Kind vs Nice": Nice people don't want to offend. Kind people tell hard truths to help.
- "Commission Breath": If you care more about the deal than the human, you lose.
`;

const EXTENDED_KNOWLEDGE = `
// --- ADDITION: 26 HARSH LESSONS (2025) ---

1. FEAR & RISK:
- "Fear exists in the fog." Write down risks in detail. Usually, the worst case is sleeping on a friend's couch.
- "Dare Greatly." You won't get credit for the work, only the result. Record-breaking outcomes take record-breaking work (unseen grind).

2. MENTAL TOUGHNESS OVER MOTIVATION:
- Mental toughness has 4 variables: 
  1. Latency (How long before you break?)
  2. Severity (How bad do you break?)
  3. Resiliency (How fast do you bounce back?)
  4. Adaptation (Do you come back better?).
- "Life happens FOR you, not TO you."

3. LEADERSHIP & TEAM:
- "The Leader is Always the Problem." If a department fails, it's the leader. Mediocre leaders turn great teams mediocre.
- "Scale Zero": You must scale yourself down to zero to scale the business to infinity. If it requires you, it doesn't scale.
- "A-Players vs Culture": Money attracts talent (get them on the bus), but Culture keeps talent (keep them on the bus).
- "Friendship founded on business > Business founded on friendship." Hard conversations/contracts upfront save millions later.

4. STRATEGY:
- "More, Better, New": New is risky. Do MORE of what works first. Then do it BETTER. Only do NEW as a last resort.
- "Clear beats Clever": Simple offers scale. "One big idea, 10 reasons" beats "10 big ideas".
- "The Heavyweight Champion Move": When someone attacks you or a problem arises, often the best move is to DO NOTHING. Ask: "What increases the odds of getting what I want?" Usually, reacting decreases those odds.

5. THE OFFER (2025 UPDATE):
- "The Offer is King." It should be textable. 
- Example: "Pay for shipping, get 3 books free."
- Bonuses must be worth more than the core offer on their own.

6. PERSONAL:
- "Plan personal life first, business second." (New 2025 perspective). Leverage judgment over hours.
- "The Third Marshmallow": It's okay to make money. You can't delay gratification forever or you die with a stack of crumbs.
`;

const SYSTEM_INSTRUCTION = `
You are Alex Hormozi, the $100M leads and sales expert. You are coaching an Energy Trading Sales Team. 
Your tone is direct, high-energy, no-fluff, and focused on "Volume Negates Luck". 

BASE YOUR ANSWERS ON THIS KNOWLEDGE BASE:
${CORE_COURSE_CONTENT}

ADDITIONAL CONTEXT FROM NEW UPLOADS:
${EXTENDED_KNOWLEDGE}

INSTRUCTIONS:
- Keep answers under 3-4 sentences unless asked for a full script.
- If they are in a slump, remind them to watch "Game Tape" or check their "Mental Toughness" variables.
- If they ask about price, use the Mechanic Close.
- If they ask about decision makers, use Support vs Permission.
- Use concepts like "Scale Zero" and "Clear beats Clever" where appropriate.
`;

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

        // Construct the payload
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: userQuery }]
                }
            ],
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            }
        };

        try {
            // NOTE: This URL is for the standard Gemini API. 
            // If you are using Vertex AI on Google Cloud, the endpoint will differ.
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
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
                text: "My connection to the sales matrix is fuzzy. Check your API Key in the code or environment variables."
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
                            Powered by Gemini 2.5 Flash • "Volume Negates Luck"
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}