'use client';

import { useEffect, useRef, useCallback } from 'react';

// Note: Ensure you place these audio files in your public/sounds directory.
// For testing purposes, if the files are not found, Howler will silently fail or log a warning.
const SOUND_URLS = {
  beep: '/sounds/beep.mp3',
  alertLow: '/sounds/alert-low.mp3',
  alertHigh: '/sounds/alert-high.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  pulse: '/sounds/pulse.mp3',
};

type SoundKey = keyof typeof SOUND_URLS;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HowlInstance = any;

export function useSimulatorAudio() {
  const sounds = useRef<{ [key: string]: HowlInstance }>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initialized.current) return;

    // Dynamically import howler only on the client
    import('howler').then(({ Howl }) => {
      sounds.current = {
        beep: new Howl({ src: [SOUND_URLS.beep], volume: 0.3 }),
        alertLow: new Howl({ src: [SOUND_URLS.alertLow], volume: 0.4 }),
        alertHigh: new Howl({ src: [SOUND_URLS.alertHigh], volume: 0.7 }),
        success: new Howl({ src: [SOUND_URLS.success], volume: 0.5 }),
        error: new Howl({ src: [SOUND_URLS.error], volume: 0.5 }),
        pulse: new Howl({ src: [SOUND_URLS.pulse], volume: 0.2, loop: true }),
      };
      initialized.current = true;
    }).catch(() => {
      // Howler failed to load, sounds will be silently unavailable
    });

    return () => {
      Object.values(sounds.current).forEach((sound) => {
        try { sound.unload(); } catch { /* ignore */ }
      });
    };
  }, []);

  const playSound = useCallback((type: SoundKey) => {
    try {
      if (sounds.current[type]) {
        sounds.current[type].play();
      }
    } catch {
      // Silently fail if audio is not available
    }
  }, []);

  const stopSound = useCallback((type: SoundKey) => {
    try {
      if (sounds.current[type]) {
        sounds.current[type].stop();
      }
    } catch {
      // Silently fail
    }
  }, []);

  return { playSound, stopSound };
}

