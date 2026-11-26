#!/usr/bin/env node
/**
 * Finds the chat ID(s) your Telegram bot can message, and sends a test alert.
 *
 *   npm run telegram:chat-id              -> lists chats that have messaged the bot
 *   npm run telegram:chat-id -- --test    -> also sends a test message to TELEGRAM_CHAT_ID
 *
 * Reads TELEGRAM_BOT_TOKEN (and TELEGRAM_CHAT_ID for --test) from the environment or .env.
 */
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set. Create a bot with @BotFather in Telegram, then put its token in .env.");
  process.exit(1);
}
const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  }).then((r) => r.json());

const me = await api("getMe");
if (!me.ok) {
  console.error(`Telegram rejected the token: ${me.description}`);
  process.exit(1);
}
console.log(`Bot: @${me.result.username}\n`);

const updates = await api("getUpdates", { allowed_updates: ["message", "channel_post", "my_chat_member"] });
const chats = new Map();
for (const u of updates.result ?? []) {
  const chat = (u.message ?? u.channel_post ?? u.my_chat_member)?.chat;
  if (chat) chats.set(chat.id, chat);
}
if (!chats.size) {
  console.log(`No chats found. Open https://t.me/${me.result.username} in Telegram, press Start (or send any message), then run this again.`);
} else {
  console.log("Chats that have talked to the bot:");
  for (const c of chats.values()) {
    const name = c.title ?? [c.first_name, c.last_name].filter(Boolean).join(" ") ?? c.username;
    console.log(`  ${c.id}\t${c.type}\t${name}${c.username ? ` (@${c.username})` : ""}`);
  }
  console.log(`\nPut the ID you want in .env, e.g. TELEGRAM_CHAT_ID="${[...chats.keys()][0]}"`);
}

if (process.argv.includes("--test")) {
  const ids = (process.env.TELEGRAM_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) {
    console.error("\n--test: TELEGRAM_CHAT_ID is not set.");
    process.exit(1);
  }
  for (const id of ids) {
    const r = await api("sendMessage", { chat_id: id, text: "✅ Nuvsera website alerts are connected. New enquiries will appear here." });
    console.log(r.ok ? `\nTest message sent to ${id}.` : `\nCould not send to ${id}: ${r.description}`);
  }
}
