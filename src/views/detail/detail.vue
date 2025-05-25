<script setup>
    import { markRaw, nextTick, onMounted, ref, computed } from 'vue';
    import FileManagement from '@/components/FileManagement/index.vue';
    import { Back, CirclePlus, CloseBold, Delete, Document, DocumentAdd, Edit, EditPen, Folder, FolderAdd, FolderChecked, Management, RefreshLeft, Remove, SortDown, SortUp, Upload, UploadFilled } from '@element-plus/icons-vue';
    import { extractTemplateVariables, getUuid, isBlank } from '@/utils/commonUtils';
    import { deleteCode, getCodeShare, saveBaseInfo, saveCodeFiles, saveTemplates } from '@/api/codeShare';
    import { useRoute, useRouter } from 'vue-router';
    import { useDictStore } from '@/store/dictStore.js';
    import { ClickOutside as vClickOutside } from 'element-plus';
    import ShareCodeDialog from '@/components/ShareCodeDialog/index.vue';

    const router = useRouter();
    const fileManagementRef = ref(null);

    const readOnly = ref(false);
    const dictStore = useDictStore();
    const route = useRoute();

    const id = ref('');
    const accessToken = ref('');

    // 文件目录树形结构
    const treeRef = ref(null);
    const fileTree = ref([]);
    const parentNode = ref(null);

    // 当前文件对应的代码内容以及编程语言
    const codeEditorVisible = ref(false);
    const codes = ref('');
    const lang = ref('');
    const currentFileId = ref('');

    // 当前步骤（默认为代码页面）
    const activeStep = ref(1);

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

    // 弹窗表单
    const form = ref({});
    const rules = ref({
        name: [
            { required: true, message: '请输入文件/文件夹名称', trigger: 'blur' },
            { min: 1, max: 100, message: '文件/文件夹名称长度为1-100', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请输入文件/文件夹名称', trigger: 'blur' }]
    });
    const formRef = ref(null);
    const dialogFormVisible = ref(false);
    const dialogFormTitle = ref('新增');

    // 更多设置
    const infoFormRef = ref(null);
    const infoForm = ref({});
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

    // 右键菜单
    const showContextMenu = ref(false);
    const left = ref(0);
    const top = ref(0);

    const tagOptions = ref([]);
    onMounted(async () => {
        // 当前数据id
        id.value = route.params.id;
        accessToken.value = route.query.accessToken || '';

        // 是否只读
        readOnly.value = route.meta.readonly === true;

        // 初始化字典数据
        tagOptions.value = await dictStore.getDict('t_tag');

        // 获取
        getCodeShare(id.value, accessToken.value).then(res => {
            const initialData = res.data;
            if (initialData) {
                fileTree.value = initialData.codeShareFileList || [];
                templateFields.value = initialData.templateList || [];
                infoForm.value = initialData.codeShareInfoVo || {};
                infoForm.value.tags = (initialData.tagList || []).map(item => ((tagOptions.value || []).some(tag => tag.code === item.code) ? item.code : item.name));
            }
        });

        // 获取数据后添加一个短暂延时，确保树节点完全渲染
        await nextTick();
    });

    function handleFileTreeChange(newFileTree) {
        fileTree.value = newFileTree;
    }

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
            if (id.value) {
                param.codeShareInfo.id = id.value;
            }

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

            // 保存代码
            saveBaseInfo(param).then(async () => {
                ElMessage({
                    message: '保存成功',
                    type: 'success',
                    showClose: true
                });
                activeStep.value++;
                // 重新初始化字典数据(防止修改tag标签后，字典没有及时更新)
                tagOptions.value = await dictStore.getDict('t_tag', false);
            });
        });
    }

    /**
     * 重置表单
     */
    function resetForm() {
        infoFormRef.value.resetFields();
    }

    /**
     * 返回
     */
    function goBack() {
        router.back();
    }

    const confirmVisible = ref(false);

    function doDelete() {
        confirmVisible.value = false;
        deleteCode(id.value).then(res => {
            ElMessage({
                message: '删除成功',
                type: 'success',
                showClose: true
            });
            goBack();
        });
    }

    // 分享对话框显示状态
    const shareDialogVisible = ref(false);

    // 处理分享按钮点击
    const handleShare = () => {
        shareDialogVisible.value = true;
    };

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
     * 自动生成模板字段信息
     */
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
                            required: 1
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
                            required: 1
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
            if (!existsFields(item.name)) {
                templateFieldsFinal.push(item);
            }
        });
        templateFieldsFinal.forEach(item => {
            templateFields.value.push(item);
        });
    }

    const existsFields = function (fieldName) {
        // 先判断普通字段中是否包含该字段
        if (templateFields.value.some(item => item.name === fieldName)) {
            return true;
        }
    };

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
                // 设置每个字段排序
                let index = 1;
                for (const item of templateFields.value) {
                    item.sort = index++;
                }
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

    /**
     * 排序字段
     * @param name 字段名称
     * @param type 类型，up：向上，down：向下
     */
    function sortFields(name, type) {
        if (readOnly.value) {
            return;
        }
        // 先处理普通字段
        for (let index = 0; index < templateFields.value.length; index++) {
            let item = templateFields.value[index];
            if (item.name === name) {
                if (type === 'up') {
                    if (index > 0) {
                        const temp = templateFields.value[index - 1];
                        templateFields.value[index - 1] = templateFields.value[index];
                        templateFields.value[index] = temp;
                    }
                } else if (type === 'down') {
                    if (index < templateFields.value.length - 1) {
                        const temp = templateFields.value[index + 1];
                        templateFields.value[index + 1] = templateFields.value[index];
                        templateFields.value[index] = temp;
                    }
                }
                break;
            }
        }
    }

    function removeTemplateFields(name) {
        if (readOnly.value) {
            return;
        }
        // 从templateFields中移除name属性为name的对象
        templateFields.value = templateFields.value.filter(item => item.name !== name);
    }

    function callAppendInChild_detail() {
        if (fileManagementRef.value) {
            fileManagementRef.value.append(null);
        }
    }
</script>

<template>
    <el-steps :active="activeStep" align-center style="margin: 0 0 18px" :finish-status="'success'">
        <el-step v-for="(item, index) in allSteps" :key="index" :title="item.title" :icon="item.icon" />
    </el-steps>

    <!-- 代码基本信息 -->
    <el-row v-show="activeStep === 0">
        <el-col>
            <el-form ref="infoFormRef" :model="infoForm" :rules="infoFormRules" label-width="100px" :inline="false" :size="'default'" :disabled="readOnly">
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
            <el-row justify="end">
                <el-col style="text-align: right">
                    <el-button v-if="!isBlank(infoForm.id)" type="success" @click="activeStep++">下一步</el-button>
                    <el-button v-if="!readOnly" :icon="UploadFilled" type="primary" @click="submitForm">保存并下一步</el-button>
                    <el-button v-if="!readOnly" :icon="RefreshLeft" type="warning" @click="resetForm">重置</el-button>
                </el-col>
            </el-row>
        </el-col>
    </el-row>
    <el-row v-show="activeStep === 1" class="main-content">
        <el-col :span="24" style="margin-bottom: 20px; width: 100%">
            <el-row>
                <el-button v-if="!readOnly" color="#626aef" :icon="CirclePlus" @click="callAppendInChild_detail">新增文件/夹</el-button>
                <el-button type="warning" @click="activeStep--">上一步</el-button>
                <el-button v-if="!readOnly" :icon="FolderChecked" type="info" @click="saveCodes(0)">保存</el-button>
                <el-button v-if="!readOnly" :icon="UploadFilled" type="success" @click="saveCodes(1)">保存并下一步</el-button>
                <el-button :icon="Back" @click="goBack">返回</el-button>
            </el-row>
            <el-row>
                <FileManagement ref="fileManagementRef" :initial-file-tree="fileTree" :read-only="readOnly" :code-id="id" style="width: 100%; height: 100%" @file-tree-change="handleFileTreeChange" @file-select="handleFileSelect" />
            </el-row>
        </el-col>
    </el-row>

    <el-row v-show="allSteps.length === 3 && activeStep === 2">
        <el-col :span="24">
            <el-row>
                <el-button type="warning" @click="activeStep--">上一步</el-button>
                <el-button v-if="!readOnly" type="primary" @click="autoGenTemplate">生成模版字段</el-button>
                <el-button v-if="!readOnly" :icon="FolderChecked" type="info" @click="saveTemplate(0)">保存</el-button>
                <el-button v-if="!readOnly" :icon="UploadFilled" type="success" @click="saveTemplate(1)">保存并下一步</el-button>
                <el-button v-else type="success" @click="activeStep++">下一步</el-button>
            </el-row>
        </el-col>
        <el-col :span="24">
            <el-row v-show="templateFields.length > 0" wrap style="width: 100%" :gutter="20">
                <el-col v-for="item in templateFields" :key="item.name" :span="12" style="margin-top: 20px">
                    <el-card>
                        <template #header>
                            <el-row justify="start">
                                <el-col :span="12">
                                    <el-button v-show="!readOnly" size="small" text circle :icon="SortDown" class="edit-circle-icon" @click="sortFields(item.name, 'down')"></el-button>
                                    <el-button v-show="!readOnly" size="small" text circle :icon="SortUp" class="edit-circle-icon" @click="sortFields(item.name, 'up')"></el-button>
                                </el-col>
                                <el-col :span="12">
                                    <el-row justify="end">
                                        <el-button v-show="!readOnly" type="danger" size="small" circle :icon="CloseBold" class="delete-circle-icon" @click="removeTemplateFields(item.name)" />
                                    </el-row>
                                </el-col>
                            </el-row>
                        </template>
                        <el-form :ref="el => (formRefs['templateFormRef' + item.name] = el)" label-width="100px" :model="item" :disabled="readOnly" :rules="templateFieldsRules">
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
        </el-col>
    </el-row>

    <el-row v-show="allSteps.length === activeStep">
        <el-col :span="24">
            <el-result icon="success" :title="readOnly ? '查看完成' : '保存完成'">
                <template #extra>
                    <el-button type="warning" @click="activeStep--">上一步</el-button>
                    <el-button type="primary" @click="goBack">完成</el-button>
                </template>
            </el-result>
        </el-col>
    </el-row>

    <!-- 添加文件/文件夹弹窗 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogFormTitle" width="500">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="left">
            <el-form-item label="文件名" label-width="100px" prop="name">
                <el-input v-model="form.name" autocomplete="off" @keydown.enter.prevent="save" />
            </el-form-item>
            <el-form-item label="文件类型" label-width="100px" prop="type">
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

    <el-dialog v-model="confirmVisible" title="提示" width="500" draggable>
        <span>此操作不可撤销，确定要删除吗？</span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="confirmVisible = false">取消</el-button>
                <el-button type="danger" @click="doDelete">确定</el-button>
            </div>
        </template>
    </el-dialog>

    <div class="detail-container">
        <!-- 添加分享对话框组件 -->
        <ShareCodeDialog v-if="!route.meta.readonly" v-model="shareDialogVisible" :code-id="id" />
    </div>
</template>

<style scoped lang="scss">
    .delete-circle-icon {
        width: 18px;
        height: 18px;
    }
    .main-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
        height: calc(100vh - 242px);
        min-height: 400px;
        padding: 20px;
    }

    .file-tree,
    .code-editor {
        height: calc(100% - 52px);
    }

    .header-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
    }
</style>
