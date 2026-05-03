const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_BASE_URL || 'https://api.example.com';

const content = `export const environment = {
  production: true,
  apiBaseUrl: '${apiUrl}'
};
`;

const outPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

fs.writeFileSync(outPath, content, { encoding: 'utf8' });
console.log('[set-env] Wrote', outPath, 'with apiBaseUrl=', apiUrl);
