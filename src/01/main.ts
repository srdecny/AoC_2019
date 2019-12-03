import * as ut from "../utils";

let lines = ut.getLinesAs("input.txt", Number);

function part1(input: number[]): number {
    return input.reduce((acc, curr) => acc + (Math.floor(curr / 3) - 2), 0);
}

function part2(input: number[]): number {

    function calculateFuel(fuel: number): number {
        const newFuel = Math.floor(fuel / 3) - 2;
        return newFuel >= 0 ? newFuel : 0
    }
    return input.reduce((acc, curr) => {
        let totalFuel = 0;
        while (true) {
            let addedFuel = calculateFuel(curr);
            if (addedFuel == 0) { break; }
            totalFuel += addedFuel;
            curr = addedFuel;
        }
        
        return acc + totalFuel;
        
    }, 0);
}

console.log(`Part 1: ${part1(lines)}`);
console.log(`Part 2: ${part2(lines)}`);