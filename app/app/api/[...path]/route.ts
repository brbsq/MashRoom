import { handle } from "@/lib/server/google";
function route(request: Request) {
  return handle(request, new URL(request.url).pathname.replace(/^\/api\//, ""));
}
export const GET = route;
export const POST = route;
export const PATCH = route;
