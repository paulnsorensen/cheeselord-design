import { rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await rm("assets/fonts", { recursive: true, force: true });
