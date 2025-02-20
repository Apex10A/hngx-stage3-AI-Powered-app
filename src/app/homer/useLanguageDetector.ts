import { useState, useEffect } from 'react';

interface LanguageDetectorResult {
  detectedLanguage: string;
  confidence: number;
}

export function useLanguageDetector() {
  const [detector, setDetector] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDetector = async () => {
      if (!('ai' in window && 'languageDetector' in (window as any).ai)) {
        setError('Language Detector API is not available in this browser');
        setIsLoading(false);
        return;
      }

      try {
        const capabilities = await (window as any).ai.languageDetector.capabilities();
        
        if (capabilities.available === 'no') {
          setError('Language detector is not usable on this device');
          setIsLoading(false);
          return;
        }

        const newDetector = await (window as any).ai.languageDetector.create({
          monitor(m: any) {
            m.addEventListener('downloadprogress', (e: any) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes`);
            });
          },
        });

        await newDetector.ready;
        setDetector(newDetector);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize language detector');
        setIsLoading(false);
      }
    };

    initializeDetector();
  }, []);

  const detectLanguage = async (text: string): Promise<LanguageDetectorResult | null> => {
    if (!detector) return null;

    try {
      const results = await detector.detect(text);
      // Get the most confident result
      const topResult = results[0];
      return topResult;
    } catch (err) {
      console.error('Error detecting language:', err);
      return null;
    }
  };

  return {
    detectLanguage,
    isLoading,
    error
  };
}