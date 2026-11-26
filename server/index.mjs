import http from 'node:http';
import dotenv from 'dotenv';
import {
  handleContact,
  handleHealth,
  handleTossConfirm,
  isRealSmtpConfigured,
  sendJson,
} from './handlers.mjs';

dotenv.config();

const PORT = Number(process.env.CONTACT_SERVER_PORT || 3001);

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (url.pathname === '/api/health') {
    handleHealth(req, res);
    return;
  }

  if (url.pathname === '/api/payments/toss/confirm') {
    await handleTossConfirm(req, res);
    return;
  }

  if (url.pathname === '/api/contact') {
    await handleContact(req, res);
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(
    `[contact-mailer] Nodemailer server listening on http://localhost:${PORT} (SMTP configured: ${isRealSmtpConfigured()})`
  );
});
