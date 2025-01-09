<template>
    <div class="share-page">
        <template v-if="loading">
            <div class="loading-wrapper">
                <el-skeleton :rows="10" animated />
            </div>
        </template>

        <template v-else-if="error">
            <div class="error-wrapper">
                <el-empty :description="error" />
            </div>
        </template>

        <!-- 密码验证弹窗 -->
        <SharePasswordDialog v-model="showPasswordDialog" @verify="handleVerifyPassword" />
    </div>
</template>

<script setup>
    import { onMounted, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { getShareCodeDetail, getShareInfo } from '@/api/share';
    import SharePasswordDialog from '@/components/SharePasswordDialog/index.vue';

    const router = useRouter();
    const route = useRoute();
    const loading = ref(true);
    const error = ref('');
    const showPasswordDialog = ref(false);

    // 检查分享是否有效
    const checkShare = async () => {
        loading.value = true;
        error.value = '';

        try {
            const res = await getShareInfo(route.params.shareId);

            if (res.data.isExpire === true) {
                error.value = '分享链接已过期';
                return false;
            }

            if (res.data.needPassword === true) {
                showPasswordDialog.value = true;
                return false;
            }

            handleVerifyPassword();
        } catch (err) {
            error.value = '分享链接无效';
            return false;
        } finally {
            loading.value = false;
        }
    };

    // 验证密码
    const handleVerifyPassword = async password => {
        getShareCodeDetail(route.params.shareId, password).then(res => {
            showPasswordDialog.value = false;
            // 跳转到 代码详情页面，且路由地址不变
            router.replace({
                name: 'detail',
                params: {
                    id: res.data.codeShareInfoVo.id
                }
            });
        });
    };

    onMounted(checkShare);
</script>

<style scoped>
    .share-page {
        padding: 20px;
        min-height: 100vh;
    }

    .loading-wrapper,
    .error-wrapper {
        max-width: 800px;
        margin: 40px auto;
    }
</style>
