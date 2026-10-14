<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { ElMessage } from 'element-plus';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import { $t } from '@/locales';

defineOptions({ name: 'CodeHighlight' });

/**
 * 按需注册语言，不引 `highlight.js` 全量（全量含 190+ 语法，体积约 1MB）。
 * 覆盖代码生成预览会出现的后缀，新增模板类型时在此补充。
 */
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('xml', xml);

/** 后缀 → highlight.js 语言名 */
const EXT_LANGUAGE: Record<string, string> = {
  java: 'java',
  js: 'javascript',
  sql: 'sql',
  xml: 'xml',
  // 没有 vue 语法，SFC 按 HTML 标记处理（script 段会退化为普通文本）
  vue: 'xml'
};

interface Props {
  /** 待高亮的源码 */
  code?: string;
  /** 文件名，用于推断语言；拿不到就自动识别 */
  filename?: string;
}

const props = defineProps<Props>();

function languageOf(filename?: string) {
  if (!filename) return '';

  // 代码生成的模板名形如 `domain.java.vm`，去掉 .vm 再取后缀
  const name = filename.replace(/\.vm$/, '');
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();

  return EXT_LANGUAGE[ext] ?? '';
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const html = computed(() => {
  const { code } = props;
  if (!code) return '';

  const language = languageOf(props.filename);

  try {
    const raw =
      language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value
        : hljs.highlightAuto(code).value;

    // 高亮产物是 HTML，插进 DOM 前统一消毒
    return DOMPurify.sanitize(raw);
  } catch {
    // 高亮失败退回纯文本，避免弹窗空白
    return escapeHtml(code);
  }
});

const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

/** 非安全上下文（如 http 内网部署）下 clipboard API 不可用，降级到 execCommand */
async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);

    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

async function handleCopy() {
  const { code } = props;
  if (!code) return;

  try {
    await copyText(code);

    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    ElMessage.error($t('common.copyFailed'));
  }
}

onBeforeUnmount(() => clearTimeout(copiedTimer));
</script>

<template>
  <div class="code-highlight">
    <ElButton class="code-highlight__copy" link type="primary" icon="DocumentCopy" @click="handleCopy">
      {{ copied ? $t('common.copied') : $t('common.copy') }}
    </ElButton>
    <pre class="code-highlight__body">
      <!-- eslint-disable-next-line vue/no-v-html -- html 是 highlight.js 的输出，插进 DOM 前已经过 DOMPurify 消毒 -->
      <code class="hljs" v-html="html" /></pre>
  </div>
</template>

<style scoped lang="scss">
.code-highlight {
  position: relative;
}

.code-highlight__copy {
  position: absolute;
  top: 4px;
  right: 12px;
  z-index: 1;
}

.code-highlight__body {
  margin: 0;
  max-height: 60vh;
  overflow: auto;
  border-radius: 6px;
  background-color: var(--el-fill-color-light);
}

.code-highlight__body :deep(code) {
  display: block;
  /* 顶部留出复制按钮的高度，避免长行滑到按钮下面 */
  padding: 32px 12px 12px;
  font-family: var(--el-font-family-mono, monospace);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  background: transparent;
}

/*
 * 自定义配色而不用 highlight.js 自带主题：那些主题（github.css 等）是固定色值，
 * 暗黑模式下会糊成一片。这里统一走 Element Plus 变量，跟随主题自动切换。
 */
.code-highlight__body :deep(.hljs-comment),
.code-highlight__body :deep(.hljs-quote) {
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.code-highlight__body :deep(.hljs-keyword),
.code-highlight__body :deep(.hljs-selector-tag),
.code-highlight__body :deep(.hljs-literal),
.code-highlight__body :deep(.hljs-tag) {
  color: var(--el-color-primary);
}

.code-highlight__body :deep(.hljs-string),
.code-highlight__body :deep(.hljs-attr),
.code-highlight__body :deep(.hljs-attribute) {
  color: var(--el-color-success);
}

.code-highlight__body :deep(.hljs-number),
.code-highlight__body :deep(.hljs-built_in),
.code-highlight__body :deep(.hljs-type) {
  color: var(--el-color-warning);
}

.code-highlight__body :deep(.hljs-title),
.code-highlight__body :deep(.hljs-name),
.code-highlight__body :deep(.hljs-section) {
  color: var(--el-color-danger);
}

.code-highlight__body :deep(.hljs-variable),
.code-highlight__body :deep(.hljs-template-variable),
.code-highlight__body :deep(.hljs-symbol) {
  color: var(--el-color-info);
}
</style>
