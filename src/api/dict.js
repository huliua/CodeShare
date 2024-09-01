import request from '@/utils/request';

export function getDictByDictCode(dictCode, cache = true) {
    return request({
        url: '/dict/getDictByDictCode',
        method: 'get',
        params: { dictCode: dictCode, cache: cache }
    });
}
