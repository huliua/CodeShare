<script setup>
    import { nextTick, onActivated, ref, computed, markRaw } from 'vue';
    import FileManagement from '@/components/FileManagement/index.vue';
    import CodeEditor from '@/components/CodeEditor/index.vue';
    import { CirclePlus, Document, Edit, Folder, RefreshLeft, Remove, FolderChecked, Upload, UploadFilled, Management, CloseBold, Back } from '@element-plus/icons-vue';
    import { extractTemplateVariables, getUuid, isBlank } from '@/utils/commonUtils';
    import { saveBaseInfo, saveCodeFiles, saveTemplates } from '@/api/codeShare';
    import { useDictStore } from '@/store/dictStore.js';

    const dictStore = useDictStore();
    const router = useRouter();
    const fileManagementRef = ref(null);

    // 文件目录树形结构
    const treeRef = ref(null);
    const fileTree = ref([]);
    const parentNode = ref(null);

    // 当前文件对应的代码内容以及编程语言
    const codeEditorVisible = ref(false);
    const codes = ref('');
    const lang = ref('');
    const currentFileId = ref('');

    // 弹窗表单
    const form = ref({});
    const rules = ref({
        name: [
            { required: true, message: '请输入文件/文件夹名称', trigger: 'blur' },
            { min: 1, max: 100, message: '文件/文件夹名称长度为1-100', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请输入文件/文件夹名称', trigger: 'blur' }]
    });
    const formLabelWidth = '100px';
    const formRef = ref(null);
    const dialogFormVisible = ref(false);
    const dialogFormTitle = ref('新增');

    // 更多设置
    const infoFormRef = ref(null);
    const infoForm = ref({
        isTemplate: '1'
    });
    const infoFormRules = ref({
        title: [
            { required: true, message: '请输入标题', trigger: 'blur' },
            { min: 1, max: 20, message: '标题长度为1-20', trigger: 'blur' }
        ],
        visibility: [{ required: true, message: '请选择可见性', trigger: 'blur' }],
        password: [
            { min: 1, max: 15, message: '密码长度为1-15', trigger: 'blur' },
            { required: true, message: '请输入密码', trigger: 'blur' }
        ]
    });
    const tagOptions = ref([]);
    onActivated(async () => {
        // 初始化字典数据
        tagOptions.value = await dictStore.getDict('t_tag');
    });

    const allSteps = computed(() => {
        const steps = [
            {
                title: '基本信息',
                icon: Edit
            },
            {
                title: '代码文件',
                icon: Upload
            }
        ];
        if (infoForm.value.isTemplate === '1') {
            steps.push({
                title: '模板设置',
                icon: Management
            });
        }
        return steps;
    });
    const activeStep = ref(0);

    const formRefs = ref({});
    const templateFields = ref([]);
    const templateFieldsRules = ref({
        name: [
            { required: true, message: '请输入字段名', trigger: 'blur' },
            { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择字段类型', trigger: 'blur' }]
    });

    /**
     * 选中文件/文件夹
     * @param {Object} data - 当前选择的节点的对象。
     */
    function handleFileSelect(selectedFile) {
        if (selectedFile) {
            codes.value = selectedFile.content || '';
            currentFileId.value = selectedFile.id;
            let fileExtention = selectedFile.name.split('.')[1] || '';
            switch (fileExtention) {
                case 'js':
                    lang.value = 'javascript';
                    break;
                case 'html':
                    lang.value = 'html';
                    break;
                case 'css':
                    lang.value = 'css';
                    break;
                case 'json':
                    lang.value = 'json';
                    break;
                case 'md':
                    lang.value = 'markdown';
                    break;
                case 'py':
                    lang.value = 'python';
                    break;
                case 'ts':
                    lang.value = 'typescript';
                    break;
                case 'java':
                    lang.value = 'java';
                    break;
                case 'c':
                    lang.value = 'c';
                    break;
                case 'cpp':
                    lang.value = 'cpp';
                    break;
                case 'php':
                    lang.value = 'php';
                    break;
                case 'go':
                    lang.value = 'go';
                    break;
                default:
                    lang.value = fileExtention;
            }
            codeEditorVisible.value = true;
        } else {
            codeEditorVisible.value = false;
            codes.value = '';
            lang.value = '';
            currentFileId.value = '';
        }
    }

    function handleFileTreeChange(newFileTree) {
        fileTree.value = newFileTree;
    }

    /**
     * 保存代码信息
     * @param type 保存类型 0：保存 1保存并下一步
     */
    function saveCodes(type) {
        if (!infoForm.value.id) {
            ElMessage({
                showClose: true,
                message: '请先保存基本信息',
                type: 'warning'
            });
            return;
        }
        // 文件信息
        const fileList = [];
        if (fileManagementRef.value) {
            fileManagementRef.value.deepBuildTreeFile(fileList, fileManagementRef.value.getFileTree());
        }
        // 为每个file设置infoId
        fileList.forEach(file => {
            file.infoId = infoForm.value.id;
        });

        // 保存代码
        saveCodeFiles(fileList).then(res => {
            ElMessage({
                showClose: true,
                message: '保存成功',
                type: 'success'
            });

            if (type === 1) {
                activeStep.value++;
            }
        });
    }

    /**
     * 提交表单
     */
    function submitForm() {
        infoFormRef.value.validate(valid => {
            if (!valid) {
                return false;
            }

            const param = {};
            // 基本信息
            param.codeShareInfo = infoForm.value;

            // 标签信息
            const tags = [];
            const selected = infoForm.value.tags || [];
            selected.forEach(tag => {
                tags.push({
                    code: (tagOptions.value || []).find(item => item.code === tag)?.code || '',
                    name: (tagOptions.value || []).find(item => item.code === tag)?.name || tag
                });
            });
            param.tagList = tags;

            // 保存代码基本信息
            saveBaseInfo(param).then(res => {
                ElMessage({
                    showClose: true,
                    message: '保存成功',
                    type: 'success'
                });
                // 记录id
                infoForm.value.id = res.data;
                // 跳转到下一步
                activeStep.value++;
            });
        });
    }

    /**
     * 完成
     */
    function finish() {
        // 重置数据
        resetForm();
        activeStep.value = 0;
        fileTree.value = [];

        // 跳转
        if (infoForm.value.id) {
            router.push({ path: `detail/${infoForm.value.id}` });
        } else {
            router.push('/my');
        }
    }

    /**
     * 重置表单
     */
    function resetForm() {
        infoFormRef.value.resetFields();
    }

    function autoGenTemplate() {
        const fileList = [];
        if (fileManagementRef.value) {
            fileManagementRef.value.deepBuildTreeFile(fileList, fileManagementRef.value.getFileTree());
        }

        if (fileList.length === 0) {
            ElMessage({
                showClose: true,
                message: '请先维护代码文件',
                type: 'warning'
            });
            return;
        }

        const templateFieldsTemp = [];
        const templateFieldsMap = {};
        let index = 1;
        fileList.forEach(file => {
            // 先判断文件名中是否包含模板字段
            if (file.name && /\$\{[^}]+}/.test(file.name)) {
                const templateVariables = extractTemplateVariables(file.name);
                // 循环保存模板变量
                templateVariables.forEach(variable => {
                    if (isBlank(templateFieldsMap[variable])) {
                        templateFieldsMap[variable] = '1';
                        templateFieldsTemp.push({
                            infoId: infoForm.value.id,
                            name: variable,
                            type: 'text',
                            description: '',
                            required: 1,
                            sort: index++
                        });
                    }
                });
            }
            if (file.content && /\$\{[^}]+}/.test(file.content)) {
                const templateVariables = extractTemplateVariables(file.content);
                templateVariables.forEach(variable => {
                    if (isBlank(templateFieldsMap[variable])) {
                        templateFieldsMap[variable] = '1';
                        templateFieldsTemp.push({
                            infoId: infoForm.value.id,
                            name: variable,
                            type: 'text',
                            description: '',
                            required: 1,
                            sort: index++
                        });
                    }
                });
            }
        });
        if (templateFieldsTemp.length === 0) {
            ElMessage({
                showClose: true,
                message: '没有发现模板变量，请检查是否正确按照"${变量名}"的格式维护代码模板！',
                type: 'warning'
            });
            return;
        }

        // 将templateFieldsTemp数据合并到templateFields.value中
        const templateFieldsFinal = [];
        templateFieldsTemp.forEach(item => {
            // 如果templateFields中存在该字段，就直接取templateFields中的字段信息
            if (templateFields.value.some(item2 => item2.name === item.name)) {
                templateFieldsFinal.push(Object.assign({}, templateFields.value.filter(item2 => item2.name === item.name)[0], item.sort));
            } else {
                templateFieldsFinal.push(item);
            }
        });
        templateFields.value = templateFieldsFinal;
    }

    const validateAllForms = () => {
        return new Promise(async (resolve, reject) => {
            let valid = true;
            for (const item of templateFields.value) {
                const formRef = formRefs.value['templateFormRef' + item.name];
                if (formRef) {
                    await formRef.validate(isValid => {
                        if (!isValid) {
                            valid = false;
                        }
                    });
                }
            }
            if (valid) {
                resolve();
            } else {
                reject();
            }
        });
    };

    /**
     * 保存代码模板信息
     * @param type 保存类型，0：保存，1：保存并下一步
     */
    function saveTemplate(type) {
        if (!infoForm.value.id) {
            ElMessage({
                showClose: true,
                message: '请先保存基本信息',
                type: 'warning'
            });
            return;
        }
        if (templateFields.value.length === 0) {
            if (type === 0) {
                ElMessage({
                    showClose: true,
                    message: '请先维护模板字段',
                    type: 'warning'
                });
            } else if (type === 1) {
                // 直接跳转到下一步
                activeStep.value++;
            }
            return;
        }
        validateAllForms()
            .then(() => {
                // 保存模板信息
                saveTemplates(templateFields.value).then(res => {
                    ElMessage({
                        showClose: true,
                        message: '保存成功',
                        type: 'success'
                    });

                    if (type === 1) {
                        activeStep.value++;
                    }
                });
            })
            .catch(err => {
                ElMessage({
                    showClose: true,
                    message: '表单校验失败，请检查输入',
                    type: 'error'
                });
            });
    }

    function removeTemplateFields(name) {
        // 从templateFields中移除name属性为name的对象
        templateFields.value = templateFields.value.filter(item => item.name !== name);
    }

    function callAppendInChild() {
        if (fileManagementRef.value) {
            fileManagementRef.value.append(null);
        }
    }
</script>

<template>
    <div class="create-page">
        <!-- Page Header -->
        <div class="page-header">
            <h2 class="page-title">创建代码</h2>
            <p class="page-desc">创建并管理你的代码片段或模板</p>
        </div>

        <!-- Steps -->
        <div class="steps-wrapper">
            <el-steps :active="activeStep" align-center :finish-status="'success'">
                <el-step v-for="(item, index) in allSteps" :key="index" :title="item.title" :icon="item.icon" />
            </el-steps>
        </div>

        <!-- Step 1: 基本信息 -->
        <div v-show="activeStep === 0" class="step-card">
            <el-form ref="infoFormRef" :model="infoForm" :rules="infoFormRules" label-width="100px" :inline="false" :size="'default'">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="infoForm.title" autocomplete="off" placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="infoForm.description" type="textarea" autocomplete="off" placeholder="请输入描述" />
                </el-form-item>
                <el-form-item label="可见性" prop="visibility">
                    <el-select v-model="infoForm.visibility" placeholder="请选择可见性" clearable>
                        <template #label="{ label, value }">
                            <span>{{ label }}:</span>
                            <span style="font-weight: bold">{{ value }}</span>
                        </template>
                        <el-option label="公开" value="public" selected />
                        <el-option label="私密" value="private" />
                        <el-option label="加密" value="cryptographic" />
                    </el-select>
                </el-form-item>
                <el-form-item label="是否模板代码" prop="isTemplate">
                    <el-switch v-model="infoForm.isTemplate" inline-prompt active-text="是" inactive-text="否" active-value="1" inactive-value="0" />
                </el-form-item>
                <el-form-item v-if="infoForm.visibility === 'cryptographic'" label="密码" prop="password">
                    <el-input v-model="infoForm.password" type="password" show-password autocomplete="off" placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="标签" prop="tags">
                    <el-select v-model="infoForm.tags" multiple filterable clearable allow-create default-first-option placeholder="请选择标签">
                        <el-option v-for="item in tagOptions" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                    <el-input v-model="infoForm.cover" autocomplete="off" placeholder="请输入封面链接">
                        <template #prepend>http(s)://</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="step-actions">
                <el-button v-if="!isBlank(infoForm.id)" type="success" @click="activeStep++">下一步</el-button>
                <el-button :icon="UploadFilled" type="primary" @click="submitForm">保存并下一步</el-button>
                <el-button :icon="RefreshLeft" @click="resetForm">重置</el-button>
            </div>
        </div>

        <!-- Step 2: 代码文件 -->
        <div v-show="activeStep === 1" class="step-card file-step">
            <div class="step-toolbar">
                <el-button type="primary" :icon="CirclePlus" @click="callAppendInChild">新增文件/夹</el-button>
                <el-button @click="activeStep--">上一步</el-button>
                <el-button :icon="FolderChecked" @click="saveCodes(0)">保存</el-button>
                <el-button type="success" :icon="UploadFilled" @click="saveCodes(1)">保存并下一步</el-button>
            </div>
            <div class="file-area">
                <FileManagement ref="fileManagementRef" :initial-file-tree="fileTree" :code-id="infoForm.id" style="width: 100%; height: 100%" @file-tree-change="handleFileTreeChange" @file-select="handleFileSelect" />
            </div>
        </div>

        <!-- Step 3: 模板设置 -->
        <div v-show="allSteps.length === 3 && activeStep === 2" class="step-card">
            <div class="step-toolbar">
                <el-button @click="activeStep--">上一步</el-button>
                <el-button type="primary" @click="autoGenTemplate">生成模版字段</el-button>
                <el-button :icon="FolderChecked" @click="saveTemplate(0)">保存</el-button>
                <el-button type="success" :icon="UploadFilled" @click="saveTemplate(1)">保存并下一步</el-button>
            </div>
            <el-row v-show="templateFields.length > 0" wrap style="width: 100%" :gutter="20">
                <el-col v-for="item in templateFields" :key="item.name" :span="12" style="margin-top: 20px">
                    <el-card>
                        <template #header>
                            <el-row justify="end">
                                <el-button type="danger" size="small" circle :icon="CloseBold" class="delete-circle-icon" @click="removeTemplateFields(item.name)" />
                            </el-row>
                        </template>
                        <el-form :ref="el => (formRefs['templateFormRef' + item.name] = el)" label-width="auto" :model="item" :rules="templateFieldsRules">
                            <el-form-item label="标识名" prop="name">
                                <el-input v-model="item.name" disabled />
                            </el-form-item>
                            <el-form-item label="类型" prop="type">
                                <el-select v-model="item.type" placeholder="请选择标识类型">
                                    <el-option label="文本框" value="text" />
                                    <el-option label="开关" value="switcher" />
                                    <el-option label="单选框" value="select" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="描述信息" prop="description">
                                <el-input v-model="item.description" />
                            </el-form-item>
                            <el-form-item label="是否必填" prop="required">
                                <el-switch v-model="item.required" :active-value="1" :inactive-value="0" />
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-col>
            </el-row>
            <el-empty v-show="templateFields.length === 0" description="暂无数据" />
        </div>

        <!-- Complete -->
        <div v-show="allSteps.length === activeStep" class="step-card">
            <el-result icon="success" title="保存完成">
                <template #extra>
                    <el-button @click="activeStep--">上一步</el-button>
                    <el-button type="primary" @click="finish">完成</el-button>
                </template>
            </el-result>
        </div>

        <!-- Dialog -->
        <el-dialog v-model="dialogFormVisible" :title="dialogFormTitle" width="500">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="left">
                <el-form-item label="文件名" :label-width="formLabelWidth" prop="name">
                    <el-input v-model="form.name" autocomplete="off" @keydown.enter.prevent="save" />
                </el-form-item>
                <el-form-item label="文件类型" :label-width="formLabelWidth" prop="type">
                    <el-select v-model="form.type" placeholder="请选择文件类型">
                        <el-option label="文件" value="file" />
                        <el-option label="文件夹" value="folder" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="save">确定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped lang="scss">
    .create-page {
        padding-bottom: 20px;
    }

    .page-header {
        margin-bottom: 20px;
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

    .steps-wrapper {
        background: var(--cs-surface);
        border: 1px solid var(--cs-border);
        border-radius: var(--cs-radius-lg);
        padding: 20px 24px;
        margin-bottom: 20px;
    }

    .step-card {
        background: var(--cs-surface);
        border: 1px solid var(--cs-border);
        border-radius: var(--cs-radius-lg);
        padding: 24px;
    }

    .step-card.file-step {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 280px);
        min-height: 400px;
    }

    .step-toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-shrink: 0;
    }

    .step-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
    }

    .file-area {
        flex: 1;
        overflow: hidden;
    }

    .delete-circle-icon {
        width: 18px;
        height: 18px;
    }
    /* 文件树节点样式优化 */
    /* :deep(.el-tree) {
        background: transparent;

        .el-tree-node {
            position: relative;
            padding: 4px 0;
        }

        .el-tree-node__content {
            height: 36px;
            padding: 0 8px;
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
                cursor: grab;
                background-color: var(--el-color-primary-light-9);
            }
        }
    } */

    /* .custom-tree-node {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
        font-size: 14px;
        max-width: calc(100% - 24px);
    } */

    /* .file-tree-node-label {
        display: flex;
        align-items: center;

        .el-icon {
            font-size: 18px;

            /* 文件夹图标颜色 */
    /* &.folder-icon {
                color: #f4b63e;
            }
        }

        span {
            margin-left: 8px;
        }
    } */

    /* 操作按钮样式 */
    /* .action-buttons {
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.2s;

        .el-icon {
            padding: 4px;
            font-size: 16px;
            border-radius: 4px;
            transition: all 0.2s;

            &:hover {
                background-color: var(--el-color-primary-light-8);
            }
        }
    } */

    /* 鼠标悬停时显示操作按钮 */
    /* .el-tree-node__content:hover .action-buttons {
        opacity: 1;
    } */

    /* 拖拽相关样式优化 */
    /* :deep(.el-tree-node.is-drop-inner) {
        & > .el-tree-node__content {
            background-color: var(--el-color-primary-light-9);
            border: 1px dashed var(--el-color-primary);
            border-radius: 4px;
        }
    } */

    /* :deep(.el-tree-node__drop-prev),
    :deep(.el-tree-node__drop-next) {
        position: relative;

        &::before {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--el-color-primary);
            content: '';
        }
    } */

    /* :deep(.el-tree-node__drop-prev::before) {
        top: -2px;
    } */

    /* :deep(.el-tree-node__drop-next::before) {
        bottom: -2px;
    } */
</style>
