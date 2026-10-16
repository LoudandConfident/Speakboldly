# Daily Task: 365 alternating readings

The first year starts on 15 October 2026, in Cairo time. The same planned order appears on every device:

- **Group 1:** 183 imagined, realistic everyday situations. These retain the expanded readings from the original library.
- **Group 2 — Explore:** 182 varied readings: 56 original serial-story parts, 49 arts and ideas readings, 42 country readings and 35 achievement-profile readings.

The groups alternate every day. The Explore topics also rotate, so the learner does not receive a block of country or biography readings in a row. Each of the 26 Explore themes has seven parts. Individual parts work as short standalone readings. After the first year, each pool cycles separately so the two groups continue alternating across the year boundary.

Countries include Egypt, Italy, Japan, Kenya, the Netherlands and Canada. Achievement profiles focus on the documented work of Mae Jemison, Katherine Johnson, Zaha Hadid, Louis Braille and Ahmed Zewail. The original serial fiction includes a café series, travel and bookshop stories, and creative projects. Texts are upbeat and suitable for the requested scope; the new collection avoids tragic plots, horror, occult/demonic themes, adult material and violence. It does not reproduce copyrighted novels or film scripts.

Every reading has A1–A2, B1–B2 and C1–C2 versions: **1,095 task versions**. Three everyday expressions have meanings and examples. An instruction above the main text explains the reading-only follow-up. **Daily Task has no videos, video links, embedded players or watch assignments. Native English remains a separate feature.**

Interactive practice includes a missing-word expression check, a written-response box with a revealable model and a completion check-in. Only the missing word is checked automatically. Open-ended writing is self-review, not AI marking, pronunciation verification or an exam submission. Responses and check-ins remain on that browser/device. No new Apps Script actions, email or backend are involved.

## Factual-reading references

The country and achievement readings use original wording. References checked on 16 October 2026 include:

- [NASA: Mae Jemison](https://www.nasa.gov/people/mae-jemison-m-d/), [education profile](https://starchild.gsfc.nasa.gov/docs/StarChild/whos_who_level2/jemison.html)
- [NASA Science: Katherine Johnson](https://science.nasa.gov/people/katherine-johnson/), [NASA biography](https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/)
- [Pritzker Architecture Prize: Zaha Hadid](https://www.pritzkerprize.com/laureates/2004), [Zaha Hadid Foundation](https://www.zhfoundation.com/about-zaha-hadid/)
- [RNIB: braille](https://www.rnib.org.uk/living-with-sight-loss/education-and-learning/braille-tactile-codes/)
- [Nobel Prize: Ahmed Zewail](https://www.nobelprize.org/prizes/chemistry/1999/zewail/facts/), [Caltech](https://www.caltech.edu/about/news/zewail-wins-nobel-prize-358)
- [Italy's official tourism site](https://www.italia.it/en/italy/italian-regions)
- [Experience Egypt: the Nile](https://www.experienceegypt.eg/en/region/12/the-nile)
- [Japan National Tourism Organization](https://www.japan.travel/en/)
- [Kenya's official tourism information](https://tic.magicalkenya.com/circuits/)
- [Holland.com](https://www.holland.com/global/tourism/get-inspired/nl-in-7-stories)
- [Destination Canada](https://media.canada.travel/en-CA/resources/canada-in-brief)

These are editorial references, not links that learners are asked to watch or browse as part of Daily Task.

## Building and loading

Files are split into twelve chunks per level. The loader fetches the needed chunk, not the whole year. `scripts/build-full-year-daily.py` retains the 183 scenario readings and alternates them with the Explore collection from `scripts/explore_daily_content.py`, using the original story material in `scripts/full_year_daily_content.py`. The old half-year builder refuses to overwrite this collection.
