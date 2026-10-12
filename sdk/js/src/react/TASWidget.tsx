import React, { useState } from 'react';
import { useTATS } from './useTATS';
import { TATSConfig, UIEvent, AgentState } from '../client/types';

export interface TASWidgetProps extends TATSConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'light' | 'indigo' | 'emerald';
  label?: string;
  className?: string;
}

export const TASWidget: React.FC<TASWidgetProps> = ({
  apiKey,
  userId,
  apiUrl = 'http://127.0.0.1:8000',
  wakeWord = 'Hey T@S',
  position = 'bottom-right',
  theme = 'indigo',
  label = 'T@S Voice Agent',
  onEvent,
  onStateChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    state,
    transcript,
    lastResponse,
    triggerWake,
    sendQuery,
    isListening,
    isThinking,
    isSpeaking,
    error,
  } = useTATS({
    apiKey,
    userId,
    apiUrl,
    wakeWord,
    continuousListening: true,
    onEvent,
    onStateChange,
  });

  // Docking coordinates
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
  };

  // Color schemes
  const themeColors = {
    indigo: { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)', bg: '#0f172a' },
    emerald: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.45)', bg: '#064e3b' },
    dark: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)', bg: '#18181b' },
    light: { primary: '#4f46e5', glow: 'rgba(79, 70, 229, 0.3)', bg: '#f8fafc' },
  }[theme];

  const getStatusColor = () => {
    switch (state) {
      case 'listening':
      case 'wake_detected':
        return '#22c55e'; // Green pulse
      case 'thinking':
        return '#eab308'; // Amber pulse
      case 'speaking':
        return '#3b82f6'; // Blue pulse
      case 'error':
        return '#ef4444'; // Red
      default:
        return themeColors.primary;
    }
  };

  const getStatusLabel = () => {
    switch (state) {
      case 'listening':
        return `Listening ("${wakeWord}")...`;
      case 'wake_detected':
        return 'Wake word detected!';
      case 'thinking':
        return 'Executing action...';
      case 'speaking':
        return 'Responding...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Click or say "' + wakeWord + '"';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 999999,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: position.startsWith('bottom') ? 'column-reverse' : 'column',
        alignItems: position.includes('right') ? 'flex-end' : 'flex-start',
        gap: 12,
        ...positionStyles[position],
      }}
      className={className}
    >
      {/* Floating Microphone Orb */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          triggerWake();
        }}
        title={`T@S Agent — ${getStatusLabel()}`}
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          backgroundColor: '#090d16',
          border: `2px solid ${getStatusColor()}`,
          boxShadow: `0 0 20px ${getStatusColor()}66, 0 8px 16px rgba(0,0,0,0.4)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke={getStatusColor()}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>

      {/* Speech & Transcript Card */}
      {isOpen && (
        <div
          style={{
            width: 320,
            borderRadius: 16,
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
            border: '1px solid #334155',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(),
                  boxShadow: `0 0 8px ${getStatusColor()}`,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{getStatusLabel()}</span>
          </div>

          {/* Transcript / Output display */}
          <div
            style={{
              minHeight: 54,
              maxHeight: 120,
              overflowY: 'auto',
              backgroundColor: '#1e293b',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              color: transcript ? '#f1f5f9' : '#64748b',
              lineHeight: 1.4,
            }}
          >
            {transcript ? (
              <div>
                <span style={{ color: '#94a3b8', fontSize: 11 }}>You said:</span>
                <p style={{ margin: '2px 0 0 0' }}>"{transcript}"</p>
              </div>
            ) : lastResponse?.speech_response ? (
              <div>
                <span style={{ color: '#818cf8', fontSize: 11 }}>Agent:</span>
                <p style={{ margin: '2px 0 0 0' }}>{lastResponse.speech_response}</p>
              </div>
            ) : (
              <em>Say "{wakeWord}..." or tap mic</em>
            )}
          </div>

          {/* Fallback text input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('msg') as HTMLInputElement);
              if (input && input.value.trim()) {
                sendQuery(input.value.trim());
                input.value = '';
              }
            }}
            style={{ display: 'flex', gap: 6 }}
          >
            <input
              name="msg"
              type="text"
              placeholder="Or type a command..."
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isThinking}
              style={{
                backgroundColor: themeColors.primary,
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

