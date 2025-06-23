export const config = {
  // API Configuration
  api: {
    baseUrl: 'http://localhost',
    port: 5123,
    endpoints: {
      transcript: '/transcript',
      summary: '/summary',
      health: '/health'
    }
  },
  
  // Get full API URL
  getApiUrl: () => `${config.api.baseUrl}:${config.api.port}`,
  
  // Get specific endpoint URLs
  getTranscriptUrl: (videoId: string) => 
    `${config.getApiUrl()}${config.api.endpoints.transcript}/${videoId}`,
  
  getSummaryUrl: (videoId: string) => 
    `${config.getApiUrl()}${config.api.endpoints.summary}/${videoId}`,
  
  getHealthUrl: () => 
    `${config.getApiUrl()}${config.api.endpoints.health}`,
  
  // YouTube Configuration
  youtube: {
    apiTimeout: 10000,
    maxRetries: 2
  }
};

export default config;
