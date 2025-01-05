import request from '@/utils/request';

// 创建分享
export function createShare(data) {
    return request({
        url: '/codeShare/createShare',
        method: 'post',
        data
    });
}

// 获取分享信息
export function getShareInfo(shareId) {
    return request({
        url: `/codeShare/share/${shareId}`,
        method: 'post'
    });
}

// 验证分享密码
export function getShareCodeDetail(shareId, password) {
    return request({
        url: `/codeShare/getShareCode/${shareId}`,
        method: 'post',
        data: {
            password
        }
    });
}
