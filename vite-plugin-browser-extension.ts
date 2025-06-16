import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function browserExtensionPlugin(): Plugin {
  return {
    name: 'browser-extension',
    generateBundle(options, bundle) {
      // Move HTML files to root of dist
      Object.keys(bundle).forEach(fileName => {
        if (fileName.includes('/') && fileName.endsWith('.html')) {
          const newFileName = path.basename(fileName);
          const asset = bundle[fileName];
          delete bundle[fileName];
          bundle[newFileName] = asset;
          
          if (asset.type === 'asset' && typeof asset.source === 'string') {
            // Update script src paths in HTML files
            asset.source = asset.source.replace(/src="\.\/index\.tsx"/g, `src="./${newFileName.replace('.html', '.js')}"`);
          }
        }
      });
    },
  };
}
