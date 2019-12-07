import {getLinesAs, permutations} from "../utils";
import { exists } from "fs";

let lines = getLinesAs("input.txt", (s: string) => Number(s), ",");

enum ComputerStatus {
    RUNNING,
    HALTED,
    WAITING
}

class Computer {

    program: number[];
    inputQueue: number[];

    pc = 0;

    status: ComputerStatus;

    constructor(program: number[]) {
        this.program = program;
        this.inputQueue = [];
        this.status = ComputerStatus.RUNNING;
    }

    enqueueInput(inputs: number[]) {
        this.inputQueue = this.inputQueue.concat(inputs);
    }

    runProgram(): number[] {

        const resolveArgs = (args: number[]): number[] => {      
            const strInstruction = this.program[this.pc].toString();
            const paddedinstruction = "0".repeat(args.length + 2 - strInstruction.length) + this.program[this.pc].toString();
            return args.map((arg, index) => {
                return (Number(paddedinstruction[paddedinstruction.length - 3 - index])) ? arg : this.program[arg];
            })
        }

        const getInput = (): number => {
            return this.inputQueue.shift();
        }

        const output = (number: number): void => {
            outputs.push(number);
        }
    
        let opcode = 99;
        let outputs: number[] = [];

        if (this.status == ComputerStatus.HALTED) {
            throw Error("Attempted to run a halted computer");
        } else {
            this.status = ComputerStatus.RUNNING;
        }

        while(this.status == ComputerStatus.RUNNING) {
            let argcount = 0;
            let callback: (args: number[]) => any;
            const oldPc = this.pc;
            opcode = this.program[this.pc] % 100

            switch(opcode) {
                case (1): // Add
                    argcount = 3;
                    callback = (args: number[]) => this.program[this.program[this.pc + 3]] = args[1] + args[0];
                    break;

                case (2): // Multiply
                    argcount = 3;
                    callback = (args: number[]) => this.program[this.program[this.pc + 3]] = args[1] * args[0];    
                    break;

                case (3): // Read
                    argcount = 1;
                    callback = (args: number[]) => this.program[this.program[this.pc + 1]] = getInput();
                    break;

                case (4): // Print
                    argcount = 1;
                    this.status = ComputerStatus.WAITING;
                    callback = (args: number[]) => {
                        output(args[0]);
                    };
                    break;

                case(5): // Jump if true
                    argcount = 2;
                    callback = (args: number[]) => {
                        if (args[0] !== 0) {
                            this.pc = args[1]
                        }};
                    break;

                case(6): // Jump if false
                    argcount = 2;
                    callback = (args: number[]) => {
                        if (args[0] == 0) {
                            this.pc = args[1]
                        }};
                    break;

                case(7): // less than
                    argcount = 3;
                    callback = (args: number[]) => {
                        this.program[this.program[this.pc + 3]] =  args[0] < args[1] ? 1 : 0;
                    }
                    break;

                case(8): // less than
                    argcount = 3;
                    callback = (args: number[]) => {
                        this.program[this.program[this.pc + 3]] =  args[0] == args[1] ? 1 : 0;
                    }
                    break;

                case(99): 
                    this.status = ComputerStatus.HALTED;
                    argcount = 1;
                    callback = (args: number[]) => {}
                    break;

                default:
                    console.log(`Unknown instruction ${this.program[this.pc]}`);
                    this.status = ComputerStatus.HALTED;
                    argcount = 1;
                    callback = (args: number[]) => {}
                    break;
            }

            const resolvedArgs = resolveArgs(this.program.slice(this.pc + 1, this.pc + 1 + argcount));
            callback(resolvedArgs);
            if (oldPc == this.pc) {
                this.pc += (1 + argcount);
            }
        }

        return outputs;
    }

}

function part1(): number {
    let max = 0;
    permutations([0,1,2,3,4]).forEach(perm => {
        let result = 0;
        perm.forEach((phase, index) => {
            const program = new Computer(Array.from(lines));
            program.enqueueInput([phase, result]);
            result = program.runProgram()[0];
        })
    
        if (max < result) {
            max = result;
        }
    })

    return max;
    
}

function part2(): number {
    let max = 0;
    permutations([5,6,7,8,9]).forEach(perm => {
        let result = 0;
        let lastResult = 0;
        let computers: Computer[] = [];
        [0,1,2,3,4].forEach(index => {
            computers[index] = new Computer(Array.from(lines));
            computers[index].enqueueInput([perm[index]]);
        })

        let finished = false;
        let index = 0;
        while (!finished) {

            computers[index].enqueueInput([result]);
            let results = computers[index].runProgram();
            if (results.length == 0) {
                finished = true;
            } else {
                result = results[0];
                if (index == 4) {
                    lastResult = result;
                }
            }
            index = (index + 1) % 5
        }

        if (lastResult > max) {
            max = lastResult;
        }

    })

    return max;
}

console.log(part1());
console.log(part2());

