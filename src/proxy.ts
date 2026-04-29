import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { getJwtSecretKey } from "@/lib/auth-config";
import { isMentorAppRoute, matchesRoutePrefix } from "@/lib/route-guards";

const LEARNER_PATHS = [
  "/achievements",
  "/ai-coach",
  "/assessment",
  "/calibration",
  "/capstone",
  "/career-compass",
  "/career-ladder",
  "/coach",
  "/dashboard",
  "/immunity",
  "/learning-path",
  "/learning-twin",
  "/market-value",
  "/mentors",
  "/mock-interview",
  "/onboarding",
  "/opportunities",
  "/portfolio",
  "/profile",
  "/resume",
  "/session-prep",
  "/skill-decay",
  "/skill-gap",
  "/skill-synergy",
  "/skill-tree",
  "/storyteller",
  "/velocity",
] as const;

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/about", "/contact"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const session = await verifyAuth(request);

  if (!session) {
    const isProtected =
      matchesRoutePrefix(pathname, LEARNER_PATHS) ||
      pathname.startsWith("/admin") || isMentorAppRoute(pathname) || pathname.startsWith("/institution");

    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  const isLearnerRoute = matchesRoutePrefix(pathname, LEARNER_PATHS);
  const isMentorRoute = isMentorAppRoute(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isInstitutionRoute = pathname.startsWith("/institution");

  const ROLE_REDIRECTS: Record<string, string> = {
    LEARNER: "/dashboard",
    MENTOR: "/mentor/dashboard",
    ADMIN: "/admin/dashboard",
    INSTITUTION_MANAGER: "/institution/dashboard",
  };

  if (session.role === "LEARNER" && (isMentorRoute || isAdminRoute || isInstitutionRoute)) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS.LEARNER, request.url));
  }
  if (session.role === "MENTOR" && (isLearnerRoute || isAdminRoute || isInstitutionRoute)) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS.MENTOR, request.url));
  }
  if (session.role === "ADMIN" && (isLearnerRoute || isMentorRoute || isInstitutionRoute)) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS.ADMIN, request.url));
  }
  if (session.role === "INSTITUTION_MANAGER" && (isLearnerRoute || isMentorRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS.INSTITUTION_MANAGER, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
