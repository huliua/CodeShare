<script setup>
import { nextTick } from 'vue';
import CodeEditor from '@/components/CodeEditor/index.vue';
import { Folder, Document, CirclePlus, Remove } from '@element-plus/icons-vue';
import { getUuid } from '@/utils/commonUtils';
// 文件目录树形结构
const treeRef = ref(null);
const fileTree = ref([]);
const parentNode = ref(null);

// 当前文件对应的代码内容以及编程语言
const codeEditorVisible = ref(true);
const codes = ref('');
const lang = ref('');

// 弹窗表单
const form = ref({});
const rules = ref({
    name: [
        { required: true, message: '请输入文件/文件夹名称', trigger: 'blur' },
        { min: 1, max: 15, message: '文件/文件夹名称长度为1-15', trigger: 'blur' },
    ],
    type: [
        { required: true, message: '请输入文件/文件夹名称', trigger: 'blur' }
    ]
});
const formLabelWidth = '100px';
const formRef = ref(null);
const dialogFormVisible = ref(false);
const dialogFormTitle = ref("新增");

// 更多设置
const moreSettingForm = ref({});

/**
 * 选中文件/文件夹
 * @param {Object} node - 当前选择的节点的对象。
 */
function doSelect(data) {
    if (data.type === 'file') {
        // 获取文件内容
        codes.value = data.content || '';
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
        codeEditorVisible.value = false;
    }
}

/**
 * 添加一个新节点到文件树中。
 * @param {Object
}

/**
 * 添加一个新节点到文件树中。
 * @param {Object} node - 当前选择的节点的对象。
 */
function append(node) {
    // 弹窗显示form
    this.dialogFormVisible = true;
    // 设置表单的标题为"新增"
    this.dialogFormTitle = "新增";
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
    formRef.value.validate((valid) => {
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
</script>

<template>
    <el-row class="main-content">
        <!-- 文件目录 -->
        <el-col :span="codeEditorVisible ? 10 : 24" class="file-tree">
            <el-row>
                <el-col :span="24">
                    <el-button :icon="CirclePlus" @click="append(null)" style="margin: 8px 4px;">新增文件</el-button>
                    <el-tree :highlight-current="true" ref="treeRef" style="max-width:98%" :data="fileTree" :node-key="'id'" default-expand-all :expand-on-click-node="false" @node-click="doSelect" :props="{ label: 'name', children: 'children', class: 'file-tree-node' }">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <span class="file-tree-node-label">
                                    <el-icon v-if="data.type === 'folder'">
                                        <Folder />
                                    </el-icon>
                                    <el-icon v-else>
                                        <Document />
                                    </el-icon>
                                    <span style="margin-left: 8px;">{{ data.name }}</span>
                                </span>
                                <span style="display: flex;">
                                    <el-icon @click="append(node)" v-if="data.type === 'folder'">
                                        <CirclePlus />
                                    </el-icon>
                                    <el-icon style="margin-left: 8px" @click="remove(node, data)">
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
            <CodeEditor v-show="codeEditorVisible" :code="codes" :lang="lang" @change="handleCodeChange" />
        </el-col>
    </el-row>

    <!-- 代码基本信息 -->
    <el-collapse>
        <el-collapse-item title="基本信息">
            <el-form :model="moreSettingForm" label-width="120px" :inline="true">
                <el-form-item label="标题">
                    <el-input v-model="moreSettingForm.title" autocomplete="off" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="moreSettingForm.description" autocomplete="off" />
                </el-form-item>
                <el-form-item label="标签">
                    <el-select v-model="moreSettingForm.tags" multiple filterable allow-create default-first-option placeholder="请选择标签">
                        <el-option v-for="item in moreSettingForm.tagOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="封面">
                    <el-input v-model="moreSettingForm.cover" autocomplete="off" />
                </el-form-item>
                <el-form-item label="分类">
                    <el-select v-model="moreSettingForm.category" placeholder="请选择分类">
                        <el-option v-for="item in moreSettingForm.categoryOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    <el-row>
        <el-col>

        </el-col>
    </el-row>

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
                <el-button type="primary" @click="save">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.main-content {
    height: calc(100vh - 160px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    box-sizing: border-box;
}

.file-tree,
.code-editor {
    height: 100%;
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    padding: 8px;
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