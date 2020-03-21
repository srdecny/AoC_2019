import {range, Direction, parseDirection, directionToString, Coords, getLinesAs, isValidCoordinate} from "../utils";

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
	const ascii = new Computer(lines);

	while (ascii.status !== ComputerStatus.HALTED) {
		ascii.runProgram();

		const grid: string[][] = []
		let row = 0
		grid[row] = []
		for (let i = 0; i < ascii.output.length; i++) {
		 	const c = String.fromCharCode(ascii.output[i])
			process.stdout.write(c)
			if (c == '\n') {
		 		row++
				grid[row] = []
			} else {
				grid[row].push(c)	
			}
		}
		console.log("--------")
		grid.forEach(r => console.log(r.join('')))
		
		const maxX = grid[0].length - 1
		const maxY = grid.length - 1
		let checksum = 0
		
		range(0, maxY).forEach(y => {
			range(0, maxX).forEach(x => {
				const neighbours = [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
						.filter(([x, y]) => { return x >= 0 && y >= 0 && x <= maxX && y <= maxY})
				if (neighbours.length == 5) {
					if (neighbours.every(([x, y]) => { return grid[y][x] == '#'})) {
						console.log("hit")
						checksum += x * y
					}
				}
			})
		}) 
		console.log(checksum)	

	}
}

function part2() {
	const ascii = new Computer(lines);

	ascii.runProgram();

	const grid: string[][] = []
	let pos = new Coords(0, 0)
	let y = 0
	let x = 0
	grid[y] = []
	for (let i = 0; i < ascii.output.length; i++) {
		const c = String.fromCharCode(ascii.output[i])
		process.stdout.write(c)
		if (c == '\n') {
			y++
			x = 0
			grid[y] = []
		} else {
			grid[y].push(c)	
			if (['^', '>', '<', 'v'].indexOf(c) != -1) {
				pos = new Coords(x, y)
			}
			x++
		}
	}
	
	console.log("------")
	grid.forEach(r => console.log(r.join("")))

	const moves = []
	const maxX = grid[0].length - 1
	const maxY = grid.length - 1
	let currentDirection: Direction = parseDirection(grid[pos.y][pos.x])
	function canMove(direction: Direction): boolean {
		switch (direction) {
			case Direction.UP:
				return isValidCoordinate(new Coords(pos.x, pos.y - 1), maxX, maxY) && grid[pos.y - 1][pos.x] == "#"
			case Direction.DOWN:
				return isValidCoordinate(new Coords(pos.x, pos.y + 1), maxX, maxY) && grid[pos.y + 1][pos.x] == "#"
			case Direction.LEFT:
				return isValidCoordinate(new Coords(pos.x - 1, pos.y), maxX, maxY) && grid[pos.y][pos.x - 1] == "#"
			case Direction.RIGHT:
				return isValidCoordinate(new Coords(pos.x + 1, pos.y), maxX, maxY) && grid[pos.y][pos.x + 1] == "#"
		}
	}
	
	function rotate(from: Direction, to: Direction): string {
		const directions = [Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN]
		const fromIdx = directions.indexOf(from)
		const toIdx = directions.indexOf(to)

		if (Math.abs(fromIdx - toIdx) == 1) {
			return fromIdx < toIdx ? "R" : "L"
		} else {
			return from == Direction.LEFT ? "L" : "R"
		}
	}
	
	while (true) {
		if (canMove(currentDirection) ) {
			moves.push("G")
			switch (currentDirection) {
				case Direction.UP:
					pos = new Coords(pos.x, pos.y - 1)
					break
				case Direction.DOWN:
					pos = new Coords(pos.x, pos.y + 1)
					break
				case Direction.LEFT:
					pos = new Coords(pos.x - 1, pos.y)
					break
				case Direction.RIGHT:
					pos = new Coords(pos.x + 1, pos.y)
					break
			}
		}  else {
			let legalMoves = []
			switch (currentDirection) {
				case Direction.UP:
					legalMoves = [Direction.LEFT, Direction.RIGHT].filter(d => canMove(d))
					break
				case Direction.DOWN:
					legalMoves = [Direction.LEFT, Direction.RIGHT].filter(d => canMove(d))
					break
				case Direction.LEFT:
					legalMoves = [Direction.UP, Direction.DOWN].filter(d => canMove(d))
					break
				case Direction.RIGHT:
					legalMoves = [Direction.UP, Direction.DOWN].filter(d => canMove(d))
					break
			}
			if (legalMoves.length == 0) {
				console.log("end")
				break
			} else {
				moves.push(rotate(currentDirection, legalMoves[0]))				
				currentDirection = legalMoves[0] // legalMoves should be of len 1 anyways 
			}	
  
		}
	}
	
	let moveCounter = 0
	let moveSequence: string[] = []
	moves.forEach(m => {
		if (m == "G") moveCounter++
		else {
			if (moveCounter > 0 ) moveSequence.push(moveCounter.toString())
			moveCounter = 0
			moveSequence.push(m)
		}
	})
	moveSequence.push(moveCounter.toString())
	const moveString = moveSequence.join("")
	// regex dark magic incoming...
	const [routineA, routineB, routineC] = moveString.match(/^(.{1,12})\1*(.{1,12})(?:\1|\2)*(.{1,12})(?:\1|\2|\3)*$/).slice(1, 4) 

	console.log(`Main routine: ${"A,A,B,C,B,C,B,C,B,A".split("").map(c => c.codePointAt(0))}`)
	console.log(`A routine: ${"L,10,L,8,R,8,L,8,R,6".split("").map(c => c.codePointAt(0))}`)
	console.log(`B routine: ${"R,6,R,8,R,8".split("").map(c => c.codePointAt(0))}`)
	console.log(`C routine: ${"R,6,R,6,L,8,L,10".split("").map(c => c.codePointAt(0))}`)

	ascii.enqueueInput([65,44,65,44,66,44,67,44,66,44,67,44,66,44,67,44,66,44,65, 10]) // Main 
	ascii.output = []
	ascii.runProgram()
	console.log(ascii.output.map(c => String.fromCharCode(c)).join(""))
	ascii.enqueueInput([76,44,49,48,44,76,44,56,44,82,44,56,44,76,44,56,44,82,44,54, 10]) // A
	ascii.output = []
	ascii.runProgram()
	console.log(ascii.output.map(c => String.fromCharCode(c)).join(""))
	ascii.enqueueInput([82,44,54,44,82,44,56,44,82,44,56,10]) // B
	ascii.output = []
	ascii.runProgram()
	console.log(ascii.output.map(c => String.fromCharCode(c)).join(""))
	ascii.enqueueInput([82,44,54,44,82,44,54,44,76,44,56,44,76,44,49,48,10]) // C
	ascii.output = []
	ascii.runProgram()
	console.log(ascii.output.map(c => String.fromCharCode(c)).join(""))
	ascii.enqueueInput([156,10]) // Live camera feed4
	ascii.output = []
	ascii.runProgram()
	console.log(ascii.output[ascii.output.length - 1])
}

part2();
