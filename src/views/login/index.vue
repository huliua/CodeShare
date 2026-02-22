<!--登录页面-->
<script setup>
    // 登录表单
    import { ref } from 'vue';
    import { Lock, User } from '@element-plus/icons-vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '@/store/userStore';
    import { login } from '@/api/auth';
    import { setRefreshToken, setToken } from '@/utils/auth';
    import { encryptByRsa } from '@/utils/commonUtils';

    const userStore = useUserStore();
    const appName = ref(import.meta.env.VITE_APP_TITLE);
    const publicKey = ref(import.meta.env.VITE_APP_PUBLIC_KEY);
    const loginForm = ref({
        username: '',
        password: '',
        rememberMe: false,
        uuid: ''
    });
    const loginRules = {
        username: [
            {
                required: true,
                trigger: 'blur',
                message: '请输入您的账号'
            }
        ],
        password: [
            {
                required: true,
                trigger: 'blur',
                message: '请输入您的密码'
            }
        ]
    };
    // 是否登录中
    const loading = ref(false);
    const loginRef = ref(null);
    const router = useRouter();
    const route = useRoute();

    // 解码url
    const redirectUrl = ref('');
    if (route.params && route.params.redirectUrl) {
        redirectUrl.value = decodeURIComponent(route.params.redirectUrl);
    }
    if (route.query && route.query.redirectUrl) {
        redirectUrl.value = decodeURIComponent(route.query.redirectUrl);
    }
    /**
     * 登录处理逻辑
     */
    const handleLogin = function () {
        loginRef.value.validate((valid, fields) => {
            if (!valid) {
                return;
            }
            loading.value = true;
            const loginFormData = Object.assign({}, loginForm.value);

            // 对登录密码进行加密处理
            loginFormData.password = encryptByRsa(loginFormData.password, atob(publicKey.value));
            if (loginFormData.rememberMe) {
                loginFormData.rememberMe = '1';
            }
            // 执行登录
            login(loginFormData)
                .then(res => {
                    loading.value = false;
                    // 存储用户信息
                    userStore.saveUser(res.data);
                    // 保存token信息
                    setToken(res.data.tokenValue);
                    setRefreshToken(res.data.refreshToken);

                    ElNotification({
                        title: 'Success',
                        message: '登录成功',
                        type: 'success'
                    });

                    // 跳转
                    router.push(redirectUrl.value || '/index');
                })
                .catch(err => {
                    loading.value = false;
                })
                .finally(() => {
                    loading.value = false;
                });
        });
    };

    // 是否开启注册
    const register = ref(true);
</script>
<template>
    <div class="auth-page">
        <!-- Background decoration -->
        <div class="auth-bg">
            <div class="bg-gradient"></div>
            <div class="bg-grid"></div>
            <div class="bg-glow bg-glow-1"></div>
            <div class="bg-glow bg-glow-2"></div>
        </div>

        <!-- Login Card -->
        <div class="auth-container">
            <div class="auth-card">
                <!-- Brand -->
                <div class="auth-brand">
                    <span class="brand-icon">&lt;/&gt;</span>
                    <h1 class="brand-title">{{ appName }}</h1>
                    <p class="brand-subtitle">分享你的代码，连接开发者世界</p>
                </div>

                <!-- Form -->
                <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="auth-form">
                    <el-form-item prop="username">
                        <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
                            <template #prefix>
                                <el-icon><User /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off" placeholder="密码" show-password @keyup.enter="handleLogin">
                            <template #prefix>
                                <el-icon><Lock /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <div class="form-options">
                        <el-checkbox v-model="loginForm.rememberMe">7天免登录</el-checkbox>
                    </div>

                    <el-form-item>
                        <el-button :loading="loading" size="large" type="primary" class="login-btn" @click.prevent="handleLogin">
                            <span v-if="!loading">登 录</span>
                            <span v-else>登 录 中...</span>
                        </el-button>
                    </el-form-item>

                    <div v-if="register" class="auth-footer-link">
                        <span>还没有账号？</span>
                        <router-link to="/register">立即注册</router-link>
                    </div>
                </el-form>
            </div>
        </div>

        <!-- Page Footer -->
        <footer class="page-footer">
            Copyright © {{ new Date().getFullYear() }} {{ appName }}. All Rights Reserved.
        </footer>
    </div>
</template>

<style scoped>
    .auth-page {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    /* Background */
    .auth-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
    }

    .bg-gradient {
        position: absolute;
        inset: 0;
        background: var(--cs-auth-gradient);
    }

    .bg-grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(var(--cs-auth-grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--cs-auth-grid-color) 1px, transparent 1px);
        background-size: 60px 60px;
        opacity: 0.4;
    }

    .bg-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
        opacity: 1;
    }

    .bg-glow-1 {
        top: -20%;
        right: -10%;
        width: 600px;
        height: 600px;
        background: var(--cs-auth-glow-1);
    }

    .bg-glow-2 {
        bottom: -20%;
        left: -10%;
        width: 500px;
        height: 500px;
        background: var(--cs-auth-glow-2);
    }

    /* Auth Container */
    .auth-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
        padding: 40px 20px;
    }

    .auth-card {
        width: 100%;
        max-width: 420px;
        padding: 40px 36px;
        background: var(--cs-glass-bg);
        backdrop-filter: var(--cs-glass-blur);
        -webkit-backdrop-filter: var(--cs-glass-blur);
        border: 1px solid var(--cs-auth-card-border);
        border-radius: var(--cs-radius-xl);
        box-shadow: var(--cs-shadow-lg);
    }

    /* Brand */
    .auth-brand {
        text-align: center;
        margin-bottom: 36px;
    }

    .brand-icon {
        display: inline-block;
        font-family: var(--cs-font-heading);
        font-size: 24px;
        font-weight: 700;
        color: var(--cs-accent);
        background: rgba(34, 197, 94, 0.1);
        padding: 10px 16px;
        border-radius: var(--cs-radius-md);
        margin-bottom: 16px;
    }

    .brand-title {
        font-family: var(--cs-font-heading);
        font-size: 28px;
        font-weight: 700;
        color: var(--cs-text);
        margin: 0 0 8px;
        letter-spacing: -0.5px;
    }

    .brand-subtitle {
        color: var(--cs-text-muted);
        font-size: 14px;
        margin: 0;
    }

    /* Form */
    .auth-form {
        width: 100%;
    }

    .form-options {
        margin-bottom: 20px;
    }

    .login-btn {
        width: 100%;
        height: 44px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        letter-spacing: 2px;
    }

    .auth-footer-link {
        text-align: center;
        margin-top: 16px;
        font-size: 14px;
        color: var(--cs-text-muted);
    }

    .auth-footer-link a {
        color: var(--cs-accent);
        font-weight: 500;
        margin-left: 4px;
    }

    .auth-footer-link a:hover {
        text-decoration: underline;
    }

    /* Page Footer */
    .page-footer {
        position: relative;
        z-index: 1;
        text-align: center;
        padding: 20px;
        color: var(--cs-text-muted);
        font-size: 12px;
        letter-spacing: 0.5px;
    }

    @media (max-width: 480px) {
        .auth-card {
            padding: 32px 20px;
        }
    }
</style>
