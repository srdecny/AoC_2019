import * as ut from "../utils";

let lines = ut.getLinesAs("input.txt", (s: string) => Number(s), ",");

function part1(program: number[]): number[] {


    function binaryInstruction(args: number[], op: (a1: number, a2: number) => number): void {
        program[args[2]] = op(program[args[0]], program[args[1]]);
        pc += 4;
    }

    let pc = 0;

    while(program[pc] !== 99) {
        switch(program[pc]) {
            case (1):
                binaryInstruction(program.slice(pc + 1, pc + 4), (a, b) => a + b);
                break;
            case (2):
                binaryInstruction(program.slice(pc + 1, pc + 4), (a, b) => a * b);
                break;
            default:
                console.log(`Unknown instruction ${program[pc]}`);
                return;
        }
    }
    return program;
}

function part2(program: number[]): number[] {

    for (let i = 0; i <= 99; i++) {
        for (let j = 0; j <= 99; j++) {
            let copiedProgram = Array.from(program);
            copiedProgram[1] = i;
            copiedProgram[2] = j;
            let result = part1(copiedProgram);
            if (result[0] == 19690720) {
                return [i, j]
            }

        }
    }
}

const res1 = part1(Array.from(lines));
console.log(`Part 1: ${res1[0]}`);

const res2 = part2(Array.from(lines));
console.log(`Part 2: ${100 * res2[0] + res2[1]}`);
