export const HERO_PARALLAX_CARD_COUNT = 40;

export const HERO_PARALLAX = {
  desktop: {
    cardWidth: 120,
    cardHeight: 156,
    gap: 10,
    sideRotationY: 68,
    centerRotationY: 26,
    waveAmplitude: 82,
    waveFrequency: 0.34,
    depthAmplitude: 110,
    scrollAmplitude: 42,
    scrollTilt: 10,
    scrollDrift: 72,
    perspective: 1250,
  },
  mobile: {
    cardWidth: 76,
    cardHeight: 104,
    gap: 6,
    sideRotationY: 64,
    centerRotationY: 30,
    waveAmplitude: 48,
    waveFrequency: 0.34,
    depthAmplitude: 60,
    scrollAmplitude: 24,
    scrollTilt: 6,
    scrollDrift: 42,
    perspective: 900,
  },
} as const;
