export interface InAppBannerPayload {
  title: string;
  body: string;
  taskId?: string;
}

type Listener = (payload: InAppBannerPayload | null) => void;

let listener: Listener | null = null;

export function subscribeInAppBanner(next: Listener): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}

export function showInAppBanner(payload: InAppBannerPayload): void {
  listener?.(payload);
}

export function hideInAppBanner(): void {
  listener?.(null);
}
