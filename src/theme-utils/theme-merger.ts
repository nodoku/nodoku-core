
export function mergeTheme<Theme extends object>(theme: Theme | undefined, defaultTheme: Theme): Theme {

    if (!theme) {
        return  defaultTheme
    }

    const newTheme = deepCopy(theme);

    return mergeObjectsRecursively_object<Theme>(newTheme, defaultTheme);
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

function mergeObjectsRecursively_object<T extends object>(obj: T, defaultObj: T): T {

    if (!obj && !defaultObj) {
        return defaultObj;
    }
    if (!obj) {
        obj = {} as T;
    }

    // console.log("received default: ", defaultObj, defaultObj ? Object.keys(defaultObj) : defaultObj)
    // console.log("received theme: ", obj, obj ? Object.keys(obj) : obj)

    type userKeyType  = keyof T;
    for (let k in defaultObj) {

        const key: keyof T = k as userKeyType;
        if (typeof defaultObj[key] === "object") {
            // console.log("merging ", key)
            type l = typeof defaultObj[typeof key] & object;
            obj[key] = mergeObjectsRecursively_object<l>(obj[key] as l, defaultObj[key] as l)
        } else if (Array.isArray(defaultObj[key])) {
            type ElementType = (typeof defaultObj[typeof key] extends (infer U)[] ? U : never) & object;
            obj[key] = mergeObjectsRecursively_array<ElementType>(obj[key] as ElementType[], defaultObj[key]) as T[keyof T];
        } else {
            obj[key] = obj[key] ? obj[key] : defaultObj[key];
        }
    }

    return obj;

}

function mergeObjectsRecursively_array<T extends object>(obj: T[], defaultObj: T[]): T[] {

    if (!obj && !defaultObj) {
        return defaultObj;
    }
    if (!obj) {
        obj = [] as T[];
    }

    // console.log("received default array: ", defaultObj, defaultObj ? Object.keys(defaultObj) : defaultObj)
    // console.log("received theme array: ", obj, obj ? Object.keys(obj) : obj)

    const res: T[] = [];

    for (let i = 0; i < Math.max(obj.length, defaultObj.length); i ++) {

        const o: T = i < obj.length ? obj[i] : {} as T;
        const d: T = i < defaultObj.length ? defaultObj[i] : {} as T;

        const l = mergeObjectsRecursively_object(o, d);
        res.push(l);

    }

    return res;

}

/*
 * https://stackoverflow.com/questions/28150967/typescript-cloning-object
 */
function deepCopy<T extends object>(obj: T): T {

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        const copy = new Date();
        copy.setTime(obj.getTime());
        return copy as T;
    }

    // Handle Array
    if (obj instanceof Array) {
        const copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy as T;
    }

    // Handle Object
    type ResType = {
        [key: string]: any
    }
    const copy: ResType = {};
    for (var attr in obj) {
        // if (obj.hasOwnProperty(attr)) {
        type l = typeof obj[typeof attr] & object;
        copy[attr] = deepCopy<l>(obj[attr] as l);
        // }
    }
    return copy as T;

}

