"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Copy, Volume2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslator } from './useTranslator';
import { useLanguageDetector } from './useLanguageDetector';
import { useSummarizer } from './useSummarizer';
import "../../main.css"

// Define available languages
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

// Message interface
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

// Welcome message
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "👋 Hello! I'm your AI language assistant. I can help you with:\n• Detecting languages\n• Translating text\n• Summarizing English content over 150 characters\n\nFeel free to type your message below to get started!",
  detectedLanguage: 'English',
  detectedLanguageCode: 'en',
  confidence: 1
};

export default function Home() {
  // Custom hooks
  const { detectLanguage, isLoading: isDetectorLoading } = useLanguageDetector();
  const { translate, isLoading: isTranslating } = useTranslator();
  const { summarize, isLoading: isSummarizing } = useSummarizer();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show welcome message on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited && !hasShownWelcome) {
      setMessages([WELCOME_MESSAGE]);
      setHasShownWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, [hasShownWelcome]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show alert helper
  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  // Handle sending a new message
  const handleSend = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      // Remove welcome message if it's the first user message
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
      showAlertMessage('Error processing message');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle translation
  const handleTranslate = async (messageId: string, targetLanguage: string) => {
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
      showAlertMessage('Translation failed');
    }
  };

  // Handle summarization
  const handleSummarize = async (messageId: string) => {
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
      showAlertMessage('Summarization failed');
    }
  };

  // Copy text to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlertMessage('Text copied to clipboard!');
    } catch (error) {
      showAlertMessage('Failed to copy text');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">AI Chat Processor</h1>
        </div>

        {/* Alert */}
        {showAlert && (
          <Alert className="fixed top-4 right-4 w-auto animate-in fade-in slide-in-from-top-2">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <Card key={message.id} className={`max-w-[85%] ${message.id === 'welcome' ? 'mx-auto bg-blue-50' : 'ml-auto'}`}>
              <CardContent className="p-4 space-y-3">
                {/* Message Text */}
                <div className="flex justify-between items-start gap-4">
                  <p className="text-gray-800 font-medium whitespace-pre-line">
                    {message.text}
                  </p>
                  {message.id !== 'welcome' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(message.text)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Language Detection Info */}
                {message.detectedLanguage && message.id !== 'welcome' && (
                  <p className="text-sm text-gray-500">
                    Detected: {message.detectedLanguage} 
                    {message.confidence && ` (${(message.confidence * 100).toFixed(1)}% confidence)`}
                  </p>
                )}

                {/* Action Buttons */}
                {message.id !== 'welcome' && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Summarize Button - only for English text over 150 chars */}
                    {message.text.length > 150 && 
                     message.detectedLanguageCode === 'en' && 
                     !message.summary && (
                      <Button
                        onClick={() => handleSummarize(message.id)}
                        disabled={isSummarizing}
                        className='bg-slate-900 hover:bg-slate-700 text-white'
                        variant="default"
                        size="sm"
                      >
                        {isSummarizing ? 'Summarizing...' : 'Summarize'}
                      </Button>
                    )}

                    {/* Language Selector */}
                    <select
                      className="text-sm border rounded px-3 py-1"
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
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Summary:
                    </p>
                    <p className="text-gray-600">{message.summary}</p>
                  </div>
                )}

                {/* Translation Display */}
                {message.translation && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Translation ({message.targetLanguage}):
                    </p>
                    <p className="text-gray-600">{message.translation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-6">
          <div className="flex gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 resize-none rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="bg-slate-900 hover:bg-slate-700 text-white rounded-xl p-3"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}