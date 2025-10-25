import { Audio } from 'expo-av';

// Inicializar configuração de áudio uma vez
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
});

// Função auxiliar para tocar som
const playSound = async (soundFile) => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    
    // Liberar memória após tocar
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Erro ao reproduzir som:', error);
  }
};

export const SoundService = {
  // Som de erro
  playError: () => playSound(require('../../assets/error.mp3')),
  
  // Som de sucesso
  playSuccess: () => playSound(require('../../assets/success.mp3')),

  // som do plim
  playPlim: () => playSound(require('../../assets/plim.mp3')),

  // som de cashier
  playCashier: () => playSound(require('../../assets/chi_ching.mp3')),

  // som de registro marcadoria
  playBeep: () => playSound(require('../../assets/beep.mp3')),
};