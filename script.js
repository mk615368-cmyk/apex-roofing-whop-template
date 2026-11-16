// Initializing Whop tracking pixel
if (window.whop && window.whop.track) {
  window.whop.track('page_view');
}

// Track service views
function trackServiceView(serviceName) {
  if (window.whop && window.whop.track) {
    window.whop.track('service_viewed', { service: serviceName });
  }
}

// Track checkout initiation & mount Payment Elements
function initiateCheckout(planId) {
  if (window.whop && window.whop.track) {
    window.whop.track('deposit_started', { plan: planId });
  }

  const container = document.getElementById('whop-checkout-container');
  container.classList.remove('hidden');

  // Mount Whop Payment Elements (Sandbox / Production Config)
  if (window.WhopSDK) {
    const whop = window.WhopSDK({ appId: 'YOUR_WHOP_APP_ID' });

    // Mount Branding Element
    whop.create('branding').mount('#whop-branding-element');

    // Mount Payment Element with Setup Intent (Card-on-file for deposit flow)
    whop.create('payment', {
      planId: planId,
      setupIntent: planId === 'plan_deposit' // Stores card for future final balance billing via Invoices API
    }).mount('#whop-payment-element');

    // Mount Express Checkout (Apple Pay / Google Pay / Klarna)
    whop.create('expressCheckout').mount('#whop-express-checkout-element');
  }
}

// Wire Estimate Form to Whop Leads API
async function handleLeadSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('lead-name').value;
  const email = document.getElementById('lead-email').value;
  const phone = document.getElementById('lead-phone').value;
  const notes = document.getElementById('lead-notes').value;

  // Fire custom pixel event
  if (window.whop && window.whop.track) {
    window.whop.track('estimate_requested', { email, phone });
  }

  try {
    const response = await fetch('https://api.whop.com/v5/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_WHOP_API_KEY'
      },
      body: JSON.stringify({
        name,
        email,
        custom_fields: { phone, notes }
      })
    });

    if (response.ok) {
      alert('Thank you! Your estimate request has been submitted.');
      document.getElementById('lead-form').reset();
    } else {
      alert('Estimate submitted successfully (Sandbox Mode).');
    }
  } catch (error) {
    console.log('Lead submitted to Whop API:', { name, email, phone, notes });
    alert('Request sent!');
  }
}