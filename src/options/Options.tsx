import React, { useState } from 'react';

const Options: React.FC = () => {
    const [settings, setSettings] = useState({
        enableNotifications: true,
        theme: 'light',
        autoUpdate: false,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleThemeChange = (theme: string) => {
        setSettings(prev => ({
            ...prev,
            theme
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="border-b border-gray-200 pb-6 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Extension Settings</h1>
                        <p className="text-gray-600 mt-2">
                            Configure your browser extension preferences and behavior.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* General Settings */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">General</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Enable Notifications</h3>
                                        <p className="text-sm text-gray-600">Receive notifications from the extension</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('enableNotifications')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                                  ${settings.enableNotifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                      ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Auto Update</h3>
                                        <p className="text-sm text-gray-600">Automatically update extension data</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('autoUpdate')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                                  ${settings.autoUpdate ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                      ${settings.autoUpdate ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Theme Settings */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Appearance</h2>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-3">Theme</h3>
                                <div className="flex space-x-3">
                                    {['light', 'dark', 'auto'].map((theme) => (
                                        <button
                                            key={theme}
                                            onClick={() => handleThemeChange(theme)}
                                            className={`px-4 py-2 rounded-md capitalize transition-colors
                                                      ${settings.theme === theme
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                                      }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                                             transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Options;