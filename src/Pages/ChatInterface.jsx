import React, { useState, useEffect, useRef } from 'react';
import ChatInput from '../Components/ChatInput';
import Message from '../Components/Message';
import '../index.css'; 
import { extractJsonFromText } from '../Components/jsonParser';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(''); 
    const messagesEndRef = useRef(null);

    const DIFY_API_URL = import.meta.env.VITE_DIFY_API_URL;
    const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY;

    // previous messages length for scroll strategy
	const prevLengthRef = useRef(0);

    const scrollToBottom = (behavior = 'smooth') => {
		// schedule on next frame so DOM is updated before scrolling
		requestAnimationFrame(() => {
			messagesEndRef.current?.scrollIntoView({ behavior });
		});
	};

	// scroll behavior: instant for 0->1 transition, smooth otherwise
	useEffect(() => {
		const behavior = prevLengthRef.current === 0 && messages.length > 0 ? 'auto' : 'smooth';
		scrollToBottom(behavior);
		prevLengthRef.current = messages.length;
	}, [messages, isLoading]);

    const handleSendMessage = async (text) => {
        const newUserMessage = { text, sender: 'user' };
        // If it's the first message, start a new array. Otherwise, add to the existing one.
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        const payload = {
            inputs: {},
            query: text,
            user: "react-chat-user", // A unique ID for your user
            response_mode: "streaming",
            conversation_id: conversationId,
        };

        try {
            const response = await fetch(DIFY_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DIFY_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            // Handle the streaming response from Dify
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullBotMessage = "";
            let firstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const jsonData = JSON.parse(line.substring(5));
                        if (jsonData.answer) fullBotMessage += jsonData.answer;
                        if (jsonData.conversation_id) setConversationId(jsonData.conversation_id);

                        if (firstChunk) {
                            // On the first piece of the bot's response, add a new message to the array
                            setMessages(prev => [...prev, { text: fullBotMessage, sender: 'bot' }]);
                            firstChunk = false;
                        } else {
                            // For subsequent pieces, update the last message in the array
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1].text = fullBotMessage;
                                return newMessages;
                            });
                        }
                    } catch { /* ignore partial parse errors */ }
                }
            }

            // After streaming finishes, attempt to extract JSON and update the last bot message
            const { summary, json } = extractJsonFromText(fullBotMessage);
            if (json !== null) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    // find last bot message index
                    for (let i = newMessages.length - 1; i >= 0; i--) {
                        if (newMessages[i].sender === 'bot') {
                            newMessages[i] = {
                                ...newMessages[i],
                                text: summary,   // keep summaries on top
                                chartData: json, // parsed JSON for charts
                            };
                            break;
                        }
                    }
                    return newMessages;
                });
            } else {
                // no JSON found — keep fullBotMessage as final text (already set)
            }
        } catch (error) {
            console.error("Dify API call failed:", error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting. Please try again.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#212121] text-white flex flex-col">
            <div className="fixed top-4 left-4 z-50">
                <img src="/BPJS_Kesehatan_logo.png" alt="Logo" className="h-10 object-cover" />
            </div>

            {/* Centered column is the scroll container (scrollbar inside column as before) */}
			<div className="flex-1 flex justify-center">
				<div className="h-full w-full max-w-3xl flex flex-col">
					{/* Messages area: this is the scrollable container */}
					<div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scrollbar">
						{messages.length === 0 ? (
							// initial centered view inside same column to avoid layout swap
							<div className="h-full flex flex-col justify-center items-center px-4">
								<h1 className="text-3xl text-white mb-8">
									What can I help you with?
								</h1>
								<ChatInput onSendMessage={handleSendMessage} />
							</div>
						) : (
							// messages list
							<div className="flex flex-col space-y-4">
								{messages.map((msg, index) => (
									<Message key={index} text={msg.text} sender={msg.sender} chartData={msg.chartData} />
								))}
								{isLoading && messages[messages.length - 1]?.sender === 'user' && (
									<div className="self-start">
										<div className="bg-[#3e3e42] rounded-lg px-4 py-3 my-1 flex items-center space-x-1.5">
											<span className="h-2 w-2 bg-gray-400 rounded-full animate-typing-blink"></span>
											<span className="h-2 w-2 bg-gray-400 rounded-full animate-typing-blink-delay-1"></span>
											<span className="h-2 w-2 bg-gray-400 rounded-full animate-typing-blink-delay-2"></span>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
						)}
					</div>

					{/* Input pinned below column for both states when not in initial view */}
					{/* For the initial state ChatInput is already shown above; when messages exist keep input here */}
					{messages.length > 0 && (
						<div className="p-4 w-full">
							<ChatInput onSendMessage={handleSendMessage} />
						</div>
					)}
				</div>
			</div>
		</div>
    );
};

export default ChatInterface;