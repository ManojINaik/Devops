import { toast as sonnerToast } from 'sonner';

export const toast = {
  error: (message) => sonnerToast.error(message),
  success: (message) => sonnerToast.success(message),
  info: (message) => sonnerToast.info(message),
};
