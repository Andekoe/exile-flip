const DEFAULT_LEAGUE = 'Mirage';

const LEAGUES = [
  'Mirage',
  'Hardcore Mirage',
  'Mirage SSF',
  'Hardcore Mirage SSF'
];

// Fallback card metadata for cards missing from the community DB.
// Add entries here when poe.ninja shows a card with no stack/reward data.
// Format: cardName: { stackSize: N, reward: 'Item Name' }
const CARD_FALLBACK = {
  'Brother\'s Gift': { stackSize: 8, reward: '5x Divine Orb' },
  'The Miracle':     { stackSize: 5, reward: 'Awakened Exceptional Gem' },
  'Damnation':       { stackSize: 5, reward: null },
};
