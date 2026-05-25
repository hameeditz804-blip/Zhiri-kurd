import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Youtube, LogIn, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';
import ImageGenerator from './components/ImageGenerator';
import { APP_NAME, APP_SLOGAN, YOUTUBE_URL, YOUTUBE_HANDLE } from './constants';
import { AuthService } from './services/authService';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.subscribeToAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await AuthService.login();
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-gray-200 font-sans overflow-x-hidden" dir="rtl">
      {/* Top Header */}
      <header className="h-16 border-b border-panel-border flex items-center justify-between px-4 sm:px-8 bg-panel-bg/50 backdrop-blur-sm shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-none">{APP_NAME}</h1>
            <p className="text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{APP_SLOGAN}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-8">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-panel-bg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white leading-tight">{user.displayName}</p>
                <button 
                  onClick={handleLogout}
                  className="text-[9px] text-gray-500 hover:text-red-400 transition-colors"
                >
                  جێهێشتن
                </button>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-accent/20 overflow-hidden bg-panel-bg shadow-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-2 text-gray-600" />
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              <LogIn className="w-3 h-3 sm:w-4 sm:h-4" /> چوونەژوورەوە
            </button>
          )}

          <div className="hidden lg:flex items-center gap-4 text-xs bg-panel-bg px-4 py-1.5 rounded-full text-gray-400 border border-panel-border">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-wider">سێرڤەر: چالاکە</span>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 bg-app-bg technical-grid relative p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto h-full">
           <ImageGenerator />
        </div>
      </main>

      {/* Floating YouTube Support Button */}
      <motion.a 
        href={YOUTUBE_URL} 
        target="_blank" 
        rel="noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-14 left-4 sm:bottom-16 sm:left-8 z-[60] flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-red-600/40 transition-all group"
      >
        <div className="flex flex-col items-start text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">پاڵپشتیمان بکەن</span>
          <span className="text-[9px] text-white/80 font-mono tracking-tight">{YOUTUBE_HANDLE}</span>
        </div>
        <Youtube className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </motion.a>

      {/* Compact Status Bar */}
      <footer className="h-10 border-t border-panel-border bg-panel-bg px-4 sm:px-8 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-gray-600 uppercase tracking-[0.3em] shrink-0">
        <div className="flex gap-4 sm:gap-6">
          <span>ناوچە: کوردستان</span>
          <span className="hidden xs:inline">خێرایی: ١٢میلی چرکە</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3 text-accent" />
          <span className="hidden xs:inline">پارێزراوە لەلایەن پرۆتۆکۆڵی ژیری</span>
          <span className="xs:hidden">ژیری کورد</span>
        </div>
      </footer>
    </div>
  );
}

