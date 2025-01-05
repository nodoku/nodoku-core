export namespace NodokuCoreTailwind {
    export function tailwindConfig(nodeModules: string = "./node_modules"): string[] {
        return [
            `./${nodeModules}/nodoku-core/esm/**/*.js`,
            `./${nodeModules}/nodoku-core/esm/**/*.jsx`,
        ]
    }

}