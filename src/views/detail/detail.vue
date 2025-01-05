<script setup>
    import { markRaw, nextTick, onMounted } from 'vue';
    import CodeEditor from '@/components/CodeEditor/index.vue';
    import { CirclePlus, Delete, Document, DocumentAdd, EditPen, Folder, FolderAdd, Remove, Share } from '@element-plus/icons-vue';
    import { getUuid } from '@/utils/commonUtils';
    import { deleteCode, getCodeShare, saveCodes } from '@/api/codeShare';
    import { useRoute, useRouter } from 'vue-router';
    import { useDictStore } from '@/store/dictStore.js';
    import { ClickOutside as vClickOutside } from 'element-plus';
    import ShareCodeDialog from '@/components/ShareCodeDialog/index.vue';

    const router = useRouter();

    const readOnly = ref(false);
    const dictStore = useDictStore();
    const route = useRoute();

    const id = ref('');

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

    // 右键菜单
    const showContextMenu = ref(false);
    const left = ref(0);
    const top = ref(0);

    const tagOptions = ref([]);
    onMounted(async () => {
        // 当前数据id
        id.value = route.params.id;
        // 是否只读
        readOnly.value = route.meta.readonly === true;

        // 初始化字典数据
        tagOptions.value = await dictStore.getDict('t_tag');

        // 获取
        getCodeShare(id.value).then(res => {
            fileTree.value = buildFileTree(res.data.codeShareFileList || []);
            moreSettingForm.value = res.data.codeShareInfoVo || {};
            moreSettingForm.value.tags = (res.data.tagList || []).map(item => ((tagOptions.value || []).some(tag => tag.code === item.code) ? item.code : item.name));
        });

        // 获取数据后添加一个短暂延时，确保树节点完全渲染
        await nextTick();
        setTimeout(() => {
            // 强制更新一次树结构
            fileTree.value = [...fileTree.value];
        }, 100);
    });

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

    // 右键菜单相关
    const currentNodeData = ref(null);
    const renameDialogVisible = ref(false);

    function treeNodeRightClick(event, data, node, instance) {
        if (readOnly) {
            return;
        }
        left.value = event.clientX + 15;
        top.value = event.clientY + 5;
        treeRef.value.setCurrentKey(data.id);
        currentNodeData.value = data;
        doSelect(data);
        setTimeout(() => {
            showContextMenu.value = true;
        }, 150);
    }

    function renameNode() {
        // 先关闭右键菜单
        showContextMenu.value = false;
        // 显示重命名弹窗
        formRef.value?.resetFields();
        form.value.name = currentNodeData.value.name;
        renameDialogVisible.value = true;
    }

    function doRename() {
        // 表单验证
        formRef.value.validate(valid => {
            if (!valid) {
                return false;
            }
            var newData = {
                id: currentNodeData.value.id,
                name: form.value.name
            };

            // 更新tree中id为currentNodeData.value.id的数据
            for (let i = 0; i < fileTree.value.length; i++) {
                deepTraverseUpdateName(fileTree.value[i], newData);
            }

            // 关闭弹窗
            renameDialogVisible.value = false;
        });
    }

    /**
     * 深度遍历树形结构，找到id为currentNodeData.value.id的数据，并替换为newData
     */
    function deepTraverseUpdateName(currentNode, data) {
        if (!currentNode) {
            return;
        }
        if (currentNode.id === data.id) {
            currentNode.name = data.name;
            return;
        }
        if (currentNode.children && currentNode.children.length > 0) {
            for (let i = 0; i < currentNode.children.length; i++) {
                deepTraverseUpdateName(currentNode.children[i], data);
            }
        }
    }

    function clickOutSide(event) {
        // 如果点击的不是contextmenu，则关闭菜单
        if (showContextMenu.value === true && event.target.className !== 'el-contextmenu') {
            showContextMenu.value = false;
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

    /**
     * 添加一个新节点到文件树中。
     * @param {Object} node - 当前选择的节点的对象。
     * @param defaultData
     */
    function append(node, defaultData) {
        // 如果是点击右键菜单，则先关闭右键菜单
        if (showContextMenu.value === true) {
            showContextMenu.value = false;
        }
        formRef.value?.resetFields();
        // 弹窗显示form
        dialogFormVisible.value = true;
        // 设置表单的标题为"新增"
        dialogFormTitle.value = '新增';
        // 重置表单
        form.value = {
            id: getUuid(),
            parentId: node?.key,
            type: 'file',
            children: [],
            // 获取当前父节点下的最大排序值+1，如果没有子节点则从1开始
            sort: node ? (node.childNodes?.length > 0 ? node.childNodes.length + 1 : 1) : fileTree.value.length > 0 ? fileTree.value.length + 1 : 1
        };
        for (let key in defaultData) {
            form.value[key] = defaultData[key];
        }

        parentNode.value = node;
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
            treeRef.value.append({ ...form.value }, parentNode.value ? parentNode.value : null);
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
        // 如果是右键菜单，则关闭菜单
        if (showContextMenu.value === true) {
            showContextMenu.value = false;
        }
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
            if (id.value) {
                param.codeShareInfo.id = id.value;
            }

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
            saveCodes(param).then(async () => {
                ElMessage({
                    message: '保存成功',
                    type: 'success',
                    showClose: true
                });
                // 重新初始化字典数据(防止修改tag标签后，字典没有及时更新)
                tagOptions.value = await dictStore.getDict('t_tag', false);
            });
        });
    }

    /**
     * 重置表单
     */
    function resetForm() {
        moreSettingFormRef.value.resetFields();
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
                sort: file.sort || 0
            };
            fileList.push(treeFile);
            if (file.children && file.children.length > 0) {
                deepBuildTreeFile(fileList, file.children, file.id);
            }
        });
    }

    // 分享对话框显示状态
    const shareDialogVisible = ref(false);

    // 处理分享按钮点击
    const handleShare = () => {
        shareDialogVisible.value = true;
    };

    // 控制是否允许拖拽
    const allowDrag = node => {
        return !readOnly.value;
    };

    // 控制拖拽规则
    const allowDrop = (draggingNode, dropNode, type) => {
        if (readOnly.value) return false;
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
        if (readOnly.value) return;

        try {
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

            // 获取所有节点数据并重建树
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

            // 获取当前树的所有节点
            getAllNodes(fileTree.value);

            // 重新构建树
            fileTree.value = buildFileTree(allNodes);

            // 确保视图更新
            nextTick(() => {
                if (treeRef.value) {
                    treeRef.value.setCurrentKey(draggingNode.data.id);
                }
            });
        } catch (error) {
            console.error('拖拽处理出错：', error);
            // 发生错误时重新构建树以恢复状态
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
        }
    };

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
    <el-row class="main-content">
        <!-- 右键菜单 -->
        <ul v-show="showContextMenu" ref="target" v-click-outside="clickOutSide" :style="{ left: left + 'px', top: top + 'px' }" class="contextMenu">
            <li @click="renameNode">
                <el-button link :icon="EditPen">重命名</el-button>
            </li>
            <li @click="remove(null, currentNodeData)">
                <el-button type="danger" link :icon="Delete">删除</el-button>
            </li>
            <li v-if="currentNodeData?.type === 'folder'" @click="append(currentNodeData, { type: 'folder' })">
                <el-button link :icon="FolderAdd">新建文件夹</el-button>
            </li>
            <li v-if="currentNodeData?.type === 'folder'" @click="append(currentNodeData, { type: 'file' })">
                <el-button link :icon="DocumentAdd">新建文件</el-button>
            </li>
        </ul>
        <!-- 文件目录 -->
        <el-col :span="fileTree.length > 0 ? 10 : 24" class="file-tree">
            <el-row>
                <el-col :span="24">
                    <el-button v-if="!readOnly" :icon="CirclePlus" style="margin: 8px 4px" @click="append(null)">新增文件</el-button>
                    <el-tree
                        ref="treeRef"
                        :highlight-current="true"
                        style="max-width: 98%"
                        :data="fileTree"
                        :node-key="'id'"
                        default-expand-all
                        :expand-on-click-node="false"
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
                        @node-contextmenu="treeNodeRightClick"
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
                                <span v-if="!readOnly" class="action-buttons">
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
        <el-col :span="fileTree.length > 0 ? 14 : 0" class="code-editor">
            <div class="editor-container">
                <CodeEditor v-show="codeEditorVisible" :key="currentFileId" v-model:code="codes" :lang="lang" :disabled="readOnly" @change="handleCodeChange" />
                <el-empty v-show="!codeEditorVisible" :image-size="150" description="请选择左侧的文件以展示具体内容！" />
            </div>
        </el-col>
    </el-row>

    <!-- 代码基本信息 -->
    <el-collapse :model-value="['baseInfo']">
        <el-collapse-item title="基本信息" name="baseInfo">
            <el-form ref="moreSettingFormRef" :model="moreSettingForm" :rules="moreSettingFormRules" label-width="100px" :inline="false" :size="'default'" :disabled="readOnly">
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
                    <el-input v-model="moreSettingForm.cover" autocomplete="off" placeholder="请输入封面链接" :formatter="value => value.replace(/^https?:\/\//, '')" :parser="value => value.replace(/^https?:\/\//, '')">
                        <template #prepend>http(s)://</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <el-row justify="end">
                <el-col style="text-align: right">
                    <el-button v-if="!readOnly" type="primary" @click="submitForm">发布</el-button>
                    <el-button v-if="!readOnly" type="warning" @click="resetForm">重置</el-button>
                    <el-button v-if="!readOnly" type="danger" @click="confirmVisible = true">删除</el-button>
                    <!-- 添加分享按钮 -->
                    <el-button v-if="!route.meta.readonly" type="primary" @click="handleShare">
                        <el-icon>
                            <Share />
                        </el-icon>
                        分享
                    </el-button>
                    <el-button @click="goBack">返回</el-button>
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

    <!-- 重命名弹窗 -->
    <el-dialog v-model="renameDialogVisible" title="重命名" width="500">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="left">
            <el-form-item label="文件名" :label-width="formLabelWidth" prop="name">
                <el-input v-model="form.name" autocomplete="off" @keydown.enter.prevent="doRename" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="renameDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="doRename">确定</el-button>
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

    .contextMenu {
        position: fixed;
        z-index: 3000;
        margin: 0;
        padding: 5px 0;
        color: #333;
        font-weight: 400;
        font-size: 12px;
        list-style-type: none;
        background: #fff;
        border-radius: 4px;
        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

        li {
            margin: 0;
            padding: 7px 16px;
            cursor: pointer;

            &:hover {
                background: #eee;
            }
        }
    }

    .header-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
    }

    /* 修改拖拽相关样式 */
    :deep(.el-tree-node__content) {
        &:hover {
            cursor: grab;
        }
    }

    :deep(.el-tree-node.is-dragging .el-tree-node__content) {
        cursor: grabbing;
        background-color: transparent;
        opacity: 0.5;
    }

    /* 统一所有层级文件夹的拖拽提示效果 */
    :deep(.el-tree-node.is-drop-inner) {
        & > .el-tree-node__content {
            background-color: var(--el-color-primary-light-9);
            border: 1px dashed var(--el-color-primary);
            outline: none;
        }
    }

    :deep(.el-tree-node__content.is-dragover) {
        background-color: var(--el-color-primary-light-8);
    }

    :deep(.el-tree-node.is-dragging) {
        opacity: 0.5;
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

    .file-tree-node-label span {
        margin-left: 8px;
    }

    .editor-container {
        position: relative;
        height: 100%;

        .el-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
</style>
