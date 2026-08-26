import { toast as sonnerToast } from "sonner";

/**
 * Extract a user-facing message from an axios/NestJS error response.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (!data) {
    if (error?.message === "Network Error") {
      return "Connection error. Please make sure the server is running.";
    }
    return error?.message || fallback;
  }

  const msg = data.message;
  if (Array.isArray(msg)) {
    return msg.filter(Boolean).join(", ") || fallback;
  }
  if (typeof msg === "string" && msg.trim()) {
    return msg;
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  return fallback;
}

export const toast = {
  success(message, options) {
    return sonnerToast.success(message, options);
  },
  error(message, options) {
    return sonnerToast.error(message, options);
  },
  info(message, options) {
    return sonnerToast.info(message, options);
  },
  warning(message, options) {
    return sonnerToast.warning(message, options);
  },
  /** Show Nest/axios API error as a toast */
  apiError(error, fallback) {
    return sonnerToast.error(getApiErrorMessage(error, fallback));
  },
};
