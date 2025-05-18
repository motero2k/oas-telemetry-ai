import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const petitionPath = path.join(__dirname, 'examples', 'petition.json');
const payload = JSON.parse(await readFile(petitionPath, 'utf-8'));

const response = await fetch('http://localhost:3000/api/v1/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

let data = response;
console.log(data)
data = await data.json()
console.log('📦 Response:\n', JSON.stringify(data, null, 2));
