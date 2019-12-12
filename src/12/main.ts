import { Point, getLines, range } from "../utils";

class Moon {
    pos: Point;
    vel: Point;

    constructor(pos: Point, vel: Point) {
        this.pos = pos;
        this.vel = vel;
    }

    applyGravity(other: Moon) {
        if (this.pos.x !== other.pos.x) {
            this.vel.x += this.pos.x < other.pos.x ? 1 : -1
        }
        if (this.pos.y !== other.pos.y) {
            this.vel.y += this.pos.y < other.pos.y ? 1 : -1
        }
        if (this.pos.z !== other.pos.z) {
            this.vel.z += this.pos.z < other.pos.z ? 1 : -1
        }
    }

    applyVelocity() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.pos.z += this.vel.z
    }

    get energy(): number {
        const potential = Math.abs(this.pos.x) + Math.abs(this.pos.y) + Math.abs(this.pos.z);
        const kinetic = Math.abs(this.vel.x) + Math.abs(this.vel.y) + Math.abs(this.vel.z);
        return potential * kinetic;
    }
}

function getMoons(): Moon[] {
    const lines = getLines("input.txt");
    return lines.map(line => {
        const coords = line.match(/(-?\d+)/g).map(c => Number(c));
        return new Moon(new Point(coords[0], coords[1], coords[2]), new Point(0, 0, 0));
    })
}

function part1() {
    const moons = getMoons();
    const moonCount = moons.length;
    const moonPairs = range(0, moonCount - 1).flatMap((m, i) => {
        return range(0, moonCount - 1).slice(i + 1).map(w => [m, w]);
    })

    const prevRepresentation = "";
    let velocitiesX = new Set<string>();
    let velocitiesY = new Set<string>();
    let velocitiesZ = new Set<string>();

    let loopX = 0;
    let loopY = 0;
    let loopZ = 0;


    for (let i = 1; i <= 4686774924; i++) {
        moonPairs.forEach(([f, s]) => {
            moons[f].applyGravity(moons[s]);
            moons[s].applyGravity(moons[f]);
        })

        moons.forEach(m => {
            m.applyVelocity();
        })

        const representationX = moons.reduce((acc, m) => acc + "|" + m.pos.x + "," + m.vel.x,  "");
        if (velocitiesX.has(representationX)) {
            loopX = velocitiesX.size;
            velocitiesX = new Set<string>();
        } else {
            velocitiesX.add(representationX);
        }

        const representationY = moons.reduce((acc, m) => acc + "|" + m.pos.y + "," + m.vel.y,  "");
        if (velocitiesY.has(representationY)) {
            loopY = velocitiesY.size;
            velocitiesY = new Set<string>();
        } else {
            velocitiesY.add(representationY);
        }

        const representationZ = moons.reduce((acc, m) => acc + "|" + m.pos.z + "," + m.vel.z,  "");
        if (velocitiesZ.has(representationZ)) {
            loopZ = velocitiesZ.size;
            velocitiesZ = new Set<string>();
        } else {
            velocitiesZ.add(representationZ);
        }

        if (loopX != 0 && loopY != 0 && loopZ != 0) {
            const gcd = (a: number, b: number): number => a ? gcd(b % a, a) : b;
            const lcm = (a: number, b: number): number => a * b / gcd(a, b);
            console.log([loopX, loopY, loopZ].reduce(lcm))
            return;
        }


    }


    // return moons.map(m => m.energy).reduce((x, y) => x + y);

}

console.time();
part1();
console.timeEnd();
