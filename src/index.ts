import { viewPolicyDetails } from './examples/legacyCarrierExample.ts';
import { logger } from './utils/logger.ts';
import sampleRequest from './samples/sampleRequest.json' with { type: 'json' };

async function main() {
  logger.info('=== Carrier Automation Exercise ===');
  logger.info(`Request ID : ${sampleRequest.requestId}`);
  logger.info(`Customer   : ${sampleRequest.customerFirstName} ${sampleRequest.customerLastName}`);
  logger.info(`Carrier    : ${sampleRequest.carrier}`);
  logger.info(`Policy     : ${sampleRequest.policyNumber}`);
  logger.info('-----------------------------------');

  try {
    const result = await viewPolicyDetails(sampleRequest);
    logger.info('Result:', result);
  } catch (err) {
    logger.error('Automation failed:', err);
    process.exit(1);
  }
}

main();
