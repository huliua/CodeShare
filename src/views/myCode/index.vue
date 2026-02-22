<script setup>
    import { ArrowDown, CirclePlus, Refresh, Search, Star, StarFilled, WarnTriangleFilled } from '@element-plus/icons-vue';
    import { deleteCode, downloadCode, favourCode, genCode, getMyCodesList } from '@/api/codeShare';
    import { useRouter } from 'vue-router';
    import { onActivated } from 'vue';
    import { useDictStore } from '@/store/dictStore.js';
    import ShowCodeDialog from '@/components/ShowCodeDialog/index.vue';
    import GenCodeDialog from '@/components/GenCodeDialog/index.vue';

    const dictStore = useDictStore();
    const router = useRouter();
    const dataList = ref([]);
    const loading = ref(false);
    const pageSize = ref(10);
    const pageNum = ref(1);
    const total = ref(0);
    const showAdvanced = ref(false);
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
        createTime: []
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
        getMyCodesList({
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

    /**
     * 删除代码
     * @param item
     */
    const doDelete = function (item) {
        deleteCode(item.id).then(res => {
            ElMessage({
                message: '删除成功',
                type: 'success',
                showClose: true
            });
            getDataList();
        });
    };

    const changeHover = function (item, isHover) {
        item.isHover = isHover;
    };
    const getIsHover = function (item) {
        return item.delConfirmVisible || item.isHover;
    };

    // 激活的时候加载数据
    onActivated(() => {
        getDataList();
    });

    defineOptions({
        name: 'My'
    });

    // 生成代码相关
    const genCodeDialogVisible = ref(false);
    const genCodeId = ref('');
    const showTemplateField = function (item) {
        genCodeId.value = item.id;
        genCodeDialogVisible.value = true;
    };
    // 展示代码相关
    const showCodeDialogVisible = ref(false);
    const codeFiles = ref([]);
    const doGenCode = function (formVal) {
        genCodeDialogVisible.value = false;
        genCode(genCodeId.value, formVal).then(res => {
            ElMessage.success('生成成功');
            codeFiles.value = res.data;
            showCodeDialogVisible.value = true;
        });
    };
    const doDownload = function (formVal) {
        downloadCode(genCodeId.value, formVal).then(res => {
            const url = window.URL.createObjectURL(res.content);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = res.filename || '代码文件.zip';

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };
</script>

<template>
    <div class="list-page">
        <el-backtop :right="40" :bottom="40" />

        <!-- Page Header -->
        <div class="page-header">
            <h2 class="page-title">我的代码</h2>
            <p class="page-desc">管理你创建的代码片段和模板</p>
        </div>

        <!-- Search Panel -->
        <div class="search-panel">
            <el-form ref="queryRef" :model="queryParams" :inline="true" class="search-form">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 180px" @keyup.enter="getDataList" />
                </el-form-item>
                <el-form-item label="标签" prop="tag">
                    <el-select v-model="queryParams.tag" multiple placeholder="请选择标签" collapse-tags collapse-tags-tooltip clearable style="width: 180px">
                        <el-option v-for="dict in tagDictList" :key="dict.code" :label="dict.name" :value="dict.code" />
                    </el-select>
                </el-form-item>
                <template v-if="showAdvanced">
                    <el-form-item label="代码模板" prop="isTemplate">
                        <el-select v-model="queryParams.isTemplate" multiple placeholder="请选择" clearable style="width: 130px">
                            <el-option label="是" value="1" />
                            <el-option label="否" value="0" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="创建时间" prop="createTime">
                        <el-date-picker v-model="queryParams.createTime" is-range format="YYYY-MM-DD HH:mm:ss" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="-" start-placeholder="开始" end-placeholder="结束" />
                    </el-form-item>
                </template>
            </el-form>
            <div class="search-actions">
                <el-button type="primary" :icon="Search" @click="getDataList">搜索</el-button>
                <el-button :icon="Refresh" @click="resetQuery()">重置</el-button>
                <el-button link type="primary" @click="showAdvanced = !showAdvanced">
                    {{ showAdvanced ? '收起' : '高级搜索' }}
                    <el-icon class="toggle-icon" :class="{ 'is-expanded': showAdvanced }"><ArrowDown /></el-icon>
                </el-button>
            </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="card-grid">
            <div v-for="n in pageSize" :key="'sk' + n" class="code-card skeleton-card">
                <el-skeleton animated>
                    <template #template>
                        <el-skeleton-item variant="image" style="height: 140px" />
                        <div style="padding: 14px 16px">
                            <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 10px" />
                            <el-skeleton-item variant="text" style="margin-bottom: 6px" />
                            <el-skeleton-item variant="text" style="width: 40%" />
                        </div>
                    </template>
                </el-skeleton>
            </div>
        </div>

        <!-- Card Grid -->
        <div v-show="!loading && dataList.length > 0" class="card-grid">
            <div
                v-for="(item, idx) in dataList"
                :key="item.id"
                class="code-card card-stagger"
                :style="{ animationDelay: idx * 0.05 + 's' }"
                @mouseenter="changeHover(item, true)"
                @mouseleave="changeHover(item, false)"
            >
                <!-- Card Cover -->
                <div class="card-cover" @click="goDetail(item)">
                    <el-image v-if="item.cover" :src="'https://' + (item.cover || '')" fit="cover" class="cover-img" />
                    <div v-else class="cover-placeholder">
                        <span class="cover-icon">&lt;/&gt;</span>
                    </div>
                    <span class="card-badge" :class="item.isTemplate === '1' ? 'badge-template' : 'badge-snippet'">
                        {{ item.isTemplate === '1' ? '模板' : '片段' }}
                    </span>
                </div>

                <!-- Card Body -->
                <div class="card-body" @click="goDetail(item)">
                    <h3 class="card-title">{{ item.title || '' }}</h3>
                    <p class="card-desc">{{ item.description || '暂无描述' }}</p>
                </div>

                <!-- Card Actions -->
                <div v-show="getIsHover(item)" class="card-actions" @click.stop>
                    <button class="action-btn" :class="{ 'is-starred': item.hasStared }" @click="changeFavo(item)">
                        <el-icon v-if="!item.hasStared"><Star /></el-icon>
                        <el-icon v-else><StarFilled /></el-icon>
                    </button>
                    <button v-if="item.isTemplate === '1'" class="action-btn action-gen" @click="showTemplateField(item)">生成</button>
                    <button class="action-btn" @click="goEdit(item)">编辑</button>
                    <button class="action-btn" @click="goDetail(item)">查看</button>
                    <el-popconfirm
                        title="此操作不可撤销，确定要删除吗?"
                        confirm-button-type="danger"
                        confirm-button-text="删除"
                        cancel-button-text="取消"
                        :icon="WarnTriangleFilled"
                        :width="250"
                        @confirm="doDelete(item)"
                        @show="item.delConfirmVisible = true"
                        @hide="item.delConfirmVisible = false"
                    >
                        <template #reference>
                            <button class="action-btn action-delete">删除</button>
                        </template>
                    </el-popconfirm>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && dataList.length > 0" class="pagination-wrapper">
            <el-pagination
                v-model:current-page="pageNum"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20, 50]"
                size="small"
                layout="sizes, prev, pager, next"
                :total="total"
                @size-change="getDataList"
                @current-change="getDataList"
            />
        </div>

        <!-- Empty State -->
        <div v-if="!loading && dataList.length === 0" class="empty-state">
            <div class="empty-icon">✍️</div>
            <h3 class="empty-title">还没有代码片段</h3>
            <p class="empty-desc">创建你的第一个代码片段或模板吧</p>
            <el-button type="primary" :icon="CirclePlus" @click="router.push('/index')">创建代码</el-button>
        </div>

        <GenCodeDialog v-model:visible="genCodeDialogVisible" :info-id="genCodeId" @submit="doGenCode" @download="doDownload"></GenCodeDialog>
        <ShowCodeDialog v-model:visible="showCodeDialogVisible" :code-files="codeFiles" />
    </div>
</template>

<style scoped>
    .list-page { padding-bottom: 20px; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-family: var(--cs-font-heading); font-size: 24px; font-weight: 700; color: var(--cs-text); margin: 0 0 4px; }
    .page-desc { color: var(--cs-text-muted); font-size: 14px; margin: 0; }

    .search-panel { background: var(--cs-surface); border: 1px solid var(--cs-border); border-radius: var(--cs-radius-lg); padding: 20px 24px 12px; margin-bottom: 24px; }
    .search-form { display: flex; flex-wrap: wrap; gap: 0; }
    .search-actions { display: flex; justify-content: center; padding-bottom: 8px; gap: 12px; }
    .toggle-icon { transition: transform 0.25s ease; margin-left: 4px; }
    .toggle-icon.is-expanded { transform: rotate(180deg); }

    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .code-card { position: relative; background: var(--cs-surface); border: 1px solid var(--cs-border); border-radius: var(--cs-radius-lg); overflow: hidden; cursor: pointer; transition: all var(--cs-transition); }
    .code-card:hover { border-color: rgba(34, 197, 94, 0.3); box-shadow: var(--cs-shadow-glow); transform: translateY(-2px); }
    .skeleton-card { cursor: default; }
    .skeleton-card:hover { transform: none; box-shadow: none; border-color: var(--cs-border); }

    .card-cover { position: relative; height: 140px; background: var(--cs-card-cover-bg); display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .cover-img { width: 100%; height: 100%; object-fit: cover; }
    .cover-placeholder { display: flex; align-items: center; justify-content: center; }
    .cover-icon { font-family: var(--cs-font-heading); font-size: 36px; color: var(--cs-border-light); opacity: 0.5; }

    .card-badge { position: absolute; top: 10px; right: 10px; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
    .badge-template { background: rgba(34, 197, 94, 0.2); color: var(--cs-accent); border: 1px solid rgba(34, 197, 94, 0.3); }
    .badge-snippet { background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); }

    .card-body { padding: 16px; }
    .card-title { font-family: var(--cs-font-heading); font-size: 15px; font-weight: 600; color: var(--cs-text); margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-desc { font-size: 13px; color: var(--cs-text-muted); margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; min-height: 39px; }

    .card-actions { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: flex-end; align-items: center; gap: 4px; padding: 8px 12px; background: var(--cs-card-actions-bg); border-top: 1px solid var(--cs-border); backdrop-filter: blur(8px); }

    .action-btn { background: none; border: none; color: var(--cs-text-secondary); font-size: 13px; cursor: pointer; padding: 4px 10px; border-radius: var(--cs-radius-sm); transition: all var(--cs-transition); display: flex; align-items: center; gap: 4px; font-family: var(--cs-font-body); }
    .action-btn:hover { color: var(--cs-accent); background: rgba(34, 197, 94, 0.1); }
    .action-btn.is-starred { color: #FBBF24; }
    .action-delete { color: var(--cs-danger) !important; }
    .action-delete:hover { background: rgba(239, 68, 68, 0.1) !important; }

    .pagination-wrapper { display: flex; justify-content: center; margin-top: 28px; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-title { font-family: var(--cs-font-heading); font-size: 18px; font-weight: 600; color: var(--cs-text); margin: 0 0 8px; }
    .empty-desc { color: var(--cs-text-muted); font-size: 14px; margin: 0 0 20px; }
</style>
