// Background script for YouTube Transcript Extension

// Define types locally to avoid imports
interface YouTubeTranscript {
  title: string;
  videoId: string;
  transcript: any[];
  language: string;
}

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com/watch')) {
    console.log('YouTube video page detected, ensuring content script is injected');
    
    try {
      // Try to inject content script programmatically as a fallback
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      console.log('Content script injected successfully');
    } catch (error) {
      console.log('Content script already injected or injection failed:', error);
    }
  }
  
  // Clear badge when tab is updated (navigating away from YouTube)
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.includes('youtube.com/watch')) {
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRANSCRIPT_FETCHED') {
    console.log('Transcript fetched from content script:', message);
    const transcript: YouTubeTranscript = message.data;
    console.log('Transcript received in background:', transcript.title);
    
    // Update extension badge to indicate transcript is available
    if (sender.tab?.id) {
      chrome.action.setBadgeText({
        text: '✓',
        tabId: sender.tab.id
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: '#22c55e', // Green color
        tabId: sender.tab.id
      });
    }
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Clear badge when tab is updated (navigating away from YouTube)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.includes('youtube.com/watch')) {
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Transcript Extension installed');
});