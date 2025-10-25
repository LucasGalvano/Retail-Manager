import { Audio } from 'expo-av';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
});

const playSound = async (soundFile) => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();

    // Liberar memória ao terminar
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
  playError: () => playSound(require('../../assets/error_sound.mp3')),

  playSuccess: () => playSound(require('../../assets/success_sound.mp3')),

  playPlim: () => playSound(require('../../assets/plim.mp3')),

  playCashier: () => playSound(require('../../assets/chi_ching.mp3')),

  playBeep: () => playSound(require('../../assets/beep.mp3')),
};
