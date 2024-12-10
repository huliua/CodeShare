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
    <div class="page-container">
        <div class="register">
            <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form" label-width="80px">
                <h3 class="title">{{ appName }}</h3>
                <el-form-item prop="username" label="用户名">
                    <el-input v-model="registerForm.username" type="text" size="large" auto-complete="off" placeholder="请输入用户名">
                        <template #prefix>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="nickname" label="昵称">
                    <el-input v-model="registerForm.nickname" size="large" auto-complete="off" clearable placeholder="请输入昵称">
                        <template #prefix>
                            <el-icon>
                                <Suitcase />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input v-model="registerForm.password" type="password" size="large" clearable auto-complete="new-password" placeholder="密码" show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword" label="确认密码">
                    <el-input v-model="registerForm.confirmPassword" type="password" size="large" clearable auto-complete="new-password" placeholder="确认密码" show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="sex" label="性别">
                    <el-select v-model="registerForm.sex" size="large" placeholder="请选择性别" clearable>
                        <el-option label="男" value="1" />
                        <el-option label="女" value="0" />
                        <template #prefix>
                            <el-icon>
                                <Female />
                            </el-icon>
                        </template>
                    </el-select>
                </el-form-item>
                <el-form-item prop="phone" label="手机">
                    <el-input v-model="registerForm.phone" size="large" placeholder="请输入手机号" clearable>
                        <template #prefix>
                            <el-icon>
                                <Phone />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="email" label="邮箱">
                    <el-input v-model="registerForm.email" size="large" placeholder="请输入邮箱地址" clearable>
                        <template #prefix>
                            <el-icon>
                                <Link />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="signature" label="个性签名">
                    <el-input v-model="registerForm.signature" size="large" placeholder="请输入个性签名" type="textarea" clearable>
                        <template #prefix>
                            <el-icon>
                                <Collection />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-row style="margin-bottom: 10px" justify="center" align="middle">
                    <el-col :span="5" :offset="9" style="text-align: center">
                        <el-button :loading="isLoading" size="large" type="primary" @click.prevent="handleRegister">
                            <span v-if="!isLoading">注 册</span>
                            <span v-else>提交中...</span>
                        </el-button>
                    </el-col>
                    <el-col :span="9">
                        <el-button type="text" style="float: left" @click="router.push('/login')">
                            <span style="color: #409eff">已有账号？去登录</span>
                        </el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <!--  底部  -->
        <el-footer>
            <el-row class="footer" @click="router.push('/index')">
                <el-col :span="24">Copyright © {{ new Date().getFullYear() }} {{ appName }}. All Rights Reserved.</el-col>
            </el-row>
        </el-footer>
    </div>
</template>

<style lang="css" scoped>
    .page-container {
        height: 100vh;
        overflow: scroll;
        background-image: url('../../assets/images/login-background.jpg');
        background-size: cover;
    }

    .register {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 60px);
    }

    .title {
        margin: 0 auto 30px auto;
        color: #707070;
        text-align: center;
    }

    .register-form {
        width: 500px;
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
            margin-left: 0;
        }
    }
</style>
