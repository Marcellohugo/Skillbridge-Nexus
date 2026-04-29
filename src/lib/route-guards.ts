export function isRouteSegment(pathname: string, segment: string) {
  const prefix = `/${segment}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function matchesRoutePrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isMentorAppRoute(pathname: string) {
  return isRouteSegment(pathname, "mentor");
}
