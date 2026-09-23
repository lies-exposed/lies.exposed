---
name: area-geo
description: Create or edit a geographic area (city, region, site, country part) with GeoJSON geometry and connect it to events and media
triggers: [area, place, location, region, city, map, geometry, geojson, coordinates, where, site, territory]
agents: [auto, platform]
---

# Area Geo

## 1. Dedupe

`liexp_cli("area list --query=<name>")` — also try the local-language name. Countries are **nations** (`nation list --name=...`), not areas: don't create an area for a whole country unless the user insists.

## 2. Geometry

- A specific site/city → `Point`: `{"type":"Point","coordinates":[<lon>,<lat>]}` — **longitude first**.
- A region → `Polygon` only if you have a reliable boundary; otherwise use a Point at its centre and say so.
- Coordinates from a reliable source (Wikipedia infobox, OpenStreetMap). Never guess coordinates.

## 3. Create

```
liexp_cli("area create --label=<Name> --slug=<name-slug> --geometry={\"type\":\"Point\",\"coordinates\":[30.52,50.45]}")
```

## 4. Connect

```
liexp_cli("area edit --id=<uuid> --events=<uuid,...> --media=<uuid,...> --featuredImage=<media-uuid>")
```
Lists replace current values — merge with existing ones from `area get`. Events with a `--location` flag (Death, Uncategorized) can also point to the area via their own edit command.

## 5. Report

Area UUID, geometry type and coordinates source, connected events.
