import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { sendChatMessage } from '../gemini';

const SUGGESTED_PROMPTS = [
    {
        title: "Viral Short-Form Hook",
        desc: "Give me 5 scroll-stopping hooks for a tech review video",
        prompt: "Give me 5 scroll-stopping viral hooks for a 60-second tech review video on YouTube Shorts and Reels."
    },
    {
        title: "YouTube Video Blueprint",
        desc: "Structure a high-retention 8-minute educational video",
        prompt: "Create a high-retention 8-minute YouTube video script structure with intro hook, pacing beats, and call-to-action."
    },
    {
        title: "أفكار محتوى فيرال",
        desc: "اقترح 5 أفكار فيديوهات قصيرة تجيب مشاهدات عالية",
        prompt: "اقترح لي 5 أفكار فيديوهات قصيرة (Reels / TikTok) في مجال التكنولوجيا وصناعة المحتوى بأسلوب جذاب ومشوق."
    },
    {
        title: "Growth & Algorithm Strategy",
        desc: "Analyze why views plateau and how to break 100K",
        prompt: "My short-form videos stop getting views around 2,000. Give me an actionable checklist to fix retention and break 100K views."
    }
];

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

// Saves real usage for the currently authenticated user.
// Firestore path: users/{uid}/features/chatbot
const updateChatbotStats = async ({ generate = false } = {}) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const ref = doc(db, 'users', user.uid, 'features', 'chatbot');
        const data = {
            lastInteractionAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        if (generate) data.generateCount = increment(1);
        await setDoc(ref, data, { merge: true });
    } catch (error) {
        console.error('Failed to save chatbot stats:', error);
    }
};

const renderInline = (line, keyPrefix) => {
    const segments = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    return segments.map((segment, i) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
            return (
                <strong key={`${keyPrefix}-${i}`} className="font-bold tracking-wide text-white">
                    {segment.slice(2, -2)}
                </strong>
            );
        }
        if (segment.startsWith('`') && segment.endsWith('`')) {
            return (
                <code key={`${keyPrefix}-${i}`} className="px-1.5 py-0.5 mx-0.5 text-[14px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/25 rounded-md">
                    {segment.slice(1, -1)}
                </code>
            );
        }
        return <React.Fragment key={`${keyPrefix}-${i}`}>{segment}</React.Fragment>;
    });
};

const FormattedMessage = ({ text, isStreaming }) => {
    if (!text && !isStreaming) return null;

    return (
        <div className="flex flex-col w-full" dir="auto">
            {text.split('\n').map((rawLine, idx, arr) => {
                const line = rawLine.trim();
                const isLastLine = idx === arr.length - 1;

                if (!line) return <div key={idx} className="h-2.5" aria-hidden="true" />;

                if (/^#{1,6}\s+/.test(line)) {
                    return (
                        <h3 key={idx} dir="auto" className="mt-6 mb-3 text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-purple-200 sm:text-2xl">
                            {renderInline(line.replace(/^#{1,6}\s+/, ''), idx)}
                            {isStreaming && isLastLine && <StreamingCursor />}
                        </h3>
                    );
                }

                if (/^[-*]\s+/.test(line)) {
                    return (
                        <div key={idx} dir="auto" className="flex items-start gap-3 mb-3.5">
                            <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-purple-500 to-blue-400 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.85)]" />
                            <p className="flex-1 text-[15.5px] sm:text-[16.5px] leading-relaxed text-zinc-200">
                                {renderInline(line.replace(/^[-*]\s+/, ''), idx)}
                                {isStreaming && isLastLine && <StreamingCursor />}
                            </p>
                        </div>
                    );
                }

                if (/^\d+\.\s+/.test(line)) {
                    const match = line.match(/^(\d+\.)\s+(.*)/);
                    return (
                        <div key={idx} dir="auto" className="flex items-start gap-3 mb-3.5">
                            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                                {match[1]}
                            </span>
                            <p className="flex-1 text-[15.5px] sm:text-[16.5px] leading-relaxed text-zinc-200">
                                {renderInline(match[2], idx)}
                                {isStreaming && isLastLine && <StreamingCursor />}
                            </p>
                        </div>
                    );
                }

                return (
                    <p key={idx} dir="auto" className="text-[15.5px] sm:text-[16.5px] leading-relaxed text-zinc-200 mb-4">
                        {renderInline(line, idx)}
                        {isStreaming && isLastLine && <StreamingCursor />}
                    </p>
                );
            })}
        </div>
    );
};

const StreamingCursor = () => (
    <span className="inline-block w-2 h-4 ml-1 align-middle bg-purple-400 rounded-sm animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
);

export default function ContentCreatorBot({ onClose }) {
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('techook_chats');
        if (saved) {
            try {
                return JSON.parse(saved).map(c => ({
                    ...c,
                    messages: c.messages.map(m => ({ ...m, isStreaming: false }))
                }));
            } catch {
                localStorage.removeItem('techook_chats');
            }
        }

        return [{
            id: 'chat_' + Date.now(),
            title: 'Welcome Session',
            createdAt: Date.now(),
            messages: []
        }];
    });

    const [activeChatId, setActiveChatId] = useState(() => {
        try {
            const saved = localStorage.getItem('techook_chats');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.length) return parsed[0].id;
            }
        } catch {}
        return null;
    });

    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 768 : true);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState(null);

    const chatContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const imageSrc = "/HLogo.png";

    useEffect(() => {
        if (!activeChatId && chats[0]) setActiveChatId(chats[0].id);
    }, [activeChatId, chats]);

    useEffect(() => {
        localStorage.setItem('techook_chats', JSON.stringify(
            chats.map(c => ({
                ...c,
                messages: c.messages.map(m => ({ ...m, isStreaming: false }))
            }))
        ));
    }, [chats]);

    useEffect(() => {
        const resize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setIsSidebarOpen(!mobile);
        };
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const scrollChatToBottom = (instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    };

    useEffect(() => {
        scrollChatToBottom(isLoading);
    }, [chats, isLoading]);

    const currentChat = chats.find(c => c.id === activeChatId) || chats[0];
    const messages = currentChat?.messages || [];

    const handleCopyText = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const handleNewChat = () => {
        const id = 'chat_' + Date.now();
        setChats(prev => [{ id, title: 'New Chat', createdAt: Date.now(), messages: [] }, ...prev]);
        setActiveChatId(id);
        setSearchQuery('');
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleDeleteChat = (e, chatId) => {
        e.stopPropagation();
        const updated = chats.filter(c => c.id !== chatId);
        if (!updated.length) {
            const id = 'chat_' + Date.now();
            setChats([{ id, title: 'New Chat', createdAt: Date.now(), messages: [] }]);
            setActiveChatId(id);
        } else {
            setChats(updated);
            if (activeChatId === chatId) setActiveChatId(updated[0].id);
        }
    };

    const handleStopChat = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
        setChats(prev => prev.map(chat => {
            if (chat.id !== activeChatId) return chat;
            const msgs = [...chat.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'assistant') {
                last.isStreaming = false;
                if (!last.content) last.content = '_Generation stopped._';
            }
            return { ...chat, messages: msgs };
        }));
    };

    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support Voice Input. Please try Chrome or Edge.');
            return;
        }
        if (isListening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-EG';
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = event => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const triggerSendMessage = async (customText) => {
        const textToSend = (customText ?? input).trim();
        if (!textToSend || isLoading) return;

        const chatIdAtSend = activeChatId;
        const chatBeforeSend = chats.find(c => c.id === chatIdAtSend);
        const history = chatBeforeSend?.messages || [];

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setInput('');
        setIsLoading(true);

        await updateChatbotStats();

        // Append user message and an empty streaming assistant placeholder immediately
        setChats(prev => prev.map(chat => {
            if (chat.id !== chatIdAtSend) return chat;
            const defaultTitle = chat.title === 'Welcome Session' || chat.title === 'New Chat';
            const title = defaultTitle
                ? (textToSend.length > 26 ? textToSend.substring(0, 26) + '...' : textToSend)
                : chat.title;
            return {
                ...chat,
                title,
                messages: [
                    ...chat.messages,
                    { role: 'user', content: textToSend, isStreaming: false },
                    { role: 'assistant', content: '', isStreaming: true }
                ],
                createdAt: Date.now()
            };
        }));

        try {
            await sendChatMessage(
                history,
                textToSend,
                (streamedText) => {
                    setChats(prev => prev.map(chat => {
                        if (chat.id !== chatIdAtSend) return chat;
                        const updatedMsgs = [...chat.messages];
                        const lastIdx = updatedMsgs.length - 1;
                        if (lastIdx >= 0 && updatedMsgs[lastIdx].role === 'assistant') {
                            updatedMsgs[lastIdx] = {
                                ...updatedMsgs[lastIdx],
                                content: streamedText,
                                isStreaming: true
                            };
                        }
                        return { ...chat, messages: updatedMsgs };
                    }));
                },
                controller.signal
            );

            await updateChatbotStats({ generate: true });

            // Finalize message state
            setChats(prev => prev.map(chat => {
                if (chat.id !== chatIdAtSend) return chat;
                const updatedMsgs = [...chat.messages];
                const lastIdx = updatedMsgs.length - 1;
                if (lastIdx >= 0 && updatedMsgs[lastIdx].role === 'assistant') {
                    updatedMsgs[lastIdx] = { ...updatedMsgs[lastIdx], isStreaming: false };
                }
                return { ...chat, messages: updatedMsgs, createdAt: Date.now() };
            }));
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Chat generation error:', error);
            setChats(prev => prev.map(chat => {
                if (chat.id !== chatIdAtSend) return chat;
                const updatedMsgs = [...chat.messages];
                const lastIdx = updatedMsgs.length - 1;
                if (lastIdx >= 0 && updatedMsgs[lastIdx].role === 'assistant') {
                    updatedMsgs[lastIdx] = {
                        role: 'assistant',
                        content: 'Connection Error: Unable to reach TechHook AI. Please try again.',
                        isStreaming: false
                    };
                }
                return { ...chat, messages: updatedMsgs };
            }));
        } finally {
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        triggerSendMessage();
    };

    const filteredChats = chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const groupedChats = { today: [], yesterday: [], previous: [] };
    const now = new Date();

    filteredChats.forEach(chat => {
        const date = new Date(chat.createdAt || Date.now());
        const diffDays = Math.floor(Math.abs(now - date) / 86400000);
        const sameDay = now.toDateString() === date.toDateString();

        if (diffDays === 0 && sameDay) groupedChats.today.push(chat);
        else if (diffDays === 1 || (diffDays === 0 && !sameDay)) groupedChats.yesterday.push(chat);
        else groupedChats.previous.push(chat);
    });

    const isEmptyState = messages.length === 0 || (messages.length === 1 && messages[0].content.includes('Welcome'));

    return (
        <div className="fixed inset-0 w-screen h-screen bg-[#06060a] text-[#f4f4f6] flex overflow-hidden font-sans antialiased z-50 selection:bg-purple-500/30 selection:text-purple-200">
            {/* Ambient Glow & Subtle Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(147,51,234,0.14),_transparent_55%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,_rgba(59,130,246,0.08),_transparent_45%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Glass Sidebar */}
            <AnimatePresence initial={false}>
                {isSidebarOpen && (
                    <motion.aside
                        initial={isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }}
                        animate={isMobile ? { x: 0, opacity: 1 } : { width: 280, opacity: 1 }}
                        exit={isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        className={`h-full w-[280px] bg-[#0a0a12]/90 backdrop-blur-xl border-r border-white/[0.06] flex flex-col justify-between shrink-0 z-40 overflow-hidden ${isMobile ? 'fixed top-0 left-0 shadow-2xl' : 'relative'}`}
                    >
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="p-4 pt-5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-purple-500/20 to-blue-500/10 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                        <img src={imageSrc} alt="Techook Logo" className="relative object-contain w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-[13px] font-bold text-white tracking-widest">TECHOOK AI</h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                            <p className="text-[10px] text-zinc-400 font-mono">Studio Engine</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleNewChat}
                                    className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/20 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.45)] active:scale-[0.98]"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                    New Session
                                </button>

                                <div className="relative mt-4">
                                    <svg className="absolute -translate-y-1/2 left-3 top-1/2 text-zinc-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search history..."
                                        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 px-3 pb-4 overflow-y-auto custom-scrollbar">
                                {filteredChats.length ? (
                                    <>
                                        {groupedChats.today.length > 0 && <ChatGroup title="Today" chats={groupedChats.today} active={activeChatId} onClick={setActiveChatId} onDelete={handleDeleteChat} />}
                                        {groupedChats.yesterday.length > 0 && <ChatGroup title="Yesterday" chats={groupedChats.yesterday} active={activeChatId} onClick={setActiveChatId} onDelete={handleDeleteChat} />}
                                        {groupedChats.previous.length > 0 && <ChatGroup title="Previous 7 Days" chats={groupedChats.previous} active={activeChatId} onClick={setActiveChatId} onDelete={handleDeleteChat} />}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
                                        <p className="text-xs">No matching sessions.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3.5 border-t border-white/[0.06] bg-black/20">
                                <div className="flex items-center gap-3 w-full bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-xl">
                                    <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-purple-300 border rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/20 border-purple-500/30 shrink-0">
                                        TS
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">TechHook Studio</p>
                                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            Creator Workspace
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Glass Header */}
                <header className="h-[68px] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 border-b border-white/[0.06] bg-[#06060a]/75 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(v => !v)}
                            className="p-2 rounded-xl transition-colors text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                            aria-label="Toggle sidebar"
                        >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /></svg>
                        </button>
                        <div className="flex items-center gap-2 border border-purple-500/20 bg-purple-500/[0.07] rounded-full px-3.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            <span className="text-[11px] font-semibold text-purple-300 tracking-wider uppercase">TechHook AI • Live Stream</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-[11px] font-medium text-zinc-300">Low-Latency Mode</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 transition-all rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/[0.08]"
                            aria-label="Close"
                        >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                </header>

                {/* Messages Area */}
                <div ref={chatContainerRef} className="z-10 flex-1 w-full overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col w-full max-w-4xl px-4 py-6 pb-44 mx-auto sm:px-6">
                        {isEmptyState ? (
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center justify-center my-auto mt-6 text-center sm:mt-14"
                            >
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-purple-500/20 to-blue-500/10 border border-purple-500/30 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(168,85,247,0.25)]">
                                    <img src={imageSrc} alt="AI" className="relative object-contain w-9 h-9" />
                                </div>
                                <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-purple-300 sm:text-4xl">
                                    Engineer Your Next Viral Hit
                                </h1>
                                <p className="max-w-lg px-4 mb-8 text-sm leading-relaxed text-zinc-400 sm:text-base">
                                    Powered by TechHook Studio. Generate scroll-stopping hooks, high-retention scripts, and growth strategies in seconds.
                                </p>

                                {/* Quick Action Cards */}
                                <div className="grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
                                    {SUGGESTED_PROMPTS.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => triggerSendMessage(item.prompt)}
                                            className="p-4 transition-all border group rounded-2xl bg-white/[0.025] hover:bg-purple-500/[0.08] border-white/[0.07] hover:border-purple-500/35 active:scale-[0.99]"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold tracking-wide text-purple-300 group-hover:text-purple-200">
                                                    {item.title}
                                                </span>
                                                <svg className="transition-transform text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </div>
                                            <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2" dir="auto">
                                                {item.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6 sm:space-y-7">
                                {messages.map((msg, idx) => {
                                    const isUser = msg.role === 'user';
                                    const isWaitingFirstChunk = !isUser && msg.isStreaming && !msg.content;

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex gap-3 sm:gap-4 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isUser && (
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-purple-500/20 to-blue-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                                    <img src={imageSrc} alt="AI" className={`w-4 h-4 sm:w-5 sm:h-5 object-contain ${msg.isStreaming ? 'animate-pulse' : ''}`} />
                                                </div>
                                            )}

                                            <div className={`group relative max-w-[92%] sm:max-w-[82%] ${isUser ? 'bg-gradient-to-br from-[#1c1b33] to-[#141426] text-zinc-100 border border-purple-500/25 px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-lg' : 'flex-1 pt-0.5'}`}>
                                                {isUser ? (
                                                    <p className="whitespace-pre-line tracking-wide leading-relaxed text-[15.5px] sm:text-[16.5px]" dir="auto">
                                                        {msg.content}
                                                    </p>
                                                ) : isWaitingFirstChunk ? (
                                                    <div className="flex items-center gap-2 py-2.5">
                                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '140ms' }} />
                                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '280ms' }} />
                                                        <span className="ml-1 text-xs font-mono text-zinc-500">Generating...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FormattedMessage text={msg.content} isStreaming={msg.isStreaming} />
                                                        {!msg.isStreaming && msg.content && (
                                                            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleCopyText(msg.content, idx)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all"
                                                                >
                                                                    {copiedIdx === idx ? (
                                                                        <>
                                                                            <svg className="text-emerald-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                                            <span className="text-emerald-400">Copied</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                                                            <span>Copy</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Command Input Bar */}
                <div className="absolute bottom-0 inset-x-0 w-full max-w-4xl mx-auto px-3 sm:px-6 pb-5 pt-6 bg-gradient-to-t from-[#06060a] via-[#06060a]/95 to-transparent z-20">
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex justify-center mb-3">
                                <button
                                    onClick={handleStopChat}
                                    className="flex items-center gap-2 bg-[#141422]/90 backdrop-blur-md border border-rose-500/30 hover:border-rose-500/60 text-zinc-200 hover:text-rose-300 px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-lg"
                                >
                                    <span className="w-2 h-2 rounded-xs bg-rose-500 animate-pulse" />
                                    Stop generating
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleFormSubmit} className="relative flex items-center w-full group">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600/20 via-indigo-500/20 to-blue-600/20 opacity-0 group-focus-within:opacity-100 blur transition-opacity pointer-events-none" />
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            dir="auto"
                            placeholder={isListening ? 'Listening to your voice...' : 'Ask TechHook AI for hooks, scripts, or growth ideas...'}
                            className={`relative w-full bg-[#0d0d16]/90 backdrop-blur-xl border border-white/[0.09] group-hover:border-purple-500/40 rounded-2xl pl-5 pr-24 py-4 text-[15.5px] text-white placeholder-zinc-500 focus:outline-none transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${isListening ? 'border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.25)]' : 'focus:border-purple-500/60'}`}
                        />
                        <div className="absolute flex items-center gap-1.5 right-2.5 z-10">
                            <button
                                type="button"
                                onClick={handleMicClick}
                                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isListening ? 'text-purple-300 bg-purple-500/20 animate-pulse' : 'text-zinc-400 hover:text-purple-300 hover:bg-white/[0.06]'}`}
                                aria-label="Voice input"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(147,51,234,0.35)] disabled:shadow-none active:scale-95"
                                aria-label="Send message"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function ChatGroup({ title, chats, active, onClick, onDelete }) {
    return (
        <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-3">{title}</p>
            <div className="space-y-1">
                {chats.map(chat => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === active}
                        onClick={() => onClick(chat.id)}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

function ChatItem({ chat, isActive, onClick, onDelete }) {
    const timestamp = chat.createdAt || Date.now();

    return (
        <div
            onClick={onClick}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer group transition-all duration-150 ${isActive ? 'bg-purple-500/[0.14] border border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.08)]' : 'hover:bg-white/[0.04] border border-transparent'}`}
        >
            <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div className={`truncate text-[12px] ${isActive ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {chat.title}
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={e => onDelete(e, chat.id)}
                    className="p-1 transition-all opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    title="Delete Chat"
                    aria-label="Delete Chat"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6" /><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 1 2 2v2" /></svg>
                </button>
                <span className={`text-[10px] shrink-0 font-mono ${isActive ? 'text-purple-300/70' : 'text-zinc-600 group-hover:hidden'}`}>
                    {formatTime(timestamp)}
                </span>
            </div>
        </div>
    );
}