<template>
    <el-dialog v-model="dialogVisible" title="访问验证" width="400px" :close-on-click-modal="false" :show-close="false">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
            <el-form-item prop="password">
                <el-input v-model="form.password" placeholder="请输入访问密码" maxlength="6" show-password @keyup.enter="handleSubmit">
                    <template #prefix>
                        <el-icon>
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" :loading="loading" @click="handleSubmit">验证</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
    import { ref } from 'vue';
    import { Lock } from '@element-plus/icons-vue';

    const props = defineProps({
        modelValue: Boolean
    });

    const emit = defineEmits(['update:modelValue', 'verify']);

    const dialogVisible = computed({
        get: () => props.modelValue,
        set: val => emit('update:modelValue', val)
    });

    const form = ref({
        password: ''
    });

    const rules = {
        password: [
            { required: true, message: '请输入访问密码', trigger: 'blur' },
            { len: 6, message: '密码长度必须为6位', trigger: 'blur' }
        ]
    };

    const loading = ref(false);
    const formRef = ref(null);

    const handleSubmit = async () => {
        if (!formRef.value) return;

        await formRef.value.validate();
        loading.value = true;
        try {
            emit('verify', form.value.password);
        } finally {
            loading.value = false;
        }
    };
</script>
