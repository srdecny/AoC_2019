import { getLines } from "../utils";


function loadMap(part2: boolean) { // false for directed graph, true for "normal" graph
    let spaceMap: {[key: string]: string[]} = {};
    const lines = getLines("input.txt");
    lines.forEach(line => {
        const orbiters = line.split(")");
        if (!(orbiters[0] in spaceMap)) {
            spaceMap[orbiters[0]] = [];
        }

        if (!(orbiters[1] in spaceMap)) {
            spaceMap[orbiters[1]] = [];
        }

        spaceMap[orbiters[0]].push(orbiters[1])

        if (part2) {
            spaceMap[orbiters[1]].push(orbiters[0])
        }

    })

    return spaceMap
}

function part1(): number {
    let spaceMap = loadMap(false);
    let cache: {[key: string]: number} = {};

    function calculateOrbits(name: string): number { 
        if (name in cache) {
            return cache[name];
        } else {
            cache[name] = spaceMap[name].length + spaceMap[name].map(n => calculateOrbits(n)).reduce((a, b) => a + b, 0);
            return cache[name];
        }
    }

    return Object.keys(spaceMap).map(n => calculateOrbits(n)).reduce((a, b) => a + b, 0);
}

function part2(): number {
    let spaceMap = loadMap(true);
    const start = Object.keys(spaceMap).find(key => spaceMap[key].some(orbiter => orbiter == "YOU"))
    const end = Object.keys(spaceMap).find(key => spaceMap[key].some(orbiter => orbiter == "SAN"))

    let steps = 0;
    let visited: string[] = [];
    let current = [start];
    while (!(current.some(o => o == end))) {
        steps += 1;
        visited = [...new Set(current.concat(visited))];
        current = [...new Set(current.map(curr => spaceMap[curr]).flat(1))]
    }
    return steps;
}

let res1 = part1()
console.log(res1);

let res2 = part2()
console.log(res2)

