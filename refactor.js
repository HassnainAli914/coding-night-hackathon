const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend-dashboard', 'src', 'components', 'landing');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('next/image')) {
    content = content.replace(/import Image from "next\/image";?\n?/g, '');
    content = content.replace(/<Image\s/g, '<img ');
    changed = true;
  }

  if (content.includes('next/link')) {
    // Replace import
    content = content.replace(/import Link from "next\/link";?\n?/g, 'import { Link } from "react-router-dom";\n');
    // Replace href with to in Link component
    // A bit tricky because href can be anywhere in the Link tag, but usually it's <Link href="...">
    content = content.replace(/<Link\s+([^>]*?)href=(["'{][^"'}]+["'}])/g, '<Link $1to=$2');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
