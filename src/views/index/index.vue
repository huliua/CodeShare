<!--首页-->
<script setup>
import { useUserStore } from '@/store/userStore';
import { ChatLineSquare, Folder, Notebook, Plus, Star, SwitchButton, User, Sunny, Moon } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const userStore = useUserStore();
const username = userStore.userInfo.nickname;
const appName = ref(import.meta.env.VITE_APP_TITLE);
// 获取当前路由地址
const route = useRoute();
const router = useRouter();
// 默认选中菜单项
const activeIndex = computed(() => route.fullPath);

/**
 * 跳转到指定页面
 */
function goto(path, openType) {
  window.open(path, openType || '_blank');
}

/**
 * 退出登录
 */
function logout() {
  // 用户确认操作
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 执行退出登录操作
    logoutAction();
  }).catch(() => {
    // 用户取消操作
  });
}

/**
 * 执行退出登录操作
 */
function logoutAction() {
  userStore.logout().then(() => {
    router.push('/login');
  });
}
</script>
<template>
  <div class="main-content">
    <el-backtop :right="100" :bottom="100" :visibility-height="100" />
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
                    <el-dropdown-item v-if="!isDark" :icon="Moon" @click="toggleDark()">
                      黑暗模式
                    </el-dropdown-item>
                    <el-dropdown-item v-else="isDark" :icon="Sunny" @click="toggleDark()">
                      明亮模式
                    </el-dropdown-item>
                    <el-dropdown-item :icon="User" @click="router.push('/user')">
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item :icon="SwitchButton" style="color: red" @click="logout">退出登录</el-dropdown-item>
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
      <el-footer>
        <el-row class="footer" @click="router.push('/index')">
          <el-col :span="24">Copyright © {{ new Date().getFullYear() }} {{ appName }}. All Rights Reserved.</el-col>
        </el-row>
      </el-footer>
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

.footer {
  font-size: 12px;
  text-align: center;
  color: rgb(192, 196, 204);
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>
