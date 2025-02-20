import { useState, useEffect } from 'react';

interface TranslatorInstance {
  translate: (text: string) => Promise<string>;
  ready: Promise<void>;
}

export function useTranslator() {
  const [translators, setTranslators] = useState<Map<string, TranslatorInstance>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTranslatorKey = (source: string, target: string) => `${source}-${target}`;

  const createTranslator = async (sourceLanguage: string, targetLanguage: string) => {
    if (!('ai' in window && 'translator' in (window as any).ai)) {
      throw new Error('Translation API is not available in this browser');
    }

    const capabilities = await (window as any).ai.translator.capabilities();
    const availability = await capabilities.languagePairAvailable(sourceLanguage, targetLanguage);

    if (availability === 'no') {
      throw new Error(`Translation not available for ${sourceLanguage} to ${targetLanguage}`);
      console.log("No")
    }

    const translator = await (window as any).ai.translator.create({
      sourceLanguage,
      targetLanguage,
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          console.log(`Downloaded ${e.loaded} of ${e.total} bytes`);
        });
      },
    });

    await translator.ready;
    return translator;
  };

  const translate = async (text: string, sourceLanguage: string, targetLanguage: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const translatorKey = getTranslatorKey(sourceLanguage, targetLanguage);
      let translator = translators.get(translatorKey);

      if (!translator) {
        translator = await createTranslator(sourceLanguage, targetLanguage);
        setTranslators(prev => new Map(prev.set(translatorKey, translator!)));
      }

      if (!translator) {
        throw new Error('Translator instance is undefined');
      }
      const result = await translator.translate(text);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    translate,
    isLoading,
    error
  };
}