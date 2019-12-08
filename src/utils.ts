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
  
 
export class Coords {
    x: number;
    y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}