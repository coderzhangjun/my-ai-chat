import { marked, type Tokens } from "marked";
import hljs from "highlight.js";

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 自定义渲染器
const renderer = new marked.Renderer();

// 代码块
renderer.code = function ({ text, lang }: Tokens.Code): string {
  const language = normalizeLanguage(lang);
  const highlighted = highlightCode(text, language);

  return `<pre class="md-code"><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

// 行内代码
renderer.codespan = function ({ text }: Tokens.Codespan): string {
  return `<code class="md-inline-code">${escapeHtml(text)}</code>`;
};

// 链接
renderer.link = function ({ href, title, tokens }: Tokens.Link): string {
  const text = this.parser.parseInline(tokens);
  const safeHref = escapeHtml(href);
  const safeTitle = title ? ` title="${escapeHtml(title)}"` : "";

  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${safeTitle}>${text}</a>`;
};

marked.use({ renderer });

/**
 * 将 Markdown 渲染为 HTML
 */
export const renderMarkdownToHtml = (markdown: unknown): string => {
  // 类型守卫：确保输入是有效的字符串
  if (markdown === null || markdown === undefined) {
    return "";
  }

  // 如果是对象，尝试转换为 JSON 字符串
  if (typeof markdown === "object") {
    console.warn("⚠️ [Markdown] 收到对象类型，尝试转换:", markdown);
    try {
      markdown = JSON.stringify(markdown, null, 2);
    } catch (e) {
      console.error("❌ [Markdown] 对象序列化失败:", e);
      return "<p>内容格式错误</p>";
    }
  }

  // 确保是字符串
  const markdownText = String(markdown);

  if (!markdownText || markdownText.trim() === "") {
    return "";
  }

  try {
    const html = marked.parse(markdownText);
    // marked.parse 可能返回 string 或 Promise，确保返回 string
    return typeof html === "string" ? html : String(html);
  } catch (error) {
    console.error("Markdown 渲染错误:", error);
    return `<p>${escapeHtml(markdownText)}</p>`;
  }
};

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

const normalizeLanguage = (language: string | undefined): string => {
  const normalized = language?.trim().split(/\s+/)[0] || "plaintext";
  return /^[a-zA-Z0-9_-]+$/.test(normalized) ? normalized : "plaintext";
};

const highlightCode = (code: string, language: string): string => {
  if (!hljs.getLanguage(language)) {
    return escapeHtml(code);
  }

  try {
    return hljs.highlight(code, { language }).value;
  } catch (error) {
    console.error("代码高亮失败", error);
    return escapeHtml(code);
  }
};

export default renderMarkdownToHtml;
