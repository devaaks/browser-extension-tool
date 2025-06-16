const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(distDir, 'src');

// Move HTML files from src subdirectories to dist root
function moveHtmlFiles() {
  if (fs.existsSync(srcDir)) {
    const dirs = ['popup', 'options'];
    
    dirs.forEach(dir => {
      const subDir = path.join(srcDir, dir);
      if (fs.existsSync(subDir)) {
        const htmlFile = path.join(subDir, `${dir}.html`);
        if (fs.existsSync(htmlFile)) {
          const destFile = path.join(distDir, `${dir}.html`);
          
          // Read the HTML file and update script paths
          let content = fs.readFileSync(htmlFile, 'utf8');
          content = content.replace('./index.tsx', `./${dir}.js`);
          // Fix absolute paths to relative paths
          content = content.replace(/src="\/([^"]+)"/g, 'src="./$1"');
          content = content.replace(/href="\/([^"]+)"/g, 'href="./$1"');
          
          // Write to dist root
          fs.writeFileSync(destFile, content);
          console.log(`Moved and updated ${dir}.html`);
        }
      }
    });
    
    // Remove the src directory
    fs.rmSync(srcDir, { recursive: true, force: true });
    console.log('Cleaned up src directory from dist');
  }
}

moveHtmlFiles();
