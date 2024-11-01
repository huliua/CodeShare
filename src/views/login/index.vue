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
    <div class="login">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
            <h3 class="title">{{ appName }}</h3>
            <el-form-item prop="username">
                <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
                    <template #prefix>
                        <el-icon>
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off" placeholder="密码" show-password @keyup.enter="handleLogin">
                    <template #prefix>
                        <el-icon>
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>
            <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 0px">7天免登录</el-checkbox>
            <el-form-item style="width: 100%">
                <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleLogin">
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                </el-button>
                <div style="text-align: right; width: 100%" v-if="register">
                    <router-link class="link-type" :to="'/register'">注册账号</router-link>
                </div>
            </el-form-item>
        </el-form>
        <!--  底部  -->
        <div class="el-login-footer">
            <span>Copyright ©2018-2023 huliua.asia All Rights Reserved.</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.login {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-image: url('../../assets/images/login-background.jpg');
    background-size: cover;
}

.title {
    margin: 0px auto 30px auto;
    color: #707070;
    text-align: center;
}

.login-form {
    width: 400px;
    padding: 25px 25px 5px 25px;
    background: #ffffff;
    border-radius: 6px;

    .el-input {
        height: 40px;

        input {
            height: 40px;
        }
    }

    .input-icon {
        width: 14px;
        height: 39px;
        margin-left: 0px;
    }
}

.el-login-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 40px;
    color: #fff;
    font-size: 12px;
    font-family: Arial;
    line-height: 40px;
    letter-spacing: 1px;
    text-align: center;
}
</style>