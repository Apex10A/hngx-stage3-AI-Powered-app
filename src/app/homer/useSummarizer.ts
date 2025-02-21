import { useState } from 'react';

export function useSummarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (text: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!('ai' in window && 'summarizer' in (window as any).ai)) {
        throw new Error('Summarizer API is not available in this browser');
      }

      const summarizer = await (window as any).ai.summarizer.create();
      await summarizer.ready;

      const result = await summarizer.summarize(text);
      return result.summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Summarization failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summarize,
    isLoading,
    error
  };
}