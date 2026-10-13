import { Image } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Ambient', true);

// react-native-sound wants a path, not a require() id: resolve the bundled asset to its URI
// (Metro URL in debug, bundled file / raw resource in release).
const CHIME_URI = Image.resolveAssetSource(require('./assets/chime.wav'))?.uri ?? '';

export function playChime(): void {
  try {
    const chime = new Sound(CHIME_URI, '', (error: unknown) => {
      if (error) {
        console.warn('[sound] could not load chime', error);
        return;
      }
      chime.play(() => chime.release());
    });
  } catch (e) {
    console.warn('[sound] chime failed', e);
  }
}
