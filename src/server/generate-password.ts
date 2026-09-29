// A random starting password that's easy to read out and type: four groups of four, no look-alike characters
import "server-only";
import { randomInt } from "node:crypto";

const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(): string {
  const group = () => Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join("");
  return [group(), group(), group(), group()].join("-");
}
