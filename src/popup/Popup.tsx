import React, { useState } from 'react';

const Popup: React.FC = () => {
    const [message, setMessage] = useState<string>('Welcome to your Extension!');
    const [count, setCount] = useState<number>(0);

    const handleClick = () => {
        setCount(prev => prev + 1);
        setMessage(`Button clicked ${count + 1} time${count + 1 === 1 ? '' : 's'}!`);
    };

    return (
        <div className="w-80 h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        🚀 Browser Extension
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Built with React, TypeScript & Tailwind CSS
                    </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-md w-full text-center">
                    <p className="text-lg font-medium text-gray-700">{message}</p>
                    <div className="mt-2 text-3xl font-bold text-indigo-600">{count}</div>
                </div>

                <button 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                             transform hover:scale-105 transition-all duration-200 shadow-lg
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleClick}
                >
                    Click Me! 🎉
                </button>

                <div className="flex space-x-2 text-xs text-gray-500">
                    <span>Powered by</span>
                    <span className="font-semibold text-indigo-600">Vite ⚡</span>
                </div>
            </div>
        </div>
    );
};

export default Popup;