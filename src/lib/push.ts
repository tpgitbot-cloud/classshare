import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

async function getVapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  }
  const wp = await import("web-push");
  return wp.default.generateVAPIDKeys();
}

export async function getVapidPublicKey() {
  const keys = await getVapidKeys();
  return keys.publicKey;
}

async function getWebPush() {
  const wp = await import("web-push");
  const keys = await getVapidKeys();
  wp.default.setVapidDetails("mailto:admin@classshare.edu", keys.publicKey, keys.privateKey);
  return wp.default;
}

export async function subscribe(endpoint: string, p256dh: string, auth: string, adminId?: string) {
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint))
    .limit(1);
  if (existing.length) return existing[0];
  const sub = { id: makeId(), endpoint, p256dh, auth, adminId: adminId || null };
  await db.insert(pushSubscriptions).values(sub as any);
  return sub;
}

export async function unsubscribe(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function sendPushNotification(title: string, body: string, url?: string) {
  try {
    const wp = await getWebPush();
    const subs = await db.select().from(pushSubscriptions);
    const payload = JSON.stringify({ title, body, url: url || "/dashboard" });
    for (const sub of subs) {
      try {
        await wp.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload);
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }
  } catch {}
}
