declare module "web-push" {
  interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
  }
  interface PushSubscription {
    endpoint: string;
    keys: PushSubscriptionKeys;
  }
  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }
  interface WebPushLib {
    setVapidDetails(email: string, publicKey: string, privateKey: string): void;
    generateVAPIDKeys(): VapidKeys;
    sendNotification(subscription: PushSubscription, payload: string): Promise<void>;
  }
  const webPush: WebPushLib;
  export default webPush;
}
