import { readFileSync } from "fs";

export function getLinesAs<T>(path: string, transform: (s: string) => T, delimiter: string = "\n"): T[] {
    return readFileSync(path, "utf8").trim().split(delimiter).map(line => transform(line));
}