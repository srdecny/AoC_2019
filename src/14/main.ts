import {getLines} from "../utils";
import * as _ from "lodash";

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

function part1() {
    const reactions = getReactions();
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

function part2() {
    const reactions = getReactions();
    const storage: {[name: string]: number} = {};
    let required: Ingredient[] = [new Ingredient(1, "FUEL")];
    let availableOre = 1000000000000;
    let fuelCount = 0;
    while (availableOre >= 0) {
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
        availableOre -= oreCount;
        fuelCount++;
        required = [new Ingredient(1, "FUEL")];
    }

    console.log(fuelCount - 1); // loop ends when available ore is zero, thus the last iteration was not possible

}


part1();
console.time();
part2();
console.timeEnd();