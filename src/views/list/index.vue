<script setup>
    import { Refresh, Search, Star, StarFilled } from '@element-plus/icons-vue';
    import { favourCode, getCodesList } from '@/api/codeShare';
    import { useRouter } from 'vue-router';
    import { onActivated } from 'vue';
    import { useDictStore } from '@/store/dictStore.js';

    const dictStore = useDictStore();
    const router = useRouter();
    const dataList = ref([]);
    const loading = ref(false);
    const pageSize = ref(10);
    const pageNum = ref(1);
    const total = ref(0);
    // 标签字典
    const tagDictList = ref([]);
    onActivated(async () => {
        // 初始化字典数据
        tagDictList.value = await dictStore.getDict('t_tag');
    });

    const queryRef = ref(null);
    // 查询条件模型
    const queryParams = ref({
        title: '',
        tag: [],
        createTime: [],
        nickname: '',
        updateTime: []
    });

    const resetQuery = function () {
        queryRef.value.resetFields();
        getDataList();
    };

    /**
     * 获取数据列表
     */
    const getDataList = function () {
        loading.value = true;
        getCodesList({
            pageSize: pageSize.value,
            pageNum: pageNum.value,
            ...queryParams.value
        }).then(res => {
            dataList.value = res.data.rows;
            total.value = res.data.total;
            loading.value = false;
        });
    };

    /**
     * 改变收藏状态
     */
    const changeFavo = function (item) {
        favourCode({
            id: item.id,
            operateType: item.hasStared ? 'undo_favorite' : 'favorite'
        }).then(() => {
            item.hasStared = !item.hasStared;
            ElMessage.success(item.hasStared ? '收藏成功' : '取消成功');
        });
    };

    /**
     * 跳转到编辑页面
     */
    const goEdit = function (item) {
        if (item.id) {
            router.push({ path: `edit/${item.id}` });
        } else {
            router.push({ path: '/index' });
        }
    };

    /**
     * 跳转到详情页面
     */
    const goDetail = function (item) {
        if (item.id) {
            router.push({ path: `detail/${item.id}` });
        } else {
            router.push({ path: '/index' });
        }
    };

    const changeHover = function (item, isHover) {
        item.isHover = isHover;
    };

    const getIsHover = function (item) {
        return item.isHover;
    };

    // 激活的时候加载数据
    onActivated(() => {
        getDataList();
    });
</script>

<template>
    <el-backtop :right="100" :bottom="100" />
    <!-- 查询条件区域 -->
    <el-form ref="queryRef" :model="queryParams" :inline="true">
        <el-form-item label="标题" prop="title">
            <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="getDataList" />
        </el-form-item>
        <el-form-item label="标签" prop="tag">
            <el-select v-model="queryParams.tag" multiple placeholder="请选择标签" collapse-tags collapse-tags-tooltip clearable style="width: 200px">
                <el-option v-for="dict in tagDictList" :key="dict.code" :label="dict.name" :value="dict.code" />
            </el-select>
        </el-form-item>
        <el-form-item label="创建人昵称" prop="nickname">
            <el-input v-model="queryParams.nickname" placeholder="请输入创建人昵称" clearable style="width: 200px" @keyup.enter="getDataList" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
            <el-date-picker v-model="queryParams.createTime" is-range format="YYYY-MM-DD HH:mm:ss" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="更新时间" prop="updateTime">
            <el-date-picker v-model="queryParams.updateTime" is-range format="YYYY-MM-DD HH:mm:ss" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
        </el-form-item>
    </el-form>
    <el-row justify="center" align="middle">
        <el-button type="primary" :icon="Search" @click="getDataList">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery()">重置</el-button>
    </el-row>
    <el-divider border-style="dashed" />

    <!-- 数据展示区域 -->
    <el-space v-show="dataList.length > 0" wrap>
        <el-card v-for="item in dataList" :key="item.id" class="box-card" shadow="hover" @mouseenter="changeHover(item, true)" @mouseleave="changeHover(item, false)">
            <template #header>
                <div class="card-header">
                    <div class="card-header-title">
                        <el-text size="large" truncated>{{ item.title || '' }}</el-text>
                    </div>
                    <div class="card-header-desciption">
                        <el-text size="small" line-clamp="1" truncated style="text-wrap: wrap">创建人：{{ item.nickname || '' }}</el-text>
                        <br />
                        <el-text size="small" line-clamp="1" truncated style="text-wrap: wrap">创建时间：{{ item.createTime || '' }}</el-text>
                    </div>
                </div>
            </template>
            <template #default>
                <div class="card-header-desciption">
                    <el-tooltip :content="item.description || ''" :show-after="1500">
                        <el-text size="small" line-clamp="2" truncated style="text-wrap: wrap">{{ item.description || '' }}</el-text>
                    </el-tooltip>
                </div>
                <div style="text-align: center; width: 100%; height: calc(100% - 42px)">
                    <el-image v-if="item.cover" style="height: 160px" :src="'https://' + (item.cover || '')" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :preview-src-list="['https://' + (item.cover || '')]" :hide-on-click-modal="true" fit="contain" />
                    <el-image v-else style="height: 160px" :src="'../../src/assets/images/code.png'" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :preview-src-list="['../../src/assets/images/code.png']" :hide-on-click-modal="true" fit="contain" />
                </div>
                <div v-show="getIsHover(item)" class="card-bottom">
                    <div class="button-group">
                        <el-button v-show="!item.hasStared" link :icon="Star" @click="changeFavo(item)"></el-button>
                        <el-button v-show="item.hasStared" link style="font-size: 16px" @click="changeFavo(item)">
                            <template #icon>
                                <el-icon>
                                    <StarFilled color="gold" />
                                </el-icon>
                            </template>
                        </el-button>
                        <el-button link color="var(--el-color-primary-dark-2)" @click="goDetail(item)">查看</el-button>
                    </div>
                </div>
            </template>
        </el-card>
    </el-space>
    <el-row v-if="dataList.length > 0" class="pagination">
        <el-col :span="24">
            <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]" size="small" layout="sizes, prev, pager, next" :total="total" @size-change="getDataList" @current-change="getDataList" />
        </el-col>
    </el-row>
    <el-empty v-show="dataList.length === 0" description="暂无数据" />
</template>

<style scoped>
    .box-card {
        position: relative;
        width: 250px;
        min-height: 240px;
    }

    .card-header-title {
        margin-bottom: 5px;
        color: var(--el-text-color-primary);
        font-weight: 600;
    }

    .card-header-desciption {
        min-height: 42px;
        margin-bottom: 5px;
        color: var(--el-text-color-secondary);
    }

    .card-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 30px;
        background: #337ecc73;
    }

    .card-bottom .button-group {
        display: flex;
        justify-content: flex-end;
        height: 100%;
        padding: 0 18px;
    }

    .pagination {
        margin-top: 20px;
        text-align: center;
    }
</style>
