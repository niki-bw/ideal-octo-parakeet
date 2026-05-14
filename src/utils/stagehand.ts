import { Stagehand } from '@browserbasehq/stagehand';
import { chromium, Page, BrowserContext } from 'playwright';
import { Browserbase } from '@browserbasehq/sdk';
import config from '../../config';

export type StagehandPageResult = {
  stagehand: InstanceType<typeof Stagehand>;
  page: Page;
  context: BrowserContext;
  bb: InstanceType<typeof Browserbase> | null;
};

export type StagehandPageOptions = {
  userMetadata?: Record<string, string>;
};

export async function getStagehandPage(
  options: StagehandPageOptions = {},
): Promise<StagehandPageResult> {
  const { stagehand: stagehandConfig } = config;

  const useBrowserbase = !!stagehandConfig.browserbaseApiKey;

  const userMetadata =
    options.userMetadata && Object.keys(options.userMetadata).length > 0
      ? options.userMetadata
      : undefined;

  const stagehand = new Stagehand({
    env: useBrowserbase ? 'BROWSERBASE' : 'LOCAL',
    // env: 'LOCAL',
    ...(useBrowserbase && {
      apiKey: stagehandConfig.browserbaseApiKey,
      projectId: stagehandConfig.browserbaseProjectId,
      ...(userMetadata && {
        browserbaseSessionCreateParams: {
          projectId: stagehandConfig.browserbaseProjectId,
          userMetadata,
        } as any,
      }),
    }),
    ...(stagehandConfig.azureOpenAIApiKey && {
      model: {
        modelName: stagehandConfig.modelName,
        apiKey: stagehandConfig.azureOpenAIApiKey,
        baseURL: stagehandConfig.azureOpenAIBaseURL,
        useDeploymentBasedUrls: true,
        apiVersion: '2025-03-01-preview',
      } as any,
    }),
    disableAPI: true,
    verbose: 0,
  });

  await stagehand.init();

  const browser = await chromium.connectOverCDP({
    wsEndpoint: stagehand.connectURL()
  });

  // Get the browserbase instance if we're using Browserbase, so we can manage the browser lifecycle (close it when done, etc.)
  let bb: InstanceType<typeof Browserbase> | null = null;
  if (useBrowserbase) {
    bb = new Browserbase({ apiKey: stagehandConfig.browserbaseApiKey });
  }

  const context = browser.contexts()[0];
  const page = context.pages()[0];

  return { stagehand, page, context, bb };
}
