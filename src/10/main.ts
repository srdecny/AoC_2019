import {getLines, Coords, isBetween} from "../utils";
import { stat } from "fs";

function getCoords(): Coords[] {
    const lines = getLines("input.txt");
    return lines.flatMap((line, y) => {
        return line.split("").map((character, x) => {
            if (character == "#") {
                return new Coords(x, y);
            }
        }).filter(c => c);
    });
}

function areCoordsSame(first: Coords, second: Coords, center: Coords): boolean {
    const det = first.x * second.y - first.y * second.x;
    if (det != 0) {
        return false;
    } else { // first and second are on the same line, check if center is between them
        return isBetween(first, new Coords(0, 0), second) ? false : true;
    }
}


function part1(): number {
    const coords = getCoords();
    let max = 0;
    let maxCoords = new Coords(0,0);

    coords.forEach(c => {
        let lines = coords.map(other => {
            return new Coords(other.x - c.x, other.y - c.y);
        }).filter(c => c.x != 0 || c.y != 0)

        const inSight = lines.reduce((acc: Coords[], line: Coords) => {
            if (!(acc.some(a => areCoordsSame(a, line, c)))) {
                acc.push(line);
            }
            return acc;
        }, []);

        if (inSight.length > max) {
            max = inSight.length;
            maxCoords = c;
        }
    })
    console.log(maxCoords)
    return max;
}

function part2(): number {
    const station = new Coords(13, 17);
    const meteors = getCoords();
    const angles: Coords[][] = [];
    meteors.filter(m => m.x != station.x || m.y != station.y).forEach(m => {
        let angle = Math.atan2(m.y - station.y, m.x - station.x);
        angles[angle] ? angles[angle].push(m) : angles[angle] = [m];
    })

    let angleKeys = Object.keys(angles).sort();
    let startKeyIndex = angleKeys.findIndex(k => Number(k) < (-1) * 0.5 *  Math.PI);
    let count = 0;
    let depth = 0;
    let keyIndex = startKeyIndex
    let destroyed = new Coords(0,0);


    while(count !== 200) {
        let index:any = angleKeys[keyIndex];
        if (angles[index].length > depth) {
            destroyed = angles[index][depth];
            count++;
        }

        keyIndex--;
        if (keyIndex == startKeyIndex) {
            depth++;
        }

        if (keyIndex == 0) {
            keyIndex = angleKeys.length - 1;
        }
    }

    return destroyed.x * 100 + destroyed.y
}


console.log(part1());
console.log(part2());

