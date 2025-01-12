<template>
    <el-dialog v-model="dialogVisible" title="分享代码" width="500px" :close-on-click-modal="false" class="share-dialog" destroy-on-close>
        <el-form ref="shareFormRef" :model="shareForm" :rules="shareRules" label-width="100px" size="large">
            <!-- 有效期设置 -->
            <el-form-item label="有效期" prop="expire">
                <el-select v-model="shareForm.expire" placeholder="请选择有效期" class="w-full">
                    <el-option v-for="item in expireOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>

            <!-- 密码设置 -->
            <el-form-item label="访问密码">
                <div class="password-setting">
                    <div class="switch-wrapper">
                        <span class="switch-label">启用密码</span>
                        <el-switch v-model="shareForm.needPassword" />
                    </div>
                    <el-input v-if="shareForm.needPassword" v-model="shareForm.password" maxlength="6" type="text">
                        <template #append>
                            <el-button @click="generatePassword">
                                <el-icon>
                                    <Refresh />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </el-form-item>

            <!-- 分享链接 -->
            <el-form-item v-if="shareUrl" label="分享链接">
                <div class="share-link">
                    <el-input v-model="shareUrl" readonly>
                        <template #append>
                            <el-button type="primary" @click="copyLink">复制</el-button>
                        </template>
                    </el-input>
                </div>
            </el-form-item>

            <!-- 分享平台 -->
            <div v-if="shareUrl" class="share-platforms">
                <div v-for="platform in platforms" :key="platform.id" class="platform-item" @click="shareTo(platform.id)">
                    <el-icon>
                        <component :is="platform.icon" />
                    </el-icon>
                    <span>{{ platform.name }}</span>
                </div>
            </div>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="loading" @click="handleShare">
                    {{ shareUrl ? '更新分享' : '生成链接' }}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
    import { computed, ref } from 'vue';
    import { Refresh } from '@element-plus/icons-vue';
    import clipboard3 from 'vue-clipboard3';
    import { createShare } from '@/api/share';

    const props = defineProps({
        modelValue: Boolean,
        codeId: {
            type: [String, Number],
            required: true
        }
    });

    // 生成随机密码
    const randomPassword = () => {
        return Math.random().toString(36).slice(-6).toUpperCase();
    };

    const emit = defineEmits(['update:modelValue']);

    // 对话框显示状态
    const dialogVisible = computed({
        get: () => props.modelValue,
        set: val => emit('update:modelValue', val)
    });

    const shareFormRef = ref(null);
    // 分享表单数据
    const shareForm = ref({
        expire: 7,
        needPassword: false,
        password: randomPassword()
    });

    const shareRules = {
        expire: [{ required: true, message: '请选择有效期', trigger: 'change' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    };

    // 有效期选项
    const expireOptions = [
        { label: '1天', value: 1 },
        { label: '7天', value: 7 },
        { label: '30天', value: 30 },
        { label: '半年', value: 180 },
        { label: '1年', value: 365 },
        { label: '永久', value: -1 }
    ];

    // 分享平台
    const platforms = [
        { id: 'wechat', name: '微信', icon: 'WechatFilled' },
        { id: 'qq', name: 'QQ', icon: 'Platform' },
        { id: 'qrcode', name: '二维码', icon: 'Postcard' }
    ];

    const loading = ref(false);
    const shareUrl = ref('');

    // 重新生成密码
    const generatePassword = () => {
        shareForm.value.password = randomPassword();
    };

    // 复制链接
    const { toClipboard } = clipboard3();
    const copyLink = async () => {
        try {
            const copyValue = '链接:' + shareUrl.value + '\n' + (shareForm.value.needPassword ? '密码:' + shareForm.value.password : '');
            await toClipboard(copyValue);
            ElMessage.success('链接已复制到剪贴板');
        } catch (error) {
            ElMessage.error('复制失败');
        }
    };

    // 处理分享
    const handleShare = async () => {
        // 验证表单
        const valid = await shareFormRef.value.validate();
        if (!valid) return;

        if (shareForm.value.needPassword && !shareForm.value.password) {
            shareForm.value.password = randomPassword();
        }

        loading.value = true;
        try {
            const res = await createShare({
                codeId: props.codeId,
                expire: expireOptions.filter(item => item.value === shareForm.value.expire)[0].label,
                password: shareForm.value.needPassword ? shareForm.value.password : null
            });
            shareUrl.value = `${window.location.origin}/share/${res.data.shareId}`;
            ElMessage.success('分享链接生成成功');
        } finally {
            loading.value = false;
        }
    };

    // 分享到其他平台
    const shareTo = platform => {
        // TODO: 实现各平台的分享逻辑
        ElMessage.info(`分享到${platform}的功能正在开发中`);
    };
</script>

<style lang="scss" scoped>
    .share-dialog {
        :deep(.el-dialog__body) {
            padding: 0;
        }

        .share-card {
            border: none;

            :deep(.el-card__body) {
                padding: 24px;
            }
        }

        .password-setting {
            .switch-wrapper {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .switch-label {
                color: var(--el-text-color-regular);
                font-size: 14px;
            }
        }

        .share-link {
            display: flex;
            gap: 8px;
        }

        .share-platforms {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-top: 24px;
            padding: 16px;
            background: var(--el-fill-color-light);
            border-radius: 8px;

            .platform-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s;
                padding: 8px 16px;
                border-radius: 6px;

                &:hover {
                    transform: translateY(-2px);
                    color: var(--el-color-primary);
                    background: var(--el-fill-color);
                }

                .el-icon {
                    font-size: 24px;
                }

                span {
                    font-size: 12px;
                }
            }
        }
    }

    :deep(.el-select) {
        width: 100%;
    }
</style>
