// Launch Library 2: the request for upcoming Cape Canaveral and Kennedy
// Space Center launches, and the fields this project keeps from a record.
// Used by the page, by the Cloudflare Pages Function, and by scripts.

// 12 is Cape Canaveral SFS; 27 is Kennedy Space Center.
export const LL2_UPCOMING_URL =
  'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?location__ids=12,27&limit=30&mode=normal&ordering=net';

/** Keep only the fields the page and the engine use. */
export function reduceLaunch(l) {
  return {
    id: l.id,
    name: l.name,
    net: l.net,
    precision: l.net_precision?.name ?? null,
    status: l.status?.abbrev ?? null,
    statusName: l.status?.name ?? null,
    lastUpdated: l.last_updated ?? null,
    vehicle: l.rocket?.configuration?.name ?? null,
    orbit: l.mission?.orbit?.abbrev ?? null,
    programs: (l.program ?? []).map((p) => p.name),
    padName: l.pad?.name ?? null,
    pad: { latitudeDeg: Number(l.pad?.latitude), longitudeDeg: Number(l.pad?.longitude) },
  };
}
