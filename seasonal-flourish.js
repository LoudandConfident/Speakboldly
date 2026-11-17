// Small original line illustrations; the existing instructor schedule chooses the art.
const harvest='<path d="M16 29Q23 15 35 9m-15 16q-9-8-6-14 10 2 6 14Zm7-8q-4-10 1-15 8 6-1 15Zm5-4q2-10 10-10 3 9-10 10ZM160 29q-7-14-19-20m15 16q9-8 6-14-10 2-6 14Zm-7-8q4-10-1-15-8 6 1 15Zm-5-4q-2-10-10-10-3 9 10 10Z" stroke="#c7af77" fill="#c7af7718"/>';
const sprigs='<path d="M16 25q14 8 40 4m-26 1q-13-6-12-15 13 1 12 15Zm14 1q-2-12 9-14 7 11-9 14ZM160 25q-14 8-40 4m26 1q13-6 12-15-13 1-12 15Zm-14 1q2-12-9-14-7 11 9 14Z" stroke="#b2bd97" fill="#b2bd9714"/>';
const icons={
 thanksgiving:'<path d="M87 12q-2-6 4-9m-3 10q-23-10-25 9-2 18 25 15 27 3 25-15-2-19-25-9Z" fill="#b4814d" stroke="#dfc28e"/><path d="M87 13q-12 11 0 24m2-24q12 11 0 24M88 13v24" stroke="#e5c798"/>',
 christmas:'<path d="m88 8-12 13h6L70 35h36L94 21h6ZM88 35v7" fill="#8fa174" stroke="#c3d0a7"/><path d="m88 2 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z" fill="#d7ba76" stroke="#d7ba76"/>',
 'new-year':'<g stroke="#d9bc79"><path d="M88 14V3m0 32v8M77 24H66m32 0h12M80 16l-8-8m24 24 8 8m-24-8-8 8m24-24 8-8"/><path d="m88 18 2 4 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#d9bc79"/></g>',
 winter:'<g stroke="#bbd3ce"><path d="M88 3v38M72 12l32 20m0-20L72 32M82 7l6 6 6-6M82 37l6-6 6 6M74 13l3 8-8 1m33 9-3-8 8-1m-33 9 3-8-8-1m33-9-3 8 8 1"/></g>',
 valentine:'<path d="M88 37C48 15 73-3 88 14c15-17 40 1 0 23Z" fill="#b6757318" stroke="#d5a29a"/><path d="M83 14q-8-6-12 1" stroke="#e7c3b6"/>',
 mothers:'<path d="M88 25v17m0-8q-17 1-17-10 15 0 17 10Z" stroke="#b5c295"/><g stroke="#dfb3ac" fill="#c8989518"><ellipse cx="88" cy="16" rx="6" ry="13"/><ellipse cx="88" cy="16" rx="6" ry="13" transform="rotate(60 88 16)"/><ellipse cx="88" cy="16" rx="6" ry="13" transform="rotate(120 88 16)"/></g><circle cx="88" cy="16" r="5" fill="#d9bd7c" stroke="#d9bd7c"/>',
 'april-fools':'<path d="m66 31 2-20 12 9 8-16 8 16 12-9 2 20Z" stroke="#d2ae79" fill="#d2ae7918"/><path d="M68 36h40" stroke="#d2ae79"/>',
 spring:'<path d="M88 40V14m0 15Q62 29 70 9q20 0 18 20Zm1-9q0-18 20-18 4 18-20 18Z" stroke="#b9c6a0" fill="#b9c6a018"/>',
 summer:'<circle cx="88" cy="22" r="10" stroke="#d9b76c" fill="#d9b76c18"/><path d="M88 4V0m0 40v4M70 22h-5m42 0h5M75 9l-4-4m30 30 4 4M75 35l-4 4m30-30 4-4" stroke="#d9b76c"/>',
 autumn:'<path d="m88 3 5 12 13-5-4 13 10 3-19 11-5 7-5-7-19-11 10-3-4-13 13 5Z" fill="#c69b6518" stroke="#d4b082"/><path d="M88 12v28m0-12 11-9m-11 14-11-8" stroke="#d4b082"/>'
};
export function renderSeasonalFlourish(art){
 return '<svg viewBox="0 0 176 44" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(['thanksgiving','autumn'].includes(art)?harvest:sprigs)+(icons[art]||icons.spring)+'</svg>';
}
