import Tesseract from "tesseract.js";

/**
 * OCR 识别结果接口
 */
export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * 文件验证结果接口
 */
export interface FileValidation {
  valid: boolean;
  error?: string;
}

/**
 * 验证图片文件
 * @param file 要验证的文件
 * @returns 验证结果
 */
export function validateImageFile(file: File): FileValidation {
  console.log(
    "[OCR] 验证文件:",
    file.name,
    "类型:",
    file.type,
    "大小:",
    file.size
  );

  // 支持的图片格式
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "请上传 PNG、JPG 或 WEBP 格式的图片",
    };
  }

  // 文件大小限制：20MB（如果超过会自动压缩）
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "图片大小不能超过 20MB，请压缩后重试",
    };
  }

  return { valid: true };
}

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param maxSizeMB 目标大小（MB）
 * @returns Promise<File> 压缩后的图片文件
 */
async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 如果图片很大，先缩小尺寸（保持宽高比）
        const maxDimension = 2400; // 最大宽度或高度
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("无法创建 Canvas 上下文"));
          return;
        }

        // 绘制图片
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 Blob，质量从 0.9 开始尝试
        let quality = 0.9;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("图片压缩失败"));
                return;
              }

              const targetSize = maxSizeMB * 1024 * 1024;

              // 如果压缩后大小合适，或者质量已经很低了，就返回
              if (blob.size <= targetSize || quality <= 0.5) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });

                console.log(
                  "[OCR] 图片压缩完成: 原始",
                  (file.size / 1024).toFixed(2),
                  "KB →",
                  (compressedFile.size / 1024).toFixed(2),
                  "KB",
                  "(质量:",
                  quality + ")"
                );

                resolve(compressedFile);
              } else {
                // 继续降低质量
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error("图片加载失败"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 识别图片中的文字
 * @param file 要识别的图片文件
 * @param progressCallback 进度回调函数
 * @returns Promise<string> 识别出的文本
 */
export async function recognizeImage(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  let worker: Tesseract.Worker | null = null;

  try {
    console.log(
      "[OCR] 开始处理图片:",
      file.name,
      "大小:",
      (file.size / 1024).toFixed(2),
      "KB"
    );

    // 如果图片大于 5MB，自动压缩
    let processedFile = file;
    if (file.size > 5 * 1024 * 1024) {
      console.log("[OCR] 图片较大，开始自动压缩...");
      try {
        processedFile = await compressImage(file, 3); // 压缩到 3MB 以内
      } catch (error) {
        console.warn("[OCR] 压缩失败，使用原图:", error);
        // 压缩失败就用原图
      }
    }

    // 创建 Worker（不传递 logger，避免序列化问题）
    worker = await Tesseract.createWorker("chi_sim+eng", 1, {
      // 使用 workerPath 配置可以提升性能，但不是必需的
    });

    console.log("[OCR] Worker 创建并初始化完成（中文+英文）");

    console.log("[OCR] 开始识别文字...");

    // 执行识别（带进度回调模拟）
    let recognitionProgress = 0;
    const progressInterval = setInterval(() => {
      if (recognitionProgress < 90) {
        recognitionProgress += 10;
        console.log("[OCR] 识别进度:", recognitionProgress + "%");
        if (progressCallback) {
          progressCallback(recognitionProgress);
        }
      }
    }, 500);

    const result = await worker.recognize(processedFile);

    // 清除进度定时器
    clearInterval(progressInterval);

    // 设置为 100%
    if (progressCallback) {
      progressCallback(100);
    }

    const recognizedText = result.data.text.trim();
    const confidence = result.data.confidence;

    console.log("[OCR] 识别完成！");
    console.log("[OCR] 文本长度:", recognizedText.length, "字符");
    console.log("[OCR] 置信度:", confidence.toFixed(2) + "%");
    console.log(
      "[OCR] 识别内容预览:",
      recognizedText.substring(0, 100) +
        (recognizedText.length > 100 ? "..." : "")
    );

    // 检查是否识别到文字
    if (!recognizedText) {
      throw new Error("未识别到任何文字内容，请确保图片清晰且包含可识别的文字");
    }

    // 终止 worker 释放资源
    await worker.terminate();
    console.log("[OCR] Worker 已终止，资源已释放");

    return recognizedText;
  } catch (error: any) {
    console.error("[OCR] 识别失败:", error);

    // 确保清理资源
    if (worker) {
      try {
        await worker.terminate();
        console.log("[OCR] Worker 异常终止");
      } catch (e) {
        console.error("[OCR] Worker 终止失败:", e);
      }
    }

    // 抛出友好的错误信息
    throw new Error("图片识别失败: " + (error.message || "未知错误"));
  }
}
