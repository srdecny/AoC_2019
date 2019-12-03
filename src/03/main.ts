import { getLines, Coords, range } from "../utils";

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

class Segment {
    from: Coords
    to: Coords

    constructor(from: Coords, to: Coords) {
        this.from = from;
        this.to = to;
    }


    static createSegments(line: string): Segment[] {
        let currentPosition = new Coords(0,0);
        const segments: Segment[] = [];

        line.split(",").forEach(direction => {
            const distance = Number(direction.substr(1))
            let newPosition: Coords = undefined;
            switch (direction[0]) {
                case ("U"):
                    newPosition = new Coords(currentPosition.x, currentPosition.y + distance);
                    break;
                case ("D"):
                    newPosition = new Coords(currentPosition.x, currentPosition.y - distance);
                    break;
                case ("L"):
                    newPosition = new Coords(currentPosition.x - distance, currentPosition.y);
                    break;
                case ("R"):
                    newPosition = new Coords(currentPosition.x + distance, currentPosition.y);
                    break;
                default:
                    throw Error(`Unexpected character when parsing: ${direction}`);
            }
            segments.push(new Segment(currentPosition, newPosition));
            currentPosition = newPosition;
        })
        return segments;
    }

    get isVertical() {
        return this.from.x === this.to.x;
    }

    get segmentDirection(): Direction {
        if (this.isVertical) {
            return this.from.y > this.to.y ? Direction.DOWN : Direction.UP;
        } else {
            return this.from.x > this.to.x ? Direction.RIGHT : Direction.LEFT;
        }
    }

    intersections(other: Segment): Coords[] {

        function isInRange(from: number, to: number, number: number): boolean {
            if (to < from) {
                return isInRange(to, from, number);
            } else {
                return (from <= number && number <= to);
            }
        }

        if ((this.isVertical && !other.isVertical) || (!this.isVertical && other.isVertical)) {
            if (this.isVertical
                && isInRange(other.from.x, other.to.x, this.from.x)
                && isInRange(this.from.y, this.to.y, other.from.y)) {
                    return [new Coords(this.from.x, other.from.y)]
            } else if (isInRange(this.from.x, this.to.x, other.from.x)
                && isInRange(other.from.y, other.to.y, this.from.y)) { 
                    return [new Coords(other.from.x, this.from.y)]
            }
        } else {
            if (this.isVertical && this.from.x == other.from.x) { // two verticals
                if (isInRange(this.from.y, this.to.y, other.from.y)) {
                    if (isInRange(other.from.y, other.to.y, this.from.y)) {
                        return range(other.from.y, this.from.y).map(y => new Coords(this.from.x, y));
                    } else {
                        return range(other.from.y, this.to.y).map(y => new Coords(this.from.x, y));
                    }
                }
            } else if(this.from.y == other.from.y) { // two horizontals
                if (isInRange(this.from.x, this.to.x, other.from.x)) {
                    if (isInRange(other.from.x, other.to.x, this.from.x)) {
                        return range(other.from.x, this.from.x).map(x => new Coords(x, this.from.y));
                    } else {
                        return range(other.from.x, this.to.x).map(x => new Coords(x, this.from.y));
                    }
                }
            }
        }

        return [];
    }
}

class SegmentWithLength extends Segment {
    length: number;
    constructor(segment: Segment, length: number) {
        super(segment.from, segment.to);
        if (segment.isVertical) {
            this.length = length + Math.abs(segment.from.y - segment.to.y);
        } else {
            this.length = length + Math.abs(segment.from.x - segment.to.x);
        }
    }

    stepsToPoint(point: Coords): number {
        let stepsSinceFrom = 0;
        switch (this.segmentDirection) {
            case (Direction.UP):
            case (Direction.DOWN):
                stepsSinceFrom = Math.abs(this.to.y - point.y);
                break;
            case (Direction.LEFT):
            case (Direction.RIGHT):
                stepsSinceFrom = Math.abs(this.to.x - point.x);
                break;
        }
        return this.length - stepsSinceFrom;
    }

}

let segments = getLines("input.txt").map(line => Segment.createSegments(line));

function part1(segments: Segment[][]): number {
    let intersections: Coords[] = [];
    segments[0].forEach(segment => {
        segments[1].forEach(otherSegment => {
            intersections = intersections.concat(segment.intersections(otherSegment));
        })
    })

    return intersections.filter(coords => coords.x !== 0 && coords.y !== 0)
            .map(coords => Math.abs(coords.x) + Math.abs(coords.y))
            .sort((a: number, b: number) => a - b)
            [0];
}

let segmentsWithLength = getLines("input.txt")
        .map(line => Segment.createSegments(line))
        .map(segments => {
            let length = 0;
            return segments.map(segment => {
                let newSegment = new SegmentWithLength(segment, length);
                length = newSegment.length;
                return newSegment
            })
        })

function part2(segments: SegmentWithLength[][]): number {
    let intersectionSteps: number[] = [];
    segments[0].forEach(segment => {
        segments[1].forEach(otherSegment => {
            const intersections = (segment.intersections(otherSegment));
            intersectionSteps = intersectionSteps.concat(intersections.map(intersection => {
                return segment.stepsToPoint(intersection) + otherSegment.stepsToPoint(intersection);
            }))
        })
    })
    return intersectionSteps.filter(steps => steps !== 0)
            .sort((a: number, b: number) => a - b)
            [0];
}

const res1 = part1(segments);
console.log(`Part 1: ${res1}`);

const res2 = part2(segmentsWithLength);
console.log(`Part 2: ${res2}`);

