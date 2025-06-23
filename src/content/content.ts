// YouTube Transcript Extension Content Script
import { 
  extractVideoId, 
  isYouTubeVideoPage, 
  getVideoTitle, 
  fetchYouTubeTranscript,
  type TranscriptItem,
  type YouTubeTranscript
} from '../utils/youtube';

(function() {
  'use strict';

// Main content script logic
let currentVideoId: string | null = null;
let isProcessing = false;

/**
 * Process the current YouTube video page
 */
async function processYouTubeVideo() {
  console.log('processYouTubeVideo called');
  
  if (isProcessing) {
    console.log('Already processing, skipping');
    return;
  }
  
  const isYouTubePage = isYouTubeVideoPage();
  console.log('Is YouTube video page:', isYouTubePage);
  
  if (!isYouTubePage) {
    currentVideoId = null;
    console.log('Not a YouTube video page, clearing currentVideoId');
    return;
  }

  const videoId = extractVideoId(window.location.href);
  console.log('Extracted video ID:', videoId);
  
  if (!videoId) {
    console.log('No video ID found');
    return;
  }
  
  if (videoId === currentVideoId) {
    console.log('Same video ID as before, skipping');
    return; // Same video, no need to process again
  }

  isProcessing = true;
  currentVideoId = videoId;

  try {
    console.log('Fetching transcript for video:', videoId);
    
    const transcript = await fetchYouTubeTranscript(videoId);
    const title = getVideoTitle();
    
    console.log('Transcript fetched:', transcript ? transcript.length : 0, 'items');
    console.log('Video title:', title);
    
    const transcriptData: YouTubeTranscript = {
      title,
      videoId,
      transcript: transcript || [],
      language: 'en' // Default to English for now
    };

    // Store the transcript data
    await chrome.storage.local.set({
      [`transcript_${videoId}`]: transcriptData,
      currentTranscript: transcriptData
    });

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_FETCHED',
      data: transcriptData
    });

    console.log('Transcript fetched and stored:', transcriptData);
  } catch (error) {
    console.error('Error processing YouTube video:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Initialize the content script
 */
function init() {
  console.log('Initializing YouTube transcript extension on:', window.location.href);
  
  // Process current page if it's a YouTube video - with delay to allow page to load
  setTimeout(() => {
    console.log('Initial processing attempt');
    processYouTubeVideo();
  }, 2000);

  // Listen for URL changes (YouTube is a SPA)
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      console.log('URL changed from', lastUrl, 'to', currentUrl);
      lastUrl = currentUrl;
      // Delay processing to allow page to load
      setTimeout(() => {
        console.log('Processing after URL change');
        processYouTubeVideo();
      }, 2000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also listen for popstate events
  window.addEventListener('popstate', () => {
    console.log('Popstate event detected');
    setTimeout(() => {
      console.log('Processing after popstate');
      processYouTubeVideo();
    }, 2000);
  });

  // Listen for pushstate/replacestate (YouTube navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    console.log('PushState detected');
    setTimeout(() => {
      console.log('Processing after pushState');
      processYouTubeVideo();
    }, 2000);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    console.log('ReplaceState detected');
    setTimeout(() => {
      console.log('Processing after replaceState');
      processYouTubeVideo();
    }, 2000);
  };
  
  // Additional listener for when video player is ready
  const checkForVideoPlayer = () => {
    const video = document.querySelector('video');
    if (video) {
      console.log('Video element found, processing');
      processYouTubeVideo();
    } else {
      console.log('No video element found yet');
      setTimeout(checkForVideoPlayer, 1000);
    }
  };
  
  // Start checking for video player
  setTimeout(checkForVideoPlayer, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', init);
} else {
  console.log('DOM already loaded, initializing immediately');
  init();
}

// Add a status indicator to help with debugging
console.log('YouTube Transcript Extension content script loaded');
console.log('Current URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Pathname:', window.location.pathname);
console.log('Search:', window.location.search);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEEK_TO_TIME') {
    const time = message.time;
    
    // Try to find the YouTube player and seek to the specified time
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.currentTime = time;
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Video player not found' });
    }
  }
  
  return true;
});

})(); // Close the IIFE