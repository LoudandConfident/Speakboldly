// Explicit editorial hold: older published articles remain available.
export const BLOG_COMING_SOON_IDS=new Set(['the-quiet-power-of-consistency']);
export const isBlogComingSoon=id=>BLOG_COMING_SOON_IDS.has(String(id||''));
