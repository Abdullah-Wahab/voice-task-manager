import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const resolveRef = useRef(null);

  // Pick a good English voice once available
  const voiceRef = useRef(null);
  useEffect(() => {
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices();
      // Prefer a natural-sounding English voice
      voiceRef.current =
        voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en-') && v.localService) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null;
    }
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }, []);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!text) { resolve(); return; }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voiceRef.current) utterance.voice = voiceRef.current;

      utteranceRef.current = utterance;
      resolveRef.current = resolve;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.error('TTS error:', e.error);
        }
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }, []);

  return { isSpeaking, speak, cancel };
}
