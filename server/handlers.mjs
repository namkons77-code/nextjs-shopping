import nodemailer from 'nodemailer';

/**
 * Send a JSON response compatible with both Node http.ServerResponse and Vercel Functions.
 */
export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return Promise.resolve(req.body);
    }
    const text = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : String(req.body);
    try {
      return Promise.resolve(text ? JSON.parse(text) : {});
    } catch {
      return Promise.reject(new Error('Invalid JSON body'));
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isRealSmtpConfigured() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(
    user &&
      pass &&
      !user.includes('your-') &&
      !pass.includes('your-')
  );
}

async function sendContactEmail({ name, phone, email, address, message }) {
  const receiver =
    process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    'help@crabmaster.kr';

  const html = `
    <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d2d2d7; border-radius: 16px; overflow: hidden;">
      <div style="background: #0d5c63; color: #ffffff; padding: 24px 28px;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 0.14em; color: #ff7b69; font-weight: 800;">CRAB MASTER</p>
        <h2 style="margin: 6px 0 0; font-size: 22px; font-weight: 800;">크랩마스터 고객 문의 접수</h2>
      </div>
      <div style="padding: 24px 28px; background: #ffffff; color: #1d1d1f;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <th style="text-align: left; padding: 10px 8px; border-bottom: 1px solid #f5f5f7; color: #6e6e73; width: 110px;">이름</th>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f5f5f7; font-weight: 700;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 10px 8px; border-bottom: 1px solid #f5f5f7; color: #6e6e73;">전화번호</th>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f5f5f7; font-weight: 700;">${escapeHtml(phone)}</td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 10px 8px; border-bottom: 1px solid #f5f5f7; color: #6e6e73;">이메일</th>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f5f5f7; font-weight: 700;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 10px 8px; border-bottom: 1px solid #f5f5f7; color: #6e6e73;">주소</th>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f5f5f7;">${escapeHtml(address)}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; border-radius: 12px; background: #f5f5f7;">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 800; color: #0d5c63;">문의 내용</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.65; white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    '[크랩마스터 고객 문의]',
    `이름: ${name}`,
    `전화번호: ${phone}`,
    `이메일: ${email}`,
    `주소: ${address}`,
    '',
    '문의 내용:',
    message,
  ].join('\n');

  if (isRealSmtpConfigured()) {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"크랩마스터 고객센터" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `[크랩마스터 문의] ${name}님의 문의가 접수되었습니다`,
      text,
      html,
    });

    return {
      mode: 'smtp_sent',
      messageId: info.messageId,
      to: receiver,
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"크랩마스터 고객센터" <${testAccount.user}>`,
    to: receiver,
    replyTo: email,
    subject: `[크랩마스터 문의] ${name}님의 문의가 접수되었습니다`,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  return {
    mode: 'ethereal_preview',
    messageId: info.messageId,
    previewUrl,
    to: receiver,
  };
}

export function handleHealth(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }
  const tossSecret = process.env.TOSS_SECRET_KEY?.trim();
  sendJson(res, 200, {
    ok: true,
    smtpConfigured: isRealSmtpConfigured(),
    tossConfigured: Boolean(tossSecret && !tossSecret.includes('your_secret_key')),
    receiver:
      process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
      process.env.SMTP_USER?.trim() ||
      null,
  });
}

export async function handleTossConfirm(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const paymentKey = String(body.paymentKey || '').trim();
    const orderId = String(body.orderId || '').trim();
    const amount = Number(body.amount);

    if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
      sendJson(res, 400, {
        ok: false,
        error: '결제 승인 요청 파라미터(paymentKey, orderId, amount)가 올바르지 않습니다.',
      });
      return;
    }

    const secretKey = process.env.TOSS_SECRET_KEY?.trim();
    const hasRealSecret = Boolean(secretKey && !secretKey.includes('your_secret_key'));

    if (paymentKey.startsWith('test_tp_sim_') || !hasRealSecret) {
      sendJson(res, 200, {
        ok: true,
        mode: 'sandbox_simulation',
        paymentKey,
        orderId,
        totalAmount: amount,
        method: '토스페이',
        status: 'DONE',
        approvedAt: new Date().toISOString(),
      });
      return;
    }

    const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossRes.json();
    if (!tossRes.ok) {
      sendJson(res, tossRes.status, {
        ok: false,
        code: tossData.code || 'TOSS_CONFIRM_ERROR',
        error: tossData.message || '토스페이먼츠 결제 승인에 실패했습니다.',
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      mode: 'toss_live_confirm',
      paymentKey: tossData.paymentKey,
      orderId: tossData.orderId,
      totalAmount: tossData.totalAmount,
      method: tossData.easyPay?.provider || tossData.method || '토스페이',
      status: tossData.status,
      approvedAt: tossData.approvedAt,
      receiptUrl: tossData.receipt?.url || null,
    });
  } catch (err) {
    console.error('[toss-confirm] Error:', err);
    sendJson(res, 500, {
      ok: false,
      error: err instanceof Error ? err.message : '결제 승인 서버 오류가 발생했습니다.',
    });
  }
}

export async function handleContact(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const address = String(body.address || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !phone || !email || !address || !message) {
      sendJson(res, 400, {
        ok: false,
        error: '이름, 전화번호, 이메일, 주소, 문의 내용을 모두 입력해 주세요.',
      });
      return;
    }

    const result = await sendContactEmail({ name, phone, email, address, message });
    console.log(`[contact-mailer] Sent inquiry from ${name} (${email}) via ${result.mode}`);
    sendJson(res, 200, { ok: true, ...result });
  } catch (err) {
    console.error('[contact-mailer] Error:', err);
    sendJson(res, 500, {
      ok: false,
      error: err instanceof Error ? err.message : '이메일 전송 중 오류가 발생했습니다.',
    });
  }
}
