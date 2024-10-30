import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

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
 * 加密字符串,使用aes加密
 */
export function encryptByAes(str) {
    const secretKey = CryptoJS.enc.Utf8.parse('codeShare-huliua');
    const iv = CryptoJS.enc.Utf8.parse('codeShare-huliua');
    const encrypted = CryptoJS.AES.encrypt(str, secretKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

// 生成 RSA 密钥对  
export function generateKeyPair() {
    const crypt = new JSEncrypt();
    const publicKey = crypt.getPublicKey();
    const privateKey = crypt.getPrivateKey();
    return { publicKey, privateKey };
}

/**
 * 使用rsa加密
 * @param {string} str 待加密的字符串
 * @returns 加密后的字符串
 */
export function encryptByRsa(str, publicKey) {
    const crypt = new JSEncrypt();
    crypt.setPublicKey(publicKey);
    return crypt.encrypt(str);
}
