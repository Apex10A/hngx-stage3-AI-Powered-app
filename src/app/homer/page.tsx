"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Maximize2, Minimize2, Copy, Volume2, Download, Share2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Message } from './types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslator } from './useTranslator';
import { useLanguageDetector } from './useLanguageDetector'; 

const languages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'es', name: 'Spanish' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'fr', name: 'French' },
];

export default function Home() {
    const { detectLanguage, isLoading: isDetectorLoading, error: detectorError } = useLanguageDetector();
    const { translate, isLoading: isTranslating } = useTranslator();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const languageResult = await detectLanguage(inputText.trim());
      
      const newMessage: Message = {
        id: nanoid(),
        text: inputText.trim(),
        detectedLanguage: languageResult ? 
          `${languages.find(l => l.code === languageResult.detectedLanguage)?.name || languageResult.detectedLanguage} (${(languageResult.confidence * 100).toFixed(1)}% confidence)` : 
          'Language detection unavailable'
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleTextToSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const languageResult = await detectLanguage(message.text);
      if (!languageResult) throw new Error('Could not detect source language');

      const translation = await translate(
        message.text,
        languageResult.detectedLanguage,
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
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.json';
    a.click();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <main className={`flex flex-col h-screen max-w-6xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display text-gray-800 dark:text-white">Multilingual Chat</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <Alert className="fixed top-4 right-4 w-auto animate-in fade-in slide-in-from-top-2">
            <AlertDescription>Text copied to clipboard!</AlertDescription>
          </Alert>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <Card key={message.id} className="max-w-[85%] ml-auto transform transition-all hover:shadow-lg">
              <CardContent className="p-4 space-y-3">
                {/* Message Content */}
                <div className="flex justify-between items-start gap-4">
                  <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                    {message.text}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(message.text)}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTextToSpeech(message.text)}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Language Info */}
                {message.detectedLanguage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detected: {message.detectedLanguage}
                  </p>
                )}

                {/* Translation Controls */}
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    className="text-sm border rounded-full px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    onChange={(e) => handleTranslate(message.id, e.target.value)}
                  >
                    <option value="">Translate to...</option>
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Translation Display */}
                {message.translation && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Translation ({message.targetLanguage}):
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{message.translation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white dark:bg-gray-800 p-6">
          <div className="flex gap-3 max-w-4xl mx-auto">
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
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-200 font-medium"
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-3 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={exportChat}
                variant="ghost"
                className="rounded-xl"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}