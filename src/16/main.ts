import { getLines, range } from "../utils"

let patterns: number[][]

function calculatePatterns(row: number): void {
	patterns = []
	const basePattern = [0, 1, 0, -1]
	range(0, row).forEach(r => {
		let pattern = []
		patterns[r] = []
		basePattern.forEach(c => {
			for (let j = 0; j <= r; j++) {
				pattern.push(c)
			}
		})
		const sliced = pattern.slice(1)
		sliced.forEach(c => {
			patterns[r].push(c)
		})
		patterns[r].push(pattern[0])
	})
}


function coef(row: number, idx: number): number {
	return patterns[row][idx % (4 * (row + 1))] 
}

function transform(inp: string): string {
	let signal: number[] = [...inp].map(c => Number(c))
	let newsignal = []
	for (let r = 0; r < signal.length; r++) {
		const sum = signal.reduce((acc, curr, idx) => {
			acc += curr * coef(r, idx)
			return acc

		}, 0)
		newsignal[r] = Math.abs(sum) % 10
	}
	return newsignal.join("")
}

function part1(inp: string): string {
	for (let cycle = 0; cycle < 100; cycle++) {
		inp = transform(inp)
	}
	return inp
}

function part2(inp: string): string {
	const offset = Number(inp.substring(0, 7)) 
	const repeats = Math.floor((10000 * inp.length - offset) / inp.length)
	inp = inp.substr(offset % inp.length) + inp.repeat(repeats)
	let signal: number[] = [...inp].map(c => Number(c))
	for (let cycle = 0; cycle < 100; cycle++) {
		let newsignal: number[] = []
		let sum: number = -1
		signal.forEach((c, idx) => {
			if (idx == 0) {
				sum = signal.slice(idx).reduce((acc, c) => acc += c, 0) 	
			} else {
				sum -= signal[idx - 1] 
			}
			newsignal[idx] = sum % 10
		})
		signal = newsignal
		console.log(`Cycle ${cycle} finished...`)
	}
	return signal.join('')
}

let signal = getLines("input.txt")[0]
calculatePatterns(signal.length + 1)
const res1 = part2(signal)
console.log(res1.substr(0, 8))
