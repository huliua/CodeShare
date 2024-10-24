export function isBlank(obj) {
    return typeof obj === 'undefined' || obj == null || (typeof obj === 'string' && obj.trim().length === 0);
}

export function tansParams(params) {
    let result = '';
    for (const propName of Object.keys(params)) {
        const value = params[propName];
        var part = encodeURIComponent(propName) + '=';
        if (value !== null && value !== '' && typeof value !== 'undefined') {
            if (typeof value === 'object') {
                for (const key of Object.keys(value)) {
                    if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
                        let params = propName + '[' + key + ']';
                        var subPart = encodeURIComponent(params) + '=';
                        result += subPart + encodeURIComponent(value[key]) + '&';
                    }
                }
            } else {
                result += part + encodeURIComponent(value) + '&';
            }
        }
    }
    return result;
}

// 首字母转大写
export function firstUpperCase(str) {
    return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return $1.toUpperCase() + $2;
    });
}

/**
 * 生成uuid
 */
export function getUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * TODO 加密
 */
export function encrypt(str) {
    console.log('加密密码......');
    return str;
}