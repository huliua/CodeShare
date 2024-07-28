<script setup>
import { Search, Refresh, Star, StarFilled } from '@element-plus/icons-vue';
import { getMyCodesList, favourCode } from '@/api/codeShare';
import { useRouter } from 'vue-router';
import { onActivated } from 'vue';
const router = useRouter();
const dataList = ref([]);
const loading = ref(false);
const pageSize = ref(10);
const pageNum = ref(1);
const total = ref(0);
// 标签字典
const tagDictList = ref([]);
onMounted(() => {
  tagDictList.value = [
    { label: 'Vue', value: 'Vue' },
    { label: 'React', value: 'React' },
    { label: 'Angular', value: 'Angular' },
    { label: 'TypeScript', value: 'TypeScript' },
    { label: 'JavaScript', value: 'JavaScript' },
    { label: 'CSS', value: 'CSS' },
    { label: 'HTML', value: 'HTML' },
    { label: 'Node.js', value: 'Node.js' }
  ];
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

const changeHover = function (item, isHover) {
  item.isHover = isHover;
};

const getIsHover = function (item) {
  return item.isHover;
};

// 激活的时候加载数据
onActivated(() => {
  // 如果不是从详情页面返回的，需要加载数据
  if (!router.currentRoute.value.meta.isBack) {
    getDataList();
  }
});
</script>

<template>
  <el-backtop :right="100" :bottom="100" />
  <!-- 查询条件区域 -->
  <el-form :model="queryParams" ref="queryRef" :inline="true">
    <el-form-item label="标题" prop="title">
      <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="getDataList" />
    </el-form-item>
    <el-form-item label="标签" prop="tag">
      <el-select v-model="queryParams.tag" multiple placeholder="请选择标签" collapse-tags collapse-tags-tooltip clearable style="width: 200px">
        <el-option v-for="dict in tagDictList" :key="dict.value" :label="dict.label" :value="dict.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-date-picker v-model="queryParams.createTime" is-range format="YYYY-MM-DD HH:mm:ss" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :icon="Search" @click="getDataList">搜索</el-button>
      <el-button :icon="Refresh" @click="resetQuery()">重置</el-button>
    </el-form-item>
  </el-form>

  <!-- 数据展示区域 -->
  <el-space wrap v-show="dataList.length > 0">
    <el-card v-for="(item) in dataList" :key="item.id" class="box-card" shadow="hover" @mouseenter="changeHover(item, true)" @mouseleave="changeHover(item, false)">
      <template #header>
        <div class="card-header">
          <div class="card-header-title"><el-text size="large" truncated>{{ item.title || '' }}</el-text></div>
          <div class="card-header-desciption"><el-text size="small" line-clamp="2" truncated style="text-wrap: wrap;">{{ item.description || '' }}</el-text></div>
        </div>
      </template>
      <template #default>
        <div style="text-align: center;width: 100%;height: 100%;">
          <el-image style="width: 120px; height: 160px" :src="'https://' + (item.cover || '')" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :previewSrcList="['https://' + (item.cover || '')]" :hide-on-click-modal="true" fit="cover" />
        </div>
        <div class="card-bottom" v-show="getIsHover(item)">
          <div class="button-group">
            <el-button link v-show="!item.hasStared" :icon="Star" @click="changeFavo(item)"></el-button>
            <el-button link v-show="item.hasStared" @click="changeFavo(item)" style="font-size: 16px;">
              <template #icon>
                <el-icon>
                  <StarFilled color="gold" />
                </el-icon>
              </template>
            </el-button>
            <el-button link color="var(--el-color-primary-dark-2)" @click="goEdit(item)">编辑</el-button>
            <el-button link color="var(--el-color-primary-dark-2)" @click="goDetail(item)">查看</el-button>
          </div>
        </div>
      </template>
    </el-card>
  </el-space>
  <el-row class="pagination" v-if="dataList.length > 0">
    <el-col :span="24">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]" size="small" layout="sizes, prev, pager, next" :total="total" @size-change="getDataList" @current-change="getDataList" />
    </el-col>
  </el-row>
  <el-empty description="暂无数据" v-show="dataList.length === 0" />
</template>

<style scoped>
.box-card {
  position: relative;
  width: 250px;
  min-height: 240px;
}

.card-header-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 5px;
}

.card-header-desciption {
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
  min-height: 42px;
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
  height: 100%;
  padding: 0 18px;
  display: flex;
  justify-content: flex-end;
}

.pagination {
  text-align: center;
  margin-top: 20px;
}
</style>