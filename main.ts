import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const RANT =
  "The office printer has had one job for twenty years and still jams on page 39 of 40, every single time. It beeps like it's the one being inconvenienced. I have apologised to a machine more than I have apologised to my own mother, and it still refuses to print. Replace it with a rock — at least the rock never pretends it is warming up.";

const OUTPUT_PATH = "/output/entry.txt";

function main(): void {
  // Validate before writing: 1-400 chars, not only whitespace.
  if (RANT.length < 1 || RANT.length > 400) {
    throw new Error(`rant must be 1-400 characters, got ${RANT.length}`);
  }
  if (RANT.trim().length === 0) {
    throw new Error("rant must not be only whitespace");
  }
  if (RANT.endsWith("\n")) {
    throw new Error("rant must not end with a trailing newline");
  }
  // Reject control characters (except tab, which a rant has no use for here
  // either, but keep the gate simple: only \n is allowed, and only mid-text).
  for (const ch of RANT) {
    const code = ch.codePointAt(0) as number;
    if ((code < 0x20 && ch !== "\n" && ch !== "\t") || code === 0x7f) {
      throw new Error(
        `rant contains a control character U+${code.toString(16).padStart(4, "0")}`,
      );
    }
  }
  // No trailing newline and no interior newline at the very end either.
  if (RANT !== RANT.trimEnd()) {
    throw new Error("rant must not end with whitespace");
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, RANT, "utf8");

  // Verify the write round-trips: read the file back and compare byte for byte.
  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== RANT) {
    throw new Error("written entry does not match the rant (round-trip check failed)");
  }
  if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(RANT, "utf8")) {
    throw new Error("written entry byte length mismatch");
  }
}

main();
