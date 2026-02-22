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

    const keepAliveInclude = ref([]);
    // 监听路由变化，动态更新 include 数组
    watch(
        () => route.fullPath, // 监听 fullPath 或 route.name
        (newPath, oldPath) => {
            const newRoute = route; // 当前路由对象

            // 如果当前路由需要缓存，且组件名称不在 include 中，则添加
            if (newRoute.meta?.keepAlive && !keepAliveInclude.value.includes(newRoute.name)) {
                keepAliveInclude.value.push(newRoute.name);
            }
        },
        { immediate: true } // 立即执行初始化
    );

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
    <div class="app-shell">
        <el-backtop :right="40" :bottom="40" :visibility-height="100" />

        <!-- Header -->
        <header class="app-header cs-glass">
            <div class="header-inner">
                <!-- Logo -->
                <div class="logo" @click="router.push('/')">
                    <span class="logo-icon">&lt;/&gt;</span>
                    <span class="logo-text">CodeShare</span>
                </div>

                <!-- Nav Menu -->
                <el-menu :default-active="activeIndex" class="nav-menu" mode="horizontal" :router="true">
                    <el-menu-item index="/index">
                        <template #title>
                            <el-icon><Plus /></el-icon>
                            创建
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/list">
                        <template #title>
                            <el-icon><Folder /></el-icon>
                            代码库
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/my">
                        <template #title>
                            <el-icon><Notebook /></el-icon>
                            我的代码
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/favour">
                        <template #title>
                            <el-icon><Star /></el-icon>
                            我的收藏
                        </template>
                    </el-menu-item>
                    <el-sub-menu index="">
                        <template #title>
                            <el-icon><ChatLineSquare /></el-icon>
                            反馈
                        </template>
                        <el-menu-item index="" @click="goto('https://github.com/huliua/CodeShare')">Github</el-menu-item>
                    </el-sub-menu>
                </el-menu>

                <!-- User Area -->
                <div class="user-area">
                    <el-dropdown>
                        <div class="avatar-wrapper">
                            <el-avatar
                                :size="34"
                                :src="userStore?.userInfo.sex === '0' ? '/src/assets/images/female.png' : '/src/assets/images/male.png'"
                            ></el-avatar>
                            <span class="user-name" :class="userStore?.userInfo.sex === '0' ? 'sex-female' : 'sex-male'">
                                {{ userStore.userInfo.nickname }}
                            </span>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-if="!isDark" :icon="Moon" @click="toggleDark()">黑暗模式</el-dropdown-item>
                                <el-dropdown-item v-else :icon="Sunny" @click="toggleDark()">明亮模式</el-dropdown-item>
                                <el-dropdown-item :icon="User" @click="router.push('/user')">个人中心</el-dropdown-item>
                                <el-dropdown-item :icon="SwitchButton" class="logout-item" @click="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="app-main">
            <div class="main-container">
                <router-view v-slot="{ Component, route }">
                    <transition name="page-fade" mode="out-in">
                        <keep-alive :include="keepAliveInclude">
                            <component :is="Component" :key="route.fullPath" />
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </main>

        <!-- Footer -->
        <footer class="app-footer">
            <span @click="router.push('/index')">
                Copyright © {{ new Date().getFullYear() }} {{ appName }}. All Rights Reserved.
            </span>
        </footer>
    </div>
</template>

<style scoped>
    .app-shell {
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* ===== Header ===== */
    .app-header {
        position: sticky;
        top: 0;
        z-index: 100;
        border-bottom: 1px solid var(--cs-border);
    }

    .header-inner {
        display: flex;
        align-items: center;
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 24px;
        height: 60px;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        flex-shrink: 0;
        margin-right: 32px;
        transition: opacity var(--cs-transition);
    }

    .logo:hover {
        opacity: 0.85;
    }

    .logo-icon {
        font-family: var(--cs-font-heading);
        font-size: 18px;
        font-weight: 700;
        color: var(--cs-accent);
        background: rgba(34, 197, 94, 0.1);
        padding: 4px 8px;
        border-radius: var(--cs-radius-sm);
        line-height: 1;
    }

    .logo-text {
        font-family: var(--cs-font-heading);
        font-size: 18px;
        font-weight: 600;
        color: var(--cs-text);
        letter-spacing: -0.5px;
    }

    /* Nav Menu */
    .nav-menu {
        flex: 1;
        height: 60px;
    }

    /* User Area */
    .user-area {
        flex-shrink: 0;
        margin-left: 16px;
    }

    .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 4px 12px 4px 4px;
        border-radius: var(--cs-radius-lg);
        transition: background-color var(--cs-transition);
    }

    .avatar-wrapper:hover {
        background-color: var(--cs-surface-hover);
    }

    .avatar-wrapper:focus-visible {
        outline: none;
    }

    .user-name {
        font-size: 14px;
        font-weight: 500;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .sex-male {
        color: #60A5FA;
    }

    .sex-female {
        color: #F9A8D4;
    }

    .logout-item {
        color: var(--cs-danger) !important;
    }

    /* ===== Main ===== */
    .app-main {
        flex: 1;
        width: 100%;
    }

    .main-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 24px;
        min-height: calc(100vh - 120px);
    }

    /* ===== Footer ===== */
    .app-footer {
        text-align: center;
        padding: 20px 24px;
        color: var(--cs-text-muted);
        font-size: 12px;
        letter-spacing: 0.5px;
        border-top: 1px solid var(--cs-border);
    }

    .app-footer span {
        cursor: pointer;
        transition: color var(--cs-transition);
    }

    .app-footer span:hover {
        color: var(--cs-accent);
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
        .header-inner {
            padding: 0 12px;
        }

        .logo-text {
            display: none;
        }

        .user-name {
            display: none;
        }

        .main-container {
            padding: 16px;
        }
    }
</style>
