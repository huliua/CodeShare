<script setup>
    import { javascript } from '@codemirror/lang-javascript';
    import { css } from '@codemirror/lang-css';
    import { html } from '@codemirror/lang-html';
    import { java } from '@codemirror/lang-java';
    import { python } from '@codemirror/lang-python';
    import { oneDark } from '@codemirror/theme-one-dark';
    import { xml } from '@codemirror/lang-xml';
    import { json } from '@codemirror/lang-json';
    import { markdown } from '@codemirror/lang-markdown';
    import { sql } from '@codemirror/lang-sql';
    import { php } from '@codemirror/lang-php';
    import { go } from '@codemirror/lang-go';
    import { rust } from '@codemirror/lang-rust';
    import { onMounted, ref, watch } from 'vue';
    import { basicSetup } from 'codemirror';
    import { CopyDocument, FullScreen } from '@element-plus/icons-vue';
    import useClipboard from 'vue-clipboard3';
    import { Codemirror } from 'vue-codemirror';

    const { toClipboard } = useClipboard();

    // 编辑器内容
    let content = ref('');
    // 当前选中的语言
    const language = ref('java');

    // 语言选择器
    const options = ref([
        {
            value: 'javascript',
            label: 'JavaScript'
        },
        {
            value: 'css',
            label: 'CSS'
        },
        {
            value: 'html',
            label: 'HTML'
        },
        {
            value: 'java',
            label: 'Java'
        },
        {
            value: 'python',
            label: 'Python'
        },
        {
            value: 'xml',
            label: 'XML'
        },
        {
            value: 'json',
            label: 'JSON'
        },
        {
            value: 'markdown',
            label: 'Markdown'
        },
        {
            value: 'sql',
            label: 'SQL'
        },
        {
            value: 'php',
            label: 'PHP'
        },
        {
            value: 'go',
            label: 'Go'
        },
        {
            value: 'rust',
            label: 'Rust'
        }
    ]);

    // 拓展插件
    const extensions = computed(() => {
        const res = [oneDark, basicSetup];
        switch (language.value) {
            case 'javascript':
                res.push(javascript());
                break;
            case 'css':
                res.push(css());
                break;
            case 'html':
                res.push(html());
                break;
            case 'java':
                res.push(java());
                break;
            case 'python':
                res.push(python());
                break;
            case 'xml':
                res.push(xml());
                break;
            case 'json':
                res.push(json());
                break;
            case 'markdown':
                res.push(markdown());
                break;
            case 'sql':
                res.push(sql());
                break;
            case 'php':
                res.push(php());
                break;
            case 'go':
                res.push(go());
                break;
            case 'rust':
                res.push(rust());
                break;
            default:
                res.push(javascript());
                break;
        }
        return res;
    });

    // 属性
    const disabled = ref(false);
    const props = defineProps(['code', 'lang', 'disabled']);
    onMounted(() => {
        // 赋值，初始化
        content.value = props.code;
        language.value = props.lang;
        if (props.hasOwnProperty('disabled')) {
            disabled.value = props.disabled;
        }
    });
    watch(
        props,
        () => {
            language.value = props.lang;
            content.value = props.code;
        },
        {
            deep: true
        }
    );

    // 获取值
    const getValue = () => {
        return content.value;
    };

    // 触发文本内容变更事件
    const emits = defineEmits(['change', 'update:code']);
    watch(content, () => {
        emits('change', content.value);
        emits('update:code', content.value);
    });

    /**
     * 复制
     */
    const copy = async () => {
        try {
            await toClipboard(content.value);
            ElMessage.success('复制成功');
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * 切换全屏
     */
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    };

    /**
     * 进入全屏
     */
    const enterFullscreen = () => {
        const wrapper = document.querySelector('.codemirror');
        if (wrapper) {
            wrapper.requestFullscreen();
        }
    };

    /**
     * 退出全屏
     */
    const exitFullscreen = () => {
        document.exitFullscreen();
    };

    // 暴露方法，外部引用
    defineExpose({
        getValue
    });
</script>
<template>
    <el-row class="main">
        <el-col :span="24" style="height: 40px">
            <el-row>
                <el-col :span="24">
                    <el-select v-model="language" placeholder="请选择语言" size="small" style="width: 120px" :filterable="true" :disabled="disabled">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-col>
            </el-row>
        </el-col>
        <el-col :span="24" class="codemirror">
            <el-row class="codemirror-tools">
                <el-col :span="24">
                    <span class="tools-item" @click="copy">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                    </span>
                    <span class="tools-item" @click="toggleFullscreen">
                        <el-icon><FullScreen /></el-icon>
                        全屏
                    </span>
                </el-col>
            </el-row>
            <el-row style="height: 100%">
                <el-col :span="24">
                    <Codemirror v-model="content" :spellcheck="true" :autofocus="true" :indent-with-tab="true" :tabSize="4" :extensions="extensions" :style="{ height: '100%' }" :disabled="disabled" />
                </el-col>
            </el-row>
        </el-col>
    </el-row>
</template>
<style lang="less" scoped>
    .main {
        width: 100%;
        height: 100%;
    }

    .codemirror {
        position: relative;
        height: calc(100% - 40px);
        overflow: hidden;
        overflow-y: auto;
    }

    .codemirror .fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: auto;
        z-index: 9;
    }

    .codemirror-tools {
        position: absolute;
        right: 0;
        z-index: 9;
        background-color: #1f2532;
    }

    .codemirror-tools .tools-item {
        display: inline-flex;
        padding: 0 4px;
        cursor: pointer;
        color: #bbb;
        font-size: 12px;
        align-items: center;
        justify-content: space-evenly;
        gap: 2px;
    }

    .codemirror-tools .tools-item:hover {
        color: #409eff;
    }
</style>
