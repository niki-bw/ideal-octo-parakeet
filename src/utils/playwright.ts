import { Browser, chromium, Download, Locator, Page } from '@playwright/test';
import { storeDocument } from '../../../services/documentService';
import { InputData } from '../../models/data';
import { FrameLocator } from 'playwright';

export type GetPlaywrightPageOptions = {
  userAgent?: string;
  viewport?: { width: number; height: number };
};

export async function getPlaywrightPage(options: GetPlaywrightPageOptions = {}) {
  let browser: Browser;
  if (process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN && process.env.PLAYWRIGHT_SERVICE_URL) {
    browser = await chromium.connect(
      `${process.env.PLAYWRIGHT_SERVICE_URL}?os=Linux`,
      {
        headers: {
          'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN || '',
        },
      },
    );
  } else {
    browser = await chromium.launch();
  }

  const context = await browser.newContext({
    acceptDownloads: true,
    ...(options.userAgent && { userAgent: options.userAgent }),
    ...(options.viewport && { viewport: options.viewport }),
  });
  const awsPage = await context.newPage();
  return { awsPage, awsBrowser: browser, context };
}

export const getPlaywrightPageAndBrowser = async (
  page: Page | undefined,
  timeout: number,
): Promise<{ page: Page; browser?: Browser }> => {
  // If we don't have a page as an argument, fetch a new one through Playwright
  if (!page) {
    const { awsPage, awsBrowser } = await getPlaywrightPage();
    awsPage.setDefaultTimeout(timeout);
    return { page: awsPage, browser: awsBrowser };
  } else {
    page.setDefaultTimeout(timeout);
    return { page };
  }
};

/**
 * Clicks an element that opens a new tab and returns the new Page instance.
 *
 * @param page - the current Page
 * @param selector - CSS/XPath selector for the link or button
 */
export async function captureNewPage(page: Page, selector: string): Promise<Page> {
  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'), // wait for the popup
    page.click(selector), // trigger new tab
  ]);
  await newPage.waitForLoadState();
  return newPage;
}

export async function getLatestTab(browser: Browser): Promise<Page> {
  // Flatten all contexts' pages into one array
  const allPages = browser.contexts().flatMap((ctx) => ctx.pages());

  // Pick the last one (latest opened)
  const latestPage = allPages[allPages.length - 1];

  // Optional: focus it in headed mode
  await latestPage.bringToFront();

  return latestPage;
}

export const downloadFromPage = async (
  page: Page,
  downloadTrigger: () => Promise<void>,
): Promise<Download> => {
  const downloadEvent = new Promise<Download>((resolve) => {
    page.once('download', (download) => resolve(download));
  });

  await downloadTrigger();
  const result = await downloadEvent;
  return result;
};

export const processDownloadedFile = async (
  fileName: string,
  documentCategory: string,
  download: Download,
  inputData: InputData,
) => {
  try {
    const storeDocumentResult = await storeDocument({
      download: download,
      inputData: {
        documentCategory,
        fileName,
        ...inputData,
      },
    });
    return storeDocumentResult.data;
  } catch (error) {
    throw new Error('failed to store document', {
      cause: { policyNumber: inputData.policyNumber, error: error },
    });
  }
};

export async function clickIfExistBySelector(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await clickIfExist(element);
}

export async function clickIfExist(element: Locator) {
  if (await isElementExist(element)) {
    await element.click();
  }
}

export async function isElementExist(element: Locator): Promise<boolean> {
  try {
    if ((await element.count()) === 0) {
      return false;
    }
    return await element.isVisible();
  } catch (e) {
    return false;
  }
}

export async function isElementExistBySelector(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  return isElementExist(element);
}

export async function waitForVisibleClick(element: Locator, timeout = 60_000): Promise<void> {
  await element.waitFor({ state: 'visible', timeout });
  await element.click();
}

export async function waitForVisible(
  page: Page,
  selector: string,
  timeout = 60_000,
): Promise<void> {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

export async function waitForVisibleInFrame(
  frame: FrameLocator,
  selector: string,
  timeout = 60_000,
): Promise<void> {
  await frame.locator(selector).waitFor({ state: 'visible', timeout });
}

export async function waitForVisibleClickBySelector(
  page: Page,
  locator: string,
  timeout = 60_000,
): Promise<void> {
  const element = page.locator(locator);
  await waitForVisibleClick(element, timeout);
}

export async function delayedClick(element: Locator, delay = 100): Promise<void> {
  await element.waitFor({ state: 'visible', timeout: delay * 5 });
  await new Promise((resolve) => setTimeout(resolve, delay));
  await element.click();
}

export async function fillInput(page: Page, locator: string, value: string) {
  const input = page.locator(locator);
  await input.click();
  await input.fill(value);
}

export async function fillFrameInput(frame: FrameLocator, locator: string, value: string) {
  const input = frame.locator(locator);
  await input.click();
  await input.fill(value);
}

export async function fillInputSubmit(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(value);
  await input.press('Enter');
}

/**
 * Override window.confirm so that dialogs whose message includes any of the given
 * substrings are auto-accepted.
 */
export async function setupConfirmAutoAccept(page: Page, messages: string[]): Promise<void> {
  await page.addInitScript((messagesToAccept: string[]) => {
    const originalConfirm = window.confirm;
    window.confirm = (message?: string) => {
      if (messagesToAccept.some((m: string) => message?.includes(m))) {
        return true;
      }
      return originalConfirm.call(window, message);
    };
  }, messages);
}
