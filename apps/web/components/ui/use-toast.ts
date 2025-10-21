import { toast as sonnerToast } from 'sonner';

// Keep the direct named export for existing imports: `import { toast } from '@/components/ui/use-toast'`
export const toast = sonnerToast;

// Type alias for the sonner toast function
type SonnerToastFn = typeof sonnerToast;

// Simple hook that returns the sonner toast implementation. We avoid useCallback to
// prevent complex generic typing issues during build.
export function useToast() {
  return { toast: sonnerToast as SonnerToastFn };
}