# T@S Web & React Client SDK (`@t-at-s/web`)

> **"You say it. T@S makes it happen."**  
> *The Universal AI Voice Agent Platform that executes real actions in your software.*

---

## 🚀 Overview

`@t-at-s/web` is the official JavaScript and React client library for embedding the **T@S Acoustic Action Engine** into web applications. It provides:

- 🎙️ **Zero-Billing Audio Engine:** Native Web Speech STT and Web SpeechSynthesis TTS (zero cloud audio billing).
- ⚡ **Continuous Wake-Word Detection:** Listens in the background for *"Hey T@S"* or custom wake words with phonetic fuzzy matching.
- 🧩 **Drop-in React Widget (`<TASWidget />`):** Floating microphone orb with pulsating states, speech transcription preview, and soundwave feedback.
- 🪝 **Custom Hook (`useTATS`):** Complete voice lifecycle control for custom UI designs.
- 🌐 **Real-time UI Event Dispatch:** Automatically routes software actions from executed backend tools directly into your front-end (`onEvent`).

---

## 📦 Installation

```bash
npm install @t-at-s/web
# or
yarn add @t-at-s/web
# or
pnpm add @t-at-s/web
```

---

## ⚡ React Quick Start (Drop-in Floating Widget)

Add the `<TASWidget />` anywhere in your application:

```tsx
import React from 'react';
import { TASWidget } from '@t-at-s/web';

export function App() {
  const currentUser = { id: 'usr_alex_1001' };

  return (
    <div>
      <h1>My Application</h1>

      {/* Floating T@S AI Voice Widget */}
      <TASWidget
        apiKey="tas_live_..."                   // From T@S Dashboard
        apiUrl="https://engine.t-at-s.com"      // Backend engine URL
        userId={currentUser.id}                 // Authentic user tenancy
        wakeWord="Hey T@S"                      // Or custom wake word
        position="bottom-right"
        theme="indigo"
        onEvent={(event) => {
          console.log('Action event received from agent:', event);
          if (event.type === 'create_task_completed') {
            // Instantly update host app state!
            alert(`Task "${event.data.title}" was created by voice!`);
          }
        }}
      />
    </div>
  );
}
```

---

## 🪝 Custom UI with `useTATS` Hook

If you want to build your own custom microphone button, voice header, or conversational assistant panel:

```tsx
import React from 'react';
import { useTATS } from '@t-at-s/web';

export function CustomVoiceButton() {
  const {
    state,              // 'idle' | 'listening' | 'wake_detected' | 'thinking' | 'speaking'
    transcript,         // Real-time voice transcript
    lastResponse,       // Response data from agent
    isListening,
    triggerWake,
    sendQuery,
  } = useTATS({
    apiKey: 'tas_live_...',
    userId: 'usr_alex_1001',
    wakeWord: 'Hey T@S',
    onEvent: (event) => console.log('UI Action:', event),
  });

  return (
    <div>
      <button onClick={triggerWake}>
        {state === 'thinking' ? 'Processing...' : 'Talk to Agent'}
      </button>
      {transcript && <p>Heard: "{transcript}"</p>}
    </div>
  );
}
```

---

## 🌐 Vanilla JavaScript / HTML Usage

Works anywhere without React (Vue, Angular, Svelte, or plain HTML):

```html
<script type="module">
  import { TATSWebClient } from './dist/index.mjs';

  const agent = new TATSWebClient({
    apiKey: 'tas_live_...',
    userId: 'usr_102',
    wakeWord: 'Hey T@S',
    apiUrl: 'http://127.0.0.1:8000',
    onEvent: (event) => {
      console.log('Action triggered:', event);
    },
  });

  // Start listening for wake-word
  agent.startListening();
</script>
```

---

## 📄 License

MIT License — Copyright (c) 2026 T@S Platform.

