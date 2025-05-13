// Simple audio system for game sounds
class SoundSystem {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.initialized = false;
  }

  // Initialize the sound system with various game sounds
  initialize() {
    if (this.initialized) return;

    // Create audio context
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create sounds
      this.createCardPlaySound();
      this.createYourTurnSound();
      this.createUnoCallSound();
      this.createWinSound();
      
      this.initialized = true;
    } catch (e) {
      console.error("Web Audio API not supported or other audio error:", e);
      this.enabled = false;
    }
  }

  // Create a soft beep for card play
  createCardPlaySound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4 note
    
    gainNode.gain.value = 0.05; // Quiet sound
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    this.sounds.cardPlay = {
      play: () => {
        if (!this.enabled) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 440;
        
        gain.gain.value = 0.05;
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
      }
    };
  }

  // Create a pleasant chime for "your turn"
  createYourTurnSound() {
    this.sounds.yourTurn = {
      play: () => {
        if (!this.enabled) return;
        
        // Play a sequence of two nice tones
        const now = this.audioContext.currentTime;
        
        // First note
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 523.25; // C5
        
        gain1.gain.value = 0.1;
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.5);
        
        // Second note (slightly delayed)
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        
        osc2.type = 'sine';
        osc2.frequency.value = 659.25; // E5
        
        gain2.gain.value = 0.1;
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        
        osc2.start(now + 0.2);
        osc2.stop(now + 0.8);
      }
    };
  }

  // Fun sound for calling UNO
  createUnoCallSound() {
    this.sounds.unoCall = {
      play: () => {
        if (!this.enabled) return;
        
        const now = this.audioContext.currentTime;
        
        // Quick ascending notes
        [440, 523.25, 659.25, 783.99, 880].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          gain.gain.value = 0.1;
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + (i * 0.1));
          
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          
          osc.start(now + (i * 0.08));
          osc.stop(now + 0.2 + (i * 0.1));
        });
      }
    };
  }

  // Victory fanfare when winning
  createWinSound() {
    this.sounds.win = {
      play: () => {
        if (!this.enabled) return;
        
        const now = this.audioContext.currentTime;
        
        // Fanfare sequence
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          gain.gain.value = 0.1;
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + (i * 0.2));
          
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          
          osc.start(now + (i * 0.2));
          osc.stop(now + 0.5 + (i * 0.2));
        });
      }
    };
  }

  // Play a specific sound
  play(soundName) {
    if (!this.initialized) {
      this.initialize();
    }
    
    if (this.sounds[soundName]) {
      this.sounds[soundName].play();
    }
  }

  // Enable or disable sounds
  toggleSound(enabled) {
    this.enabled = enabled;
  }
}

// Create a singleton instance
const soundSystem = new SoundSystem();

export default soundSystem;