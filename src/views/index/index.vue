<!--首页-->
<script setup>
import { useUserStore } from '@/store/userStore';
import { ChatLineSquare, Folder, Notebook, Plus, Star, SwitchButton, User } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
const userStore = useUserStore();
const username = userStore.userInfo.nickname;
const appName = ref(import.meta.env.VITE_APP_TITLE);

// 获取当前路由地址
const route = useRoute();

// 默认选中菜单项
const activeIndex = ref("/index");
activeIndex.value = route.fullPath;

/**
 * 跳转到指定页面
 */
function goto(path) {
  window.open(path, '_blank');
}
</script>
<template>
  <div class="main-content">
    <el-container>
      <el-header>
        <el-row :gutter="10">
          <el-col :xs="5" :sm="6" :md="4" :lg="3" :xl="3">
            <div class="app-title">
              CodeShare
            </div>
          </el-col>
          <el-col :xs="14" :sm="12" :md="16" :lg="18" :xl="19">
            <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router="true">
              <el-menu-item index="/index">
                <template #title>
                  <el-icon>
                    <Plus />
                  </el-icon>
                  创建
                </template>
              </el-menu-item>
              <el-menu-item index="/list">
                <template #title>
                  <el-icon>
                    <Folder />
                  </el-icon>
                  代码库
                </template>
              </el-menu-item>
              <el-menu-item index="/my">
                <template #title>
                  <el-icon>
                    <Notebook />
                  </el-icon>
                  我的代码
                </template>
              </el-menu-item>
              <el-menu-item index="/favour">
                <template #title>
                  <el-icon>
                    <Star />
                  </el-icon>
                  我的收藏
                </template>
              </el-menu-item>
              <el-sub-menu index="">
                <template #title>
                  <el-icon>
                    <ChatLineSquare />
                  </el-icon>
                  联系我们
                </template>
                <el-menu-item index="" @click="goto('https://github.com/huliua')">Github</el-menu-item>
                <el-menu-item index="" @click="goto('https://gitee.com/githuliu')">Gitee</el-menu-item>
                <el-menu-item index="" @click="goto('https://www.cnblogs.com/huliua')">博客园</el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-col>
          <el-col :xs="5" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="avatar">
              <el-dropdown>
                <el-avatar> {{ username }}</el-avatar>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :icon="User">
                      <router-link to="/user">个人中心</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item :icon="SwitchButton" style="color: red">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.app-title {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.main-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.avatar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar span:hover {
  outline: none !important;
}

.avatar span:focus-visible {
  outline: none !important;
}
</style>
