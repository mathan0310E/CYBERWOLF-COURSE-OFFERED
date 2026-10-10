import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

/**
 * Detect whether the Firebase Emulator Suite can actually run here. It needs a
 * Java runtime for the Firestore emulator. When the runtime is unavailable the
 * rules tests skip rather than fail, so CI without Java stays green — but the
 * suite runs for real wherever Java and the emulator are present.
 */

export function javaAvailable(): boolean {
  const result = spawnSync("java", ["-version"], { stdio: "ignore" });
  return result.status === 0;
}

/** True when an emulator is already running and reachable. */
export async function emulatorReachable(host: string, port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://${host}:${port}/`, { method: "GET" });
    return response.status < 500;
  } catch {
    return false;
  }
}

export function rulesTestAvailable(): boolean {
  return javaAvailable();
}

const REPO_ROOT = path.resolve(__dirname, "..", "..");

/** Read a security-rules file for structural assertions (always runs). */
export function readRules(relativePath: string): string {
  return readFileSync(path.resolve(REPO_ROOT, relativePath), "utf8");
}

export function fileExists(relativePath: string): boolean {
  return existsSync(path.resolve(REPO_ROOT, relativePath));
}

export function listDir(relativeDir: string): string[] {
  return readdirSync(path.resolve(REPO_ROOT, relativeDir));
}
