import React, { useEffect, useState } from 'react';

const Message = ({ text, sender }) => {
    const isUser = sender === 'user';

    // Local state to control enter animation
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        // Ensure the initial class is applied before transitioning to the final state
        const raf = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} px-2`}>
            <div
                // Use opacity-only enter animation so height/layout doesn't change during the animation
                className={`inline-block rounded-2xl px-4 py-3 max-w-[75%] whitespace-pre-wrap wrap-break-word transition-opacity duration-200 ease-out ${
                    entered ? 'opacity-100' : 'opacity-0'
                } ${isUser ? 'bg-[#3e3e42] text-white' : 'bg-[#3e3e42] text-gray-200'}`}
            >
                {text.split('\n').map((line, index) => (
                    <p key={index} className="m-0">{line}</p>
                ))}
            </div>
        </div>
    );
};

export default Message;