#!/usr/bin/env node
import { register } from 'node:module';
import { ComponentDef, Manifest } from "../content/manifest.js";
import fs from "node:fs";
import path from "path";
import Mustache from "mustache";
register('./import-load-hooks.js', import.meta.url);
/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/visual-schema.json.mtl")).default;
function loadComponents(dir) {
    const comps = new Map();
    const files = fs.readdirSync(dir);
    console.log("reading ...", dir);
    for (const f of files) {
        const stat = fs.statSync(`${dir}/${f}`);
        if (stat.isDirectory()) {
            const m = loadComponentsByManifest(`${dir}/${f}`, f);
            if (m) {
                comps.set(f, m);
            }
        }
    }
    return comps;
}
function loadComponentsByManifest(dir, moduleName) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const stat = fs.statSync(`${dir}/${f}`);
        if (stat.isFile()) {
            if (f == "nodoku.manifest.json") {
                const manifest = new Manifest(moduleName);
                console.log("found manifest ", `${dir}/${f}`, "reading...");
                let json;
                if (stat.isSymbolicLink()) {
                    json = JSON.parse(fs.readlinkSync(`${dir}/nodoku.manifest.json`));
                }
                else {
                    json = JSON.parse(fs.readFileSync(`${dir}/nodoku.manifest.json`).toString());
                }
                console.log("loaded manifest ", path.resolve(dir, f));
                console.log("found manifest json ", json);
                manifest.namespace = json.namespace;
                Object.keys(json.components).forEach((k) => {
                    const v = json.components[k];
                    console.log("adding ", k, v);
                    // comps.set(k, Manifest.from(k, moduleName, v));
                    manifest.components.set(k, new ComponentDef(v.implementation, v.schemaFile));
                });
                return manifest;
            }
        }
    }
    return undefined;
}
class TemplateView {
    components = new Map();
}
function calculateTemplateView(schemaDestinationDir, dirNodeModules = undefined) {
    if (!dirNodeModules) {
        dirNodeModules = `${path.resolve()}/node_modules`;
    }
    const components = loadComponents(dirNodeModules);
    const tv = new TemplateView();
    components.forEach((m) => {
        m.components.forEach((cd, cn) => {
            const moduleDir = `${dirNodeModules}/${m.moduleName}`;
            const { content, dest } = readSchema(schemaDestinationDir, m.moduleName, moduleDir, cd.schemaFile);
            const resolvedContent = resolveRefsInSchema(content, m.moduleName, dirNodeModules, schemaDestinationDir, cd.schemaFile);
            const schemaFile = writeSchema(dest, resolvedContent);
            const res = schemaFile.startsWith(schemaDestinationDir) ? schemaFile.replace(stripTrailingSlash(schemaDestinationDir), ".") : schemaFile;
            tv.components.set(cn, res);
        });
    });
    const compSchemas = [];
    let i = 0;
    tv.components.forEach((v, k) => {
        compSchemas.push({ name: k, schema: v, isLast: i == tv.components.size - 1 });
        i++;
    });
    return { components: compSchemas };
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
function readSchema(schemaDestinationDir, moduleName, moduleDir, compSchema) {
    const moduleSchemaFile = `${stripTrailingSlash(moduleDir)}/${stripLeadingSlash(compSchema)}`;
    console.log("module dir", moduleDir);
    let destSchemaFile = `${moduleName}/${stripLeadingSlash(compSchema)}`;
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
    if (path.startsWith("/")) {
        return path.substring(1);
    }
    else if (path.startsWith("./")) {
        return path.substring(2);
    }
    return path;
}
export function generateVisualSchema() {
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
generateVisualSchema();
