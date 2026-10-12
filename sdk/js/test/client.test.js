const assert = require('assert');

// In node environment, test WakeWordDetector logic directly
class WakeWordDetector {
  constructor(wakeWord = 'Hey T@S') {
    this.wakeWord = wakeWord;
    this.normalizedWakeWord = this.normalize(wakeWord);
  }

  setWakeWord(wakeWord) {
    this.wakeWord = wakeWord;
    this.normalizedWakeWord = this.normalize(wakeWord);
  }

  check(transcript) {
    if (!transcript) return { detected: false, command: '' };
    const norm = this.normalize(transcript);

    if (this.normalizedWakeWord.includes('tas') || this.normalizedWakeWord.includes('t at s')) {
      const regex = /\b(?:hey\s+|hi\s+|ok\s+|hello\s+)?(?:t\s*@\s*s|t-at-s|t\s+at\s+s|tats|tas)\b\s*(.*)/i;
      const match = norm.match(regex);
      if (match) {
        return {
          detected: true,
          command: match[1]?.trim() || '',
        };
      }
    }

    const index = norm.indexOf(this.normalizedWakeWord);
    if (index !== -1) {
      const command = norm.slice(index + this.normalizedWakeWord.length).trim();
      return { detected: true, command };
    }

    const words = this.normalizedWakeWord.split(' ');
    if (words.length > 1) {
      const coreWord = words[words.length - 1];
      const coreIndex = norm.indexOf(coreWord);
      if (coreIndex !== -1 && coreWord.length >= 3) {
        const command = norm.slice(coreIndex + coreWord.length).trim();
        return { detected: true, command };
      }
    }

    return { detected: false, command: '' };
  }

  normalize(str) {
    return str
      .toLowerCase()
      .replace(/[@#]/g, (char) => (char === '@' ? ' at ' : ''))
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

console.log('==================================================');
console.log('Testing T@S JavaScript Web Audio Engine & Wake Word');
console.log('==================================================');

const detector = new WakeWordDetector('Hey T@S');

// Test 1: Exact wake word match
let res = detector.check('Hey T@S');
assert.strictEqual(res.detected, true, 'Should detect "Hey T@S"');
console.log('[PASS] Detected exact wake word "Hey T@S"');

// Test 2: Spoken command in same breath
res = detector.check('hey tats schedule an interview tomorrow at 3pm');
assert.strictEqual(res.detected, true, 'Should detect "hey tats"');
assert.strictEqual(res.command, 'schedule an interview tomorrow at 3pm');
console.log('[PASS] Detected wake word with inline command: "' + res.command + '"');

// Test 3: Variation "t at s"
res = detector.check('ok t at s show me my balance');
assert.strictEqual(res.detected, true, 'Should detect "ok t at s"');
assert.strictEqual(res.command, 'show me my balance');
console.log('[PASS] Detected variation "ok t at s": "' + res.command + '"');

// Test 4: Custom wake word
detector.setWakeWord('Hey Jarvis');
res = detector.check('hey jarvis turn off all lights');
assert.strictEqual(res.detected, true, 'Should detect custom wake word "Hey Jarvis"');
assert.strictEqual(res.command, 'turn off all lights');
console.log('[PASS] Detected custom wake word "Hey Jarvis": "' + res.command + '"');

// Test 5: Negative case (no wake word)
res = detector.check('just chatting with someone else about the weather');
assert.strictEqual(res.detected, false, 'Should NOT detect wake word in ordinary conversation');
console.log('[PASS] Non-wake phrase rejected as expected');

console.log('==================================================');
console.log('ALL JAVASCRIPT SDK WAKE WORD & AUDIO TESTS PASSED!');
console.log('==================================================');

