<script setup>
    import { computed } from 'vue';
    import { getTemplateFields } from '@/api/codeShare.js';

    const props = defineProps({
        infoId: String,
        visible: Boolean
    });

    const visible = computed({
        get: () => props.visible,
        set: val => emits('update:visible', val)
    });
    const templateFields = ref([]);
    const form = ref({});
    const formRef = ref({});
    const rules = computed(() => {
        const rules = {};
        templateFields.value.forEach(item => {
            if (item.required === 1) {
                rules[item.name] = [{ required: true, message: `${item.name}不能为空`, trigger: 'blur' }];
            }
        });
        return rules;
    });

    // 触发文本内容变更事件
    const emits = defineEmits(['update:visible', 'submit']);

    watch(
        () => props.visible,
        val => {
            if (!val) {
                formRef.value.resetFields();
                templateFields.value = [];
                return;
            }
            getTemplateFields(props.infoId).then(res => {
                templateFields.value = res.data || [];
                nextTick(() => {
                    formRef.value.clearValidate();
                }, 1000);
            });
        }
    );

    function doSubmit() {
        formRef.value.validate(valid => {
            if (valid) {
                emits('submit', form.value);
            }
        });
    }
</script>

<template>
    <el-dialog v-model="visible" title="模板字段" width="800px" draggable :lock-scroll="true" @close="visible = false">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="auto" label-position="top">
            <el-form-item v-for="(item, index) in templateFields" :key="index" :label="item.name" :prop="item.name">
                <el-input v-model="form[item.name]" :placeholder="item.description || ''"></el-input>
            </el-form-item>
        </el-form>
        <el-row justify="center">
            <el-button type="primary" @click="doSubmit">生成</el-button>
            <el-button @click="visible = false">取消</el-button>
        </el-row>
    </el-dialog>
</template>

<style scoped></style>
