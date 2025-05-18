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
      this.loadBingoSound();
      this.loadBlueySound();
      this.loadDadSound();
      
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

  // Load the Bingo sound file
  loadBingoSound() {
    // Similar to image handling, use the preloaded audio element
    const preloadedBingoAudio = document.getElementById('bingo-sound-preload');
    
    this.sounds.bingo = {
      play: () => {
        if (!this.enabled) return;
        
        try {
          // Use the preloaded audio element if available
          if (preloadedBingoAudio) {
            console.log('Using preloaded Bingo sound');
            preloadedBingoAudio.currentTime = 0;
            preloadedBingoAudio.volume = 0.5;
            
            // Create a clone to allow overlapping sounds
            const audioClone = preloadedBingoAudio.cloneNode();
            audioClone.volume = 0.5;
            
            // Play the sound
            audioClone.play().then(() => {
              console.log('Bingo sound played successfully!');
              
              // Remove clone after it finishes playing to prevent memory leaks
              audioClone.onended = () => {
                if (audioClone.parentNode) {
                  audioClone.parentNode.removeChild(audioClone);
                }
              };
            }).catch(err => {
              console.error('Error playing cloned Bingo sound:', err);
              
              // Try direct play if clone fails
              preloadedBingoAudio.play().catch(e => {
                console.error('Error playing original Bingo sound:', e);
              });
            });
          }
          // Fallback to creating a new audio element with the full path
          else {
            console.log('Preloaded Bingo sound not found, using fallback');
            const fallbackAudio = new Audio('public/audio/bingo.mp3');
            fallbackAudio.volume = 0.5;
            fallbackAudio.play().catch(error => {
              console.error('Fallback Bingo sound failed:', error);
            });
          }
        } catch (e) {
          console.error("Exception playing Bingo sound:", e);
        }
      }
    };
  }
  
  // Load the Bluey sound file
  loadBlueySound() {
    // Similar to Bingo sound, use the preloaded audio element
    const preloadedBlueyAudio = document.getElementById('bluey-sound-preload');
    
    this.sounds.bluey = {
      play: () => {
        if (!this.enabled) return;
        
        try {
          // Use the preloaded audio element if available
          if (preloadedBlueyAudio) {
            console.log('Using preloaded Bluey sound');
            preloadedBlueyAudio.currentTime = 0;
            preloadedBlueyAudio.volume = 0.5;
            
            // Create a clone to allow overlapping sounds
            const audioClone = preloadedBlueyAudio.cloneNode();
            audioClone.volume = 0.5;
            
            // Play the sound
            audioClone.play().then(() => {
              console.log('Bluey sound played successfully!');
              
              // Remove clone after it finishes playing to prevent memory leaks
              audioClone.onended = () => {
                if (audioClone.parentNode) {
                  audioClone.parentNode.removeChild(audioClone);
                }
              };
            }).catch(err => {
              console.error('Error playing cloned Bluey sound:', err);
              
              // Try direct play if clone fails
              preloadedBlueyAudio.play().catch(e => {
                console.error('Error playing original Bluey sound:', e);
              });
            });
          }
          // Fallback to creating a new audio element with the full path
          else {
            console.log('Preloaded Bluey sound not found, using fallback');
            const fallbackAudio = new Audio('public/audio/bluey.mp3');
            fallbackAudio.volume = 0.5;
            fallbackAudio.play().catch(error => {
              console.error('Fallback Bluey sound failed:', error);
            });
          }
        } catch (e) {
          console.error("Exception playing Bluey sound:", e);
        }
      }
    };
  }
  
  // Load the Dad sound file
  loadDadSound() {
    // Similar to Bingo sound, use the preloaded audio element
    const preloadedDadAudio = document.getElementById('dad-sound-preload');
    
    this.sounds.dad = {
      play: () => {
        if (!this.enabled) return;
        
        try {
          // Use the preloaded audio element if available
          if (preloadedDadAudio) {
            console.log('Using preloaded Dad sound');
            preloadedDadAudio.currentTime = 0;
            preloadedDadAudio.volume = 0.5;
            
            // Create a clone to allow overlapping sounds
            const audioClone = preloadedDadAudio.cloneNode();
            audioClone.volume = 0.5;
            
            // Play the sound
            audioClone.play().then(() => {
              console.log('Dad sound played successfully!');
              
              // Remove clone after it finishes playing to prevent memory leaks
              audioClone.onended = () => {
                if (audioClone.parentNode) {
                  audioClone.parentNode.removeChild(audioClone);
                }
              };
            }).catch(err => {
              console.error('Error playing cloned Dad sound:', err);
              
              // Try direct play if clone fails
              preloadedDadAudio.play().catch(e => {
                console.error('Error playing original Dad sound:', e);
              });
            });
          }
          // Fallback to creating a new audio element with the full path
          else {
            console.log('Preloaded Dad sound not found, using fallback');
            const fallbackAudio = new Audio('public/audio/dad.mp3');
            fallbackAudio.volume = 0.5;
            fallbackAudio.play().catch(error => {
              console.error('Fallback Dad sound failed:', error);
            });
          }
        } catch (e) {
          console.error("Exception playing Dad sound:", e);
        }
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