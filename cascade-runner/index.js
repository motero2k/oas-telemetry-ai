import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { NodeVM } from 'vm2';
import { transactionMiddleware } from './utils/middleware.js';
import logger from './utils/logger.js';
import oasTelemetry from '@oas-tools/oas-telemetry';

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(transactionMiddleware);

app.use(oasTelemetry())

app.post('/api/v1/execute', async (req, res) => {
  const actions = req.body;

  if (!Array.isArray(actions)) {
    logger.error('Invalid request body: must be an array of actions');
    return res.status(400).json({ error: 'Request body must be an array of actions' });
  }

  try {
    const results = await processActions(actions);
    res.json({ results });
  } catch (err) {
    logger.error('Error processing actions:', err.message);
    res.status(500).json({ error: err.message });
  }
});

async function processActions(actions) {
  const results = [];

  for (const action of actions) {
    const repeat = action.repeat || 1;
    for (let i = 0; i < repeat; i++) {
        if (action.type === 'code') {
            const result = await executeCode(action.source);
            results.push(result);
        } else if (action.type === 'http') {
            const response = await forwardRequest(action);
            results.push(response);
        } else {
            logger.warn('Unknown action type:', action.type);
            results.push({ error: `Unknown action type: ${action.type}` });
        }
    }
  }

  return results;
}

async function executeCode(source) {
    const vm = new NodeVM({
        console: 'inherit',
        sandbox: { logger, fetch },
        require: {
            external: false
        },
        timeout: 3000
    });

    return await vm.run(`
        module.exports = (async function() {
            ${source}
        })();
    `);
}

async function forwardRequest({ url, method = 'POST', headers = {}, body }) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return data.results || data;
}

app.listen(port, () => {
  logger.info(`cascade-runner running on port ${port}`);
});
