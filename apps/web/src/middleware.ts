
import { NextResponse } from "next/server";

export function middleware(req: any) {
  console.log("BARE MIDDLEWARE EXECUTED");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\..*).*)"],
};
