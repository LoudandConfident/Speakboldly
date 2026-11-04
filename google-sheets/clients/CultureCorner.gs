// Add as CultureCorner.gs. Keep Code.gs, login, calendar and existing data.
// Put the routing block from CULTURE-CORNER-SETUP.md FIRST inside your existing doPost(event).
function sbCultureCornerHandleEvent(event) {
  let data;
  try { data = JSON.parse(event?.postData?.contents || 'null'); } catch (_) { return null; }
  if (!data || !['cultureCornerFilms','cultureCornerFilmsEdit','cultureCornerFilmsSave'].includes(data.action)) return null;
  const json = value => ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
  try {
    if (event.postData.contents.length > 12000) throw Error('Film details are too long.');
    const properties = PropertiesService.getScriptProperties();
    const read = () => JSON.parse(properties.getProperty('SB_CULTURE_FILMS_V1') || '{"revision":"0","mode":"automatic","films":[]}');
    if (data.action === 'cultureCornerFilms') return json({ok:true,settings:read()});
    // Preserve the existing cross-browser instructor session handling.
    if (typeof sbInstructorRepairEvent === 'function') {
      const result = sbInstructorRepairEvent(event);
      if (result !== null) return result;
      data = JSON.parse(event.postData.contents);
    }
    if (typeof sbRequireClientConnection !== 'function') throw Error('Keep your existing Clients Code.gs.');
    sbRequireClientConnection(data);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const current = read();
      if (data.action === 'cultureCornerFilmsEdit') return json({ok:true,settings:current});
      if (!['automatic','manual'].includes(data.mode)) throw Error('Choose automatic or manual films.');
      const films = data.mode === 'manual' ? sbCultureValidateFilms(data.films) : [];
      if (String(data.revision) !== current.revision) {
        if (data.mode === current.mode && JSON.stringify(films) === JSON.stringify(current.films)) return json({ok:true,settings:current});
        throw Error('Films changed on another device. Reload before publishing.');
      }
      const next = {revision:Utilities.getUuid(),mode:data.mode,films};
      if (JSON.stringify(next).length > 7000) throw Error('Shorten the film descriptions.');
      properties.setProperty('SB_CULTURE_FILMS_V1',JSON.stringify(next));
      return json({ok:true,settings:next});
    } finally { lock.releaseLock(); }
  } catch (error) { return json({ok:false,error:String(error.message || error)}); }
}
function sbCultureValidateFilms(input) {
  if (!Array.isArray(input) || input.length !== 2) throw Error('Choose two films.');
  return input.map(item => {
    const film = {};
    for (const pair of [['title',150],['year',4],['genre',150],['language',500],['brief',1000]]) {
      const key = pair[0], value = item?.[key];
      if (typeof value !== 'string' || !value.trim() || value.trim().length > pair[1]) throw Error('Check the film ' + key + '.');
      film[key] = value.trim();
    }
    if (!/^\d{4}$/.test(film.year)) throw Error('Use a four-digit release year.');
    film.art = Number.isInteger(item.art) && item.art >= 0 && item.art <= 3 ? item.art : 0;
    return film;
  });
}
