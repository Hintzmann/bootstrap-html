import packageJson from "../../package.json";
import { buildLlmsFull } from "../lib/llms.js";

export function GET({ site }) {
  const body = buildLlmsFull({ packageJson, site, base: import.meta.env.BASE_URL });
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
