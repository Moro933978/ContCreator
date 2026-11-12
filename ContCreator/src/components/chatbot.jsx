import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { sendChatMessage } from '../gemini';

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
    const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return segments.map((segment, i) =>
        segment.startsWith('**') && segment.endsWith('**')
            ? <strong key={`${keyPrefix}-${i}`} className="font-bold tracking-wide text-white">{segment.slice(2, -2)}</strong>
            : <React.Fragment key={`${keyPrefix}-${i}`}>{segment}</React.Fragment>
    );
};

const FormattedMessage = ({ text }) => {
    if (!text) return null;
    return (
        <div className="flex flex-col w-full" dir="auto">
            {text.split('\n').map((rawLine, idx) => {
                const line = rawLine.trim();
                if (!line) return <div key={idx} className="h-3" aria-hidden="true" />;

                if (/^#{1,6}\s+/.test(line)) {
                    return (
                        <h3 key={idx} dir="auto" className="mt-8 mb-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            {renderInline(line.replace(/^#{1,6}\s+/, ''), idx)}
                        </h3>
                    );
                }

                if (/^[-*]\s+/.test(line)) {
                    return (
                        <div key={idx} dir="auto" className="flex items-start gap-3 mb-4">
                            <span className="mt-[10px] w-2 h-2 rounded-xl bg-purple-500 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                            <p className="flex-1 text-[16px] sm:text-[17px] leading-relaxed text-zinc-200">
                                {renderInline(line.replace(/^[-*]\s+/, ''), idx)}
                            </p>
                        </div>
                    );
                }

                return (
                    <p key={idx} dir="auto" className="text-[16px] sm:text-[17px] leading-relaxed text-zinc-200 mb-5">
                        {renderInline(line, idx)}
                    </p>
                );
            })}
        </div>
    );
};

const SmoothTypewriter = React.memo(({ text, speed = 10, onComplete }) => {
    const [displayedLength, setDisplayedLength] = useState(text.length);
    const initial = useRef(true);

    useEffect(() => {
        if (initial.current) {
            initial.current = false;
            let i = 0;
            setDisplayedLength(0);
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayedLength(prev => prev + 1);
                    i++;
                } else {
                    clearInterval(timer);
                    onComplete?.();
                }
            }, speed);
            return () => clearInterval(timer);
        }
        setDisplayedLength(text.length);
    }, [text, speed, onComplete]);

    return <FormattedMessage text={text.substring(0, displayedLength)} />;
});

export default function ContentCreatorBot({ onClose }) {
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('techook_chats');
        if (saved) {
            try {
                return JSON.parse(saved).map(c => ({
                    ...c,
                    messages: c.messages.map(m => ({ ...m, isNew: false }))
                }));
            } catch {
                localStorage.removeItem('techook_chats');
            }
        }

        return [{
            id: 'chat_' + Date.now(),
            title: 'Welcome Session',
            createdAt: Date.now(),
            messages: [{
                role: 'assistant',
                content: "Welcome to Techook Studio Workspace.\n\nI am your AI Content Strategist. Let's engineer your next viral masterpiece.",
                isNew: false
            }]
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

    const chatContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const stopChatRef = useRef(false);
    const imageSrc = "/HLogo.png";

    useEffect(() => {
        if (!activeChatId && chats[0]) setActiveChatId(chats[0].id);
    }, [activeChatId, chats]);

    useEffect(() => {
        localStorage.setItem('techook_chats', JSON.stringify(
            chats.map(c => ({
                ...c,
                messages: c.messages.map(m => ({ ...m, isNew: false }))
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

    const scrollChatToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollChatToBottom();
    }, [chats, isLoading]);

    const currentChat = chats.find(c => c.id === activeChatId) || chats[0];
    const messages = currentChat?.messages || [];

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
        stopChatRef.current = true;
        setIsLoading(false);
        setChats(prev => prev.map(chat =>
            chat.id === activeChatId
                ? { ...chat, messages: [...chat.messages, { role: 'assistant', content: 'You stopped the chat.', isNew: true }] }
                : chat
        ));
    };

    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support the Web Speech API. Please try Google Chrome or Microsoft Edge.');
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
        recognition.onerror = event => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        const chatIdAtSend = activeChatId;
        const chatBeforeSend = chats.find(c => c.id === chatIdAtSend);
        const history = chatBeforeSend?.messages || [];

        stopChatRef.current = false;
        setInput('');
        setIsLoading(true);

        // Real interaction timestamp. No fake counters.
        await updateChatbotStats();

        setChats(prev => prev.map(chat => {
            if (chat.id !== chatIdAtSend) return chat;
            const defaultTitle = chat.title === 'Welcome Session' || chat.title === 'New Chat';
            const title = defaultTitle
                ? (userText.length > 22 ? userText.substring(0, 22) + '...' : userText)
                : chat.title;
            return {
                ...chat,
                title,
                messages: [...chat.messages, { role: 'user', content: userText, isNew: false }],
                createdAt: Date.now()
            };
        }));

        try {
            const botResponse = await sendChatMessage(history, userText);

            // Count only a successful AI generation.
            await updateChatbotStats({ generate: true });

            if (!stopChatRef.current) {
                setChats(prev => prev.map(chat =>
                    chat.id === chatIdAtSend
                        ? {
                            ...chat,
                            messages: [...chat.messages, { role: 'assistant', content: botResponse, isNew: true }],
                            createdAt: Date.now()
                        }
                        : chat
                ));
            }
        } catch (error) {
            console.error('Chat generation error:', error);
            if (!stopChatRef.current) {
                setChats(prev => prev.map(chat =>
                    chat.id === chatIdAtSend
                        ? {
                            ...chat,
                            messages: [...chat.messages, {
                                role: 'assistant',
                                content: 'Connection Error: Unable to process request.',
                                isNew: true
                            }]
                        }
                        : chat
                ));
            }
        } finally {
            setIsLoading(false);
        }
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

    return (
        <div className="fixed inset-0 w-screen h-screen bg-[#07070b] text-[#f4f4f6] flex overflow-hidden font-sans antialiased z-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(147,51,234,0.1),_transparent_60%)] pointer-events-none" />

            <AnimatePresence>
                {isSidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {isSidebarOpen && (
                    <motion.aside
                        initial={isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }}
                        animate={isMobile ? { x: 0, opacity: 1 } : { width: 280, opacity: 1 }}
                        exit={isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        className={`h-full w-70 bg-[#0c0c14] border-r border-zinc-800/40 flex flex-col justify-between shrink-0 z-40 overflow-hidden ${isMobile ? 'fixed top-0 left-0' : 'relative'}`}
                    >
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="p-4 pt-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="relative w-9 h-9 rounded-xl bg-[#0d0d16] border border-purple-500/30 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-md" />
                                        <img src={imageSrc} alt="Techook Logo" className="relative object-contain w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-[13px] font-bold text-white tracking-widest">TECHOOK AI</h2>
                                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Engine v2.5</p>
                                    </div>
                                </div>

                                <button onClick={handleNewChat} className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold flex items-center gap-3 bg-purple-600 hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                    New Chat
                                </button>

                                <div className="relative mt-5">
                                    <svg className="absolute -translate-y-1/2 left-3 top-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search chats..."
                                        className="w-full bg-[#13131f] border border-zinc-800/50 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
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
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                        <p className="text-xs mt-2">No chats found.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-zinc-800/40 bg-[#0c0c14]">
                                <div className="flex items-center gap-3 w-full bg-[#13131f] border border-zinc-800/50 p-2.5 rounded-xl">
                                    <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-purple-300 border rounded-xl bg-purple-900/40 border-purple-500/20 shrink-0">T</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">TechHook Studio</p>
                                        <p className="text-[10px] text-purple-400">Pro Plan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#07070b]">
                <header className="h-[72px] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 border-b border-zinc-800/40 bg-[#07070b] shadow-[0_0_20px_rgba(168,85,247,0.05)]">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={() => setIsSidebarOpen(v => !v)} className="p-1 transition-colors text-zinc-400 hover:text-white" aria-label="Toggle sidebar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /></svg>
                        </button>
                        <div className="flex items-center gap-2 border border-zinc-800/60 bg-[#13131f]/50 rounded-xl px-3 py-1.5">
                            <span className="text-[11px] font-bold text-purple-400 tracking-widest uppercase">Techook Engine</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-[#13131f] border border-zinc-800/60 px-3 py-1.5 rounded-xl">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-xl shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <span className="text-xs font-medium tracking-wide text-zinc-300">Connected</span>
                        </div>
                        <button onClick={onClose} className="p-2 transition-all rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800" aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                </header>

                <div ref={chatContainerRef} className="z-10 flex-1 w-full overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col w-full max-w-4xl px-3 py-6 pb-40 mx-auto sm:px-6">
                        {(messages.length === 0 || (messages.length === 1 && messages[0].content.includes('Welcome'))) && (
                            <div className="flex flex-col items-center justify-center h-full mt-10 text-center sm:mt-20">
                                <div className="relative w-16 h-16 rounded-xl bg-[#0d0d16] border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                                    <img src={imageSrc} alt="AI" className="relative object-contain w-10 h-10" />
                                </div>
                                <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Hey there! 👋</h1>
                                <p className="max-w-md px-4 text-base tracking-wide text-zinc-400 sm:text-lg">I'm your AI Content Strategist.<br />What would you like to create today?</p>
                            </div>
                        )}

                        <div className="space-y-6 sm:space-y-8">
                            {messages.map((msg, idx) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={idx} className={`flex gap-3 sm:gap-5 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isUser && (
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0d0d16] border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                                                <img src={imageSrc} alt="AI" className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] object-contain" />
                                            </div>
                                        )}
                                        <div className={`max-w-[95%] sm:max-w-[85%] px-5 sm:px-6 py-4 sm:py-5 rounded-2xl ${isUser ? 'bg-[#1a1a2e] text-zinc-100 border border-purple-500/20 rounded-tr-sm shadow-md' : 'bg-transparent text-zinc-100 border-none px-0'}`}>
                                            {isUser
                                                ? <p className="whitespace-pre-line tracking-wide leading-relaxed text-[16px] sm:text-[17px]" dir="auto">{msg.content}</p>
                                                : msg.isNew && idx === messages.length - 1
                                                    ? <SmoothTypewriter text={msg.content} onComplete={scrollChatToBottom} />
                                                    : <FormattedMessage text={msg.content} />}
                                        </div>
                                    </div>
                                );
                            })}

                            {isLoading && !stopChatRef.current && (
                                <div className="flex items-center justify-start w-full gap-3 sm:gap-5">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0d0d16] border border-purple-500/20 flex items-center justify-center shrink-0">
                                        <img src={imageSrc} alt="AI" className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] object-contain animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-xl animate-bounce" />
                                        <span className="w-2 h-2 bg-blue-500 rounded-xl animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-xl animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 w-full max-w-4xl mx-auto px-3 sm:px-4 pb-6 pt-4 bg-gradient-to-t from-[#07070b] via-[#07070b]/90 to-transparent z-20">
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex justify-center mb-4">
                                <button onClick={handleStopChat} className="flex items-center gap-2 bg-[#1a1a2e] border border-zinc-700 hover:border-rose-500/50 text-zinc-300 hover:text-rose-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
                                    Stop generation
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSendMessage} className="relative flex items-center w-full group">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            dir="auto"
                            placeholder={isListening ? 'Listening...' : 'Type a message...'}
                            className={`w-full bg-[#0c0c14] border border-zinc-800/80 group-hover:border-purple-500/40 rounded-xl pl-12 pr-24 py-4 text-[16px] text-white placeholder-zinc-500 focus:outline-none transition-all shadow-lg ${isListening ? 'border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'focus:border-purple-500/60'}`}
                        />
                        <div className="absolute left-4 text-zinc-500">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        </div>
                        <div className="absolute flex items-center gap-2 right-3">
                            <button type="button" onClick={handleMicClick} className={`p-2 rounded-xl transition-all flex items-center justify-center ${isListening ? 'text-purple-400 bg-purple-500/10 animate-pulse' : 'text-zinc-500 hover:text-purple-300 hover:bg-zinc-800/50'}`} aria-label="Voice input">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            </button>
                            <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 bg-purple-600 text-white hover:bg-purple-500 disabled:bg-[#1f1f2e] disabled:text-zinc-600 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md" aria-label="Send message">
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
        <div className="mb-6">
            <p className="text-[11px] text-zinc-500 mb-2 px-3">{title}</p>
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
        <div onClick={onClick} className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer group transition-colors duration-150 ${isActive ? 'bg-purple-500/[0.15] border border-purple-500/20' : 'hover:bg-zinc-800/40 border border-transparent'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                </div>
                <div className={`truncate text-[12px] ${isActive ? 'text-purple-100 font-medium' : 'text-zinc-400'}`}>{chat.title}</div>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={e => onDelete(e, chat.id)} className="p-1 transition-all opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl" title="Delete Chat" aria-label="Delete Chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6" /><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 1 2 2v2" /></svg>
                </button>
                <span className={`text-[10px] shrink-0 ${isActive ? 'text-purple-300/80' : 'text-zinc-600 group-hover:hidden'}`}>{formatTime(timestamp)}</span>
            </div>
        </div>
    );
}
