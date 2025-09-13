"use node"
import { Twilio } from 'twilio';
import { Result, ok, err, ResultAsync, fromThrowable } from 'neverthrow';
import type { TwilioError } from './error';

// =============================================================================
// SMS/OTP Functionality
// =============================================================================

const DEV_WHATSAPP_PHONE_NUMBER = "whatsapp:+14155238886";

// Configuration type
type SMSConfig = {
  readonly accountSid: string;
  readonly authToken: string;
  readonly fromNumber: string;
  readonly whatsappFromNumber: string;
};

// Helper functions
const isDevelopment = () => process.env.TWILIO_ENV === 'development';

const validateInput = (phoneNumber: string, code: string): Result<[string, string], TwilioError> => {
  if (!phoneNumber?.trim()) {
    return err({ type: 'INVALID_INPUT', message: 'Phone number is required' });
  }
  if (!code?.trim()) {
    return err({ type: 'INVALID_INPUT', message: 'Verification code is required' });
  }
  return ok([phoneNumber.trim(), code.trim()]);
};

const getConfig = (): Result<SMSConfig, TwilioError> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_NUMBER;
  const whatsappFromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return err({
      type: 'CONFIG_MISSING',
      message: 'Missing Twilio environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER'
    });
  }

  const effectiveWhatsappFrom = whatsappFromNumber ?? DEV_WHATSAPP_PHONE_NUMBER;

  return ok({ accountSid, authToken, fromNumber, whatsappFromNumber: effectiveWhatsappFrom });
};

const createClient = fromThrowable(
  (config: SMSConfig) => new Twilio(config.accountSid, config.authToken),
  (error) => ({ type: 'SEND_FAILED' as const, message: 'Failed to create Twilio client', cause: error })
);

const logDevOTP = (phoneNumber: string, code: string): void => {
  console.log('\n' + '='.repeat(50));
  console.log(`📱 Development OTP`);
  console.log(`Phone: ${phoneNumber}`);
  console.log(`Code:  ${code}`);
  console.log('='.repeat(50) + '\n');
};

const sendTwilioSMS = (client: Twilio, config: SMSConfig, phoneNumber: string, code: string): ResultAsync<void, TwilioError> =>
  ResultAsync.fromPromise(
    client.messages.create({
      body: `Your verification code is: ${code}`,
      from: config.fromNumber,
      to: phoneNumber,
    }),
    (error) => ({ type: 'SEND_FAILED' as const, message: 'Failed to send SMS', cause: error })
  ).map((message) => {
    console.log(`✅ SMS sent successfully (SID: ${message.sid})`);
  });


const sendTwilioWhatsapp = (client: Twilio, config: SMSConfig, phoneNumber: string, body: string): ResultAsync<void, TwilioError> =>
  ResultAsync.fromPromise(
    client.messages.create({
      body: body,
      from: config.whatsappFromNumber,
      to: phoneNumber,
    }),
    (error) => ({ type: 'WHATSAPP_SEND_FAIL' as const, message: `Failed to send WhatsappMessage.\n From: ${config.whatsappFromNumber} \nTo: ${phoneNumber}`, cause: error })
  ).map((message) => {
    console.log(`✅ SMS sent successfully (SID: ${message.sid})`);
  });


// Main SMS function
export const sendOTP = async (phoneNumber: string, code: string): Promise<Result<void, TwilioError>> => {
  const inputResult = validateInput(phoneNumber, code);
  if (inputResult.isErr()) {
    return err(inputResult.error);
  }

  const [validPhone, validCode] = inputResult.value;

  // Development mode: just log
  if (isDevelopment()) {
    logDevOTP(validPhone, validCode);
    return ok(undefined);
  }

  // Production mode: send via Twilio
  const configResult = getConfig();
  if (configResult.isErr()) {
    return err(configResult.error);
  }

  const clientResult = createClient(configResult.value);
  if (clientResult.isErr()) {
    return err(clientResult.error);
  }

  const sendResult = await sendTwilioSMS(clientResult.value, configResult.value, validPhone, validCode);
  return sendResult;
};




export const sendWhatsappMessage = async (phoneNumber: string, message: string): Promise<Result<void, TwilioError>> => {

  const configResult = getConfig();
  if (configResult.isErr()) {
    return err(configResult.error);
  }

  const clientResult = createClient(configResult.value);
  if (clientResult.isErr()) {
    return err(clientResult.error);
  }

  const sendResult = await sendTwilioWhatsapp(clientResult.value, configResult.value, phoneNumber, message);
  return sendResult;

}
