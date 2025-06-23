import config from '../config';

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

export interface FormattedSummary {
  formatted_text: string;
  has_formatting: boolean;
  sections?: Array<{
    type: 'paragraph' | 'header' | 'list';
    content?: string;
    level?: number;
    items?: string[];
  }>;
}

export interface YouTubeTranscript {
  title: string;
  videoId: string;
  transcript: TranscriptItem[];
  summary?: FormattedSummary;
  language: string;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Check if current page is a YouTube video page
 */
export function isYouTubeVideoPage(): boolean {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const search = window.location.search;
  
  console.log('YouTube detection:', { hostname, pathname, search });
  
  const isYouTube = hostname.includes('youtube.com');
  const isWatchPage = pathname === '/watch';
  const hasVideoParam = search.includes('v=');
  
  console.log('Detection results:', { isYouTube, isWatchPage, hasVideoParam });
  
  return isYouTube && isWatchPage && hasVideoParam;
}

/**
 * Get video title from the page
 */
export function getVideoTitle(): string {
  // Multiple selectors to try for the video title
  const selectors = [
    'h1.ytd-watch-metadata yt-formatted-string',
    'h1.title.style-scope.ytd-video-primary-info-renderer',
    'h1.style-scope.ytd-video-primary-info-renderer',
    'h1 yt-formatted-string',
    '.watch-title',
    '#watch-headline-title',
    '.ytp-title-link',
    'meta[name="title"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const title = element.textContent?.trim() || 
                   (element as HTMLMetaElement).content?.trim();
      if (title) {
        console.log('Found title with selector:', selector, title);
        return title;
      }
    }
  }
  
  // Fallback to document title
  const docTitle = document.title;
  if (docTitle && docTitle !== 'YouTube') {
    const cleanTitle = docTitle.replace(' - YouTube', '').trim();
    if (cleanTitle) {
      console.log('Using document title:', cleanTitle);
      return cleanTitle;
    }
  }
  
  console.log('No title found, using default');
  return 'Unknown Title';
}

/**
 * Fetch transcript from YouTube's internal API
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<TranscriptItem[] | null> {
  try {
    try {
      const apiResponse = await fetch(config.getTranscriptUrl(videoId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(config.youtube.apiTimeout)
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        
        if (apiData.success && apiData.transcript) {
          console.log('Successfully fetched transcript from Flask API');
          return apiData.transcript.map((item: any) => ({
            text: item.text,
            start: item.start,
            duration: item.duration
          }));
        }
      }
    } catch (apiError) {
      console.log('Failed to get transcript: ', apiError);
    }

    return null;
  } catch (error) {
    console.info('Error fetching transcript:', error);
    return null;
  }
}

/**
 * Fetch summary from Flask API
 */
export async function fetchYouTubeSummary(videoId: string): Promise<FormattedSummary | null> {
  try {
    const apiResponse = await fetch(config.getSummaryUrl(videoId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(config.youtube.apiTimeout)
    });
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      
      if (apiData.success && apiData.summary) {
        console.log('Successfully fetched summary from Flask API');
        return apiData.summary; // This is now the formatted summary object
      } else {
        console.log('Flask API returned unsuccessful summary response:', apiData);
        return null;
      }
    } else {
      console.log('Flask summary API response not ok:', apiResponse.status);
      return null;
    }
  } catch (error) {
    console.log('Flask summary API not available or error occurred:', error);
    return null;
  }
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
