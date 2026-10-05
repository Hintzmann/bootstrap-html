import packageJson from "../../package.json";
import { buildLlms } from "../lib/llms.js";

export function GET({ site }) {
  const body = buildLlms({ packageJson, site, base: import.meta.env.BASE_URL });
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
