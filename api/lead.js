export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false });
  }

  try {
    const { request = '', contact = '', photo = null } = req.body || {};

    if (!String(request).trim() || !String(contact).trim()) {
      return res.status(400).json({ ok: false });
    }

    const text = '📌 ' + String(request).slice(0, 2000) +
                 '\n\n📞 ' + String(contact).slice(0, 500);

    let tgRes;

    if (photo) {
      const base64 = String(photo).split(',').pop();
      const bytes = Buffer.from(base64, 'base64');

      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('caption', text);
      form.append('photo', new Blob([bytes]), 'photo.jpg');

      tgRes = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendPhoto', {
        method: 'POST',
        body: form
      });
    } else {
      tgRes = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      });
    }

    const data = await tgRes.json();

    if (!data.ok) {
      return res.status(502).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}
