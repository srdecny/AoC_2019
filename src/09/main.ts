import {getLinesAs} from "../utils";

enum ComputerStatus {
    RUNNING,
    HALTED,
    WAITING
}

class Computer {

    program: number[];
    inputQueue: number[] = [];

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

    runProgram(): number[] {

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
                    callback = (args: number[]) => this.program[args[0]] = getInput();
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

        return outputs;
    }

}

let lines = getLinesAs("input.txt", (s: string) => Number(s), ",");


function part1() {
    let computer = new Computer(Array.from(lines));
    computer.enqueueInput([1])
    console.log(computer.runProgram());
}

function part2() {
    let computer = new Computer(Array.from(lines));
    computer.enqueueInput([2])
    console.log(computer.runProgram());
}

part1();
part2();
