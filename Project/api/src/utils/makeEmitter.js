const crypto = require('crypto');
const axios = require('axios');

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL; // webhook address from make.com
const MAKE_SIGNING_SECRET = process.env.MAKE_SIGNING_SECRET; // random long string

function signBody(bodyString) {
  return crypto.createHmac('sha256', MAKE_SIGNING_SECRET)
               .update(bodyString, 'utf8')
               .digest('hex');
}

async function emitToMake(event, payload) {
  const body = JSON.stringify({ event, payload, ts: Date.now() });
  const signature = signBody(body);

  try {
    await axios.post(MAKE_WEBHOOK_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      },
      timeout: 5000
    });
  } catch (err) {
    console.error('[Make webhook] failed', err?.response?.status, err?.message);
  }
}

module.exports = { emitToMake };