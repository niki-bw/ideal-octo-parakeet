// Mocked browser layer — simulates page navigation, interactions, and occasional failures.
// No real browser is launched. Actions are logged and delayed to feel realistic.

import { randomDelay } from '../utils/delay';
import { logger } from '../utils/logger';

// Rough failure simulation. Tune this up to stress-test retry logic.
const FAILURE_RATE = 0.06;

function maybeFail(context: string) {
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`[browser] Simulated failure — ${context}`);
  }
}

class BrowserSession {
  private currentUrl: string = '';

  async goto(url: string): Promise<void> {
    logger.info(`[browser] goto → ${url}`);
    await randomDelay(400, 900);
    this.currentUrl = url;
  }

  async click(selector: string): Promise<void> {
    logger.debug(`[browser] click "${selector}"`);
    await randomDelay(80, 350);
    maybeFail(`click "${selector}" — element may not be present or visible`);
  }

  async type(selector: string, value: string): Promise<void> {
    logger.debug(`[browser] type "${selector}" = "${value}"`);
    await randomDelay(150, 450);
  }

  // timeoutMs is accepted for interface realism but not enforced in the mock
  async waitForText(text: string, timeoutMs: number = 5000): Promise<void> {
    logger.debug(`[browser] waitForText "${text}" (timeout: ${timeoutMs}ms)`);
    await randomDelay(300, 1100);
    maybeFail(`waitForText "${text}" — text did not appear within ${timeoutMs}ms`);
  }

  async screenshot(name: string): Promise<void> {
    logger.info(`[browser] screenshot → ${name}.png (simulated)`);
    await randomDelay(40, 120);
  }

  async getHtml(): Promise<string> {
    logger.debug('[browser] getHtml');
    await randomDelay(40, 90);
    return '<html><body><!-- simulated page snapshot --></body></html>';
  }

  getCurrentUrl(): string {
    return this.currentUrl;
  }
}

export function createBrowser(): BrowserSession {
  return new BrowserSession();
}
