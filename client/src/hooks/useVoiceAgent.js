import { useState, useCallback, useEffect, useRef } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { api } from '../services/api';

export function useVoiceAgent() {
  const {
    isListening, transcript, interimTranscript,
    isSupported, startListening, stopListening,
  } = useSpeechRecognition();

  const { isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const [status, setStatus] = useState('idle');
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const conversationHistory = useRef([]);
  const lastTranscript = useRef('');
  const retryCount = useRef(0);

  // Load tasks on mount
  useEffect(() => {
    api.getTasks()
      .then(setTasks)
      .catch(() => setError('Could not connect to server'));
  }, []);

  // Sync status from hooks
  useEffect(() => {
    if (isListening) setStatus('listening');
    else if (isSpeaking) setStatus('speaking');
  }, [isListening, isSpeaking]);

  // Process final transcript
  useEffect(() => {
    if (!transcript || transcript === lastTranscript.current) return;
    lastTranscript.current = transcript;

    const userMsg = { role: 'user', content: transcript };
    setMessages(prev => [...prev, userMsg]);
    conversationHistory.current.push(userMsg);

    setStatus('processing');
    setError(null);
    retryCount.current = 0;

    sendToAPI(transcript);
  }, [transcript]);

  const sendToAPI = useCallback(async (text) => {
    try {
      const data = await api.chat(text, conversationHistory.current.slice(-10));
      const aiMsg = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, aiMsg]);
      conversationHistory.current.push(aiMsg);
      setTasks(data.tasks);

      // Speak response
      setStatus('speaking');
      await speak(data.message);
      setStatus('idle');
    } catch (err) {
      console.error('Chat error:', err);

      // Retry once on network failure
      if (retryCount.current < 1) {
        retryCount.current++;
        setError('Connection issue — retrying...');
        setTimeout(() => sendToAPI(text), 2000);
        return;
      }

      // Show error after retry fails
      const errMsg = err.message?.includes('Failed to fetch')
        ? 'Cannot reach server. Is the backend running?'
        : err.message?.includes('429') || err.message?.includes('quota')
        ? 'AI rate limit hit. Please wait a moment and try again.'
        : 'Something went wrong. Please try again.';

      setError(errMsg);
      setStatus('error');
      setTimeout(() => { setError(null); setStatus('idle'); }, 5000);
    }
  }, [speak]);

  // Toggle voice with interruption
  const toggleVoice = useCallback(() => {
    setError(null);

    if (status === 'listening') {
      stopListening();
      return;
    }

    // Interrupt TTS if speaking
    if (status === 'speaking' || isSpeaking) {
      cancelSpeech();
    }

    // Small delay after cancel to avoid conflicts
    setTimeout(() => {
      try {
        startListening();
      } catch (e) {
        setError('Microphone access denied. Please enable it in browser settings.');
        setStatus('error');
        setTimeout(() => { setError(null); setStatus('idle'); }, 5000);
      }
    }, status === 'speaking' ? 100 : 0);
  }, [status, isSpeaking, startListening, stopListening, cancelSpeech]);

  return {
    status, tasks, messages, error,
    interimTranscript, isSupported, toggleVoice,
  };
}
