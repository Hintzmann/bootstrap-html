import packageJson from "../../package.json";
import { buildContract } from "../lib/contract.js";

export function GET() {
  return new Response(JSON.stringify(buildContract(packageJson), null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
