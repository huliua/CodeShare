import request from '@/utils/request';

/**
 * 登录
 * @param {Object} param 登录表单信息
 */
export function login(param) {
    return request({
        url: '/auth/login',
        headers: {
            needToken: false,
        },
        method: 'post',
        data: param
    });
}

/**
 * 登出
 */
export function logout() {
    return request({
        url: '/auth/logout',
        headers: {
            needToken: true,
        },
        method: 'post'
    });
}

export function getUserInfo() {
    return request({
        url: '/auth/getUserInfo',
        headers: {
            needToken: true
        },
        method: 'post'
    });
}


// 刷新token
export async function refreshToken() {
    await request({
        url: '/user/refreshToken',
        method: 'post',
        headers: {
            needToken: false,
        },
        _isRefreshTokenRequest: true,
    }).then(res => {
        if (res.data) {
            setToken(res.data);
        }
    });
}