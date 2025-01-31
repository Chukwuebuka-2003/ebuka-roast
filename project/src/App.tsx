import React, { useState, useRef, useEffect } from 'react';
import { Flame, Send, MessageSquare } from 'lucide-react';

interface Message {
    content: string;
    isUser: boolean;
    timestamp: Date;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
         const fetchInitialMessage = async () => {
            setIsLoading(true);
             try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                 const response = await fetch('https://comp-eb.onrender.com/chat', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                         'Accept': 'application/json',
                     },
                     body: JSON.stringify({ message: "Hello" }),
                     signal: controller.signal
                 });

                 clearTimeout(timeoutId);

                 if (!response.ok) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                 }

                 const data = await response.json();

                 if (!data || typeof data.reply !== 'string') {
                     throw new Error('Invalid response format');
                 }
                 
                 const botMessage: Message = {
                     content: data.reply,
                     isUser: false,
                     timestamp: new Date(),
                 };

                 setMessages(prev => [...prev, botMessage]);

             } catch (error) {
                  console.error('Error:', error);
                let errorMessage = "Connection's worse than a Sunday league pitch. Try again later.";

                if (error instanceof Error) {
                  if (error.name === 'AbortError') {
                    errorMessage = "Server's taking longer than VAR. Try again.";
                  } else if (error.message.includes('Invalid response format')) {
                    errorMessage = "Server's playing like it's had too many at half-time. Try again.";
                  }
                }

                setMessages(prev => [...prev, {
                  content: errorMessage,
                  isUser: false,
                  timestamp: new Date(),
                }]);
             } finally {
                 setIsLoading(false);
             }
         };

          fetchInitialMessage();
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            content: input,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);


        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('https://comp-eb.onrender.com/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message: input }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || typeof data.reply !== 'string') {
                throw new Error('Invalid response format');
            }
            const botMessage: Message = {
                content: data.reply,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
             console.error('Error:', error);
                let errorMessage = "Connection's worse than a Sunday league pitch. Try again later.";

                if (error instanceof Error) {
                  if (error.name === 'AbortError') {
                    errorMessage = "Server's taking longer than VAR. Try again.";
                  } else if (error.message.includes('Invalid response format')) {
                    errorMessage = "Server's playing like it's had too many at half-time. Try again.";
                  }
                }

                setMessages(prev => [...prev, {
                  content: errorMessage,
                  isUser: false,
                  timestamp: new Date(),
                }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-600 to-purple-900">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-black/20 backdrop-blur-lg rounded-lg shadow-xl overflow-hidden border border-orange-500/20">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-700 p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center border-2 border-orange-400">
                            <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Football Roasting</h1>
                            <p className="text-orange-200 text-sm">Where banter burns brighter than VAR screens</p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="h-[600px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/10 to-black/30">
                        {messages.length === 0 && (
                            <div className="flex justify-center items-center h-full text-orange-200/70 text-center">
                                <div>
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Start the roast.<br/>Your football takes can't be worse than Arsenal's trophy cabinet.</p>
                                </div>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.isUser
                                            ? 'bg-orange-500 text-white rounded-br-none shadow-lg'
                                            : 'bg-red-700 text-white rounded-bl-none shadow-lg'
                                    }`}
                                >
                                    <p className="break-words">{message.content}</p>
                                    <span className="text-xs opacity-75 mt-1 block">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-red-700 text-white rounded-lg rounded-bl-none p-3 shadow-lg">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="p-4 bg-black/40">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Drop your hottest football take..."
                                className="flex-1 bg-black/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-orange-200/50"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg px-4 py-2 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default App;