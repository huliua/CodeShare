<script setup>
import { useUserStore } from '@/store/userStore';
import { changePassword, updateUserInfo } from '@/api/user.js';
import { encryptByRsa } from '@/utils/commonUtils';
const publicKey = ref(import.meta.env.VITE_APP_PUBLIC_KEY);

const userStore = useUserStore();
const userInfoForm = ref({
    username: userStore.userInfo?.username,
    nickname: userStore.userInfo?.nickname,
    phone: userStore.userInfo?.phone,
    sex: userStore.userInfo?.sex,
    email: userStore.userInfo?.email,
    signature: userStore.userInfo?.signature
});
const userInfoFormRef = ref(null);
const changePasswordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});
const changePasswordFormRef = ref(null);
const changePasswordFormRules = ref({
    oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度为6-20', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: function (rule, value, callback) {
                if (value !== changePasswordForm.value.newPassword) {
                    return callback(new Error('两次输入的密码不一致'));
                } else {
                    return callback();
                }
            }
        }
    ]
});
const phoneValidator = function (rule, value, callback) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!value) {
        return callback(new Error('请输入手机号'));
    } else if (!phoneRegex.test(value)) {
        return callback(new Error('请输入有效的手机号'));
    } else {
        return callback();
    }
};
const userInfoFormRules = ref({
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 1, max: 50, message: '昵称长度为1-25', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { validator: phoneValidator, trigger: 'blur' }
    ],
    email: [{ type: 'email', message: '请输入合法的邮箱地址', trigger: 'blur' }]
});

const doUpdateUserInfo = () => {
    userInfoFormRef.value.validate(valid => {
        if (!valid) {
            return false;
        }
        updateUserInfo(userInfoForm.value).then(res => {
            ElMessage.success('修改成功');
            const newUserInfo = res.data;
            userStore.updateUser(newUserInfo);
        });
    });
};

const doChangePassword = () => {
    changePasswordFormRef.value.validate(valid => {
        if (!valid) {
            return false;
        }
        const changePasswordData = Object.assign({}, changePasswordForm.value);
        changePasswordData.oldPassword = encryptByRsa(changePasswordData.oldPassword, atob(publicKey.value));
        changePasswordData.newPassword = encryptByRsa(changePasswordData.newPassword, atob(publicKey.value));
        changePasswordData.confirmPassword = encryptByRsa(changePasswordData.confirmPassword, atob(publicKey.value));
        changePassword(changePasswordData).then(res => {
            ElMessage.success('修改成功');
        });
    });
};
</script>
<template>
    <el-tabs type="border-card">
        <el-tab-pane label="基本信息">
            <el-row>
                <el-col :span="12">
                    <el-form ref="userInfoFormRef" style="max-width: 600px" :model="userInfoForm" :rules="userInfoFormRules" label-width="auto">
                        <el-form-item label="用户名" prop="username">
                            <el-input :disabled="true" v-model="userInfoForm.username" />
                        </el-form-item>
                        <el-form-item label="昵称" prop="nickname">
                            <el-input v-model="userInfoForm.nickname" clearable />
                        </el-form-item>
                        <el-form-item label="性别" prop="sex">
                            <el-select v-model="userInfoForm.sex" placeholder="请选择性别" clearable>
                                <el-option label="男" value="1" />
                                <el-option label="女" value="0" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="手机" prop="phone">
                            <el-input v-model="userInfoForm.phone" clearable />
                        </el-form-item>
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="userInfoForm.email" clearable />
                        </el-form-item>
                        <el-form-item label="个性签名" prop="signature">
                            <el-input v-model="userInfoForm.signature" type="textarea" clearable />
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :justify="'center'">
                <el-button type="primary" @click="doUpdateUserInfo">保存</el-button>
            </el-row>
        </el-tab-pane>
        <el-tab-pane label="安全设置">
            <el-row>
                <el-col :span="12">
                    <el-form ref="changePasswordFormRef" style="max-width: 600px" :model="changePasswordForm" :rules="changePasswordFormRules" label-width="auto">
                        <el-form-item label="原密码" prop="oldPassword">
                            <el-input type="password" v-model="changePasswordForm.oldPassword" show-password />
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                            <el-input type="password" v-model="changePasswordForm.newPassword" show-password />
                        </el-form-item>
                        <el-form-item label="确认密码" prop="confirmPassword">
                            <el-input type="password" v-model="changePasswordForm.confirmPassword" show-password />
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :justify="'center'">
                <el-button type="primary" @click="doChangePassword">修改密码</el-button>
            </el-row>
        </el-tab-pane>
    </el-tabs>
</template>

<style scoped></style>