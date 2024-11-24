<script setup>
import { nextTick, onActivated } from 'vue';
import CodeEditor from '@/components/CodeEditor/index.vue';
import { CirclePlus, Document, Folder, Remove } from '@element-plus/icons-vue';
import { getUuid } from '@/utils/commonUtils';
import { saveCodes } from '@/api/codeShare';
import { useDictStore } from '@/store/dictStore.js';

const dictStore = useDictStore();
const router = useRouter();
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
        { min: 1, max: 25, message: '文件/文件夹名称长度为1-25', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请输入文件/文件夹名称', trigger: 'blur' }]
});
const formLabelWidth = '100px';
const formRef = ref(null);
const dialogFormVisible = ref(false);
const dialogFormTitle = ref('新增');

// 更多设置
const moreSettingFormRef = ref(null);
const moreSettingForm = ref({});
const moreSettingFormRules = ref({
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

/**
 * 选中文件/文件夹
 * @param {Object} data - 当前选择的节点的对象。
 */
function doSelect(data) {
    // 先把代码编辑器隐藏
    codeEditorVisible.value = false;
    if (data.type === 'file') {
        // 获取文件内容
        codes.value = data.content || '';
        currentFileId.value = data.id;
        let fileExtention = data.name.split('.')[1] || '';
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
        codes.value = '';
        lang.value = '';
    }
}

/**
 * 添加一个新节点到文件树中。
 * @param {Object} node - 当前选择的节点的对象。
 */
function append(node) {
    // 弹窗显示form
    this.dialogFormVisible = true;
    // 设置表单的标题为"新增"
    this.dialogFormTitle = '新增';
    // 重置表单
    this.form = {
        id: getUuid(),
        parentId: node?.key,
        type: 'file',
        children: []
    };
    parentNode.value = node;
    // 清除表单的验证结果
    nextTick(() => {
        if (formRef.value) {
            formRef.value.resetFields();
        }
    });
}

/**
 * 保存新节点到文件树中。
 */
function save() {
    // 表单验证
    formRef.value.validate(valid => {
        if (!valid) {
            return false;
        }
        treeRef.value.append(form.value, parentNode.value ? parentNode.value : null);
        parentNode.value = null;
        // 关闭弹窗
        dialogFormVisible.value = false;
    });
}

/**
 * 从文件树中移除指定的节点。
 * @param {Object} node - 要移除的节点的对象。
 * @param {Object} data - 包含节点信息的对象，用于查找要移除的节点。
 */
function remove(node, data) {
    treeRef.value.remove(data);
    // 如果文件树中不存在当前编辑器打开的文件，则取消显示代码编辑器
    nextTick(() => {
        const currentNode = treeRef.value.getNode(currentFileId.value);
        if (!currentNode) {
            codeEditorVisible.value = false;
            currentFileId.value = '';
            codes.value = '';
            lang.value = '';
        }
    });
}

/**
 * 处理代码内容变化
 * @param {String} content 文件内容
 */
function handleCodeChange(content) {
    // 获取当前选择的文件
    let selectedNode = treeRef.value.getCurrentNode();
    if (selectedNode) {
        // 更新文件内容
        selectedNode.content = content;
    }
}

/**
 * 提交表单
 */
function submitForm() {
    moreSettingFormRef.value.validate(valid => {
        if (!valid) {
            return false;
        }

        const param = {};
        // 基本信息
        param.codeShareInfo = moreSettingForm.value;

        // 文件信息
        const fileList = [];
        deepBuildTreeFile(fileList, fileTree.value);
        param.codeShareFileList = fileList;

        // 标签信息
        const tags = [];
        var selected = moreSettingForm.value.tags || [];
        selected.forEach(tag => {
            tags.push({
                code: (tagOptions.value || []).find(item => item.code === tag)?.code || '',
                name: (tagOptions.value || []).find(item => item.code === tag)?.name || tag
            });
        });
        param.tagList = tags;

        // 保存代码
        saveCodes(param).then(res => {
            ElMessage({
                showClose: true,
                message: '保存成功',
                type: 'success'
            });

            // 重置数据
            resetForm();
            fileTree.value = [];

            // 跳转
            if (res.msg) {
                router.push({ path: `detail/${res.data}` });
            } else {
                router.push('/my');
            }
        });
    });
}

/**
 * 重置表单
 */
function resetForm() {
    moreSettingFormRef.value.resetFields();
}

function deepBuildTreeFile(fileList, treeFileList, parentId = null) {
    treeFileList.forEach(file => {
        const treeFile = {
            id: file.id,
            name: file.name,
            parentId: parentId || '',
            type: file.type,
            content: file.content
        };
        fileList.push(treeFile);
        if (file.children && file.children.length > 0) {
            deepBuildTreeFile(fileList, file.children, file.id);
        }
    });
}
</script>

<template>
    <el-row class="main-content">
        <!-- 文件目录 -->
        <el-col :span="fileTree.length > 0 ? 10 : 24" class="file-tree">
            <el-row>
                <el-col :span="24">
                    <el-button :icon="CirclePlus" @click="append(null)" style="margin: 8px 4px">新增文件</el-button>
                    <el-tree :highlight-current="true" ref="treeRef" style="max-width: 98%" :data="fileTree" :node-key="'id'" default-expand-all :expand-on-click-node="false" @node-click="doSelect" :props="{ label: 'name', children: 'children', class: 'file-tree-node' }">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <span class="file-tree-node-label">
                                    <el-icon v-if="data.type === 'folder'">
                                        <Folder />
                                    </el-icon>
                                    <el-icon v-else>
                                        <Document />
                                    </el-icon>
                                    <span style="margin-left: 8px">{{ data.name }}</span>
                                </span>
                                <span style="display: flex">
                                    <el-icon @click="append(node)" v-if="data.type === 'folder'">
                                        <CirclePlus />
                                    </el-icon>
                                    <el-icon style="margin-left: 8px" @click.stop="remove(node, data)">
                                        <Remove />
                                    </el-icon>
                                </span>
                            </span>
                        </template>
                        <template #empty>
                            <el-empty :image-size="200" description="请添加文件或文件夹" />
                        </template>
                    </el-tree>
                </el-col>
            </el-row>
        </el-col>

        <!-- 文件预览 -->
        <el-col :span="codeEditorVisible ? 14 : 0" class="code-editor">
            <CodeEditor v-show="codeEditorVisible" :key="currentFileId" v-model:code="codes" :lang="lang" @change="handleCodeChange" />
        </el-col>
    </el-row>

    <!-- 代码基本信息 -->
    <el-collapse :model-value="['baseInfo']">
        <el-collapse-item title="基本信息" name="baseInfo">
            <el-form :model="moreSettingForm" ref="moreSettingFormRef" :rules="moreSettingFormRules" label-width="100px" :inline="false" :size="'default'">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="moreSettingForm.title" autocomplete="off" placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="moreSettingForm.description" autocomplete="off" placeholder="请输入描述" />
                </el-form-item>
                <el-form-item label="可见性" prop="visibility">
                    <el-select v-model="moreSettingForm.visibility" placeholder="请选择可见性" clearable>
                        <template #label="{ label, value }">
                            <span>{{ label }}:</span>
                            <span style="font-weight: bold">{{ value }}</span>
                        </template>
                        <el-option label="公开" value="public" selected />
                        <el-option label="私密" value="private" />
                        <el-option label="加密" value="cryptographic" />
                    </el-select>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="moreSettingForm.visibility === 'cryptographic'">
                    <el-input v-model="moreSettingForm.password" type="password" show-password autocomplete="off" placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="标签" prop="tags">
                    <el-select v-model="moreSettingForm.tags" multiple filterable clearable allow-create default-first-option placeholder="请选择标签">
                        <el-option v-for="item in tagOptions" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                    <el-input v-model="moreSettingForm.cover" autocomplete="off" placeholder="请输入封面链接">
                        <template #prepend>http(s)://</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <el-row justify="end">
                <el-col style="text-align: right">
                    <el-button type="primary" @click="submitForm">发布</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-col>
            </el-row>
        </el-collapse-item>
    </el-collapse>

    <!-- 添加文件/文件夹弹窗 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogFormTitle" width="500">
        <el-form :model="form" ref="formRef" :rules="rules" label-position="left">
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
</template>

<style scoped>
.main-content {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    box-sizing: border-box;
    height: calc(100vh - 160px);
    min-height: 400px;
    padding: 20px;
}

.file-tree,
.code-editor {
    height: 100%;
}

.custom-tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    font-size: 16px;
    cursor: pointer;
}

.file-tree-node-label {
    display: flex;
    align-items: center;
}

.file-tree-node {
    margin: 8px 0;
}
</style>