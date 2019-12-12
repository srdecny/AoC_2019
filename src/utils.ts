import { readFileSync } from "fs";

export function getLinesAs<T>(path: string, transform: (s: string) => T, delimiter: string = "\n"): T[] {
    return readFileSync(path, "utf8").trim().split(delimiter).map(line => transform(line));
}

export function getLines(path: string, delimiter: string = "\n") {
    return readFileSync(path, "utf8").trim().split(delimiter);
}

export const range = (start: number, end: number): number[] => {
    if (start <= end) {
        return Array.from({length: (end + 1 - start)}, (v, k) => k + start);
    } else return range(end, start);
}

export function isInRange(from: number, to: number, number: number): boolean {
    if (to < from) {
        return isInRange(to, from, number);
    } else {
        return (from <= number && number <= to);
    }
}

export function nthDigit(index: number, number: number): number {
    if (index < 0) {
        return 0;
    }
    var len = Math.floor( Math.log(number) / Math.LN10 ) - index;
    return ( (number / Math.pow(10, len)) % 10) | 0; 
}

export function permutations<T>(inputArr: T[]): T[][] {
    let result: T[][] = [];
  
    const permute = (arr: T[], m: T[] = []) => {
      if (arr.length === 0) {
        result.push(m)
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next))
       }
     }
   }
  
   permute(inputArr)
  
   return result;
  }

export function countCharacter(string: string, character: string): number {
    return (string.match(new RegExp(character, "g")) || []).length
}
  
export function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function isBetween(from: Coords, point: Coords, to: Coords): boolean {
    function distance(a: Coords, b: Coords) {
        return Math.abs((a.x - b.x) + Math.abs(a.y - b.y));
    }
    return Math.abs(distance(from,to) - distance(point,to) - distance(from,point)) < 0.0001;
}



export class Coords {
    x: number;
    y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `${this.x},${this.y}`;
    }

    static fromString(string: String): Coords {
        const [x, y] = string.split(",").map(s => Number(s));
        return new Coords(x, y); 
    }
}

export class Point {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get toString(): string {
        return `${this.x},${this.y},${this.z}`;
    }
}

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}
