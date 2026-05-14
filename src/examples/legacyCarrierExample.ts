// Address change automation for legacy carrier portal
// Extended from the existing login-only RPA — address update steps added below the login block
// TODO: other carriers still only have the login portion; this is the first one with actual work

import { createBrowser } from '../browser/browser';
import { delay } from '../utils/delay';
import { logger } from '../utils/logger';

// TODO: these should not be hardcoded here
const CARRIER_LOGIN_URL = 'https://demo-legacy-carrier.example.com/login';
const CARRIER_SEARCH_URL = 'https://demo-legacy-carrier.example.com/policies/search';

export async function updateAddressOnLegacyCarrier(request: any) {
  const browser = createBrowser();

  logger.info(`Starting address update — policy ${request.policyNumber}`);

  // --- Login ---
  // Ported from the existing login-only automation for this carrier.
  // That script just verified credentials and stopped here. Everything below is new.
  await browser.goto(CARRIER_LOGIN_URL);
  await browser.click('#username-field');
  await browser.type('#username-field', request.agentUsername);
  await browser.click('#password-field');
  await browser.type('#password-field', request.agentPassword);
  await browser.click('#btn-login');

  // This carrier sometimes redirects to an MFA page, sometimes doesn't.
  // Depends on whether the session is "trusted." Not sure how that's determined.
  // For now assuming no MFA. Will need to handle this eventually.
  await browser.waitForText('Welcome back');

  // --- Find the policy ---
  await browser.goto(CARRIER_SEARCH_URL);

  // NOTE: this carrier has two different search UIs depending on policy vintage.
  // Policies written before ~2019 use a different portal entirely.
  // Hardcoding the new one for now. Old-portal support is a TODO.
  await browser.type('input[name="q"]', request.policyNumber);
  await browser.click('.search-btn');

  await browser.waitForText('Search Results');

  // hoping the first result is always the right one
  await browser.click('.result-row:first-child .policy-link');

  await browser.waitForText('Policy Details');
  await browser.screenshot('01-policy-found');

  // --- Navigate to address change ---
  // TODO: there's also a "Change Address" link in the sidebar on some accounts
  // but not all. This dropdown approach seems to work more consistently.
  await browser.click('#policy-actions-menu');
  await delay(600); // dropdown has a CSS animation, clicking too fast misses it
  await browser.click('#policy-actions-menu .action-change-address');

  await browser.waitForText('Update Policyholder Address');
  await browser.screenshot('02-address-form-loaded');

  // --- Fill in new address ---
  // TODO: do we need to clear these fields first? or does type() overwrite?
  // tested a few times and it seemed fine but not 100% sure
  await browser.type('#addr-line1', request.newAddress.street);
  await browser.type('#addr-city', request.newAddress.city);

  // State is a <select> on this carrier, not a text input
  // TODO: handle both cases once we add more carriers
  await browser.click('#addr-state');
  await browser.click(`#addr-state option[value="${request.newAddress.state}"]`);

  await browser.type('#addr-zip', request.newAddress.zip);

  await browser.screenshot('03-address-filled');

  // --- Submit ---
  await browser.click('#btn-submit-change');

  // Confirmation on this carrier is unreliable.
  // Sometimes shows a modal, sometimes redirects, sometimes nothing visible happens.
  // Waiting a couple seconds before checking.
  await delay(2000);

  let confirmed = false;

  try {
    await browser.waitForText('Address updated successfully');
    confirmed = true;
  } catch (_e1) {
    // maybe the other confirmation message
    try {
      await browser.waitForText('Change request received');
      confirmed = true;
    } catch (_e2) {
      // try the modal variant
      try {
        await browser.waitForText('Your request has been submitted');
        confirmed = true;
      } catch (_e3) {
        logger.warn('None of the expected confirmation messages appeared — manual check required');
      }
    }
  }

  await browser.screenshot('04-after-submit');

  // TODO: should we log out after each run? does leaving sessions open cause issues?
  // await browser.click('#nav-logout');

  if (confirmed) {
    logger.info(`Done — address updated for policy ${request.policyNumber}`);
  } else {
    logger.warn(`Done — confirmation UNKNOWN for policy ${request.policyNumber}`);
  }

  return {
    success: confirmed,
    policyNumber: request.policyNumber,
    carrier: 'legacy-carrier',
    // TODO: capture confirmation number if present
  };
}
