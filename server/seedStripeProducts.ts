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

  const kdpReady = await stripe.products.create({
    name: 'KDP Ready',
    description: 'Upload your manuscript, pick a template, and get KDP-ready PDF and EPUB files. Perfect for self-publishers.',
    metadata: {
      app: 'easy-book-publishers',
      planName: 'kdp_ready',
    },
  });
  console.log(`Created product: ${kdpReady.name} (${kdpReady.id})`);

  const kdpReadyMonthly = await stripe.prices.create({
    product: kdpReady.id,
    unit_amount: 499,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { billingCycle: 'monthly', planName: 'kdp_ready' },
  });
  console.log(`  Monthly: ${kdpReadyMonthly.id} — $4.99/mo`);

  const kdpReadyAnnual = await stripe.prices.create({
    product: kdpReady.id,
    unit_amount: 3588,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { billingCycle: 'annual', planName: 'kdp_ready' },
  });
  console.log(`  Annual: ${kdpReadyAnnual.id} — $35.88/yr ($2.99/mo)`);

  const kdpReadyLifetime = await stripe.prices.create({
    product: kdpReady.id,
    unit_amount: 2900,
    currency: 'usd',
    metadata: { billingCycle: 'lifetime', planName: 'kdp_ready' },
  });
  console.log(`  Lifetime: ${kdpReadyLifetime.id} — $29.00`);

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
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { billingCycle: 'monthly', planName: 'author_pro' },
  });
  console.log(`  Monthly: ${authorProMonthly.id} — $9.99/mo`);

  const authorProAnnual = await stripe.prices.create({
    product: authorPro.id,
    unit_amount: 8388,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { billingCycle: 'annual', planName: 'author_pro' },
  });
  console.log(`  Annual: ${authorProAnnual.id} — $83.88/yr ($6.99/mo)`);

  const authorProLifetime = await stripe.prices.create({
    product: authorPro.id,
    unit_amount: 9700,
    currency: 'usd',
    metadata: { billingCycle: 'lifetime', planName: 'author_pro' },
  });
  console.log(`  Lifetime: ${authorProLifetime.id} — $97.00`);

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
    unit_amount: 2499,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { billingCycle: 'monthly', planName: 'publisher' },
  });
  console.log(`  Monthly: ${publisherMonthly.id} — $24.99/mo`);

  const publisherAnnual = await stripe.prices.create({
    product: publisher.id,
    unit_amount: 20388,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { billingCycle: 'annual', planName: 'publisher' },
  });
  console.log(`  Annual: ${publisherAnnual.id} — $203.88/yr ($16.99/mo)`);

  const publisherLifetime = await stripe.prices.create({
    product: publisher.id,
    unit_amount: 24900,
    currency: 'usd',
    metadata: { billingCycle: 'lifetime', planName: 'publisher' },
  });
  console.log(`  Lifetime: ${publisherLifetime.id} — $249.00`);

  console.log('\nDone! Products and prices created in Stripe.');
  console.log('Webhooks will automatically sync them to the database.');
}

seedProducts().catch(console.error);
