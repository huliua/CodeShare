import request from '@/utils/request';

/**
 * 保存代码
 */
export function saveCodes(param) {
    return request({
        url: '/codeShare/saveCodes',
        headers: {
            needToken: true,
        },
        method: 'post',
        data: param
    });
}

/**
 * 删除代码
 */
export function deleteCodes(param) {
    return request({
        url: '/codeShare/deleteCodes',
        headers: {
            needToken: true,
        },
        method: 'post',
        data: param
    });
}

/**
 * 查询代码
 */
export function getCodes(param) {
    return request({
        url: '/codeShare/getCodes',
        headers: {
            needToken: true,
        },
        method: 'post',
        data: param
    });
}