import {getLinesAs} from "../utils";
import {keyInSelect} from "readline-sync";

enum ComputerStatus {
    RUNNING,
    HALTED,
    WAITING
}

class Computer {

    program: number[];
    inputQueue: number[] = [];

    output: number[] = [];
    pc = 0;

    base = 0;

    status: ComputerStatus = ComputerStatus.RUNNING;

    constructor(program: number[]) {
        this.program = program;
    }

    enqueueInput(inputs: number[]) {
        this.inputQueue = this.inputQueue.concat(inputs);
    }

    readMemory(address: number) : number {
        return this.program[address] ? this.program[address] : 0
    }


    runProgram() {
        const resolveArgs = (args: number[], writes: number[]): number[] => {      
            const strInstruction = this.program[this.pc].toString();
            const paddedinstruction = "0".repeat(args.length + 2 - strInstruction.length) + this.program[this.pc].toString();
            return args.map((arg, index) => {
                if (!(writes.includes(index))) {
                    switch (Number(paddedinstruction[paddedinstruction.length - 3 - index])) {
                        case(0):
                            return this.readMemory(arg)
                        case(1):
                            return arg;
                        case(2):
                            return this.readMemory(arg + this.base)
                        default:
                            throw Error(`Unexpected parameter mode: ${args}`)
                    } 
                } else {
                    switch (Number(paddedinstruction[paddedinstruction.length - 3 - index])) {
                        case(1):
                            throw Error(`Memory writes are never in immediate mode: ${args}`)
                        case (0):
                            return arg;
                        case(2):
                            return arg + this.base;
                    }
                }
    
            })
        }

        const getInput = (): number | undefined => {
            return this.inputQueue.length > 0 ? this.inputQueue.shift() : undefined;
        }

        const output = (number: number): void => {
            this.output.push(number);
        }
    
        let opcode = 99;

        if (this.status == ComputerStatus.HALTED) {
            throw Error("Attempted to run a halted computer");
        } else {
            this.status = ComputerStatus.RUNNING;
        }

        while(this.status == ComputerStatus.RUNNING) {
            let argcount = 0;
            let writes: number[] = [];
            let callback: (args: number[]) => any;
            const oldPc = this.pc;
            opcode = this.program[this.pc] % 100

            switch(opcode) {
                case (1): // Add
                    argcount = 3;
                    writes = [2];
                    callback = (args: number[]) => this.program[args[2]] = args[1] + args[0];
                    break;

                case (2): // Multiply
                    argcount = 3;
                    writes = [2];
                    callback = (args: number[]) => this.program[args[2]] = args[1] * args[0];    
                    break;

                case (3): // Read
                    argcount = 1;
                    writes = [0];
                    callback = (args: number[]) => {
                        const input = getInput();
                        if (input !== undefined) {
                            this.program[args[0]] = input;
                        } else {
                            this.status = ComputerStatus.WAITING;
                            argcount = -1; // repeat the read next time
                        }
                    }
                    break;

                case (4): // Print
                    argcount = 1;
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
                    writes = [2];
                    callback = (args: number[]) => {
                        this.program[args[2]] =  args[0] < args[1] ? 1 : 0;
                    }
                    break;

                case(8): // equal
                    argcount = 3;
                    writes = [2];
                    callback = (args: number[]) => {
                        this.program[args[2]] =  args[0] == args[1] ? 1 : 0;
                    }
                    break;
                
                case (9):
                    argcount = 1;
                    callback = (args: number[]) => { 
                        this.base += args[0];
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

            const resolvedArgs = resolveArgs(this.program.slice(this.pc + 1, this.pc + 1 + argcount), writes);
            callback(resolvedArgs);
            if (oldPc == this.pc) {
                this.pc += (1 + argcount);
            }
        }

    }

}

let lines = getLinesAs("input.txt", (s: string) => Number(s), ",");

function part1() {
    const arkanoid = new Computer(lines);
    const grid: string[][] = [];        
    let score = 0;

    while (arkanoid.status !== ComputerStatus.HALTED) {
        console.clear();
        arkanoid.runProgram();

        for (let i = 0; i < arkanoid.output.length / 3; i++) {
            const index = i * 3;
            const x = arkanoid.output[index]
            const y = arkanoid.output[index + 1];

            let character = "";
            if (x == -1 && y == 0) {
                score = arkanoid.output[index + 2];
            }  else {      
                switch (arkanoid.output[index + 2]) {
                    case (0):
                        character = " ";
                        break;
                    case (1):
                        character = "🧱";
                        break;
                    case (2):
                        character = "🌟";
                        break;
                    case (3):
                        character = "🛹";
                        break;
                    case (4):
                        character = "⚽";
                        break;
                    default:
                        throw new Error(`Unexpected character code: ${arkanoid.output[index + 2]}`);
                }
    
                if (!grid[y]) {
                    grid[y] = [];
                }
    
                grid[y][x] = character;
            }
        }

        grid.forEach(row => {
            console.log(row.join(" "));
        })
        console.log(`Score: ${score}`)

        //let moves = ["-1", "0", "1"];
        //let moveIndex: number = keyInSelect(moves, "Direction")
        arkanoid.enqueueInput([0])
        arkanoid.output = [];
    }
}

part1();