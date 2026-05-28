const fs = require('fs');
const path = require('path');

const basePath = path.join('e:', 'next', 'edunext', 'src', 'app', 'college', '[slug]');

const pages = [
  { dir: 'admission', newName: 'AdmissionClient.tsx' },
  { dir: 'placement', newName: 'PlacementClient.tsx' },
  { dir: 'ranking', newName: 'RankingClient.tsx' },
  { dir: 'reviews', newName: 'ReviewsClient.tsx' },
  { dir: 'contact', newName: 'ContactClient.tsx' }
];

pages.forEach(({ dir, newName }) => {
  const oldPath = path.join(basePath, dir, 'page.tsx');
  const newPath = path.join(basePath, dir, newName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldPath} to ${newPath}`);
  } else {
    console.log(`File not found: ${oldPath}`);
  }
});
