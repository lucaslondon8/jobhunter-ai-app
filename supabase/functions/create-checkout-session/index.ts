// supabase/functions/create-checkout-session/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
// NOTE: Add stripe to your project's import_map.json
import Stripe from 'npm:stripe@^14.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Stripe with your secret key.
// IMPORTANT: Set STRIPE_SECRET_KEY, SITE_URL, and STRIPE_PRO_PRICE_ID in your Supabase Function environment variables.
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('User not authenticated');

    // 2. Get the Stripe Price ID for your "Pro" plan from the request body
    const { priceId } = await req.json(); // e.g., 'price_1P...' from your Stripe dashboard
    if (!priceId) throw new Error('Price ID is required');

    // 3. Get or create a Stripe Customer for the user
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
        // Save the new Stripe customer ID to the user's profile
        await supabase.from('user_profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }
    
    // 4. Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${Deno.env.get('SITE_URL')}/dashboard?payment=success`,
      cancel_url: `${Deno.env.get('SITE_URL')}/dashboard/settings`,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stripe Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
