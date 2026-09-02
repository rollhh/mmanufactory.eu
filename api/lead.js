export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false });
  }

  const API = 'https://api.telegram.org/bot' + TOKEN;

  try {
    const { request = '', contact = '', photos = [] } = req.body || {};

    if (!String(request).trim() || !String(contact).trim()) {
      return res.status(400).json({ ok: false });
    }

    const text = '📌 ' + String(request).slice(0, 2000) +
                 '\n\n📞 ' + String(contact).slice(0, 500);

    const list = Array.isArray(photos) ? photos.slice(0, 10) : [];

    const toBlob = (p) => new Blob([Buffer.from(String(p).split(',').pop(), 'base64')]);

    let result;

    if (list.length === 0) {
      const r = await fetch(API + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      });
      result = await r.json();

    } else if (list.length === 1) {
      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('caption', text);
      form.append('photo', toBlob(list[0]), 'photo.jpg');
      const r = await fetch(API + '/sendPhoto', { method: 'POST', body: form });
      result = await r.json();

    } else {
      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      const media = [];
      list.forEach((p, i) => {
        const name = 'photo' + i;
        form.append(name, toBlob(p), name + '.jpg');
        media.push(
          i === 0
            ? { type: 'photo', media: 'attach://' + name, caption: text }
            : { type: 'photo', media: 'attach://' + name }
        );
      });
      form.append('media', JSON.stringify(media));
      const r = await fetch(API + '/sendMediaGroup', { method: 'POST', body: form });
      result = await r.json();
    }

    if (!result.ok) {
      return res.status(502).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}
