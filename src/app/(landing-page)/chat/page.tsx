"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Copy, Volume2, Sun, Moon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslator } from './useTranslator';
import { useLanguageDetector } from './useLanguageDetector';
import { useSummarizer } from './useSummarizer';
import "../../main.css"

// Define available languages (same as before)
const languages = [
  { code: 'ar', name: 'Arabic' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hr', name: 'Croatian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'iw', name: 'Hebrew' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'no', name: 'Norwegian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-Hant', name: 'Chinese (Traditional)' }
];

interface Message {
  id: string;
  text: string;
  detectedLanguage?: string;
  detectedLanguageCode?: string;
  translation?: string;
  targetLanguage?: string;
  summary?: string;
  confidence?: number;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "👋 Hello! I'm your AI language assistant. I can help you with:\n• Detecting languages\n• Translating text\n• Summarizing English content over 150 characters\n\nFeel free to type your message below to get started!",
  detectedLanguage: 'English',
  detectedLanguageCode: 'en',
  confidence: 1
};

export default function Home() {
  const { detectLanguage, isLoading: isDetectorLoading } = useLanguageDetector();
  const { translate, isLoading: isTranslating } = useTranslator();
  const { summarize, isLoading: isSummarizing } = useSummarizer();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('80px');
  const [darkMode, setDarkMode] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check browser compatibility
  useEffect(() => {
    const checkBrowserSupport = () => {
      const isWebkit = 'webkitSpeechRecognition' in window;
      const isSpeechSupported = 'speechSynthesis' in window;
      const isModernBrowser = 'Promise' in window && 'fetch' in window;
      
      setBrowserSupported(isModernBrowser);
    };

    checkBrowserSupport();
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited && !hasShownWelcome) {
      setMessages([WELCOME_MESSAGE]);
      setHasShownWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, [hasShownWelcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '80px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + 'px';
      setTextareaHeight(`${Math.min(scrollHeight, 200)}px`);
    }
  }, [inputText]);

  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!browserSupported) {
      showAlertMessage('Your browser may not fully support all features. Please use a modern browser for the best experience.');
      return;
    }

    setIsLoading(true);
    try {
      if (messages.length === 1 && messages[0].id === 'welcome') {
        setMessages([]);
      }

      const languageResult = await detectLanguage(inputText.trim());
      
      if (!languageResult) {
        throw new Error('Language detection failed');
      }

      const newMessage: Message = {
        id: nanoid(),
        text: inputText.trim(),
        detectedLanguageCode: languageResult.detectedLanguage,
        detectedLanguage: `${languages.find(l => l.code === languageResult.detectedLanguage)?.name || languageResult.detectedLanguage}`,
        confidence: languageResult.confidence
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    } catch (error) {
      console.error('Error processing message:', error);
      showAlertMessage('Error processing message. Please check your browser compatibility.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    if (!browserSupported) {
      showAlertMessage('Translation may not be fully supported in your browser. Please use a modern browser.');
      return;
    }

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message || !message.detectedLanguageCode) return;

      const translation = await translate(
        message.text,
        message.detectedLanguageCode,
        targetLanguage
      );

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              translation, 
              targetLanguage: languages.find(l => l.code === targetLanguage)?.name 
            }
          : msg
      ));
    } catch (error) {
      console.error('Translation error:', error);
      showAlertMessage('Translation failed. Please try again or check your browser compatibility.');
    }
  };

  const handleSummarize = async (messageId: string) => {
    if (!browserSupported) {
      showAlertMessage('Summarization may not be fully supported in your browser. Please use a modern browser.');
      return;
    }

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const summary = await summarize(message.text);
      if (summary) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, summary }
            : msg
        ));
      }
    } catch (error) {
      console.error('Summarization error:', error);
      showAlertMessage('Summarization failed. Please try again or check your browser compatibility.');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlertMessage('Text copied to clipboard!');
    } catch (error) {
      showAlertMessage('Failed to copy text. This feature may not be supported in your browser.');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <main className={`flex flex-col h-screen mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} md:max-w-4xl lg:max-w-6xl`}>
        {/* Header */}
        <div className={`border-b px-4 sm:px-6 py-3 sm:py-4 ${darkMode ? 'border-gray-700' : ''} flex justify-between items-center`}>
          <h1 className={`text-xl sm:text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Chat Processor
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className={darkMode ? 'text-white' : 'text-gray-900'}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Browser Support Warning */}
        {!browserSupported && (
          <Alert className="m-4">
            <AlertDescription>
              Some features may not work properly in your current browser. For the best experience, please use a modern browser like Chrome, Firefox, or Edge.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert */}
        {showAlert && (
          <Alert className={`fixed top-4 right-4 z-50 w-auto max-w-[90vw] animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-gray-700 text-white' : ''}`}>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`max-w-[95%] sm:max-w-[85%] ${
                message.id === 'welcome' 
                  ? 'mx-auto ' + (darkMode ? 'bg-blue-900' : 'bg-blue-50')
                  : 'ml-auto'
              } ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
            >
              <CardContent className="p-3 sm:p-4 space-y-3">
                {/* Message Text */}
                <div className="flex justify-between items-start gap-2 sm:gap-4">
                  <p className={`text-sm sm:text-base font-medium whitespace-pre-line break-words ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {message.text}
                  </p>
                  {message.id !== 'welcome' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-shrink-0 ${darkMode ? 'text-gray-300 hover:text-white' : ''}`}
                      onClick={() => handleCopy(message.text)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Language Detection Info */}
                {message.detectedLanguage && message.id !== 'welcome' && (
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Detected: {message.detectedLanguage} 
                    {message.confidence && ` (${(message.confidence * 100).toFixed(1)}% confidence)`}
                  </p>
                )}

                {/* Action Buttons */}
                {message.id !== 'welcome' && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {message.text.length > 150 && 
                     message.detectedLanguageCode === 'en' && 
                     !message.summary && (
                      <Button
                        onClick={() => handleSummarize(message.id)}
                        disabled={isSummarizing}
                        className={`text-xs sm:text-sm ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-slate-900 hover:bg-slate-700 text-white'
                        }`}
                        variant="default"
                        size="sm"
                      >
                        {isSummarizing ? 'Summarizing...' : 'Summarize'}
                      </Button>
                    )}

                    <select
                      className={`text-xs sm:text-sm border rounded px-2 py-1 sm:px-3 sm:py-1 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white text-gray-900'
                      }`}
                      onChange={(e) => handleTranslate(message.id, e.target.value)}
                      disabled={isTranslating}
                    >
                      <option value="">Translate to...</option>
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Summary Display */}
                {message.summary && (
                  <div className={`mt-3 p-2 sm:p-3 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-xs sm:text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Summary:
                    </p>
                    <p className={`text-xs sm:text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {message.summary}
                    </p>
                  </div>
                )}

                {/* Translation Display */}
                {message.translation && (
                  <div className={`mt-3 p-2 sm:p-3 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-xs sm:text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Translation ({message.targetLanguage}):
                    </p>
                    <p className={`text-xs sm:text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {message.translation}
                    </p>
                  </div>
                )}
                </CardContent>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`border-t p-4 sm:p-6 ${darkMode ? 'border-gray-700' : ''}`}>
          <div className="flex gap-2 sm:gap-3">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className={`flex-1 resize-none rounded-xl border p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900'
              }`}
              style={{ height: textareaHeight }}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className={`rounded-xl p-2 sm:p-3 flex-shrink-0 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-900 hover:bg-slate-700 text-white'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}