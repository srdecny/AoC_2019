import {getLines, range, countCharacter} from "../utils";
const chalk = require("chalk")

let lines = getLines("input.txt");
const width = 25;
const height = 6;
const layerPixels = width * height;

function getLayers(input: string): string[] {
    const layerCount = input.length / layerPixels;
    return range(0, layerCount - 1).map(index => {
        return input.substr(index * layerPixels, layerPixels);
    })
}

function part1(): number {
    const layers = getLayers(lines[0]);
    const comparer = (first: string, second: string): number => {
        return countCharacter(first, "0") > countCharacter(second, "0") ? 1 : -1
    }

    let l = layers.sort(comparer)[0];
    return countCharacter(l, "1") * countCharacter(l, "2");
}

function part2(): void {
    const layers = getLayers(lines[0]);

    const calculatePixel = (pixel: string[]): string => {

        for (let i = 0; i < pixel.length; i++) {
            if (pixel[i] == "0" || pixel[i] == "1") {
                return pixel[i];
            }
        }

        return "2";
    }

    const formattedPixel = range(0, layerPixels - 1).map(i => {
        const pixel = layers.map(layer => layer[i]);
        return calculatePixel(pixel);
    }).join("");

    range(0, height - 1).forEach(i => {
        const row = formattedPixel.substr(i * width, width)
        row.split("").forEach(c => {
            if (c == "0") {
                process.stdout.write(chalk.black(c));
            } else {
                process.stdout.write(chalk.white(c));
            }
        })
        console.log();
    })


}

console.log(part1());
part2();