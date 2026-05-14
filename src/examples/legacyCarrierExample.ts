import { createBrowser } from '../browser/browser.ts';
import { delay } from '../utils/delay.ts';
import { logger } from '../utils/logger.ts';

// TODO: these should not be hardcoded here
const CARRIER_LOGIN_URL = 'https://demo-legacy-carrier.example.com/login';
const CARRIER_SEARCH_URL = 'https://demo-legacy-carrier.example.com/policies/search';

export async function viewPolicyDetails(request: any) {
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

  await browser.type('input[name="q"]', request.policyNumber);
  await browser.click('.search-btn');

  await browser.waitForText('Search Results');

  await browser.click('.result-row:first-child .policy-link');

  await browser.waitForText('Policy Details');
  await browser.screenshot('01-policy-found');

  // Waiting a couple seconds for load
  await delay(2000);

  await browser.screenshot('02-policy-details');

  // TODO: should we log out after each run? does leaving sessions open cause issues?

    logger.info(`Done — policy information pulled for policy ${request.policyNumber}`);

  return {
    policyNumber: request.policyNumber,
    carrier: 'BrunoNational',
  };
}
