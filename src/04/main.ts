import { range } from "../utils";

const from = 171309
const to = 643603

function part1(): string[] {
    return range(from, to).map(n => n.toString())
        .filter((s: string) => /(\d)\1/.test(s))
        .filter(s => s === s.split("").sort().join(""))
}

function part2(): string[] {
    return part1().filter(s => s.match(/(\d)\1+/g).some(m => m.length == 2))
}

console.log(part1().length)
console.log(part2().length)

// 749 low