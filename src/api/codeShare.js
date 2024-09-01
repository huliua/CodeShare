import request from '@/utils/request';

/**
 * 保存代码
 */
export function saveCodes(param) {
    return request({
        url: '/codeShare/saveCodes',
        headers: {
            needToken: true
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
            needToken: true
        },
        method: 'post',
        data: param
    });
}

/**
 * 查看代码库
 */
export function getCodesList(param) {
    return request({
        url: '/codeShare/getCodesList',
        headers: {
            needToken: true
        },
        method: 'post',
        data: param
    });
}

/**
 * 查询我的代码
 */
export function getMyCodesList(param) {
    return request({
        url: '/codeShare/getMyCodesList',
        headers: {
            needToken: true
        },
        method: 'post',
        data: param
    });
}

/**
 * 获取我的收藏代码
 */
export function getMyFavourList(param) {
    return request({
        url: '/codeShare/getMyFavourList',
        headers: {
            needToken: true
        },
        method: 'post',
        data: param
    });
}

/**
 * 收藏/取消收藏代码
 */
export function favourCode(params) {
    return request({
        url: '/codeShare/favourCode',
        headers: {
            needToken: true
        },
        method: 'post',
        data: params
    });
}

export function getCodeShare(id) {
    return request({
        url: `/codeShare/getCodeShare/${id}`,
        headers: {
            needToken: true
        },
        method: 'post'
    });
}
