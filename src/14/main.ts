import {getLines} from "../utils";
import * as _ from "lodash";
import { create } from "domain";
import { questionNewPassword } from "readline-sync";

class Ingredient {
    amount: number;
    name: string;

    constructor(amount: number, name: string) {
        this.amount = amount;
        this.name = name;
    }
}

class Reaction {
    output: Ingredient;
    input: Ingredient[];

    constructor(output: Ingredient, input: Ingredient[]) {
        this.output = output;
        this.input = input;
    }
}

function getReactions() {
    const lines = getLines("input.txt");
    return lines.map(r => {
        const ingredients = r.match(/\d+ \w+/g)
                .map(i => {
                    const parts = i.split(" ");
                    return new Ingredient(Number(parts[0]), parts[1]);
                });
        return new Reaction(_.last(ingredients), _.initial(ingredients));
    })    
}

const reactions = getReactions();

function part1() {
    const storage: {[name: string]: number} = {};
    let required: Ingredient[] = [new Ingredient(1, "FUEL")];
    let oreCount = 0;
    while (required.length > 0) {
        let newRequired = required.pop(); // todo check for fuel
        if (newRequired.name == "ORE") {
            oreCount += newRequired.amount;
        } else {
            let r = reactions.find(r => r.output.name == newRequired.name); // find the reaction for the desired element

            const stored = storage[newRequired.name] ? storage[newRequired.name] : 0;
            storage[newRequired.name] = storage[newRequired.name] - newRequired.amount; // withdraw from the storage
    
            if (stored < newRequired.amount) {
                const needed = newRequired.amount - stored;
                const reactionRepeats = Math.ceil(needed / r.output.amount);
                const extra = reactionRepeats * r.output.amount - needed;
                storage[newRequired.name] = extra;
                r.input.forEach(i => {
                    const newIngredient = new Ingredient(i.amount * reactionRepeats, i.name);
                    required.push(newIngredient);
                })
            }    
        }
        
    }

    console.log(oreCount);

}

type Storage = {[name: string]: number};

function createFuel(fuelcount: number, storage: Storage): [Storage, number] {

    let required: Ingredient[] = [new Ingredient(fuelcount, "FUEL")];
        let oreCount = 0;
        while (required.length > 0) {
            let newRequired = required.pop(); // todo check for fuel
            if (newRequired.name == "ORE") {
                oreCount += newRequired.amount;
            } else {
                let r = reactions.find(r => r.output.name == newRequired.name); // find the reaction for the desired element

                const stored = storage[newRequired.name] ? storage[newRequired.name] : 0;
                storage[newRequired.name] = storage[newRequired.name] - newRequired.amount; // withdraw from the storage
        
                if (stored < newRequired.amount) {
                    const needed = newRequired.amount - stored;
                    const reactionRepeats = Math.ceil(needed / r.output.amount);
                    const extra = reactionRepeats * r.output.amount - needed;
                    storage[newRequired.name] = extra;
                    r.input.forEach(i => {
                        const newIngredient = new Ingredient(i.amount * reactionRepeats, i.name);
                        required.push(newIngredient);    
                    })
                }    
            }
        }

        return [storage, oreCount]; 
}

function part2() {
    let availableOre = 1000000000000;
    let fuelCount = 0;
    let initialFuelCount = 10000;
    let lastStorageState: Storage = {};
    while (availableOre > 0) {
        let [newStorage, usedOre] = createFuel(initialFuelCount, _.cloneDeep(lastStorageState));
        if (availableOre - usedOre < 0) {
            break;
        } else {
            availableOre -= usedOre;
            lastStorageState = newStorage;
            fuelCount += initialFuelCount;
        }
    }
    while (availableOre > 0) {
        let [newStorage, usedOre] = createFuel(1, lastStorageState);
        availableOre -= usedOre;
        lastStorageState = newStorage;
        fuelCount += 1;
    }

    return fuelCount - 1;
}


part1();
console.time();
const res = part2();
console.timeEnd();
console.log(res);