import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
import DOMPurify from 'dompurify';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm the EQUIP AI Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, { message: userMessage.text });

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.reply,
                sender: 'ai'
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error talking to AI:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm sorry, I'm having trouble connecting to my servers right now. Please try again later.",
                sender: 'ai',
                isError: true
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="p-4 bg-brand-600 text-white flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">EQUIP Assistant</h3>
                                <p className="text-xs text-brand-100 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'user'
                                        ? 'bg-brand-600 text-white rounded-tr-sm shadow-md'
                                        : msg.isError
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800/50 rounded-tl-sm'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-tl-sm'
                                        }`}
                                >
                                    {/* Simple Markdown rendering for bold text */}
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')) }} />
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-full pl-4 pr-12 py-3 text-sm outline-none transition-all disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 p-2 bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-full transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300 transform p-4 bg-accent-500 hover:bg-accent-600 text-white rounded-full shadow-lg shadow-accent-500/30 flex items-center justify-center`}
                aria-label="Open AI Chat"
            >
                <MessageSquare size={28} />
            </button>
        </div>
    );
};

export default ChatWidget;
