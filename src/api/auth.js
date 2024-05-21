import request from '@/utils/request';

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