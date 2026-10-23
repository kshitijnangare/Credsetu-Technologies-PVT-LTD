const OTP_TTL_MS = 5 * 60 * 1000;

type OtpRecord = {
  otp: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

export const generateOtp = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

export const saveOtp = (phoneNumber: string, otp: string): void => {
  otpStore.set(phoneNumber, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
};

export const verifyStoredOtp = (phoneNumber: string, otp: string): boolean => {
  const record = otpStore.get(phoneNumber);
  if (!record) {
    return false;
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phoneNumber);
    return false;
  }
  const matches = record.otp === otp;
  if (matches) {
    otpStore.delete(phoneNumber);
  }
  return matches;
};

export const resetOtpStore = (): void => {
  otpStore.clear();
};
