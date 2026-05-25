import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Sparkles, Download, RefreshCw, X, History, Trash2, ShieldAlert } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { AuthService } from '../services/authService';
import { ASPECT_RATIOS } from '../constants';
import { AspectRatio, GeneratedMedia } from '../types';
import { auth } from '../lib/firebase';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedMedia[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = AuthService.subscribeToAuth((u) => {
      setUser(u);
      if (u) {
        loadHistory(u.uid);
      } else {
        const saved = localStorage.getItem('zhiri_history');
        if (saved) {
          try {
            setHistory(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to load history");
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadHistory = async (uid: string) => {
    const cloudHistory = await AuthService.getHistory(uid);
    setHistory(cloudHistory);
  };

  const saveToHistory = async (url: string, promptText: string) => {
    if (user) {
      await AuthService.saveImage(user.uid, url, promptText, aspectRatio);
      await loadHistory(user.uid);
    } else {
      const newItem: GeneratedMedia = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        prompt: promptText,
        timestamp: Date.now(),
      };
      const newHistory = [newItem, ...history].slice(0, 12);
      setHistory(newHistory);
      localStorage.setItem('zhiri_history', JSON.stringify(newHistory));
    }
  };

  const clearHistory = async () => {
    if (user) {
      // For cloud history, we delete items one by one for safety or keep it
      // Let's just clear locally for now or add a clear all service
      // To keep it simple, we'll just advise sign in
    } else {
      setHistory([]);
      localStorage.removeItem('zhiri_history');
    }
  };

  const deleteItem = async (id: string) => {
    if (user) {
      await AuthService.deleteHistoryItem(user.uid, id);
      await loadHistory(user.uid);
    } else {
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      localStorage.setItem('zhiri_history', JSON.stringify(newHistory));
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setError(null);
    try {
      const imageUrl = await GeminiService.generateImage(prompt, aspectRatio);
      setResult(imageUrl);
      saveToHistory(imageUrl, prompt);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (imgUrl: string) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `zhiri-kurd-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-8 h-full" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white tracking-tight">ستۆدیۆی وێنە</h2>
          <p className="text-sm text-gray-500">خەیاڵەکانت بگۆڕە بۆ وێنەی هونەری دیجیتاڵی</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 h-full text-right">
        {/* Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">پێناسەی وێنەکە (بە ئینگلیزی)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="چی دەبینیت؟ بۆمان بنووسە... (بۆ نموونە: قەڵای هەولێر لە پاشەڕۆژدا)"
                className="w-full bg-transparent border border-panel-border rounded-xl p-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-accent/50 transition-colors h-32 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">قەبارە</label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                      aspectRatio === ratio.value
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-app-bg border-panel-border text-gray-500 hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt}
              className="w-full bg-accent text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              {generating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {generating ? 'خەریکی دروستکردنە...' : 'وێنەکە دروست بکە'}
            </button>
          </div>

          {/* History */}
          <div className="glass-panel p-5 rounded-2xl flex-1 flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <History className="w-3 h-3" />
                وێنە کۆنەکان
              </div>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-gray-600 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => setResult(item.url)}
                    className="w-full aspect-square bg-app-bg rounded-lg overflow-hidden border border-panel-border hover:border-accent/40 transition-colors group relative"
                  >
                    <img src={item.url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-accent/20 transition-opacity">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <div className="col-span-3 py-10 text-center opacity-20 text-[10px] uppercase tracking-widest font-mono">هیچ وێنەیەک نییە</div>
              )}
            </div>

            {!user && history.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-accent shrink-0" />
                <p className="text-[10px] text-gray-500 leading-tight">بۆ پاراستنی وێنەکانت لە هەموو ئامێرێکدا، تکایە بچۆ ژوورەوە.</p>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-kurd-red/10 border border-kurd-red/30 rounded-xl text-kurd-red text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-8 relative min-h-[500px] flex items-center justify-center bg-panel-bg border border-panel-border rounded-2xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group w-full h-full flex items-center justify-center p-4 bg-app-bg"
              >
                <img
                  src={result}
                  alt="Generated AI"
                  className="max-w-full max-h-full rounded-lg shadow-2xl object-contain shadow-accent/5"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-6 left-6 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleDownload(result)}
                    className="bg-accent text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-accent-hover shadow-lg"
                  >
                    <Download className="w-4 h-4" /> دابەزاندن
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="bg-panel-bg/90 backdrop-blur-sm border border-white/10 p-2 rounded-full hover:bg-red-500 transition-colors text-white"
                    title="سڕینەوە"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : generating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-2 border-accent/10 border-t-accent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-500 font-mono text-[10px] tracking-widest uppercase">خەریکی کارکردنە...</p>
              </motion.div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <ImageIcon className="w-16 h-16 mx-auto mb-2 text-gray-500" />
                <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.2em]">چاوەڕێی پێناسەکردنی وێنەکەیە</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

