export function mergeTheme(theme, defaultTheme) {
    if (!theme) {
        return defaultTheme;
    }
    const newTheme = deepCopy(theme);
    return mergeObjectsRecursively_object(newTheme, defaultTheme);
}
// function mergeObjectsRecursively<T extends object>(obj: T, defaultObj: T): T {
//
//     if (!obj && !defaultObj) {
//         return defaultObj;
//     }
//     if (!obj) {
//         obj = {} as T;
//     }
//
//     console.log("received default: ", defaultObj, defaultObj ? Object.keys(defaultObj) : defaultObj)
//     console.log("received theme: ", obj, obj ? Object.keys(obj) : obj)
//
//     type userKeyType  = keyof T;
//     // for (let k in defaultObj) {
//     const keys = Object.keys(defaultObj)
//     for (let i = 0; i < keys.length; i++) {
//
//         const ke: string = keys[i];
//         console.log(" this is k", kk)
//
//         // const key: keyof T = k as userKeyType;
//         if (typeof defaultObj[ke]) {
//             console.log("merging ", key)
//             type l = typeof defaultObj[typeof key] & object;
//             obj[key] = mergeObjectsRecursively<l>(obj[key] as l, defaultObj[key] as l)
//         } else if (Array.isArray(defaultObj[kk])) {
//             console.log("merging array", key)
//             // type l = typeof defaultObj[typeof key];
//             const resArr = []
//             for (let i = 0; i < defaultObj[key].length; i++) {
//                 type keyItem = keyof (typeof defaultObj[typeof key][typeof i]);
//                 type l = typeof defaultObj[key][typeof i];
//                 resArr.push(mergeObjectsRecursively<l>(obj[key][i] as l, defaultObj[key][i] as l));
//             }
//             obj[key] = resArr;
//         } else {
//             obj[key] = obj[key] ? obj[key] : defaultObj[key];
//         }
//     }
//
//     return obj;
//
// }
function mergeObjectsRecursively_object(obj, defaultObj) {
    if (!obj && !defaultObj) {
        return defaultObj;
    }
    if (!obj) {
        obj = {};
    }
    for (let k in defaultObj) {
        const key = k;
        if (typeof defaultObj[key] === "object") {
            obj[key] = mergeObjectsRecursively_object(obj[key], defaultObj[key]);
        }
        else if (Array.isArray(defaultObj[key])) {
            obj[key] = mergeObjectsRecursively_array(obj[key], defaultObj[key]);
        }
        else {
            obj[key] = (obj[key] && ("" + obj[key]).length > 0) ? obj[key] : defaultObj[key];
        }
    }
    return obj;
}
function mergeObjectsRecursively_array(obj, defaultObj) {
    if (!obj && !defaultObj) {
        return defaultObj;
    }
    if (!obj) {
        obj = [];
    }
    // console.log("received default array: ", defaultObj, defaultObj ? Object.keys(defaultObj) : defaultObj)
    // console.log("received theme array: ", obj, obj ? Object.keys(obj) : obj)
    const res = [];
    for (let i = 0; i < Math.max(obj.length, defaultObj.length); i++) {
        const o = i < obj.length ? obj[i] : {};
        const d = i < defaultObj.length ? defaultObj[i] : {};
        const l = mergeObjectsRecursively_object(o, d);
        res.push(l);
    }
    return res;
}
/*
 * https://stackoverflow.com/questions/28150967/typescript-cloning-object
 */
function deepCopy(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj)
        return obj;
    // Handle Date
    if (obj instanceof Date) {
        const copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
        const copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }
    const copy = {};
    for (var attr in obj) {
        copy[attr] = deepCopy(obj[attr]);
        // }
    }
    return copy;
}
