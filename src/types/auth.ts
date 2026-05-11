export type AuthIntent = "tourist" | "guide";

export type LoginTokens = {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

export type RegisterResult = {
  userSub?: string;
  userConfirmed?: boolean;
  codeDeliveryDetails?: unknown;
  existingAccountMayExist?: boolean;
  nextStep?: string;
};
