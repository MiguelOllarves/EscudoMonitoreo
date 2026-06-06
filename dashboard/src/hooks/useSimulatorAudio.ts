'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

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

export function useSimulatorAudio() {
  const sounds = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    // Initialize Howl instances
    sounds.current = {
      beep: new Howl({ src: [SOUND_URLS.beep], volume: 0.3 }),
      alertLow: new Howl({ src: [SOUND_URLS.alertLow], volume: 0.4 }),
      alertHigh: new Howl({ src: [SOUND_URLS.alertHigh], volume: 0.7 }),
      success: new Howl({ src: [SOUND_URLS.success], volume: 0.5 }),
      error: new Howl({ src: [SOUND_URLS.error], volume: 0.5 }),
      pulse: new Howl({ src: [SOUND_URLS.pulse], volume: 0.2, loop: true }),
    };

    return () => {
      // Cleanup
      Object.values(sounds.current).forEach(sound => sound.unload());
    };
  }, []);

  const playSound = useCallback((type: keyof typeof SOUND_URLS) => {
    if (sounds.current[type]) {
      sounds.current[type].play();
    }
  }, []);

  const stopSound = useCallback((type: keyof typeof SOUND_URLS) => {
    if (sounds.current[type]) {
      sounds.current[type].stop();
    }
  }, []);

  return { playSound, stopSound };
}
