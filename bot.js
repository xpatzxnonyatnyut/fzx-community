const { cfg, loadConfig } = require("./config");
const { Telegraf, session, Scenes: { WizardScene, Stage }, Markup } = require("telegraf");
const axios = require("axios");
const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
require("dotenv").config();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ʙᴏᴛ sᴇᴛᴛɪɢs
(async () => {
  await loadConfig();

const cfg = {
  ownerId: process.env.OWNER_ID || "8496713254:AAHrmNmVe-bMaTYX0-77sRaMCKhB1pz1xzI",
  botToken: process.env.BOT_TOKEN || "5120884017"
};

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "AFIDKte0MnJN5yXoGzOGAFt0";

const bot = new Telegraf(cfg.botToken);

const myWizardScene = new WizardScene('start', (ctx) => {
  ctx.reply("Kembali ke /start");
  return ctx.scene.leave();
});

bot.use(session());
const stage = new Stage([myWizardScene]);
bot.use(stage.middleware());

// ғᴜɴᴄᴛɪᴏɴ
function isAllowed(id) {
  let allowed = [];
  try { allowed = JSON.parse(fs.readFileSync("./checks.json")); }
  catch { fs.writeFileSync("./checks.json", "[]"); }
  return allowed.includes(id);
}

function b64(buf) { return Buffer.from(buf).toString('base64'); }
function fromB64(s) { return Buffer.from(s, 'base64'); }

function xorBuffer(buf, mask) {
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] ^ mask[i % mask.length];
  return out;
}

async function safeFetch(url, opts = {}, maxRetries = 2) {
  const timeout = opts.timeout ?? 10000;
  let attempt = 0, lastErr = null;
  while (attempt <= maxRetries) {
    try {
      const res = await axios.get(url, { timeout, validateStatus: null, headers: { Accept: "*/*" } });
      if (!res) throw new Error("No response");
      const ct = (res.headers["content-type"] || "").toLowerCase();
      if (ct.includes("json")) return { ok: true, status: res.status, data: res.data };
      if (typeof res.data === "object") return { ok: true, status: res.status, data: res.data };
      if (typeof res.data === "string") {
        try { return { ok: true, status: res.status, data: JSON.parse(res.data) }; }
        catch { return { ok: false, status: res.status, text: res.data }; }
      }
      return { ok: false, status: res.status, data: res.data };
    } catch (err) { lastErr = err; attempt++; await sleep(500 * attempt); }
  }
  return { ok: false, error: lastErr?.message || "Unknown error after retries" };
}

async function getFileLink(fileId, botToken) {
  const res = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  if (!res.data.ok) throw new Error("Gagal ambil file path");
  return `https://api.telegram.org/file/bot${botToken}/${res.data.result.file_path}`;
}

bot.use((ctx, next) => {
  const oldReply = ctx.reply.bind(ctx);
  ctx.reply = (text, extra = {}) => {
    extra.reply_markup = {
      inline_keyboard: [
        ...(extra.reply_markup?.inline_keyboard || []),
        [{ text: "ᴅᴇᴠᴇʟᴏᴘᴇʀs", url: "https://t.me/Komlnfo" }]
      ]
    };
    return oldReply(text, extra);
  };
  return next();
});

// ʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅ
bot.start(async (ctx) => {
/*  if (!isAllowed(ctx.from.id)) {
    return ctx.reply("Only the owner can access this feature. Please request access first.");
  }
*/

  const message = `<blockquote>[ ! ] Hello user, I am bot 7ooModdss FzX, Designed By Joo, I am a Multifunctional Bot.

[ ! ] 7ooModdss
☐ Tiktokdl
☐ Spotify
☐ Instagramdl
☐ Facebookdl
☐ Pinterestdl

[ ! ] Tools
☐ Ngl
☐ Removebg
☐ Tofigure
☐ Iqc
☐ Getsesi
☐ Deploy
☐ Obfhtml
☐ Web2apk

[ ! ] Artificial Intelligence
☐ Chatgpt
☐ Gemini
☐ Kimi
</blockquote>
`;

  await ctx.replyWithPhoto(
    "https://files.catbox.moe/g2aotg.png",
    {
      caption: message,
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("ᴊᴏɪɴ ᴄʜᴀɴɴᴇʟ", "t.me/Nocturn3code")],
        [Markup.button.url("ᴊᴏɪɴ ʀᴏᴏᴍ", "t.me/Joomodss")],
        [Markup.button.url("ʀᴇsᴛ ᴀᴘɪ", "https://joozxdev.my.id")]
      ])
    }
  );
});

bot.command("tiktokdl", async (ctx) => {
  const url = ctx.message.text.split(" ")[1];
  if (!url) return ctx.reply("Masukkan link TikTok!");
  try {
    const { data } = await axios.get(`https://joozxdev.my.id/api/tiktok?url=${encodeURIComponent(url)}`);
    if (data.error) return ctx.reply(`Error: ${data.error}`);
    await ctx.replyWithVideo(data.play, {
      caption: `*${data.caption || "No Caption"}*\n${data.author?.nickname || ""}`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    ctx.reply(`Error: ${e.message}`);
  }
});

bot.command('obfhtml', async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.document) return ctx.reply('Please reply to an HTML file (as a document)');
    const doc = reply.document;
    const fileName = doc.file_name || 'file.html';
    if (!fileName.toLowerCase().endsWith('.html') && doc.mime_type !== 'text/html') {
      return ctx.reply('File does not seem to be an .html file. Please send the file as a .html document.');
    }
    await ctx.reply('7ooModdss Shield: downloading and obfuscating...');
    const fileLink = await getFileLink(doc.file_id, cfg.botToken);
    const res = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const htmlBuf = Buffer.from(res.data);
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(htmlBuf), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const payload = { cipher: b64(encrypted), iv: b64(iv), tag: b64(authTag), filename: fileName };
    const mask = crypto.randomBytes(8);
    const xored = xorBuffer(key, mask);
    const xoredB64 = b64(xored);
    const maskB64 = b64(mask);
    const chunks = [];
    for (let i = 0; i < xoredB64.length; i += 22) chunks.push(xoredB64.slice(i, i + 22));
    const payloadB64 = b64(Buffer.from(JSON.stringify(payload)));
    const clientScript = `(() => {
  try {
    const shieldName = '7ooModdss Shield';
    const payload = JSON.parse(atob('${payloadB64}'));
    const chunks = ${JSON.stringify(chunks)};
    const maskB64 = '${maskB64}';
    const xoredB64 = chunks.join('');
    const xored = Uint8Array.from(atob(xoredB64), c => c.charCodeAt(0));
    const mask = Uint8Array.from(atob(maskB64), c => c.charCodeAt(0));
    for (let i = 0; i < xored.length; i++) xored[i] = xored[i] ^ mask[i % mask.length];
    const rawKey = xored.buffer;
    const cipherBuf = Uint8Array.from(atob(payload.cipher), c => c.charCodeAt(0));
    const tag = Uint8Array.from(atob(payload.tag), c => c.charCodeAt(0));
    const combined = new Uint8Array(cipherBuf.length + tag.length);
    combined.set(cipherBuf, 0); combined.set(tag, cipherBuf.length);
    (async () => {
      const cryptoObj = (window.crypto || window.msCrypto);
      const key = await cryptoObj.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt']);
      const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
      const plain = await cryptoObj.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, combined);
      const dec = new TextDecoder().decode(plain);
      document.open(); document.write(dec); document.close();
    })().catch(e => {
      document.body.innerText = shieldName + ' - Failed to decrypt: ' + (e.message || e);
    });
  } catch (e) {
    document.body.innerText = '7ooModdss Shield - unexpected error: ' + (e.message || e);
  }
})();`;
    const scriptB64 = b64(Buffer.from(clientScript));
    const finalHtml = `<!doctype html><html><head><meta charset="utf-8"><title>7ooModdss Shield - ${fileName}</title></head><body><script>eval(atob('${scriptB64}'))</script></body></html>`;
    const outName = `obf_${path.basename(fileName)}`;
    const outPath = path.join(__dirname, outName);
    fs.writeFileSync(outPath, finalHtml);
    await ctx.replyWithDocument({ source: outPath, filename: outName });
    await sleep(200);
    fs.unlinkSync(outPath);
  } catch (err) {
    console.error(err);
    ctx.reply('Error: ' + (err.message || err));
  }
});

bot.command("adduser", (ctx) => {
  if (ctx.from.id !== parseInt(cfg.ownerId)) return;
  const target = ctx.message.text.split(" ")[1];
  if (!target) return ctx.reply("Masukin ID");
  const arr = JSON.parse(fs.readFileSync("./checks.json"));
  if (arr.includes(target)) return ctx.reply("Sudah ada.");
  arr.push(target);
  fs.writeFileSync("./checks.json", JSON.stringify(arr));
  ctx.reply("User ditambahkan.");
});

async function askAI(ctx, engine) {
  const q = ctx.message.text.replace(`/${engine}`, '').trim();
  if (!q) return ctx.reply('Pertanyaan Mu?', { parse_mode: 'Markdown' });
  await ctx.reply('Sedang mikir...');
  try {
    const { data } = await axios.post(`https://joozxdev.my.id/api/${engine}`,
                                      { message: q },
                                      { headers: { 'Content-Type': 'application/json' } });
    let ans = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Gagal mendapatkan jawaban.';
    if (ans.length > 4000) ans = ans.slice(0, 3990) + '... (terpotong)';
    const escapeMd = str => str.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
    await ctx.reply(escapeMd(ans), { parse_mode: 'MarkdownV2' });
  } catch (err) {
    console.error(err);
    ctx.reply('Terjadi error: ' + err.message);
  }
}
bot.command('chatgpt', ctx => askAI(ctx, 'chatgpt'));
bot.command('gemini',  ctx => askAI(ctx, 'gemini'));
bot.command('kimi',    ctx => askAI(ctx, 'kimiai'));

bot.command("deploy", async (ctx) => {
  const raw = ctx.message.text.replace(/^\/\w+(@\w+)?\s*/i, "").trim();
  const namaWeb = raw.split(" ")[0];
  if (!namaWeb) return ctx.reply("Format salah.\nGunakan: `/deploy namaweb` (reply ke file .html)", { parse_mode: "Markdown" });
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.document) {
    return ctx.reply("Harus reply file `.html` dengan command `/deploy namaweb`", { parse_mode: "Markdown" });
  }
  const doc = ctx.message.reply_to_message.document;
  if (!doc.file_name || !doc.file_name.toLowerCase().endsWith(".html")) {
    return ctx.reply("File harus format `.html`");
  }
  try {
    await ctx.reply("Sedang proses deploy ke Vercel...");
    const fileLink = await getFileLink(doc.file_id, cfg.botToken);
    const response = await axios.get(fileLink, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data);
    const base64Data = fileBuffer.toString("base64");
    const deployRes = await axios.post(
      "https://api.vercel.com/v13/deployments",
      {
        name: namaWeb,
        files: [{ file: "index.html", data: base64Data, encoding: "base64" }],
        projectSettings: { framework: null, buildCommand: null, devCommand: null, outputDirectory: null }
      },
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    await ctx.reply(`Sukses deploy!\nLink: https://${namaWeb}.vercel.app\nVercel: ${deployRes.data.url}`);
  } catch (err) {
    console.error("ERROR DEPLOY:", err.response?.data || err.message);
    await ctx.reply("Gagal deploy ke Vercel.");
  }
});

bot.command("removebg", async (ctx) => {
  const reply = ctx.message.reply_to_message;
  const args = ctx.message.text.split(" ").slice(1).join(" ");
  try {
    let imageUrl;
    if (args && args.startsWith("http")) imageUrl = args;
    else if (reply && reply.photo) {
      const photo = reply.photo[reply.photo.length - 1];
      imageUrl = await getFileLink(photo.file_id, cfg.botToken);
    } else return ctx.reply("Gunakan: Reply Foto");
    await ctx.reply("Menghapus background...");
    const resApi = await axios.post(
      `https://joozxdev.my.id/api/removebg?image_url=${encodeURIComponent(imageUrl)}`,
      null,
      { responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(resApi.data);
    await ctx.replyWithDocument({ source: buffer, filename: "removebg.png" }, { caption: "Background berhasil dihapus!" });
  } catch (err) {
    console.error("Error /removebg:", err.response?.data || err.message);
    await ctx.reply("Gagal hapus background.");
  }
});

bot.command("spotify", async (ctx) => {
  try {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) return ctx.reply("Masukin Judul Lagu");

    await ctx.reply("Mencari lagu...");

    const query = encodeURIComponent(text);
    const { data: res } = await axios.get(`https://joocode.zone.id/api/music?query=${query}`);

    if (!res.success) return ctx.reply("Lagu tidak ditemukan.");

    const audioResponse = await axios.get(res.result.download.audio, { responseType: "arraybuffer" });

    await ctx.replyWithAudio(
      { source: Buffer.from(audioResponse.data) },
      {
        title: res.result.title,
        performer: res.result.author?.name || "Unknown",
        caption: `🎵 ${res.result.title}\n👤 ${res.result.author?.name || "Unknown"}`
      }
    );

  } catch (err) {
    console.error(err);
    ctx.reply("Gagal mengambil lagu.");
  }
});


bot.command("ngl", async (ctx) => {
  const raw = ctx.message.text || "";
  const withoutCmd = raw.replace(/^\/\w+(@\w+)?\s*/i, "").trim();
  if (!withoutCmd) return ctx.reply("Username,Pesan\nExample: /ngl @7ooModdss,X");
  const firstComma = withoutCmd.indexOf(",");
  if (firstComma === -1) return ctx.reply("Usage: /ngl username,pesan\nPastikan ada koma untuk memisahkan username dan pesan.");
  const rawUsername = withoutCmd.slice(0, firstComma).trim();
  const message = withoutCmd.slice(firstComma + 1).trim();
  if (!rawUsername || !message) return ctx.reply("Username atau pesan kosong. Format: /ngl username,pesan");
  const cleanUsername = rawUsername.replace(/^@+/, "");
  if (!/^[\w.-]{2,64}$/.test(cleanUsername)) return ctx.reply("Username tidak valid. Hanya huruf, angka, underscore, dot atau dash, minimal 2 karakter.");
  const displayUsername = "@" + cleanUsername;
  const TOTAL = 20, PER_BATCH = 5, DELAY_MS = 2000, API_BASE = "https://joozxdev.my.id/api/spam";
  let progressMsg;
  try {
    const sent = await ctx.reply(`Memulai pengiriman ${TOTAL} pesan ke ${displayUsername}...`);
    progressMsg = sent;
  } catch {}
  let success = 0, failedBatches = 0;
  try {
    for (let offset = 0, batchNum = 1; offset < TOTAL; offset += PER_BATCH, batchNum++) {
      const remaining = TOTAL - offset;
      const batchCount = Math.min(PER_BATCH, remaining);
      const url = `${API_BASE}?u=${encodeURIComponent(cleanUsername)}&m=${encodeURIComponent(message)}&c=${encodeURIComponent(batchCount)}`;
      const result = await safeFetch(url, { timeout: 10000 }, 2);
      if (result.ok && result.data && (result.data.success === true || result.data.success === "true")) {
        success += batchCount;
        await ctx.reply(`Batch ${batchNum}: sukses (${success}/${TOTAL})`);
      } else {
        failedBatches++;
        const reason = result.error || (result.data && JSON.stringify(result.data)) || result.text || `HTTP ${result.status || "?"}`;
        await ctx.reply(`Batch ${batchNum} gagal: ${String(reason).slice(0, 300)}`);
      }
      await sleep(DELAY_MS);
    }
    await ctx.reply(`Selesai! Total sukses: ${success}/${TOTAL} ke ${displayUsername}`);
  } catch (err) {
    console.error("Error /ngl:", err);
    await ctx.reply("Terjadi error saat proses. Cek log server untuk detail.");
  }
});



bot.command('web2apk', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 3) {
    return ctx.reply("Reply Icon Web : `/web2apk <url> <namaApp> <email>`", { parse_mode: 'Markdown' });
  }
  if (!ctx.message.reply_to_message?.photo) {
    return ctx.reply('Kamu harus reply foto dulu untuk dijadikan ikon APK!', { parse_mode: 'Markdown' });
  }

  const [url, appName, email] = args;
  try { new URL(url); } catch { return ctx.reply('URL tidak valid'); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ctx.reply('Email tidak valid');

  const waitMsg = await ctx.reply('Upload & build APK dimulai… (perkiraan memakan waktu 3-8 menit)', { parse_mode: 'Markdown' });

  (async () => {                       
    try {
      const photo = ctx.message.reply_to_message.photo.pop();
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const { data: buffer } = await axios.get(fileLink.href, { responseType: 'arraybuffer' });

      const form = new FormData();
      form.append('files', buffer, { filename: 'icon.png', contentType: 'image/png' });

      const up = await axios.post('https://cdn.yupra.my.id/upload', form, {
        headers: form.getHeaders(),
        timeout: 30000
      });
      if (!up.data?.success || !up.data.files?.[0]) throw new Error('CDN gagal');
      const iconUrl = 'https://cdn.yupra.my.id' + up.data.files[0].url;

      const buildUrl =
        'https://api.fikmydomainsz.xyz/tools/toapp/build-complete' +
        '?url=' + encodeURIComponent(url) +
        '&email=' + encodeURIComponent(email) +
        '&appName=' + encodeURIComponent(appName) +
        '&appIcon=' + encodeURIComponent(iconUrl);

      const { data: job } = await axios.get(buildUrl, { timeout: 0 });
      if (!job.status) throw new Error(job.error || 'Build gagal');

      const caption =
        `Aplikasi berhasil dibuat!\n\n` +
        `Nama: ${appName}\n` +
        `Download APK: ${job.downloadUrl}`;

      await ctx.telegram.sendMessage(ctx.chat.id, caption, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (err) {
      await ctx.telegram.sendMessage(ctx.chat.id, `${err.message || 'Terjadi kesalahan'}`, {
        parse_mode: 'Markdown'
      });
      console.error('[X]', err);
    }
  })();

  return;
});

bot.command("instagramdl", async (ctx) => {
  const url = ctx.message.text.split(" ")[1];
  if (!url) return ctx.reply("Input Link");
  try {
    await ctx.reply("Tunggu sebentar, sedang memproses...");
    const apiUrl = `https://joozxdev.my.id/api/instagram?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    if (!data.medias || data.medias.length === 0) return ctx.reply("Gagal mengambil media Instagram.");
    for (const media of data.medias) {
      if (media.type === "video") {
        await ctx.replyWithVideo({ url: media.url }, { caption: "Video Instagram" });
      } else {
        await ctx.replyWithPhoto({ url: media.url }, { caption: "Foto Instagram" });
      }
    }
  } catch (err) {
    console.error("ERROR /instagramdl:", err.message);
    ctx.reply("Terjadi kesalahan saat memproses link Instagram.");
  }
});

bot.command("facebookdl", async (ctx) => {
  const url = ctx.message.text.split(" ")[1];
  if (!url) return ctx.reply("Input Url");
  try {
    await ctx.reply("Tunggu sebentar, sedang memproses...");
    const apiUrl = `https://joozxdev.my.id/api/facebook?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    if (!data.success) return ctx.reply("Gagal mengambil video Facebook.");
    const videoHd = data.video_hd;
    const videoSd = data.video_sd;
    if (videoHd) {
      await ctx.replyWithVideo({ url: videoHd }, { caption: "Facebook Video (HD)" });
    } else if (videoSd) {
      await ctx.replyWithVideo({ url: videoSd }, { caption: "Facebook Video (SD)" });
    } else {
      return ctx.reply("Video tidak ditemukan.");
    }
  } catch (err) {
    console.error("ERROR /facebookdl:", err.message);
    ctx.reply("Terjadi kesalahan saat memproses link Facebook.");
  }
});

bot.command("pinterestdl", async (ctx) => {
  const url = ctx.message?.text?.split(" ")[1];
  if (!url) return ctx.reply("Input URL Pinterest dulu.");
  try {
    await ctx.reply("Tunggu sebentar, sedang mengambil media...");
    const apiUrl = `https://joozxdev.my.id/api/pinterest?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    console.log("Pinterest API Response:", data);

    if (!data.success || !data.url) {
      return ctx.reply("Gagal mengambil media dari Pinterest.");
    }

    const mediaUrl = data.url;
    if (mediaUrl.endsWith(".mp4")) {
      await ctx.replyWithVideo(mediaUrl, { caption: "Pinterest Video" });
    } else {
      await ctx.replyWithPhoto(mediaUrl, { caption: "Pinterest Image" });
    }
  } catch (err) {
    console.error("ERROR /pinterestdl:", err.message);
    ctx.reply("Terjadi kesalahan saat memproses link Pinterest.");
  }
});

bot.command("tofigure", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.photo) {
      return ctx.reply("Harap reply ke foto yang mau dijadikan figure.");
    }

    const fileId = reply.photo[reply.photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${cfg.botToken}/${file.file_path}`;

    await ctx.reply("Sedang membuat figure dari foto...");

    const res = await axios.get(
      `https://7oocode-5mgr.vercel.app/api/figure?imgurl=${encodeURIComponent(fileUrl)}`
    );

    const data = res.data;

    if (!data.status || !data.result?.generatedImageUrl) {
      return ctx.reply("Gagal generate figure.");
    }

    await ctx.replyWithPhoto(
      { url: data.result.generatedImageUrl },
      { caption: "Figure berhasil dibuat!" }
    );
  } catch (err) {
    console.error("Failed /tofigure:", err.response?.data || err.message);
    ctx.reply("Terjadi kesalahan saat generate figure.");
  }
});

bot.command("iqc", async (ctx) => {
  try {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length < 3) {
      return ctx.reply("Format salah.\nExample: `/iqc 12:00 100 Your Message`", { parse_mode: "Markdown" });
    }

    const time = args[0];
    const battery = args[1];
    const message = args.slice(2).join(" ");

    ctx.session = ctx.session || {};
    ctx.session.iqcData = { time, battery, message };

    await ctx.reply("Pilih Provider", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Axis", callback_data: "iqc_provider_Axis" },
            { text: "Telkomsel", callback_data: "iqc_provider_Telkomsel" }
          ],
          [
            { text: "Indosat", callback_data: "iqc_provider_Indosat" },
            { text: "IM3", callback_data: "iqc_provider_IM3" }
          ]
        ]
      }
    });
  } catch (err) {
    console.error("Failed /iqc:", err.message);
    ctx.reply("Terjadi kesalahan saat memproses IQC.");
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    if (!ctx.callbackQuery.data.startsWith("iqc_provider_")) return;

    const provider = ctx.callbackQuery.data.replace("iqc_provider_", "");
    const { time, battery, message } = ctx.session?.iqcData || {};

    if (!time || !battery || !message) {
      return ctx.reply("Data Iqc tidak ditemukan. Jalankan command /iqc lagi.");
    }

    await ctx.answerCbQuery(); 
    await ctx.reply("Sedang membuat gambar...");

    const apiUrl = `https://joocode.zone.id/api/iqc?t=${encodeURIComponent(time)}&b=${encodeURIComponent(battery)}&m=${encodeURIComponent(message)}&p=${encodeURIComponent(provider)}`;

    await ctx.replyWithPhoto({ url: apiUrl }, { caption: `IQC berhasil dibuat!`, parse_mode: "Markdown" });
  } catch (err) {
    console.error("ERROR callback_query:", err.message);
    ctx.reply("Gagal generate IQC.");
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
console.log("7ooModdss FzX Successfully Connected 🦄");
