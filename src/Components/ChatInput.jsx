import React, { useState } from 'react';
import { FiPaperclip, FiMic, FiArrowUp } from 'react-icons/fi';

const ChatInput = ({ onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Type your message..."
                    className="w-full pl-5 pr-14 py-4 bg-[#3e3e42] rounded-3xl resize-none text-white text-base"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="absolute right-3 p-2 rounded-full bg-white text-black disabled:text-white disabled:bg-[#777C6D] transition-colors"
                >
                    <FiArrowUp size={22} />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;