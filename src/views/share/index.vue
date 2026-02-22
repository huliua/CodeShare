<script setup>
    import { getShareInfo, getShareIsValid } from '@/api/share';
    import SharePasswordDialog from '@/components/SharePasswordDialog/index.vue';
    import { useRoute, useRouter } from 'vue-router';

    const route = useRoute();
    const router = useRouter();

    const shareId = route.params.shareId;
    const shareInfo = ref({});
    const passwordDialogVisible = ref(false);
    const loading = ref(true);
    const errorMsg = ref('');

    onMounted(() => {
        getShareIsValid(shareId)
            .then(res => {
                if (res.data.needPassword) {
                    passwordDialogVisible.value = true;
                } else {
                    goToDetail(res.data);
                }
                loading.value = false;
            })
            .catch(err => {
                errorMsg.value = err?.msg || '分享链接已失效或不存在';
                loading.value = false;
            });
    });

    const handleVerify = password => {
        getShareInfo(shareId, password)
            .then(res => {
                passwordDialogVisible.value = false;
                goToDetail(res.data);
            })
            .catch((err) => {
                ElMessage.error(err?.msg || '密码错误');
            });
    };

    const goToDetail = data => {
        router.push({
            path: `/detail/${data.codeId}`,
            query: { shareId: shareId, readonly: true }
        });
    };
</script>

<template>
    <div class="share-page">
        <div class="auth-bg">
            <div class="bg-gradient"></div>
            <div class="bg-grid"></div>
        </div>

        <div class="share-container">
            <!-- Loading -->
            <div v-if="loading" class="share-card">
                <div class="share-loading">
                    <el-icon class="is-loading" :size="40" color="var(--cs-accent)"><Loading /></el-icon>
                    <p>正在验证分享链接...</p>
                </div>
            </div>

            <!-- Error -->
            <div v-else-if="errorMsg" class="share-card">
                <el-result icon="warning" :title="errorMsg">
                    <template #extra>
                        <el-button type="primary" @click="router.push('/login')">返回首页</el-button>
                    </template>
                </el-result>
            </div>
        </div>

        <SharePasswordDialog v-model="passwordDialogVisible" @verify="handleVerify" />
    </div>
</template>

<style scoped>
    .share-page {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

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

    .share-container {
        position: relative;
        z-index: 1;
    }

    .share-card {
        background: var(--cs-glass-bg);
        backdrop-filter: var(--cs-glass-blur);
        -webkit-backdrop-filter: var(--cs-glass-blur);
        border: 1px solid var(--cs-auth-card-border);
        border-radius: var(--cs-radius-xl);
        padding: 40px;
        min-width: 400px;
    }

    .share-loading {
        text-align: center;
        padding: 20px;
    }

    .share-loading p {
        color: var(--cs-text-muted);
        margin-top: 16px;
    }
</style>
