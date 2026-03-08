import { getStripeSync } from './stripeClient';
import { updateUserStripeInfo } from './db';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    const event = JSON.parse(payload.toString());
    try {
      await WebhookHandlers.handleEvent(event);
    } catch (err) {
      console.error('[Stripe Webhook] Error handling event:', err);
    }
  }

  private static async handleEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = parseInt(session.metadata?.userId, 10);
        const planName = session.metadata?.planName as 'author_pro' | 'publisher' | undefined;
        if (!userId || !planName) return;

        const update: Parameters<typeof updateUserStripeInfo>[1] = {
          plan: planName,
          stripeCustomerId: session.customer,
        };

        if (session.subscription) {
          update.stripeSubscriptionId = session.subscription;
        }

        await updateUserStripeInfo(userId, update);
        console.log(`[Stripe] User ${userId} upgraded to ${planName}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = parseInt(subscription.metadata?.userId, 10);
        if (!userId) return;

        if (subscription.status === 'active') {
          const planName = subscription.metadata?.planName as 'author_pro' | 'publisher' | undefined;
          if (planName) {
            await updateUserStripeInfo(userId, {
              plan: planName,
              stripeSubscriptionId: subscription.id,
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = parseInt(subscription.metadata?.userId, 10);
        if (!userId) return;

        await updateUserStripeInfo(userId, {
          plan: 'starter',
          stripeSubscriptionId: null,
        });
        console.log(`[Stripe] User ${userId} subscription cancelled, reverted to starter`);
        break;
      }
    }
  }
}
