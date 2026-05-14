import { updateAddressOnLegacyCarrier } from './examples/legacyCarrierExample';
import { logger } from './utils/logger';
import sampleRequest from './samples/sampleRequest.json';

async function main() {
  logger.info('=== Carrier Automation Exercise ===');
  logger.info(`Request ID : ${sampleRequest.requestId}`);
  logger.info(`Customer   : ${sampleRequest.customerName}`);
  logger.info(`Carrier    : ${sampleRequest.carrier}`);
  logger.info(`Policy     : ${sampleRequest.policyNumber}`);
  logger.info('-----------------------------------');

  try {
    const result = await updateAddressOnLegacyCarrier(sampleRequest);
    logger.info('Result:', result);
  } catch (err) {
    logger.error('Automation failed:', err);
    process.exit(1);
  }
}

main();
