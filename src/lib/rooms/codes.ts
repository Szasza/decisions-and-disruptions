import { randomInt } from "node:crypto";

// Excludes 0/O, 1/I/L to avoid visual ambiguity when a code is spoken or typed.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/**
 * Generates a random room code from an ambiguity-free alphabet, regenerating
 * until `isTaken` reports the candidate is free (guarding against collisions
 * with a live store).
 */
export function generateRoomCode(isTaken: (code: string) => boolean): string {
  let code: string;
  do {
    let candidate = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      candidate += ALPHABET[randomInt(ALPHABET.length)];
    }
    code = candidate;
  } while (isTaken(code));
  return code;
}
