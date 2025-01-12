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
        <SharePasswordDialog v-model="showPasswordDialog" @verify="getShareCode" />
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

            getShareCode();
        } catch (err) {
            error.value = '分享链接无效';
            return false;
        } finally {
            loading.value = false;
        }
    };

    // 获取分享的代码
    const getShareCode = async password => {
        getShareCodeDetail(route.params.shareId, password).then(res => {
            if (showPasswordDialog.value) {
                showPasswordDialog.value = false;
            }
            router.push({
                path: `/share/detail/${res.data.shareCodeId}`,
                query: {
                    accessToken: res.data.accessToken
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
