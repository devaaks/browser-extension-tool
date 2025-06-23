# YouTube Transcript Fetcher Extension

This is a modern browser extension built using **Vite**, **React 18**, **Tailwind CSS**, and **TypeScript** that automatically fetches YouTube video transcripts and provides **AI-powered summaries** using DeepSeek.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Modern React with hooks and concurrent features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📘 **TypeScript** - Type-safe JavaScript
- 🔧 **Manifest V3** - Latest Chrome extension format
- 🚀 **Hot Module Replacement** - Fast development experience
- 📺 **YouTube Integration** - Automatic transcript fetching
- 🤖 **AI Summaries** - Powered by DeepSeek through OpenRouter
- 🕐 **Clickable Timestamps** - Jump to specific video times
- 📋 **Copy to Clipboard** - Easy transcript sharing
- 🔄 **Toggle Views** - Switch between AI summary and full transcript

## YouTube Transcript Features

- **Automatic Detection**: Automatically detects when you're on a YouTube video page
- **Transcript Fetching**: Fetches available transcripts via Flask API backend
- **AI Summarization**: Generates concise summaries using DeepSeek AI model
- **Interactive Timeline**: Click on any timestamp to jump to that moment in the video
- **Copy Functionality**: Copy the entire transcript to your clipboard with one click
- **Visual Indicators**: Extension badge shows when a transcript is available
- **Real-time Updates**: Automatically updates when navigating between videos
- **Dual View Mode**: Toggle between AI summary and full transcript view

## API Backend

The extension includes a Flask API server that handles:
- **Transcript Fetching**: Uses `youtube-transcript-api` to get video transcripts
- **AI Summarization**: Integrates with OpenRouter API to use DeepSeek for summaries
- **CORS Support**: Enables browser extension communication

### API Endpoints

- `GET /transcript/<video_id>` - Fetch transcript for a YouTube video
- `GET /summary/<video_id>` - Get AI summary of a YouTube video
- `GET /health` - Health check endpoint
- `GET /` - API documentation

## How to Use

1. **Setup the API Backend**:
   ```bash
   # Run the setup script
   ./setup.sh
   
   # Or manually:
   cd api
   pip install -r requirements.txt
   
   # Get an OpenRouter API key from https://openrouter.ai/keys
   # Add it to api/.env file:
   echo "OPENROUTER_API_KEY=your_api_key_here" > .env
   ```

2. **Start the Flask API**:
   ```bash
   cd api
   python index.py
   ```

3. **Build and Install the Extension**:
   ```bash
   npm install
   npm run build
   ```

4. **Load in Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select the `dist` folder

5. **Use the Extension**:
   - Navigate to any YouTube video page
   - Click the extension icon to view the AI summary
   - Toggle between summary and full transcript views
   - Click timestamps to jump to specific video moments

## Visual Indicators

- **Green Badge (✓)**: Transcript successfully fetched and available
- **No Badge**: No transcript available or not on a YouTube video page

## Project Structure

```
browser-extension/
├── src/
│   ├── background/
│   │   └── background.ts          # Service worker script
│   ├── content/
│   │   └── content.ts             # Content script
│   ├── popup/
│   │   ├── Popup.tsx              # Popup component
│   │   ├── index.tsx              # Popup entry point
│   │   └── popup.html             # Popup HTML template
│   ├── options/
│   │   ├── Options.tsx            # Options component
│   │   ├── index.tsx              # Options entry point
│   │   └── options.html           # Options HTML template
│   ├── components/
│   │   └── index.ts               # Shared components
│   ├── utils/
│   │   └── index.ts               # Utility functions
│   └── styles/
│       └── globals.css            # Global styles with Tailwind
├── public/
│   ├── manifest.json              # Extension manifest
│   └── icons/
│       ├── icon16.jpg
│       ├── icon48.jpg
│       └── icon128.jpg
├── scripts/
│   └── post-build.js              # Post-build processing
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── README.md
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Load the extension in your browser:**
   - For Chrome: Go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked" 
   - Select the `dist` folder (after running `npm run build`)
   - For Firefox: Go to `about:debugging`, click "This Firefox", and click "Load Temporary Add-on"
   - Select the `manifest.json` file from the `dist` folder

## Development Workflow

1. **Make changes** to your source files in the `src/` directory
2. **Build** the project with `npm run build`
3. **Reload** the extension in your browser to see changes
4. **Test** your extension functionality

## Key Technologies

- **Vite**: Modern build tool with fast HMR
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first styling
- **Manifest V3**: Latest Chrome extension APIs

## Extension Components

- **Background Script**: Handles extension lifecycle and background tasks
- **Content Script**: Runs in the context of web pages
- **Popup**: Small UI that appears when clicking the extension icon
- **Options Page**: Settings and configuration interface

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview the built extension
- `npm test` - Run tests

## Browser Compatibility

This extension is built for modern browsers supporting Manifest V3:
- Chrome 88+
- Edge 88+
- Firefox (with some API differences)

- **Popup Interface:** A user-friendly popup that appears when the extension icon is clicked.
- **Options Page:** A settings page for users to configure the extension.
- **Background Script:** Manages the extension's lifecycle and handles events.

## Technologies Used

- **React:** For building the user interface.
- **Tailwind CSS:** For styling the components.
- **TypeScript:** For type safety and better development experience.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.