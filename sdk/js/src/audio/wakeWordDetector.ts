/**
 * Detects wake words from continuous speech recognition transcripts.
 * Supports fuzzy variations for "Hey T@S" / "T@S" and custom user wake words.
 */
export class WakeWordDetector {
  private wakeWord: string;
  private normalizedWakeWord: string;

  constructor(wakeWord: string = 'Hey T@S') {
    this.wakeWord = wakeWord;
    this.normalizedWakeWord = this.normalize(wakeWord);
  }

  public setWakeWord(wakeWord: string): void {
    this.wakeWord = wakeWord;
    this.normalizedWakeWord = this.normalize(wakeWord);
  }

  public getWakeWord(): string {
    return this.wakeWord;
  }

  /**
   * Evaluates incoming transcript for wake word presence.
   * If detected, returns { detected: true, command: remaining text after wake word }.
   */
  public check(transcript: string): { detected: boolean; command: string } {
    if (!transcript) {
      return { detected: false, command: '' };
    }

    const norm = this.normalize(transcript);

    // 1. Built-in pattern for T@S variations (Hey T@S, Hey Tats, T at S, etc.)
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

    // 2. Custom wake word matching
    const index = norm.indexOf(this.normalizedWakeWord);
    if (index !== -1) {
      const command = norm.slice(index + this.normalizedWakeWord.length).trim();
      return {
        detected: true,
        command: command,
      };
    }

    // 3. Fallback: Check if wake word matches without greeting prefix (e.g. user said "Jarvis" instead of "Hey Jarvis")
    const words = this.normalizedWakeWord.split(' ');
    if (words.length > 1) {
      const coreWord = words[words.length - 1];
      const coreIndex = norm.indexOf(coreWord);
      if (coreIndex !== -1 && coreWord.length >= 3) {
        const command = norm.slice(coreIndex + coreWord.length).trim();
        return {
          detected: true,
          command: command,
        };
      }
    }

    return { detected: false, command: '' };
  }

  private normalize(str: string): string {
    return str
      .toLowerCase()
      .replace(/[@#]/g, (char) => (char === '@' ? ' at ' : ''))
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
