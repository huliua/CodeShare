<script setup>
    import { ChatLineSquare, Edit, Monitor, Phone, Promotion, User, MessageBox } from '@element-plus/icons-vue';
    import { useUserStore } from '@/store/userStore';
    import { changePassword, getUserInfo, updateUserInfo } from '@/api/user';

    // 获取用户信息
    const userStore = useUserStore();
    const userInfoRef = ref(null);
    const changePwdFormRef = ref(null);

    const userInfo = ref({});
    const changePasswordInfo = ref({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const userInfoForm = ref({
        username: '',
        nickname: '',
        phone: '',
        sex: '',
        email: '',
        signature: ''
    });

    const userInfoRules = reactive({
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        sex: [{ required: true, message: '请输入性别', trigger: 'blur' }]
    });

    const changePwdRules = reactive({
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, max: 20, message: '密码长度为6-20字符', trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '请确认新密码', trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    if (value !== changePasswordInfo.value.newPassword) {
                        callback(new Error('两次输入的密码不一致'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }
        ]
    });

    onMounted(() => {
        getUserInfo().then(res => {
            userInfo.value = res.data;
            userInfoForm.value = {
                username: res.data.username,
                nickname: res.data.nickname,
                phone: res.data.phone,
                sex: res.data.sex,
                email: res.data.email,
                signature: res.data.signature
            };
        });
    });

    const submitUserInfo = () => {
        userInfoRef.value.validate(valid => {
            if (valid) {
                updateUserInfo(userInfoForm.value).then(res => {
                    ElMessage.success('修改成功');
                    userStore.updateUserInfo(userInfoForm.value);
                });
            }
        });
    };

    const submitChangePwd = () => {
        changePwdFormRef.value.validate(valid => {
            if (valid) {
                changePassword(changePasswordInfo.value).then(res => {
                    ElMessage.success('修改密码成功');
                    changePasswordInfo.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
                });
            }
        });
    };
</script>

<template>
    <div class="user-page">
        <!-- Page Header -->
        <div class="page-header">
            <h2 class="page-title">个人中心</h2>
            <p class="page-desc">管理你的账户信息和安全设置</p>
        </div>

        <el-tabs type="border-card" class="user-tabs">
            <el-tab-pane label="基本信息">
                <template #label>
                    <span class="tab-label"><el-icon><User /></el-icon> 基本信息</span>
                </template>
                <div class="tab-content">
                    <el-form ref="userInfoRef" :model="userInfoForm" :rules="userInfoRules" label-width="80px">
                        <el-form-item label="用户名">
                            <el-input v-model="userInfoForm.username" disabled />
                        </el-form-item>
                        <el-form-item label="昵称" prop="nickname">
                            <el-input v-model="userInfoForm.nickname" />
                        </el-form-item>
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="userInfoForm.phone" />
                        </el-form-item>
                        <el-form-item label="性别" prop="sex">
                            <el-select v-model="userInfoForm.sex" placeholder="请选择">
                                <el-option label="男" value="1" />
                                <el-option label="女" value="0" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="邮箱">
                            <el-input v-model="userInfoForm.email" />
                        </el-form-item>
                        <el-form-item label="个性签名">
                            <el-input v-model="userInfoForm.signature" type="textarea" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitUserInfo">保存修改</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>

            <el-tab-pane label="安全设置">
                <template #label>
                    <span class="tab-label"><el-icon><Monitor /></el-icon> 安全设置</span>
                </template>
                <div class="tab-content">
                    <el-form ref="changePwdFormRef" :model="changePasswordInfo" :rules="changePwdRules" label-width="80px">
                        <el-form-item label="旧密码" prop="oldPassword">
                            <el-input v-model="changePasswordInfo.oldPassword" type="password" show-password />
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                            <el-input v-model="changePasswordInfo.newPassword" type="password" show-password />
                        </el-form-item>
                        <el-form-item label="确认密码" prop="confirmPassword">
                            <el-input v-model="changePasswordInfo.confirmPassword" type="password" show-password />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitChangePwd">修改密码</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style scoped>
    .user-page {
        max-width: 700px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 24px;
    }

    .page-title {
        font-family: var(--cs-font-heading);
        font-size: 24px;
        font-weight: 700;
        color: var(--cs-text);
        margin: 0 0 4px;
    }

    .page-desc {
        color: var(--cs-text-muted);
        font-size: 14px;
        margin: 0;
    }

    .tab-label {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .tab-content {
        padding: 24px 16px;
    }
</style>
