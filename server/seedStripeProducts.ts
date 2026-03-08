import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('Creating Stripe products...');

  const existing = await stripe.products.search({ query: "metadata['app']:'easy-book-publishers'" });
  if (existing.data.length > 0) {
    console.log(`Found ${existing.data.length} existing products. Skipping seed.`);
    for (const p of existing.data) {
      const prices = await stripe.prices.list({ product: p.id, active: true });
      console.log(`  ${p.name} (${p.id}):`);
      for (const pr of prices.data) {
        const label = pr.recurring ? `${pr.recurring.interval}ly` : 'one-time';
        console.log(`    ${pr.id} — $${(pr.unit_amount! / 100).toFixed(2)} ${label}`);
      }
    }
    return;
  }

  const authorPro = await stripe.products.create({
    name: 'Author Pro',
    description: 'Full publishing toolkit with AI-powered typesetting, KDP export, unlimited projects.',
    metadata: {
      app: 'easy-book-publishers',
      planName: 'author_pro',
    },
  });
  console.log(`Created product: ${authorPro.name} (${authorPro.id})`);

  const authorProMonthly = await stripe.prices.create({
    product: authorPro.id,
    unit_amount: 1499,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { billingCycle: 'monthly', planName: 'author_pro' },
  });
  console.log(`  Monthly: ${authorProMonthly.id} — $14.99/mo`);

  const authorProAnnual = await stripe.prices.create({
    product: authorPro.id,
    unit_amount: 9999,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { billingCycle: 'annual', planName: 'author_pro' },
  });
  console.log(`  Annual: ${authorProAnnual.id} — $99.99/yr ($9.99/mo)`);

  const authorProLifetime = await stripe.prices.create({
    product: authorPro.id,
    unit_amount: 14900,
    currency: 'usd',
    metadata: { billingCycle: 'lifetime', planName: 'author_pro' },
  });
  console.log(`  Lifetime: ${authorProLifetime.id} — $149.00`);

  const publisher = await stripe.products.create({
    name: 'Publisher',
    description: 'For publishing houses, imprints, and prolific authors. Priority support, dedicated account manager, custom branding.',
    metadata: {
      app: 'easy-book-publishers',
      planName: 'publisher',
    },
  });
  console.log(`Created product: ${publisher.name} (${publisher.id})`);

  const publisherMonthly = await stripe.prices.create({
    product: publisher.id,
    unit_amount: 3999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { billingCycle: 'monthly', planName: 'publisher' },
  });
  console.log(`  Monthly: ${publisherMonthly.id} — $39.99/mo`);

  const publisherAnnual = await stripe.prices.create({
    product: publisher.id,
    unit_amount: 29988,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { billingCycle: 'annual', planName: 'publisher' },
  });
  console.log(`  Annual: ${publisherAnnual.id} — $299.88/yr ($29.99/mo)`);

  const publisherLifetime = await stripe.prices.create({
    product: publisher.id,
    unit_amount: 39900,
    currency: 'usd',
    metadata: { billingCycle: 'lifetime', planName: 'publisher' },
  });
  console.log(`  Lifetime: ${publisherLifetime.id} — $399.00`);

  console.log('\nDone! Products and prices created in Stripe.');
  console.log('Webhooks will automatically sync them to the database.');
}

seedProducts().catch(console.error);
