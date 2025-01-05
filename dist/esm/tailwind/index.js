export var NodokuCoreTailwind;
(function (NodokuCoreTailwind) {
    function tailwindConfig(nodeModules = "./node_modules") {
        return [
            `./${nodeModules}/nodoku-core/esm/**/*.js`,
            `./${nodeModules}/nodoku-core/esm/**/*.jsx`,
        ];
    }
    NodokuCoreTailwind.tailwindConfig = tailwindConfig;
})(NodokuCoreTailwind || (NodokuCoreTailwind = {}));
