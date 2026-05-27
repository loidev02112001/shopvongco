// Type declarations for Google Identity Services (GSI)
// https://developers.google.com/identity/gsi/web/reference/js-reference

interface GoogleCredentialResponse {
  credential: string; // JWT ID token
  select_by: string;
}

interface GoogleAccountsIdConfig {
  client_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (response: any) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonConfig {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: GoogleAccountsIdConfig) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
  prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
  disableAutoSelect: () => void;
  revoke: (hint: string, callback: () => void) => void;
}

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
    onGoogleLibraryLoad?: () => void;
  }
}

export {};
