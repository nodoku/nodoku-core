#!/usr/bin/env node
import fs from "node:fs";
import path from "path";
import yaml from "js-yaml";

async function generateComponentDefaultTheme() {

    console.log("generating default theme")

    const dir = path.resolve("./dist/esm/components");
    const dirSchema = path.resolve("./dist/schemas/components");

    const components: string[] = fs.readdirSync(dir);

    console.log("components", components);

    Promise.all(components.map(async compo => {
        const defaultTheme = (await import(`file:${path.resolve(dir, compo, compo + "-theme.js")}`)).default

        console.log("defaultTheme", defaultTheme);

        const yamlContent = yaml.dump(defaultTheme, {
            indent: 4,
            lineWidth: 5000
        })

        console.log("yaml default theme", compo, yamlContent)

        fs.writeFileSync(path.resolve(dirSchema, compo, "default-theme.yml"), yamlContent)

        return null
    }))

}

await generateComponentDefaultTheme();