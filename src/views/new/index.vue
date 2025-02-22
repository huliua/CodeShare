<script setup>
    import { nextTick, onActivated } from 'vue';
    import CodeEditor from '@/components/CodeEditor/index.vue';
    import { CirclePlus, Document, Folder, RefreshLeft, Remove, UploadFilled } from '@element-plus/icons-vue';
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
    function append(node, defaultData) {
        // 弹窗显示form
        this.dialogFormVisible = true;
        // 设置表单的标题为"新增"
        this.dialogFormTitle = '新增';
        // 重置表单
        this.form = {
            id: getUuid(),
            parentId: node?.key,
            type: 'file',
            children: [],
            // 获取当前层级的最大排序值+1
            sort: getMaxSort(node) + 1
        };
        parentNode.value = node;
        // 清除表单的验证结果
        nextTick(() => {
            if (formRef.value) {
                formRef.value.resetFields();
            }
        });
    }

    // 获取指定节点下的最大排序值
    function getMaxSort(node) {
        if (!node) {
            // 如果是根节点，则从fileTree中获取
            return Math.max(0, ...fileTree.value.map(item => item.sort || 0));
        }
        // 如果是子节点，则从node的children中获取
        const children = node.childNodes || [];
        return Math.max(0, ...children.map(child => child.data.sort || 0));
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
        if (!treeFileList) return;

        treeFileList.forEach(file => {
            if (!file) return;

            const treeFile = {
                id: file.id,
                name: file.name,
                parentId: parentId || '',
                type: file.type,
                content: file.content,
                sort: file.sort || 0 // 确保排序值被保存
            };
            fileList.push(treeFile);
            if (file.children && file.children.length > 0) {
                deepBuildTreeFile(fileList, file.children, file.id);
            }
        });
    }

    // 控制是否允许拖拽
    const allowDrag = node => {
        return true;
    };

    // 控制拖拽规则
    const allowDrop = (draggingNode, dropNode, type) => {
        // 不允许拖拽到文件节点下
        if (dropNode.data.type === 'file' && type === 'inner') {
            return false;
        }
        return true;
    };

    // 开始拖拽时的处理
    const handleDragStart = (node, ev) => {
        console.log('drag start', node);
    };

    // 拖拽进入目标节点时的处理
    const handleDragEnter = (draggingNode, dropNode, ev) => {
        console.log('tree drag enter: ', dropNode.label);
    };

    // 拖拽离开目标节点时的处理
    const handleDragLeave = (draggingNode, dropNode, ev) => {
        console.log('tree drag leave: ', dropNode.label);
    };

    // 拖拽经过目标节点时的处理
    const handleDragOver = (draggingNode, dropNode, ev) => {
        console.log('tree drag over: ', dropNode.label);
    };

    // 拖拽结束时的处理
    const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
        console.log('tree drag end: ', dropType);
    };

    // 处理拖拽完成事件
    const handleDrop = (draggingNode, dropNode, type) => {
        // 获取拖拽节点的父节点
        const draggingParentNode = draggingNode.parent;
        const dropParentNode = type === 'inner' ? dropNode : dropNode.parent;

        // 更新所有受影响节点的排序值
        const updateNodesSort = parentNode => {
            if (!parentNode) {
                // 如果是根节点，直接更新 fileTree
                const rootNodes = treeRef.value.store.nodesMap;
                const rootNodesList = Object.values(rootNodes)
                    .filter(node => !node.parent || !node.parent.data)
                    .sort((a, b) => a.level - b.level);

                rootNodesList.forEach((node, index) => {
                    if (node.data) {
                        node.data.sort = index + 1;
                    }
                });
                return;
            }

            // 获取父节点下的所有子节点
            const children = parentNode.childNodes || [];

            // 按照当前顺序重新设置排序值
            children.forEach((node, index) => {
                if (node.data) {
                    node.data.sort = index + 1;
                }
            });
        };

        // 更新拖拽节点的父节点下所有子节点的排序
        updateNodesSort(draggingParentNode);

        // 如果是跨父节点拖拽,还需要更新目标父节点下的排序
        if (dropParentNode !== draggingParentNode) {
            updateNodesSort(dropParentNode);
        }

        // 如果是拖拽到根级别，需要更新根节点的排序
        if (!dropParentNode) {
            updateNodesSort(null);
        }

        // 更新节点的parentId
        if (type === 'inner') {
            draggingNode.data.parentId = dropNode.data.id;
        } else {
            draggingNode.data.parentId = dropNode.parent ? dropNode.parent.data.id : '';
        }

        // 重新构建树
        const allNodes = [];
        const getAllNodes = nodes => {
            if (!nodes) return;
            nodes.forEach(node => {
                const nodeData = { ...node };
                delete nodeData.children;
                allNodes.push(nodeData);
                if (node.children && node.children.length > 0) {
                    getAllNodes(node.children);
                }
            });
        };

        getAllNodes(fileTree.value);
        fileTree.value = buildFileTree(allNodes);

        // 确保视图更新
        nextTick(() => {
            treeRef.value?.setCurrentKey(draggingNode.data.id);
        });
    };

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

    // 根据文件扩展名返回对应的图标组件
    const getFileIcon = fileName => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
                return markRaw(Document); // 使用 markRaw 避免不必要的响应式包装
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
    <el-row class="main-content">
        <!-- 文件目录 -->
        <el-col :span="fileTree.length > 0 ? 10 : 24" class="file-tree">
            <el-row>
                <el-col :span="24">
                    <el-button :icon="CirclePlus" style="margin: 8px 4px" @click="append(null)">新增文件</el-button>
                    <el-tree
                        ref="treeRef"
                        :highlight-current="true"
                        style="max-width: 98%"
                        :data="fileTree"
                        :node-key="'id'"
                        default-expand-all
                        :expand-on-click-node="false"
                        :props="{ label: 'name', children: 'children', class: 'file-tree-node' }"
                        draggable
                        :allow-drag="allowDrag"
                        :allow-drop="allowDrop"
                        @node-drag-start="handleDragStart"
                        @node-drag-enter="handleDragEnter"
                        @node-drag-leave="handleDragLeave"
                        @node-drag-over="handleDragOver"
                        @node-drag-end="handleDragEnd"
                        @node-drop="handleDrop"
                        @node-click="doSelect"
                    >
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <span class="file-tree-node-label">
                                    <el-icon :class="data.type === 'folder' ? 'folder-icon' : 'file-icon'">
                                        <Folder v-if="data.type === 'folder'" />
                                        <component :is="getFileIcon(data.name)" v-else />
                                    </el-icon>
                                    <span>{{ data.name }}</span>
                                </span>
                                <span class="action-buttons">
                                    <el-icon v-if="data.type === 'folder'" @click.stop="append(node)">
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
            <el-form ref="moreSettingFormRef" :model="moreSettingForm" :rules="moreSettingFormRules" label-width="100px" :inline="false" :size="'default'">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="moreSettingForm.title" autocomplete="off" placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="moreSettingForm.description" type="textarea" autocomplete="off" placeholder="请输入描述" />
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
                <el-form-item v-if="moreSettingForm.visibility === 'cryptographic'" label="密码" prop="password">
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
                    <el-button :icon="UploadFilled" type="success" @click="submitForm">发布</el-button>
                    <el-button :icon="RefreshLeft" type="warning" @click="resetForm">重置</el-button>
                </el-col>
            </el-row>
        </el-collapse-item>
    </el-collapse>

    <!-- 添加文件/文件夹弹窗 -->
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
</template>

<style scoped lang="scss">
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

    /* 文件树节点样式优化 */
    :deep(.el-tree) {
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
    }

    .custom-tree-node {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
        font-size: 14px;
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
        }

        span {
            margin-left: 8px;
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

    /* 鼠标悬停时显示操作按钮 */
    .el-tree-node__content:hover .action-buttons {
        opacity: 1;
    }

    /* 拖拽相关样式优化 */
    :deep(.el-tree-node.is-drop-inner) {
        & > .el-tree-node__content {
            background-color: var(--el-color-primary-light-9);
            border: 1px dashed var(--el-color-primary);
            border-radius: 4px;
        }
    }

    :deep(.el-tree-node__drop-prev),
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
    }

    :deep(.el-tree-node__drop-prev::before) {
        top: -2px;
    }

    :deep(.el-tree-node__drop-next::before) {
        bottom: -2px;
    }
</style>
