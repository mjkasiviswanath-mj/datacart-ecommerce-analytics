import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';

interface VoiceSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  size?: 'normal' | 'large';
  className?: string;
}

export const VoiceSearchBar: React.FC<VoiceSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search products, electronics, laptops, books...',
  size = 'normal',
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechMessage('Voice search simulation: pick a search phrase below');
      setShowQuickPhrases(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechMessage('Listening... speak now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onChange(transcript);
          setSpeechMessage(`Heard: "${transcript}"`);
          setTimeout(() => {
            setSpeechMessage(null);
            if (onSearch) onSearch();
          }, 800);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechMessage('Microphone access blocked. Click a quick phrase below:');
          setShowQuickPhrases(true);
        } else {
          setSpeechMessage('Could not catch that. Try speaking again or pick below:');
          setShowQuickPhrases(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setShowQuickPhrases(true);
      setSpeechMessage('Select a voice search term below:');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setSpeechMessage(null);
  };

  const handleSelectQuickVoice = (phrase: string) => {
    onChange(phrase);
    setShowQuickPhrases(false);
    setSpeechMessage(`Searched: "${phrase}"`);
    setTimeout(() => {
      setSpeechMessage(null);
      if (onSearch) onSearch();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const isLarge = size === 'large';

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Search icon */}
        <Search
          className={`absolute left-3.5 text-slate-400 pointer-events-none ${
            isLarge ? 'w-5 h-5' : 'w-4 h-4'
          }`}
        />

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white text-slate-900 border rounded-xl transition placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs ${
            isLarge ? 'pl-11 pr-24 py-3.5 text-base border-slate-200' : 'pl-10 pr-20 py-2.5 text-sm border-slate-200'
          }`}
        />

        {/* Action icons right side: Clear + Mic */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-1.5 rounded-lg transition flex items-center justify-center cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-xs ring-2 ring-rose-400/30'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title={isListening ? 'Stop listening' : 'Voice search'}
          >
            {isListening ? (
              <MicOff className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
            ) : (
              <Mic className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
            )}
          </button>
        </div>
      </form>

      {/* Listening / Status Indicator */}
      {speechMessage && (
        <div className="absolute top-full left-0 right-0 mt-2 z-30 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-lg flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            {isListening ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            )}
            <span className="font-medium">{speechMessage}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSpeechMessage(null);
              setShowQuickPhrases(false);
            }}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Voice Search Term Suggestion Popup */}
      {showQuickPhrases && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20 p-3 bg-white rounded-xl shadow-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Voice Search Sample Phrases:</span>
            </span>
            <button
              onClick={() => setShowQuickPhrases(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Wireless Headphones',
              'MacBook Air',
              'Smart Watch',
              'Data Analysis Book',
              'Fast Charger',
              'Mechanical Keyboard',
              'Galaxy Phone',
            ].map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => handleSelectQuickVoice(phrase)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
