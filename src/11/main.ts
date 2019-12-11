import {getLinesAs, Coords, Direction, range} from "../utils";
import { rebeccapurple } from "color-name";

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
    const computer = new Computer(lines);
    let position = new Coords(0,0);
    let direction = Direction.UP;
    let painted: {[index: string]: number} = {};
    let paintedCount = 0;

    const turn = (right: boolean) => {
        switch(direction) {
            case Direction.UP:
                direction = right ? Direction.RIGHT : Direction.LEFT
                break;
            case Direction.DOWN:
                direction = right ? Direction.LEFT : Direction.RIGHT;
                break;
            case Direction.LEFT:
                direction = right ? Direction.UP : Direction.DOWN;
                break;
            case Direction.RIGHT:
                direction = right ? Direction.DOWN : Direction.UP;
                break;
        }
    }

    const move = () => {
        switch (direction) {
            case Direction.UP:
                position = new Coords(position.x, position.y + 1);
                break;
            case Direction.DOWN:
                position = new Coords(position.x, position.y - 1);
                break;
            case Direction.RIGHT:
                position = new Coords(position.x + 1, position.y);
                break;
            case Direction.LEFT:
                position = new Coords(position.x - 1, position.y);
                break;
        }

    }

    painted["0,0"] = 1;
    while (computer.status !== ComputerStatus.HALTED) {

        if (computer.status == ComputerStatus.WAITING) {
            let color = painted[position.toString()] ? painted[position.toString()] : 0;
            computer.enqueueInput([color]);    
        }
        computer.runProgram();

        if (computer.output.length == 2) {
            let [newColor, newDirection] = computer.output;
            if (painted[position.toString()] == undefined) {
                paintedCount++;
            }
            painted[position.toString()] = newColor;
    
            turn(newDirection == 1 ? true : false);
            move();
            computer.output = [];
        }

    }
    console.log(paintedCount);
    return painted;
}

function part2() {
    const painted = part1();
    const coords = Object.keys(painted).map(x => Coords.fromString(x));

    const minX = coords.map(c => Number(c.x)).sort((a, b) => a - b)[0];
    const maxX = coords.map(c => Number(c.x)).sort((a, b) => a - b).reverse()[0];
    const minY = coords.map(c => Number(c.y)).sort((a, b) => a - b)[0];
    const maxY = coords.map(c => Number(c.y)).sort((a, b) => a - b).reverse()[0];

    range(minY, maxY).reverse().forEach(y => {
        range(minX, maxX).forEach(x => {
            const color  = painted[`${x},${y}`];
            if (color == undefined || color == 0) {
                process.stdout.write(" ");
            } else {
                process.stdout.write("■");
            }
        });
        console.log();
    })

}

part2();