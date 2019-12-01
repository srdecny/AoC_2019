import { readFileSync } from "fs";

export function getLines(path: string): string[] {
    return readFileSync(path, "utf8").trim().split("\n");
}