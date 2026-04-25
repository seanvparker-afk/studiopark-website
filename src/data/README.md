# Geographic data

## `canada-provinces.json`

Filtered subset of Natural Earth's 1:50m Admin 1 — States/Provinces dataset, used by `src/pages/consulting.astro` to render the Western Canada coverage map.

**Source:** `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson`

**Filter:** `adm0_a3 === "CAN"` and `name ∈ {British Columbia, Alberta, Saskatchewan, Manitoba, Yukon, Northwest Territories, Nunavut, Ontario}`.

Each feature retains `name` + `iso_3166_2` code. All other Natural Earth properties (population, fips, etc.) are stripped to keep the file small.

## `calgary-downtown.json`

OSM features for downtown Calgary, used by `src/pages/contact.astro` to render the studio location map.

**Source:** OpenStreetMap via Overpass API. Bbox `51.030, -114.100, 51.060, -114.020` (south, west, north, east) — ~4km × 2km of central Calgary covering Eau Claire, Downtown, East Village, Beltline, Inglewood, and Stampede Park.

**Query:**
```
[out:json][timeout:60];
(
  way["highway"](51.030,-114.100,51.060,-114.020);
  way["waterway"="river"](51.030,-114.100,51.060,-114.020);
  way["railway"~"light_rail|subway"](51.030,-114.100,51.060,-114.020);
  way["leisure"="park"](51.030,-114.100,51.060,-114.020);
  relation["leisure"="park"](51.030,-114.100,51.060,-114.020);
  way["place"="island"](51.030,-114.100,51.060,-114.020);
);
out geom;
```

Stampede Park (way 308090725) was fetched separately — it's tagged `tourism=attraction` rather than `leisure=park` so the main query missed it.

**Filter:**
- Excluded: footways, cycleways, paths, steps, corridors, pedestrian, services, busway, construction, track, building footprints, bus routes, address points, POIs.
- Service roads (alleyways, driveways, parking-lot access) excluded — too dense at this scale.
- Each way kept with: `tier` (categorization), `geom` (lat/lon array), `id`, optional `name` and `label`.
- Per-tier simplification via `@turf/simplify` at tolerances ranging from 0.00005° (Bow River, ~5m) to 0.00020° (minor streets, ~20m). Coordinates rounded to 5 decimal places (~1m precision).

## Regenerating

If the source dataset is updated, re-pin the URL above to the new tag and re-run the filter:

```sh
curl -sSL -o /tmp/ne.geojson <source-url>
node -e "
  const { readFileSync, writeFileSync } = require('node:fs');
  const fc = JSON.parse(readFileSync('/tmp/ne.geojson', 'utf8'));
  const want = new Set(['British Columbia','Alberta','Saskatchewan','Manitoba','Yukon','Northwest Territories','Nunavut','Ontario']);
  const features = fc.features
    .filter(f => f.properties.adm0_a3 === 'CAN' && want.has(f.properties.name))
    .map(f => ({ type: 'Feature', properties: { name: f.properties.name, code: f.properties.iso_3166_2 }, geometry: f.geometry }));
  writeFileSync('src/data/canada-provinces.json', JSON.stringify({ type: 'FeatureCollection', features }));
"
```
