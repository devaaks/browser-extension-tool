import React, { useState, useEffect } from 'react';
import { TranscriptView, FormattedSummary } from '../components';
import { YouTubeTranscript, extractVideoId, fetchYouTubeTranscript, fetchYouTubeSummary, getVideoTitle } from '../utils/youtube';

const Popup: React.FC = () => {
    const [currentTranscript, setCurrentTranscript] = useState<YouTubeTranscript | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTranscript, setShowTranscript] = useState(false);

    useEffect(() => {
        loadCurrentTranscript();
        
        // Add click outside handler to close popup
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside the popup
            if (event.target && !(event.target as Element).closest('.popup-container')) {
                window.close();
            }
        };

        // Add blur event listener to close popup when it loses focus
        const handleBlur = () => {
            window.close();
        };

        // Add listeners
        document.addEventListener('click', handleClickOutside);
        window.addEventListener('blur', handleBlur);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    const loadCurrentTranscript = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url?.includes('youtube.com/watch')) {
                setCurrentTranscript(null);
                setIsLoading(false);
                return;
            }

            // Extract video ID from current tab URL
            const videoId = extractVideoId(tab.url);
            if (!videoId) {
                setCurrentTranscript(null);
                setIsLoading(false);
                return;
            }

            // Try to get stored transcript data
            const result = await chrome.storage.local.get(['currentTranscript', `transcript_${videoId}`]);
            let transcript = result.currentTranscript || result[`transcript_${videoId}`];

            // If no transcript found in storage or transcript is for a different video, fetch from API
            if (!transcript || transcript.videoId !== videoId) {
                console.log('Transcript not found in storage, fetching from API...');                    // Fetch transcript from API
                    const transcriptData = await fetchYouTubeTranscript(videoId);
                    
                    if (transcriptData) {
                        // Get video title from the current tab (inject script to get title)
                        let title = 'Unknown Title';
                        try {
                            const [titleResult] = await chrome.scripting.executeScript({
                                target: { tabId: tab.id! },
                                func: () => {
                                    const selectors = [
                                        'h1.ytd-watch-metadata yt-formatted-string',
                                        'h1.title.style-scope.ytd-video-primary-info-renderer',
                                        'h1.style-scope.ytd-video-primary-info-renderer',
                                        'h1 yt-formatted-string',
                                        'meta[name="title"]'
                                    ];
                                    
                                    for (const selector of selectors) {
                                        const element = document.querySelector(selector);
                                        if (element) {
                                            const titleText = element.textContent?.trim() || 
                                                           (element as HTMLMetaElement).content?.trim();
                                            if (titleText) return titleText;
                                        }
                                    }
                                    
                                    // Fallback to document title
                                    const docTitle = document.title;
                                    return docTitle && docTitle !== 'YouTube' 
                                        ? docTitle.replace(' - YouTube', '').trim() 
                                        : 'Unknown Title';
                                }
                            });
                            
                            if (titleResult?.result) {
                                title = titleResult.result;
                            }
                        } catch (scriptError) {
                            console.log('Could not inject script to get title, using default');
                        }

                        // Fetch summary from API
                        const summary = await fetchYouTubeSummary(videoId);

                        // Create transcript object
                        transcript = {
                            title,
                            videoId,
                            transcript: transcriptData,
                            summary: summary || undefined,
                            language: 'en'
                        };

                    // Store the fetched transcript
                    await chrome.storage.local.set({
                        [`transcript_${videoId}`]: transcript,
                        currentTranscript: transcript
                    });

                    console.log('Transcript fetched and stored from API');
                } else {
                    setError('No transcript available for this video');
                    setCurrentTranscript(null);
                    setIsLoading(false);
                    return;
                }
            }

            if (transcript && transcript.videoId) {
                setCurrentTranscript(transcript);
            } else {
                setCurrentTranscript(null);
            }
        } catch (err) {
            console.error('Error loading transcript:', err);
            setError('Failed to load transcript data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTimeClick = async (time: number) => {
        try {
            // Get current tab and update video time
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'SEEK_TO_TIME',
                    time: time
                });
            }
        } catch (err) {
            console.error('Error seeking to time:', err);
        }
    };

    const handleRefresh = () => {
        loadCurrentTranscript();
    };

    const copyTranscript = () => {
        if (!currentTranscript?.transcript) return;
        
        const text = currentTranscript.transcript
            .map(item => item.text)
            .join(' ');
        
        navigator.clipboard.writeText(text).then(() => {
            // Could add a toast notification here
            console.log('Transcript copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy transcript:', err);
        });
    };

    if (isLoading) {
        return (
            <div className="w-96 h-96 bg-gradient-to-br from-red-50 to-pink-100 p-6 popup-container">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">Loading transcript...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-96 h-96 bg-gradient-to-br from-red-50 to-pink-100 p-6 popup-container">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-red-600 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600 text-center">{error}</p>
                    <button 
                        onClick={handleRefresh}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-96 h-96 bg-gradient-to-br from-red-50 to-pink-100 flex flex-col popup-container"
             onClick={(e) => e.stopPropagation()} // Prevent clicks inside popup from closing it
        >
            {/* Header */}
            <div className="p-4 border-b border-red-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        📺 YouTube Transcript
                    </h1>
                    <button
                        id='refresh-button'
                        onClick={handleRefresh}
                        className="p-1 hover:bg-red-200 rounded h-8"
                        title="Refresh"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                       </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {currentTranscript ? (
                    <div className="h-full flex flex-col">
                        {/* Video Info */}
                        <div className="p-4 border-b border-red-200">
                            <h2 className="font-medium text-gray-800 text-sm leading-tight mb-2">
                                {currentTranscript.title}
                            </h2>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">
                                    {showTranscript 
                                        ? `${currentTranscript.transcript.length} segments`
                                        : currentTranscript.summary ? 'AI Summary' : 'No summary available'
                                    }
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowTranscript(!showTranscript)}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                                        title={showTranscript ? "Show AI Summary" : "Show Full Transcript"}
                                    >
                                        {showTranscript ? "📝 Summary" : "📄 Transcript"}
                                    </button>
                                    {showTranscript && (
                                        <button 
                                            onClick={copyTranscript}
                                            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                                            title="Copy transcript to clipboard"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden p-4">
                            {showTranscript ? (
                                <div className="h-full hidden-scrollbar">
                                    <TranscriptView 
                                        transcript={currentTranscript.transcript}
                                        onTimeClick={handleTimeClick}
                                    />
                                </div>
                            ) : (
                                <div className="h-full hidden-scrollbar">
                                    {currentTranscript.summary ? (
                                        <div className="selectable-text">
                                            <FormattedSummary summary={currentTranscript.summary} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="text-4xl mb-4">🤖</div>
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                                Summary Not Available
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                AI summary couldn't be generated for this video.
                                            </p>
                                            <button 
                                                onClick={() => setShowTranscript(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                View Transcript Instead
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="text-6xl mb-4">📺</div>
                        <h2 className="text-lg font-medium text-gray-800 mb-2">
                            No YouTube Video Detected
                        </h2>
                        <p className="text-sm text-gray-600 mb-4 selectable-text">
                            Navigate to a YouTube video page to automatically fetch the transcript.
                        </p>
                        <div className="text-xs text-gray-500 space-y-1 selectable-text">
                            <p>• Transcripts are fetched automatically</p>
                            <p>• Click timestamps to jump to specific times</p>
                            <p>• Copy transcripts to clipboard</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popup;