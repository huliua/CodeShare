<script setup>
    import { Collection, Female, Link, Lock, Phone, Suitcase, User } from '@element-plus/icons-vue';
    import { useRouter } from 'vue-router';
    import { register } from '@/api/auth';
    import { encryptByRsa } from '@/utils/commonUtils';

    const router = useRouter();
    const appName = ref(import.meta.env.VITE_APP_TITLE);
    const publicKey = ref(import.meta.env.VITE_APP_PUBLIC_KEY);
    const registerRef = ref(null);
    const registerForm = ref({
        username: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        phone: '',
        sex: '',
        email: '',
        signature: ''
    });

    const phoneValidator = (rule, value, callback) => {
        if (!value) {
            return callback(new Error('请输入手机号'));
        }
        if (!/^1[3456789]\d{9}$/.test(value)) {
            return callback(new Error('请输入正确的手机号'));
        }
        callback();
    };

    const passwordValidator = function (rule, value, callback) {
        if (value.length < 6 || value.length > 20) {
            return callback(new Error('密码长度为6-20字符'));
        }
        if (registerForm.value.confirmPassword) {
            // 触发确认密码的校验
            registerRef.value.validateField('confirmPassword');
        }
        return callback();
    };

    const confirmValidator = function (rule, value, callback) {
        if (registerForm.value.confirmPassword !== registerForm.value.password) {
            return callback(new Error('两次输入的密码不一致'));
        } else {
            return callback();
        }
    };
    const registerRules = reactive({
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 15, message: '长度在3到15个字符', trigger: 'blur' }
        ],
        nickname: [
            { required: true, message: '请输入昵称', trigger: 'blur' },
            { min: 1, max: 25, message: '长度在1到25个字符' }
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: passwordValidator, trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '请再次输入新密码', trigger: 'blur' },
            { validator: confirmValidator, trigger: 'blur' }
        ],
        phone: [
            { required: true, message: '请输入手机号！', trigger: 'blur' },
            { validator: phoneValidator, trigger: 'blur' }
        ],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur'] }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }]
    });

    const isLoading = ref(false);
    const handleRegister = () => {
        registerRef.value.validate(valid => {
            if (!valid) {
                return false;
            }
            const registerFormData = Object.assign({}, registerForm.value);

            // 对登录密码进行加密处理
            registerFormData.password = encryptByRsa(registerFormData.password, atob(publicKey.value));
            registerFormData.confirmPassword = encryptByRsa(registerFormData.confirmPassword, atob(publicKey.value));
            register(registerFormData).then(() => {
                ElMessage.success('注册成功');
                router.push('/login');
            });
        });
    };
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

        <!-- Register Card -->
        <div class="auth-container">
            <div class="auth-card">
                <!-- Brand -->
                <div class="auth-brand">
                    <span class="brand-icon">&lt;/&gt;</span>
                    <h1 class="brand-title">{{ appName }}</h1>
                    <p class="brand-subtitle">创建账号，开始分享代码</p>
                </div>

                <!-- Form -->
                <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="auth-form" label-width="80px">
                    <el-form-item prop="username" label="用户名">
                        <el-input v-model="registerForm.username" type="text" size="large" auto-complete="off" placeholder="请输入用户名">
                            <template #prefix>
                                <el-icon><User /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="nickname" label="昵称">
                        <el-input v-model="registerForm.nickname" size="large" auto-complete="off" clearable placeholder="请输入昵称">
                            <template #prefix>
                                <el-icon><Suitcase /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="password" label="密码">
                        <el-input v-model="registerForm.password" type="password" size="large" clearable auto-complete="new-password" placeholder="密码" show-password>
                            <template #prefix>
                                <el-icon><Lock /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="confirmPassword" label="确认密码">
                        <el-input v-model="registerForm.confirmPassword" type="password" size="large" clearable auto-complete="new-password" placeholder="确认密码" show-password>
                            <template #prefix>
                                <el-icon><Lock /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="sex" label="性别">
                        <el-select v-model="registerForm.sex" size="large" placeholder="请选择性别" clearable>
                            <el-option label="男" value="1" />
                            <el-option label="女" value="0" />
                            <template #prefix>
                                <el-icon><Female /></el-icon>
                            </template>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="phone" label="手机">
                        <el-input v-model="registerForm.phone" size="large" placeholder="请输入手机号" clearable>
                            <template #prefix>
                                <el-icon><Phone /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="email" label="邮箱">
                        <el-input v-model="registerForm.email" size="large" placeholder="请输入邮箱地址" clearable>
                            <template #prefix>
                                <el-icon><Link /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="signature" label="个性签名">
                        <el-input v-model="registerForm.signature" size="large" placeholder="请输入个性签名" type="textarea" clearable>
                            <template #prefix>
                                <el-icon><Collection /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <div class="form-actions">
                        <el-button :loading="isLoading" size="large" type="primary" class="register-btn" @click.prevent="handleRegister">
                            <span v-if="!isLoading">注 册</span>
                            <span v-else>提交中...</span>
                        </el-button>
                    </div>

                    <div class="auth-footer-link">
                        <span>已有账号？</span>
                        <a href="javascript:void(0)" @click="router.push('/login')">去登录</a>
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
        overflow-y: auto;
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
        opacity: 0.15;
    }

    .bg-glow-1 {
        top: -20%;
        right: -10%;
        width: 600px;
        height: 600px;
        background: var(--cs-accent);
    }

    .bg-glow-2 {
        bottom: -20%;
        left: -10%;
        width: 500px;
        height: 500px;
        background: #3B82F6;
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
        max-width: 520px;
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
        margin-bottom: 32px;
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

    .form-actions {
        margin-top: 24px;
        text-align: center;
    }

    .register-btn {
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
            padding: 32px 16px;
        }
    }
</style>
