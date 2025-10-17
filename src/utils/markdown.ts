import { marked } from "marked";
import hljs from "highlight.js";

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 自定义渲染器
const renderer = new marked.Renderer();

// 代码块
renderer.code = function (code: string, language: string | undefined): string {
  const lang = language || "plaintext";
  let highlighted = code;

  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(code, { language: lang }).value;
    } catch (e) {
      console.error("代码高亮失败", e);
    }
  }

  return `<pre class="md-code"><code class="hljs language-${lang}">${highlighted}</code></pre>`;
};

// 行内代码
renderer.codespan = function (code: string): string {
  return `<code class="md-inline-code">${code}</code>`;
};

// 链接
renderer.link = function (
  href: string,
  title: string | null,
  text: string
): string {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${
    title ? ` title="${title}"` : ""
  }>${text}</a>`;
};

marked.use({ renderer });

/**
 * 将 Markdown 渲染为 HTML
 */
export const renderMarkdownToHtml = (markdown: any): string => {
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
  markdown = String(markdown);

  if (!markdown || markdown.trim() === "") {
    return "";
  }

  try {
    const html = marked.parse(markdown);
    // marked.parse 可能返回 string 或 Promise，确保返回 string
    return typeof html === "string" ? html : String(html);
  } catch (error) {
    console.error("Markdown 渲染错误:", error);
    return `<p>${escapeHtml(markdown)}</p>`;
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

export default renderMarkdownToHtml;
