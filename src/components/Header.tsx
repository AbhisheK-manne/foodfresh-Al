import React from 'react';
import { 
  Apple, 
  Camera, 
  Clock, 
  Cloud,
  Database, 
  HelpCircle, 
  History, 
  LayoutDashboard, 
  LogIn,
  LogOut,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'home' | 'scan' | 'result' | 'history' | 'dashboard' | 'dataset' | 'about';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasCurrentResult: boolean;
  onOpenDemoPicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  hasCurrentResult,
  onOpenDemoPicker,
}) => {
  const { user, signIn, signOut, firestoreConnected } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);

  const handleAuthAction = async () => {
    try {
      setAuthError(null);
      if (user) {
        await signOut();
      } else {
        await signIn();
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
      setTimeout(() => setAuthError(null), 4000);
    }
  };
  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">FoodFresh</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Vision
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Freshness & Spoilage Estimator
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60 text-sm">
            <button
              id="nav-home"
              onClick={() => onSelectTab('home')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-scan"
              onClick={() => onSelectTab('scan')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'scan'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Input / Scan</span>
            </button>
            {hasCurrentResult && (
              <button
                id="nav-result"
                onClick={() => onSelectTab('result')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'result'
                    ? 'bg-stone-700 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                Latest Result
              </button>
            )}
            <button
              id="nav-history"
              onClick={() => onSelectTab('history')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <History className="w-4 h-4 text-stone-400" />
              History
            </button>
            <button
              id="nav-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-stone-400" />
              Dashboard
            </button>
            <button
              id="nav-dataset"
              onClick={() => onSelectTab('dataset')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'dataset'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400" />
              Dataset & Eval
            </button>
            <button
              id="nav-about"
              onClick={() => onSelectTab('about')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'about'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-stone-400" />
              How It Works
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Firestore Database Indicator */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-800/80 border border-stone-700/70 text-stone-300"
              title="Firestore Database: ai-studio-foodfreshai-f6bab187-9a4e-453c-8024-c4d9d947a5e0"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firestore</span>
            </div>

            {/* Google Authentication Control */}
            {user ? (
              <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700/80 rounded-lg p-1 pl-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden xl:inline text-xs text-stone-200 max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  id="auth-signout-btn"
                  onClick={handleAuthAction}
                  className="p-1 text-stone-400 hover:text-rose-400 rounded transition-colors"
                  title="Sign out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="auth-signin-btn"
                onClick={handleAuthAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shadow-sm cursor-pointer"
                title="Sign in with Google to sync scans and data to cloud Firestore"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button
              id="header-demo-samples-btn"
              onClick={onOpenDemoPicker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
              title="Open Hackathon Demo Presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Prototype Samples</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              id="header-quick-scan-btn"
              onClick={() => onSelectTab('scan')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Input Food</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scroll Strip */}
        <div className="md:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-stone-800 text-xs no-scrollbar">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'home' ? 'bg-stone-700 text-white' : 'text-stone-400'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('scan')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
              activeTab === 'scan' ? 'bg-emerald-600 text-white' : 'text-emerald-400'
            }`}
          >
            <Camera className="w-3 h-3" />
            Scan
          </button>
          {hasCurrentResult && (
            <button
              onClick={() => onSelectTab('result')}
              className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'result' ? 'bg-stone-700 text-white' : 'text-stone-400'
              }`}
            >
              Result
            </button>
          )}
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'history' ? 'bg-stone-700 text-white' : 'text-stone-400'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-stone-700 text-white' : 'text-stone-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('dataset')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'dataset' ? 'bg-stone-700 text-white' : 'text-stone-400'
            }`}
          >
            Dataset & Eval
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'about' ? 'bg-stone-700 text-white' : 'text-stone-400'
            }`}
          >
            How It Works
          </button>
        </div>
      </div>
    </header>
  );
};
