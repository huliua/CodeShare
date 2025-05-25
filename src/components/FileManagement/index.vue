<script setup>
    import { markRaw, nextTick, ref, watch } from 'vue';
    import CodeEditor from '@/components/CodeEditor/index.vue';
    import { CirclePlus, Delete, Document, DocumentAdd, EditPen, Folder, FolderAdd, Remove } from '@element-plus/icons-vue';
    import { getUuid } from '@/utils/commonUtils';
    import { ClickOutside as vClickOutside } from 'element-plus';

    const props = defineProps({
        initialFileTree: {
            type: Array,
            default: () => []
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        codeId: {
            type: String,
            default: ''
        }
    });

    const emit = defineEmits(['file-tree-change', 'file-select', 'save-files']);

    const treeRef = ref(null);
    const fileTree = ref([]);
    const parentNode = ref(null);

    const codeEditorVisible = ref(false);
    const codes = ref('');
    const lang = ref('');
    const currentFileId = ref('');

    const form = ref({});
    const rules = ref({
        name: [
            { required: true, message: '请输入文件/文件夹名称', trigger: 'blur' },
            { min: 1, max: 100, message: '文件/文件夹名称长度为1-100', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请输入文件/文件夹类型', trigger: 'blur' }]
    });
    const formRef = ref(null);
    const dialogFormVisible = ref(false);
    const dialogFormTitle = ref('新增');

    const showContextMenu = ref(false);
    const left = ref(0);
    const top = ref(0);
    const currentNodeData = ref(null);
    const renameDialogVisible = ref(false);

    watch(
        () => props.initialFileTree,
        newVal => {
            if (Array.isArray(newVal)) {
                fileTree.value = buildFileTree(newVal);
            } else {
                fileTree.value = [];
            }
        },
        { deep: true, immediate: true }
    );

    function buildFileTree(data) {
        if (!Array.isArray(data)) {
            return [];
        }
        if (data.length === 0) return [];

        let items = data.map(item => (item && typeof item === 'object' ? { ...item } : null)).filter(Boolean);

        items = items.filter(item => typeof item.id !== 'undefined' && item.id !== null);

        const roots = [];
        const childrenMap = new Map();

        for (const item of items) {
            const parentId = item.parentId || '';
            item.parentId = parentId;

            if (parentId === '') {
                roots.push(item);
            } else {
                if (!childrenMap.has(parentId)) {
                    childrenMap.set(parentId, []);
                }
                childrenMap.get(parentId).push(item);
            }
        }

        roots.sort((a, b) => (a.sort || 0) - (b.sort || 0));

        const finalTree = roots.map(rootNode => {
            const nodeWithChildren = { ...rootNode };
            setNodeChildrenRecursive(nodeWithChildren, childrenMap);
            return nodeWithChildren;
        });

        return finalTree;
    }

    function setNodeChildrenRecursive(node, childrenMap) {
        if (!node || typeof node.id === 'undefined') {
            return;
        }

        const childItems = childrenMap.get(node.id) || [];
        if (childItems.length > 0) {
            childItems.sort((a, b) => (a.sort || 0) - (b.sort || 0));
            node.children = childItems.map(childItem => {
                const childNodeWithChildren = { ...childItem };
                setNodeChildrenRecursive(childNodeWithChildren, childrenMap);
                return childNodeWithChildren;
            });
        } else {
            node.children = [];
        }
    }

    function treeNodeRightClick(event, data, node, instance) {
        if (props.readOnly) {
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
        showContextMenu.value = false;
        formRef.value?.resetFields();
        form.value.name = currentNodeData.value.name;
        renameDialogVisible.value = true;
    }

    function doRename() {
        formRef.value.validate(valid => {
            if (!valid) {
                return false;
            }
            var newData = {
                id: currentNodeData.value.id,
                name: form.value.name
            };

            const updateInTree = (nodes, targetId, newName) => {
                if (!Array.isArray(nodes)) return false;
                for (const node of nodes) {
                    if (node.id === targetId) {
                        node.name = newName;
                        return true;
                    }
                    if (node.children && node.children.length > 0) {
                        if (updateInTree(node.children, targetId, newName)) return true;
                    }
                }
                return false;
            };

            if (updateInTree(fileTree.value, newData.id, newData.name)) {
                const flatList = [];
                deepBuildTreeFile(flatList, fileTree.value);
                emit('file-tree-change', flatList);
            }
            renameDialogVisible.value = false;
        });
    }

    function clickOutSide(event) {
        if (showContextMenu.value === true && event.target.className !== 'el-contextmenu' && !event.target.closest('.contextMenu-fm')) {
            showContextMenu.value = false;
        }
    }

    function doSelect(data) {
        nextTick(() => {
            if (data && data.type === 'file') {
                codes.value = data.content || '';
                currentFileId.value = data.id;
                let fileExtention = data.name.split('.').pop()?.toLowerCase() || '';
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
                emit('file-select', { ...data });
            } else if (data && data.type === 'folder') {
                codes.value = '';
                lang.value = '';
                currentFileId.value = ''; // Clear FileManagement's own currentFileId
                codeEditorVisible.value = false; // Hide editor for folders
                emit('file-select', { ...data }); // Or emit null if parent shouldn't know about folder selection: emit('file-select', null);
            } else {
                // Fallback for null data or unexpected type
                codes.value = '';
                lang.value = '';
                currentFileId.value = '';
                codeEditorVisible.value = false;
                emit('file-select', null);
            }
        });
    }

    function append(node, defaultDataFromMenu) {
        if (showContextMenu.value === true) {
            showContextMenu.value = false;
        }

        const parentNodeRef = node && node.key ? node : null;
        const parentId = parentNodeRef ? parentNodeRef.key : '';

        let maxSort = 0;
        if (parentNodeRef && parentNodeRef.childNodes && parentNodeRef.childNodes.length > 0) {
            maxSort = Math.max(0, ...parentNodeRef.childNodes.map(child => child.data.sort || 0));
        } else if (!parentNodeRef && fileTree.value.length > 0) {
            maxSort = Math.max(0, ...fileTree.value.map(item => item.sort || 0));
        }

        formRef.value?.resetFields();
        dialogFormVisible.value = true;
        dialogFormTitle.value = '新增';
        form.value = {
            id: getUuid(),
            parentId: parentId,
            type: defaultDataFromMenu?.type || 'file',
            children: [],
            sort: maxSort + 1,
            name: ''
        };

        parentNode.value = parentNodeRef;
    }

    function save() {
        formRef.value.validate(valid => {
            if (!valid) {
                return false;
            }
            treeRef.value.append({ ...form.value }, parentNode.value);
            const flatList = [];
            deepBuildTreeFile(flatList, fileTree.value);
            emit('file-tree-change', flatList);
            dialogFormVisible.value = false;
            parentNode.value = null;
        });
    }

    function remove(node, data) {
        if (showContextMenu.value === true) {
            showContextMenu.value = false;
        }
        treeRef.value.remove(data);
        const flatList = [];
        deepBuildTreeFile(flatList, fileTree.value);
        emit('file-tree-change', flatList);

        nextTick(() => {
            if (currentFileId.value === data.id) {
                const nodeExists = treeRef.value.getNode(data.id);
                if (!nodeExists) {
                    codeEditorVisible.value = false;
                    currentFileId.value = '';
                    codes.value = '';
                    lang.value = '';
                    emit('file-select', null);
                }
            }
        });
    }

    function handleCodeChange(newContent) {
        let selectedNodeData = treeRef.value.getCurrentNode();
        if (selectedNodeData && selectedNodeData.type === 'file') {
            const updateContentInTree = (nodes, targetId, content) => {
                if (!Array.isArray(nodes)) return false;
                for (const node of nodes) {
                    if (node.id === targetId) {
                        node.content = content;
                        return true;
                    }
                    if (node.children && updateContentInTree(node.children, targetId, content)) {
                        return true;
                    }
                }
                return false;
            };

            if (updateContentInTree(fileTree.value, selectedNodeData.id, newContent)) {
                const flatList = [];
                deepBuildTreeFile(flatList, fileTree.value);
                emit('file-tree-change', flatList);
            }
        }
    }

    function deepBuildTreeFile(fileList, currentTree, parentIdToSet = null) {
        if (!Array.isArray(currentTree)) return;
        currentTree.forEach(file => {
            if (!file || typeof file.id === 'undefined') return;
            const treeFile = {
                id: file.id,
                name: file.name,
                parentId: parentIdToSet !== null ? parentIdToSet : file.parentId || '',
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

    const allowDrag = node => !props.readOnly;

    const allowDrop = (draggingNode, dropNode, type) => {
        if (props.readOnly) return false;
        if (dropNode.data.type === 'file' && type === 'inner') return false;
        let current = dropNode;
        while (current) {
            if (current.data.id === draggingNode.data.id) return false;
            current = current.parent;
        }
        return true;
    };

    const handleDragStart = (node, ev) => {};
    const handleDragEnter = (draggingNode, dropNode, ev) => {};
    const handleDragLeave = (draggingNode, dropNode, ev) => {};
    const handleDragOver = (draggingNode, dropNode, ev) => {};

    const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
        if (dropType !== 'none') {
        }
    };

    const handleDrop = (draggingNode, dropNode, dropType, ev) => {
        if (props.readOnly || dropType === 'none') return;

        const allNodesInTreeStore = Object.values(treeRef.value.store.nodesMap).map(nodeInstance => {
            return { ...nodeInstance.data };
        });

        const draggedNodeDataOriginal = draggingNode.data;
        const draggedNodeDataInStore = allNodesInTreeStore.find(n => n.id === draggedNodeDataOriginal.id);

        if (draggedNodeDataInStore) {
            if (dropType === 'inner') {
                draggedNodeDataInStore.parentId = dropNode.data.id;
            } else {
                draggedNodeDataInStore.parentId = dropNode.parent ? (dropNode.parent.data ? dropNode.parent.data.id : '') : '';
            }
        }

        const updateSortRecursively = elTreeNodes => {
            if (!Array.isArray(elTreeNodes)) return;
            elTreeNodes.forEach((elTreeNode, index) => {
                const nodeDataInStore = allNodesInTreeStore.find(n => n.id === elTreeNode.data.id);
                if (nodeDataInStore) {
                    nodeDataInStore.sort = index + 1;
                    if (elTreeNode.parent && elTreeNode.parent.data) {
                        nodeDataInStore.parentId = elTreeNode.parent.data.id;
                    } else if (!elTreeNode.parent || (elTreeNode.parent && !elTreeNode.parent.data && elTreeNode.parent.level === 0)) {
                        nodeDataInStore.parentId = '';
                    }
                }
                if (elTreeNode.childNodes && elTreeNode.childNodes.length > 0) {
                    updateSortRecursively(elTreeNode.childNodes);
                }
            });
        };

        if (treeRef.value && treeRef.value.root && treeRef.value.root.childNodes) {
            updateSortRecursively(treeRef.value.root.childNodes);
        }

        fileTree.value = buildFileTree(allNodesInTreeStore); // This updates the internal structured tree

        // Now emit the flat list representation of this updated structured tree
        const flatList = [];
        deepBuildTreeFile(flatList, fileTree.value);
        emit('file-tree-change', flatList);

        nextTick(() => {
            if (treeRef.value && draggedNodeDataOriginal.id) {
                treeRef.value.setCurrentKey(draggedNodeDataOriginal.id);
            }
        });
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

    defineExpose({
        getFileTree: () => fileTree.value,
        deepBuildTreeFile,
        append
    });
</script>

<template>
    <el-row>
        <el-row class="main-content-fm">
            <ul v-show="showContextMenu" ref="target" v-click-outside="clickOutSide" :style="{ left: left + 'px', top: top + 'px' }" class="contextMenu-fm">
                <li @click="renameNode"><el-button type="info" link :icon="EditPen">重命名</el-button></li>
                <li @click="remove(null, currentNodeData)"><el-button type="danger" link :icon="Delete">删除</el-button></li>
                <li v-if="currentNodeData?.type === 'folder'" @click="append(treeRef.getNode(currentNodeData.id), { type: 'folder' })"><el-button type="info" link :icon="FolderAdd">新建文件夹</el-button></li>
                <li v-if="currentNodeData?.type === 'folder'" @click="append(treeRef.getNode(currentNodeData.id), { type: 'file' })"><el-button type="info" link :icon="DocumentAdd">新建文件</el-button></li>
            </ul>
            <el-col :span="fileTree.length > 0 ? 10 : 24" class="file-tree-fm">
                <el-row style="height: 100%">
                    <el-col :span="24" style="height: 100%">
                        <el-tree
                            ref="treeRef"
                            :highlight-current="true"
                            style="width: 98%; height: 100%; overflow: auto"
                            :data="fileTree"
                            node-key="id"
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
                                <span class="custom-tree-node-fm">
                                    <el-row style="width: 98%">
                                        <el-col :span="20">
                                            <span class="file-tree-node-label-fm">
                                                <el-icon :class="data.type === 'folder' ? 'folder-icon-fm' : 'file-icon-fm'">
                                                    <Folder v-if="data.type === 'folder'" />
                                                    <component :is="getFileIcon(data.name)" v-else />
                                                </el-icon>
                                                <el-text truncated>{{ data.name }}</el-text>
                                            </span>
                                        </el-col>
                                        <el-col :span="4">
                                            <span v-if="!readOnly" class="action-buttons-fm">
                                                <el-icon v-if="data.type === 'folder'" @click.stop="append(node)"><CirclePlus /></el-icon>
                                                <el-icon style="margin-left: 8px" @click.stop="remove(node, data)"><Remove /></el-icon>
                                            </span>
                                        </el-col>
                                    </el-row>
                                </span>
                            </template>
                            <template #empty>
                                <el-empty :image-size="200" description="请添加文件或文件夹" />
                            </template>
                        </el-tree>
                    </el-col>
                </el-row>
            </el-col>

            <el-col :span="fileTree.length > 0 ? 14 : 0" class="code-editor-fm">
                <div class="editor-container-fm">
                    <CodeEditor v-show="codeEditorVisible" :key="currentFileId" v-model:code="codes" :lang="lang" :disabled="readOnly" style="height: 100%" @change="handleCodeChange" />
                    <el-empty v-show="!codeEditorVisible" :image-size="150" description="请选择左侧的文件以展示具体内容！" />
                </div>
            </el-col>
        </el-row>

        <el-dialog v-model="dialogFormVisible" :title="dialogFormTitle" width="500">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="left">
                <el-form-item label="名称" label-width="100px" prop="name">
                    <el-input v-model="form.name" autocomplete="off" @keydown.enter.prevent="save" />
                </el-form-item>
                <el-form-item label="类型" label-width="100px" prop="type">
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

        <el-dialog v-model="renameDialogVisible" title="重命名" width="500">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="left">
                <el-form-item label="名称" label-width="100px" prop="name">
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
    </el-row>
</template>

<style scoped lang="scss">
    .main-content-fm {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        box-sizing: border-box;
        height: 100%;
        min-height: 400px;
        padding: 0px;
        width: 100%;
        margin-top: 20px;
    }

    .file-tree-fm {
        height: 100%;
    }

    .code-editor-fm {
        height: calc(100vh - 295px);
        padding-left: 10px;
        display: flex;
        flex-direction: column;
    }

    .contextMenu-fm {
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
    :deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
        background-color: var(--el-color-primary-light-9);
        border: 1px dashed var(--el-color-primary);
        outline: none;
    }
    :deep(.el-tree-node__content.is-dragover) {
        background-color: var(--el-color-primary-light-8);
    }
    :deep(.el-tree-node.is-dragging) {
        opacity: 0.5;
    }
    :deep(.el-tree-node__drop-prev::before),
    :deep(.el-tree-node__drop-next::before) {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--el-color-primary);
        content: '';
    }
    :deep(.el-tree-node__drop-prev::before) {
        top: -2px;
    }
    :deep(.el-tree-node__drop-next::before) {
        bottom: -2px;
    }

    :deep(.el-tree) {
        background: transparent;
        .el-tree-node {
            position: relative;
            padding: 4px 0 0;
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

    .custom-tree-node-fm {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
        font-size: 14px;
        max-width: calc(100% - 24px);
    }

    .file-tree-node-label-fm {
        display: flex;
        align-items: center;
        .el-icon {
            font-size: 18px;
            &.folder-icon-fm {
                color: #f4b63e;
            }
            &.file-icon-fm {
                color: #64748b;
            }
        }
        span {
            margin-left: 8px;
        }
    }

    .action-buttons-fm {
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

    .el-tree-node__content:hover .action-buttons-fm {
        opacity: 1;
    }

    .editor-container-fm {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        .el-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
</style>
