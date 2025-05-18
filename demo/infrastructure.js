import { readFile } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configPath = path.join(__dirname, 'examples', 'infrastructure.json');
const infra = JSON.parse(await readFile(configPath, 'utf-8'));

for (const { name, port, logLevel = 'INFO' } of infra.instances) {
  const child = spawn('node', ['../cascade-runner/index.js'], {
    env: { ...process.env, PORT: port, SERVICE_NAME: name, ZH2GH_LOG_LEVEL: logLevel },
    cwd: path.join(__dirname, '..', 'cascade-runner'),
    stdio: 'inherit'
  });

  console.log(`🟢 ${name} listening on port ${port} with log level ${logLevel}`);
}
