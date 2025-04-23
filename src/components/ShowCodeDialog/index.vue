<script setup>
    import { computed, markRaw, onMounted } from 'vue';
    import { getTemplateFields } from '@/api/codeShare.js';
    import { Back, CirclePlus, Delete, Document, DocumentAdd, EditPen, Folder, FolderAdd, FolderChecked, Remove, UploadFilled } from '@element-plus/icons-vue';
    import CodeEditor from '@/components/CodeEditor/index.vue';

    const props = defineProps({
        visible: Boolean,
        codeFiles: Array
    });

    const visible = computed({
        get: () => props.visible,
        set: val => emits('update:visible', val)
    });

    // 触发文本内容变更事件
    const emits = defineEmits(['update:visible']);

    // 文件目录树形结构
    const treeRef = ref(null);
    const treeFile = computed(() => {
        return buildFileTree(props.codeFiles);
    });

    // 当前文件对应的代码内容以及编程语言
    const codeEditorVisible = ref(false);
    const codes = ref('');
    const lang = ref('');
    const currentFileId = ref('');

    /**
     * 将数组中的数据，构建成树形结构
     * @param {Array} data - 需要构建树形结构的数组
     */
    function buildFileTree(data) {
        if (!data || data.length === 0) return [];

        let temp = [...data];
        // 先过滤出根节点并排序
        let root = temp.filter(item => !item.parentId || item.parentId === '').sort((a, b) => (a.sort || 0) - (b.sort || 0));

        // 循环根节点，从根节点开始构建树形结构
        root.forEach(item => {
            setNodeChildren(item, temp);
        });
        return root;
    }

    /**
     * 递归函数，用户为节点设置子节点
     * @param {Object} node - 当前节点
     * @param dataArr
     * @type {Array} dataArr - 所有节点的数组
     */
    function setNodeChildren(node, dataArr) {
        if (!node || !dataArr) return;

        // 获取当前节点的子节点并排序
        let children = dataArr.filter(item => item.parentId === node.id).sort((a, b) => (a.sort || 0) - (b.sort || 0));

        if (children.length > 0) {
            node.children = children;
            // 递归为子节点设置子节点
            children.forEach(item => {
                setNodeChildren(item, dataArr);
            });
        }
    }

    /**
     * 选中文件/文件夹
     * @param data
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

    const getFileIcon = fileName => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
                return markRaw(Document);
            case 'html':
                return markRaw(Document);
            case 'css':
                return markRaw(Document);
            case 'json':
                return markRaw(Document);
            case 'md':
                return markRaw(Document);
            case 'py':
                return markRaw(Document);
            case 'java':
                return markRaw(Document);
            default:
                return markRaw(Document);
        }
    };
</script>

<template>
    <el-dialog v-model="visible" title="代码信息" draggable :lock-scroll="true" style="height: 70%" :body-class="'show-code-dialog-body-class'" @close="visible = false">
        <el-row class="main-content">
            <!-- 文件目录 -->
            <el-col :span="treeFile.length > 0 ? 10 : 24" class="file-tree">
                <el-row>
                    <el-col :span="24">
                        <el-row>
                            <el-tree ref="treeRef" :highlight-current="true" style="max-width: 98%" :data="treeFile" :node-key="'id'" default-expand-all :expand-on-click-node="false" draggable @node-click="doSelect">
                                <template #default="{ data }">
                                    <span class="custom-tree-node">
                                        <el-row style="width: 98%">
                                            <el-col :span="24">
                                                <span class="file-tree-node-label">
                                                    <el-icon :class="data.type === 'folder' ? 'folder-icon' : 'file-icon'">
                                                        <Folder v-if="data.type === 'folder'" />
                                                        <component :is="getFileIcon(data.name)" v-else />
                                                    </el-icon>
                                                    <el-text truncated>{{ data.name }}</el-text>
                                                </span>
                                            </el-col>
                                        </el-row>
                                    </span>
                                </template>
                            </el-tree>
                        </el-row>
                    </el-col>
                </el-row>
            </el-col>

            <!-- 文件预览 -->
            <el-col :span="codeFiles.length > 0 ? 14 : 0" class="code-editor">
                <div class="editor-container">
                    <CodeEditor v-show="codeEditorVisible" :key="currentFileId" v-model:code="codes" :lang="lang" :disabled="true" />
                    <el-empty v-show="!codeEditorVisible" :image-size="150" description="请选择左侧的文件以展示具体内容！" />
                </div>
            </el-col>
        </el-row>
    </el-dialog>
</template>

<style scoped>
    .main-content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        box-sizing: border-box;
        height: 100%;
        padding: 20px;
    }

    ::v-global(.show-code-dialog-body-class) {
        height: calc(100% - 40px);
    }

    .file-tree,
    .code-editor {
        height: calc(100% - 52px);
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

    .custom-tree-node {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
        font-size: 14px;
        max-width: calc(100% - 24px);
    }

    .file-tree-node-label {
        display: flex;
        align-items: center;

        .el-icon {
            font-size: 18px;

            /* 文件夹图标颜色 */
            &.folder-icon {
                color: #f4b63e;
            }

            /* 文件图标颜色 */
            &.file-icon {
                color: #64748b;
            }
        }
    }

    /* 操作按钮样式 */
    .action-buttons {
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
    }

    .file-tree-node-label span {
        margin-left: 8px;
    }

    .editor-container {
        position: relative;
        height: 100%;
    }
</style>
