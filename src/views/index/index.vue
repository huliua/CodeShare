<!--首页-->
<script setup>
    import { useUserStore } from '@/store/userStore';
    import { ChatLineSquare, Folder, Moon, Notebook, Plus, Star, Sunny, SwitchButton, User } from '@element-plus/icons-vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useDark, useToggle } from '@vueuse/core';

    const isDark = useDark();
    const toggleDark = useToggle(isDark);

    const userStore = useUserStore();
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
            type: 'warning'
        })
            .then(() => {
                // 执行退出登录操作
                logoutAction();
            })
            .catch(() => {
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
            <el-alert type="info" :closable="true" show-icon>
                <template #title>
                    <el-text>新功能投票入口：</el-text>
                    <el-link type="primary" target="_blank" href="https://www.yuque.com/huliu_doc/codeshare/fbw88zcu5mst4o4s?singleDoc# 《CodeShare新功能预告》">点击进入</el-link>
                </template>
            </el-alert>
            <el-header>
                <el-row :gutter="10">
                    <el-col :xs="5" :sm="6" :md="4" :lg="3" :xl="3">
                        <div class="app-title" @click="router.push('/')">CodeShare</div>
                    </el-col>
                    <el-col :xs="14" :sm="12" :md="16" :lg="18" :xl="18">
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
                                    意见反馈
                                </template>
                                <el-menu-item index="" @click="goto('https://github.com/huliua/CodeShare')">Github</el-menu-item>
                            </el-sub-menu>
                        </el-menu>
                    </el-col>
                    <el-col :xs="5" :sm="6" :md="4" :lg="3" :xl="3">
                        <div class="avatar">
                            <el-dropdown>
                                <el-avatar style="background: transparent" :src="userStore?.userInfo.sex === '0' ? '/src/assets/images/female.png' : '/src/assets/images/male.png'"></el-avatar>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-if="!isDark" :icon="Moon" @click="toggleDark()">黑暗模式</el-dropdown-item>
                                        <el-dropdown-item v-else :icon="Sunny" @click="toggleDark()">明亮模式</el-dropdown-item>
                                        <el-dropdown-item :icon="User" @click="router.push('/user')">个人中心</el-dropdown-item>
                                        <el-dropdown-item :icon="SwitchButton" style="color: red" @click="logout">退出登录</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                            <el-divider direction="vertical" border-style="hidden" style="margin: 0 2px" />
                            <el-tooltip :content="userStore.userInfo.nickname" placement="bottom" :show-after="1000">
                                <el-text style="cursor: default" tag="b" truncated :class="userStore?.userInfo.sex === '0' ? 'sex-female' : 'sex-male'">
                                    {{ userStore.userInfo.nickname }}
                                </el-text>
                            </el-tooltip>
                        </div>
                    </el-col>
                </el-row>
            </el-header>
            <el-main class="main">
                <router-view v-slot="{ Component, route }">
                    <keep-alive v-if="route.meta.keepAlive">
                        <component :is="Component" />
                    </keep-alive>
                    <component :is="Component" v-else />
                </router-view>
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
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--el-color-primary);
        font-weight: bold;
        font-size: 18px;
        cursor: pointer;
    }

    .main-content {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    .main {
        min-height: calc(100vh - 120px);
    }

    .avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .avatar span:hover {
        outline: none !important;
    }

    .avatar span:focus-visible {
        outline: none !important;
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: rgb(192, 196, 204);
        font-size: 12px;
        text-align: center;
        cursor: pointer;
    }

    .sex-male {
        color: #74b7eb;
    }

    .sex-female {
        color: #faa59b;
    }

    .username {
        width: calc(100% - 40px);
    }
</style>
