import { isBoolean, isObject, isRegExp } from 'lodash';

import { toArray, toRegExp, toBoolean, toInteger, toObject } from '../converters';

export default function automatic(value) {
    if (isBoolean(value)) {
        return (input) => toBoolean(input);
    } else if (isRegExp(value)) {
        return toRegExp;
    } else if (Array.isArray(value)) {
        // Take the first value in the array to decide what converter to use
        const converter = value.length > 0 ?
            automatic(value[0]) : undefined;
        return toArray(converter);
    } else if (Number.isInteger(value)) {
        return toInteger;
    } else if (isObject(value)) {
        return toObject;
    }

    return (input) => input;
}
