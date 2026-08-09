const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const isProduction = process.argv.includes('--production');

// Angular does not load .env files itself. Read the simple KEY=VALUE format
// here so the generated environment file is used by both dev and prod builds.
const fileEnv = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !line.trimStart().startsWith('#')) {
      fileEnv[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const apiUrl = process.env.API_BASE_URL || fileEnv.API_BASE_URL || 'https://api.example.com';

const content = `export const environment = {
  production: ${isProduction},
  apiBaseUrl: '${apiUrl}'
};
`;

const outputFile = isProduction ? 'environment.prod.ts' : 'environment.dev.ts';
const outPath = path.join(rootDir, 'src', 'environments', outputFile);

fs.writeFileSync(outPath, content, { encoding: 'utf8' });
console.log('[set-env] Wrote', outPath, 'with apiBaseUrl=', apiUrl);
