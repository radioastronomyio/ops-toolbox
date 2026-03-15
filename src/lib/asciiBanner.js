import figlet from 'figlet';

export function getAvailableFonts() {
  try {
    return figlet.fontsSync();
  } catch {
    return ['Standard', 'Big', 'Slant', 'Banner', 'Block', 'Doom'];
  }
}

export async function generateBanner(text, font = 'Standard', options = {}) {
  return new Promise((resolve, reject) => {
    const { width = 80, horizontalLayout = 'default' } = options;
    figlet.text(text || '', { font, width, horizontalLayout }, (err, result) => {
      if (err) reject(err);
      else resolve(result || '');
    });
  });
}
