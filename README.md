# Browser Extension with React, Tailwind CSS, and TypeScript

This project is a modern browser extension built using **Vite**, **React 18**, **Tailwind CSS**, and **TypeScript**. It includes a popup interface, options page, background script, and content script.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Modern React with hooks and concurrent features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📘 **TypeScript** - Type-safe JavaScript
- 🔧 **Manifest V3** - Latest Chrome extension format
- 🚀 **Hot Module Replacement** - Fast development experience

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