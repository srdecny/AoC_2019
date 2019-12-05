import {getLinesAs} from "../utils";

let lines = getLinesAs("input.txt", (s: string) => Number(s), ",");

function runProgram(program: number[]): number[] {

    function resolveArgs(args: number[]): number[] {      
        const strInstruction = program[pc].toString();
        const paddedinstruction = "0".repeat(args.length + 2 - strInstruction.length) + program[pc].toString();
        return args.map((arg, index) => {
            return (Number(paddedinstruction[paddedinstruction.length - 3 - index])) ? arg : program[arg];
        })
    }

    function getInput(): number {
        return 5;
    }

    function output(number: number): void {
        console.log(number);
    }
 
    let pc = 0;
    let opcode = 99;

    while((opcode = program[pc] % 100) !== 99) {
        let argcount = 0;
        let callback: (args: number[]) => any;
        const oldPc = pc;
            
        switch(opcode) {
            case (1): // Add
                argcount = 3;
                callback = (args: number[]) => program[program[pc + 3]] = args[1] + args[0];
                break;
            case (2): // Multiply
                argcount = 3;
                callback = (args: number[]) => program[program[pc + 3]] = args[1] * args[0];    
                break;
            case (3): // Read
                argcount = 1;
                callback = (args: number[]) => program[program[pc + 1]] = getInput();
                break;
            case (4): // Print
                argcount = 1;
                callback = (args: number[]) => output(args[0]);
                break;
            case(5): // Jump if true
                argcount = 2;
                callback = (args: number[]) => {
                    if (args[0] !== 0) {
                        pc = args[1]
                    }};
                break;
            case(6): // Jump if false
                argcount = 2;
                callback = (args: number[]) => {
                    if (args[0] == 0) {
                        pc = args[1]
                    }};
                break;

            case(7): // less than
                argcount = 3;
                callback = (args: number[]) => {
                    program[program[pc + 3]] =  args[0] < args[1] ? 1 : 0;
                }
                break;

            case(8): // less than
                argcount = 3;
                callback = (args: number[]) => {
                    program[program[pc + 3]] =  args[0] == args[1] ? 1 : 0;
                }
                break;


            default:
                console.log(`Unknown instruction ${program[pc]}`);
                return;
        }

        const resolvedArgs = resolveArgs(program.slice(pc + 1, pc + 1 + argcount));
        callback(resolvedArgs);
        if (oldPc == pc) {
            pc += (1 + argcount);
        }
    }
    return program;
}

const res1 = runProgram(Array.from(lines));

