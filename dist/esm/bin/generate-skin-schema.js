#!/usr/bin/env node
import { register } from 'node:module';
import fs from "node:fs";
import path from "path";
import Mustache from "mustache";
import { loadManifestsFromFolder } from "./manifest-loader.js";
register('./import-load-hooks.js', import.meta.url);
/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/visual-schema.json.hbs")).default;
function calculateTemplateView(schemaDestinationDir, dirNodeModules = undefined) {
    if (!dirNodeModules) {
        dirNodeModules = path.resolve("./node_modules");
    }
    const components = loadManifestsFromFolder(dirNodeModules);
    const tv = { components: new Map() };
    components.forEach((m) => {
        m.components.forEach((cd, cn) => {
            const moduleDir = `${dirNodeModules}/${m.moduleName}`;
            const themeSchema = resolveSchema(schemaDestinationDir, m.moduleName, moduleDir, cd.themeSchema, dirNodeModules);
            const optionsSchema = resolveSchema(schemaDestinationDir, m.moduleName, moduleDir, cd.optionsSchema, dirNodeModules);
            tv.components.set(cn, { themeSchema: themeSchema, optionsSchema: optionsSchema });
            /*
             * copy default-theme.yml
            */
            const compSchema = cd.themeSchema;
            const moduleSchemaFile = path.resolve(stripTrailingSlash(moduleDir), stripLeadingSlash(compSchema));
            const compDefaultYaml = cd.defaultThemeFile;
            // const moduleDefaultYamlFile = path.resolve(path.dirname(moduleSchemaFile), stripLeadingSlash(compDefaultYaml));
            const moduleDefaultYamlFile = path.resolve(stripTrailingSlash(moduleDir), stripLeadingSlash(compDefaultYaml));
            let stat = undefined;
            try {
                stat = fs.statSync(moduleDefaultYamlFile);
                console.log("defaultYamlFilePath", moduleDefaultYamlFile);
                if (stat.isFile()) {
                    let destSchemaFile = path.resolve(m.moduleName, compSchema);
                    console.log("compSchema", compSchema);
                    const dest = path.resolve(schemaDestinationDir, themeSchema);
                    const yamlFileName = path.basename(moduleDefaultYamlFile);
                    console.log("copying default-theme.yml", yamlFileName, schemaDestinationDir, destSchemaFile, moduleDefaultYamlFile, dest, path.dirname(dest));
                    fs.copyFile(moduleDefaultYamlFile, path.resolve(path.dirname(dest), yamlFileName), (err) => { });
                }
            }
            catch (e) {
                console.log("defaultYamlFilePath file not found ", moduleDefaultYamlFile);
            }
        });
    });
    const compSchemas = [];
    let i = 0;
    tv.components.forEach((v, k) => {
        compSchemas.push({ name: k, schema: v.themeSchema, options: v.optionsSchema, isLast: i == tv.components.size - 1 });
        i++;
    });
    return { components: compSchemas };
}
function resolveSchema(schemaDestinationDir, moduleName, moduleDir, schemaFileLoc, dirNodeModules) {
    if (!schemaFileLoc) {
        return undefined;
    }
    const { content, dest } = readSchema(schemaDestinationDir, moduleName, moduleDir, schemaFileLoc);
    const resolvedContent = resolveRefsInSchema(content, moduleName, dirNodeModules, schemaDestinationDir, schemaFileLoc);
    const schemaFile = writeSchema(dest, resolvedContent);
    const res = schemaFile.startsWith(schemaDestinationDir) ? schemaFile.replace(stripTrailingSlash(schemaDestinationDir), ".") : schemaFile;
    return res;
}
function resolveRefsInSchema(schemaFileContent, moduleName, dirNodeModules, schemaDestinationDir, schemaFileRelativeToModuleDir) {
    const regex = /\s*"\$ref": "(.*)"/;
    const refs = [];
    for (const line of schemaFileContent.split("\n")) {
        const matched = regex.exec(line);
        if (matched) {
            let ref = matched[1];
            if (ref.indexOf("#") >= 0) {
                ref = ref.substring(0, ref.indexOf("#"));
            }
            if (ref.length > 0) {
                refs.push(ref);
            }
        }
    }
    const correctedRefs = new Map();
    refs.forEach(r => {
        correctedRefs.set(r, resolveRef(r, moduleName, dirNodeModules, schemaDestinationDir, schemaFileRelativeToModuleDir));
    });
    let res = schemaFileContent;
    correctedRefs.forEach((v, k) => {
        console.log("replacing ref", k, "by", v);
        res = res.replaceAll(k, v);
    });
    return res;
}
function resolveRef(ref, moduleName, dirNodeModules, schemaDestinationDir, schemaFileRelativeToModuleDir) {
    const isAbsolute = path.isAbsolute(ref);
    if (isAbsolute) {
        return ref;
    }
    let relativeSchemaFileLocation = schemaFileRelativeToModuleDir;
    if (schemaFileRelativeToModuleDir.endsWith(".json")) {
        relativeSchemaFileLocation = schemaFileRelativeToModuleDir.substring(0, schemaFileRelativeToModuleDir.lastIndexOf("/"));
    }
    const fileName = `${schemaDestinationDir}/${relativeSchemaFileLocation}/${ref}`;
    let stat = undefined;
    try {
        console.log("searching for ref file: ", path.resolve(fileName));
        stat = fs.statSync(path.resolve(fileName));
    }
    catch (e) {
        // file doesn't exist
    }
    if (stat && stat.isFile()) {
        console.log("file is found");
        return ref;
    }
    const k = ref.indexOf("node_modules");
    if (k >= 0) {
        const schemaFileDir = path.resolve(`${schemaDestinationDir}/${moduleName}/${relativeSchemaFileLocation}`);
        const relativePathToNodeModules = path.relative(schemaFileDir, dirNodeModules);
        console.log("resolving diff: schemaFileDir", schemaFileDir, "dirNodeModules", dirNodeModules, "relative path", relativePathToNodeModules);
        ref = `${relativePathToNodeModules}/${stripLeadingSlash(ref.substring(k + "node_modules".length))}`;
    }
    ref = ref.replaceAll("\\", "/");
    console.log("returning ref", ref);
    return ref;
}
function readSchema(schemaDestinationDir, moduleName, moduleDir, schemaFileLoc) {
    // const moduleSchemaFile = `${stripTrailingSlash(moduleDir)}/${stripLeadingSlash(schemaFileLoc)}`;
    const moduleSchemaFile = path.resolve(moduleDir, schemaFileLoc);
    console.log("module dir", moduleDir);
    let destSchemaFile = `${moduleName}/${stripLeadingSlash(schemaFileLoc)}`;
    const dest = `${schemaDestinationDir}/${destSchemaFile}`;
    const moduleSchemaFilePath = moduleSchemaFile.replaceAll("/", "\\");
    const stat = fs.statSync(moduleSchemaFilePath);
    let content;
    if (stat.isSymbolicLink()) {
        content = fs.readlinkSync(moduleSchemaFile);
    }
    else {
        content = fs.readFileSync(moduleSchemaFile).toString();
    }
    console.log("read content of file:", moduleSchemaFilePath, ", to be copied to", dest);
    return { content, dest };
}
function writeSchema(dest, content) {
    console.log("dest", dest);
    const destSchemaDir = dest.substring(0, dest.lastIndexOf("/"));
    fs.mkdirSync(destSchemaDir, { recursive: true });
    fs.writeFileSync(path.resolve(dest), content);
    return dest;
}
function stripTrailingSlash(path) {
    if (path.endsWith("/")) {
        return path.substring(0, path.length - 1);
    }
    return path;
}
function stripLeadingSlash(path) {
    if (path && path.startsWith("/")) {
        return path.substring(1);
    }
    else if (path && path.startsWith("./")) {
        return path.substring(2);
    }
    return path;
}
export function generateSkinSchema() {
    const args = process.argv.slice(2);
    const dir = path.resolve();
    const schemaSrc = args[0] ? args[0] : "./schemas";
    console.log("generating visual schema");
    const view = calculateTemplateView(schemaSrc);
    const output = Mustache.render(template, view);
    const fileName = `${dir}/${schemaSrc}/visual-schema.json`;
    fs.writeFile(fileName, output, err => {
        if (err) {
            return console.error(err);
        }
        console.log(`${fileName}: File created!`);
    });
}
generateSkinSchema();
