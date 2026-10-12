import { useState, useEffect, useRef, useCallback } from 'react';
import { TATSWebClient } from '../client/tatsWebClient';
import { TATSConfig, AgentState, ChatResponse, UIEvent } from '../client/types';

export function useTATS(config: TATSConfig) {
  const [state, setState] = useState<AgentState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [lastEvent, setLastEvent] = useState<UIEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<TATSWebClient | null>(null);
  const onEventRef = useRef(config.onEvent);
  onEventRef.current = config.onEvent;

  useEffect(() => {
    const client = new TATSWebClient({
      ...config,
      onStateChange: (newState) => {
        setState(newState);
        config.onStateChange?.(newState);
      },
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        config.onTranscript?.(text, isFinal);
      },
      onResponse: (response) => {
        setLastResponse(response);
        config.onResponse?.(response);
      },
      onEvent: (event) => {
        setLastEvent(event);
        onEventRef.current?.(event);
      },
      onError: (err) => {
        const msg = typeof err === 'string' ? err : err.message;
        setError(msg);
        config.onError?.(err);
      },
    });

    clientRef.current = client;

    if (config.continuousListening) {
      client.startListening();
    }

    return () => {
      client.destroy();
    };
  }, [config.apiKey, config.userId, config.apiUrl, config.wakeWord]);

  const startListening = useCallback(() => {
    clientRef.current?.startListening();
  }, []);

  const stopListening = useCallback(() => {
    clientRef.current?.stopListening();
  }, []);

  const triggerWake = useCallback(() => {
    clientRef.current?.triggerWake();
  }, []);

  const sendQuery = useCallback((text: string) => {
    return clientRef.current?.sendQuery(text);
  }, []);

  const speak = useCallback((text: string) => {
    clientRef.current?.speak(text);
  }, []);

  const stopSpeaking = useCallback(() => {
    clientRef.current?.stopSpeaking();
  }, []);

  return {
    state,
    transcript,
    lastResponse,
    lastEvent,
    error,
    isListening: state === 'listening' || state === 'wake_detected',
    isThinking: state === 'thinking',
    isSpeaking: state === 'speaking',
    startListening,
    stopListening,
    triggerWake,
    sendQuery,
    speak,
    stopSpeaking,
  };
}
