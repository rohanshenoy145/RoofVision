/** Safe defaults when reading React Navigation route params. */
export function getRouteParams(route) {
  return route?.params ?? {};
}
