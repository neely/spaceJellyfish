// Attach hand-set flight directions (config/launch-directions.json) to
// launch records, by LL2 id. Used by the page and the sky view.

/** Return the launches, each with `direction` set when the file has one for its id. */
export function applyDirections(launches, file) {
  const table = file?.launches ?? {};
  return launches.map((l) => (table[l.id] ? { ...l, direction: table[l.id] } : l));
}
