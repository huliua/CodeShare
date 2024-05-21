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