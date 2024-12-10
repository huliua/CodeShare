import { defineStore } from 'pinia';
import { getDictByDictCode } from '@/api/dict';

export const useDictStore = defineStore('dict', {
    state: () => {
        return {
            dictMap: {}
        };
    },
    actions: {
        initDict: async function (dictNames, cache = true) {
            if (typeof dictNames == 'string') {
                dictNames = [dictNames];
            }
            // 过滤掉已经存在的字典
            if (cache) {
                dictNames = dictNames.filter(dictName => !this.dictMap[dictName]);
            }
            if (dictNames.length === 0) {
                return new Promise(resolve => resolve());
            }
            const res = await Promise.all(dictNames.map(dictName_1 => getDictByDictCode(dictName_1)));
            res.forEach((item, index) => {
                this.dictMap[dictNames[index]] = item.data;
            });
        },
        getDict: async function (dictName) {
            await this.initDict(dictName);
            return this.dictMap[dictName];
        },
        reloadDict: function (...dictNames) {
            this.initDict(dictNames, true);
        }
    }
});
