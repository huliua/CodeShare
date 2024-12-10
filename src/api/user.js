import request from '@/utils/request';

export function getUserInfo() {
    return request({
        url: '/auth/getUserInfo',
        headers: {
            needToken: true
        },
        method: 'post'
    });
}

export function updateUserInfo(data) {
    return request({
        url: '/user/update',
        headers: {
            needToken: true
        },
        method: 'post',
        data
    });
}

export function changePassword(data) {
    return request({
        url: '/user/changePassword',
        headers: {
            needToken: true
        },
        method: 'post',
        data
    });
}
