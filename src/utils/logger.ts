export const logger = {
  error(error: unknown, context?: string): void {
    if (context) {
      console.error(context, error);
      return;
    }

    console.error(error);
  },
};
