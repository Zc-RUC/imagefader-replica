import {
    RECIPE_VERSION,
    conicPosition,
    createOutputFilename,
    decodeImageFile,
    isSupportedImageFile,
    normalizeRecipe,
    processDecodedImage,
    renderRecipeToContext,
    sourceDimensions
} from "./image-core.js";
import {
    createTaskMeasurement,
    trackEvent,
    viewportBucket
} from "./analytics.js";
import { icon } from "./ui-icons.js";

(() => {
    "use strict";

    function resolveLanguage(value) {
        const language = String(value || "").toLowerCase();
        if (language.startsWith("ja")) return "ja";
        if (language.startsWith("en")) return "en";
        return "zh-CN";
    }

    const LANGUAGE = resolveLanguage(document.documentElement.lang);

    const COPY = {
        "zh-CN": {
            unknownSize: "未知大小",
            editorTitle: "ImageFader 编辑器",
            notUploaded: "尚未上传",
            replaceImage: "更换",
            clearImage: "清除",
            uploadImageAria: "上传图片",
            dropTitle: "把图片放到这里",
            dropDescription: "拖拽、粘贴，或者从设备中选择一张图片",
            chooseImage: "选择图片",
            supportedFormats: "支持格式",
            maxSize: "最大 60MP",
            effectSettings: "效果参数",
            effect: "效果",
            modesAria: "透明处理模式",
            opacityPresets: "不透明度快捷预设",
            commonUses: "常用场景",
            oneClick: "一键开始",
            softWatermark: "淡水印",
            backgroundImage: "背景图",
            slightFade: "轻微变淡",
            gradientType: "渐变类型",
            linear: "线性",
            radial: "径向",
            conic: "扇形",
            conicFade: "渐变方式",
            conicAngular: "沿角度",
            conicRadial: "从中心向外",
            sectorStart: "扇形起边",
            sectorEnd: "扇形止边",
            conicRadialHint: "扇形内从中心向外淡出，范围外透明。A/B 调整开口，反转可让中心变透明。",
            conicHint: "绕中心渐变；拖动中心定位，拖动 A/B 调范围。虚线标记首尾接缝。",
            conicCanvasHint: "拖动中心定位，拖动 A/B 调整扇形",
            quickDirection: "快捷方向",
            leftToRight: "左 → 右",
            rightToLeft: "右 → 左",
            topToBottom: "上 → 下",
            bottomToTop: "下 → 上",
            diagonalDown: "↘ 斜向",
            diagonalUp: "↗ 斜向",
            angle: "角度",
            fadeStart: "淡出起点",
            fadeEnd: "淡出终点",
            dragHandles: "也可以直接拖动画布上的两个控制点。",
            centerX: "中心 X",
            centerY: "中心 Y",
            reverseGradient: "反转透明方向",
            featherShape: "羽化形状",
            rectangleEdges: "矩形边缘",
            ellipseFocus: "椭圆聚焦",
            featherEdges: "羽化边缘",
            allSides: "四周",
            horizontalSides: "左右两侧",
            verticalSides: "上下两侧",
            topOnly: "仅上边",
            bottomOnly: "仅下边",
            leftOnly: "仅左边",
            rightOnly: "仅右边",
            featherWidth: "羽化宽度",
            edgeSoftness: "边缘柔和度",
            reverseFeather: "反转羽化（中心淡出）",
            selectionTool: "选择工具",
            rectangle: "矩形",
            ellipse: "椭圆",
            brush: "画笔",
            editSelection: "编辑选区",
            add: "增加",
            restore: "还原",
            brushSize: "画笔大小",
            selectionFeather: "选区羽化",
            invertSelection: "反选（处理选区外）",
            selectAll: "全选",
            clearSelection: "清除选区",
            selectionHint: "在图片上拖动创建选区；画笔模式支持连续涂抹。",
            imagePreview: "图片预览",
            previewBackground: "预览背景",
            checkerBackground: "棋盘格背景",
            whiteBackground: "白色背景",
            blackBackground: "黑色背景",
            customBackground: "自定义预览背景",
            guides: "辅助线",
            compareOriginal: "按住看原图",
            canvasPreview: "处理后的图片预览",
            canvasDefaultHint: "预览缩放不影响导出尺寸",
            exportSettings: "导出设置",
            exportInfo: "导出信息",
            alphaChannel: "透明通道",
            dimensions: "尺寸",
            processing: "处理",
            localOnly: "仅本地",
            fileFormat: "文件格式",
            pngLossless: "PNG · 无损透明",
            webpSmaller: "WebP · 更小体积",
            webpQuality: "WebP 质量",
            downloadTransparent: "下载透明图片",
            copyClipboard: "复制到剪贴板",
            exportPrivacy: "导出在当前设备完成，不会上传原图。",
            exportImage: "导出图片",
            dropInvalid: "请拖入 PNG、JPG 或 WebP 图片。",
            invalidImage: "请选择有效的图片文件。",
            imageTooLarge: "图片尺寸过大，请使用小于 60MP 且边长不超过 16384px 的图片。",
            imageLoaded: "图片已载入，所有处理都在本地完成。",
            imageUnreadable: "这张图片无法读取，请换一张 PNG、JPG 或 WebP。",
            imageCleared: "图片已从编辑器中清除。",
            localCanvasHint: "拖动画布创建选区 · 蓝色区域为当前作用范围",
            gradientCanvasHint: "拖动控制点调整淡出范围",
            webpFallback: "当前浏览器不支持 WebP 导出，已改为 PNG。",
            downloadStarted: "透明图片已开始下载。",
            exportFailed: "导出失败，请稍后重试或改用 PNG。",
            clipboardUnsupported: "当前浏览器不支持复制图片，请使用下载。",
            copied: "透明图片已复制到剪贴板。",
            copyFailed: "复制失败，浏览器可能需要安全连接权限。",
            generating: "正在生成…",
            resultReady: "效果已生成，可以直接下载，也可以继续调整。",
            downloadWithFormat: "下载 {format}",
            copyShort: "复制",
            processAnother: "处理另一张图片",
            downloadComplete: "已开始下载",
            copyComplete: "已复制"
        },
        en: {
            unknownSize: "Unknown size",
            editorTitle: "ImageFader Editor",
            notUploaded: "No image yet",
            replaceImage: "Replace",
            clearImage: "Clear",
            uploadImageAria: "Upload an image",
            dropTitle: "Drop your image here",
            dropDescription: "Drag, paste, or choose an image from your device",
            chooseImage: "Choose image",
            supportedFormats: "Supported formats",
            maxSize: "Up to 60MP",
            effectSettings: "Effect controls",
            effect: "Effect",
            modesAria: "Transparency modes",
            opacityPresets: "Opacity presets",
            commonUses: "Quick presets",
            oneClick: "Start in one click",
            softWatermark: "Watermark",
            backgroundImage: "Background",
            slightFade: "Soft fade",
            gradientType: "Gradient type",
            linear: "Linear",
            radial: "Radial",
            conic: "Sector",
            conicFade: "Fade direction",
            conicAngular: "Around center",
            conicRadial: "Center outward",
            sectorStart: "Sector start",
            sectorEnd: "Sector end",
            conicRadialHint: "Fade outward inside the sector; the outside stays transparent. A/B set its opening. Invert to fade the center instead.",
            conicHint: "Fade around the center. Drag the center to move it, or A/B to change the range. The dashed ray marks the seam.",
            conicCanvasHint: "Drag the center to move it, or A/B to adjust the sector range",
            quickDirection: "Direction",
            leftToRight: "Left → right",
            rightToLeft: "Right → left",
            topToBottom: "Top → bottom",
            bottomToTop: "Bottom → top",
            diagonalDown: "↘ Diagonal",
            diagonalUp: "↗ Diagonal",
            angle: "Angle",
            fadeStart: "Fade start",
            fadeEnd: "Fade end",
            dragHandles: "You can also drag both handles directly on the canvas.",
            centerX: "Center X",
            centerY: "Center Y",
            reverseGradient: "Reverse fade direction",
            featherShape: "Feather shape",
            rectangleEdges: "Rectangle edges",
            ellipseFocus: "Ellipse focus",
            featherEdges: "Edges to feather",
            allSides: "All sides",
            horizontalSides: "Left and right",
            verticalSides: "Top and bottom",
            topOnly: "Top only",
            bottomOnly: "Bottom only",
            leftOnly: "Left only",
            rightOnly: "Right only",
            featherWidth: "Feather width",
            edgeSoftness: "Edge softness",
            reverseFeather: "Reverse feather (fade center)",
            selectionTool: "Selection tool",
            rectangle: "Rectangle",
            ellipse: "Ellipse",
            brush: "Brush",
            editSelection: "Edit selection",
            add: "Add",
            restore: "Restore",
            brushSize: "Brush size",
            selectionFeather: "Selection feather",
            invertSelection: "Invert (affect outside)",
            selectAll: "Select all",
            clearSelection: "Clear selection",
            selectionHint: "Drag on the image to select an area. Brush mode supports continuous painting.",
            imagePreview: "Image preview",
            previewBackground: "Preview background",
            checkerBackground: "Checkerboard background",
            whiteBackground: "White background",
            blackBackground: "Black background",
            customBackground: "Custom preview background",
            guides: "Guides",
            compareOriginal: "Hold for original",
            canvasPreview: "Processed image preview",
            canvasDefaultHint: "Preview scaling does not change export dimensions",
            exportSettings: "Export settings",
            exportInfo: "Export details",
            alphaChannel: "Alpha channel",
            dimensions: "Dimensions",
            processing: "Processing",
            localOnly: "On device",
            fileFormat: "File format",
            pngLossless: "PNG · Lossless alpha",
            webpSmaller: "WebP · Smaller file",
            webpQuality: "WebP quality",
            downloadTransparent: "Download transparent image",
            copyClipboard: "Copy to clipboard",
            exportPrivacy: "Export happens on this device. Your original image is never uploaded.",
            exportImage: "Export image",
            dropInvalid: "Please drop a PNG, JPG, or WebP image.",
            invalidImage: "Please choose a valid image file.",
            imageTooLarge: "This image is too large. Use an image under 60MP with edges below 16,384px.",
            imageLoaded: "Image loaded. All processing stays on this device.",
            imageUnreadable: "This image could not be read. Try another PNG, JPG, or WebP file.",
            imageCleared: "The image was cleared from the editor.",
            localCanvasHint: "Drag to create a selection · Blue shows the affected area",
            gradientCanvasHint: "Drag the handles to adjust the fade range",
            webpFallback: "WebP export is unavailable in this browser, so the file was saved as PNG.",
            downloadStarted: "Your transparent image is downloading.",
            exportFailed: "Export failed. Try again or switch to PNG.",
            clipboardUnsupported: "This browser cannot copy images. Please use download instead.",
            copied: "Transparent image copied to your clipboard.",
            copyFailed: "Copy failed. Your browser may require a secure connection.",
            generating: "Generating…",
            resultReady: "Your result is ready. Download it now or keep adjusting.",
            downloadWithFormat: "Download {format}",
            copyShort: "Copy",
            processAnother: "Process another image",
            downloadComplete: "Download started",
            copyComplete: "Copied"
        },
        ja: {
            unknownSize: "サイズ不明",
            editorTitle: "ImageFader エディター",
            notUploaded: "画像が選択されていません",
            replaceImage: "変更",
            clearImage: "クリア",
            uploadImageAria: "画像を選択",
            dropTitle: "ここに画像をドロップ",
            dropDescription: "ドラッグ、貼り付け、または端末から画像を選択",
            chooseImage: "画像を選択",
            supportedFormats: "対応形式",
            maxSize: "最大 60MP",
            effectSettings: "効果の設定",
            effect: "効果",
            modesAria: "透明度の処理モード",
            opacityPresets: "不透明度のプリセット",
            commonUses: "よく使う設定",
            oneClick: "ワンクリックで適用",
            softWatermark: "薄い透かし",
            backgroundImage: "背景画像",
            slightFade: "少し薄く",
            gradientType: "グラデーションの種類",
            linear: "線形",
            radial: "放射状",
            conic: "扇形",
            conicFade: "グラデーション方向",
            conicAngular: "角度に沿う",
            conicRadial: "中心から外側",
            sectorStart: "扇形の開始角",
            sectorEnd: "扇形の終了角",
            conicRadialHint: "扇形の中心から外側へ透明にします。範囲外は透明のまま。A/B で開き角を調整し、反転で中心を透明にできます。",
            conicHint: "中心の周りを徐々に透明にします。中心を移動し、A/B で範囲を調整。破線は開始と終了の継ぎ目です。",
            conicCanvasHint: "中心を移動し、A/B で扇形の範囲を調整",
            quickDirection: "方向",
            leftToRight: "左 → 右",
            rightToLeft: "右 → 左",
            topToBottom: "上 → 下",
            bottomToTop: "下 → 上",
            diagonalDown: "↘ 斜め",
            diagonalUp: "↗ 斜め",
            angle: "角度",
            fadeStart: "フェード開始",
            fadeEnd: "フェード終了",
            dragHandles: "キャンバス上の 2 つのハンドルを直接ドラッグすることもできます。",
            centerX: "中心 X",
            centerY: "中心 Y",
            reverseGradient: "透明になる方向を反転",
            featherShape: "フェード形状",
            rectangleEdges: "長方形のふち",
            ellipseFocus: "楕円フォーカス",
            featherEdges: "ぼかす辺",
            allSides: "四辺",
            horizontalSides: "左右",
            verticalSides: "上下",
            topOnly: "上のみ",
            bottomOnly: "下のみ",
            leftOnly: "左のみ",
            rightOnly: "右のみ",
            featherWidth: "ふちの幅",
            edgeSoftness: "境界のなめらかさ",
            reverseFeather: "反転（中央をフェード）",
            selectionTool: "選択ツール",
            rectangle: "長方形",
            ellipse: "楕円",
            brush: "ブラシ",
            editSelection: "選択範囲を編集",
            add: "追加",
            restore: "復元",
            brushSize: "ブラシサイズ",
            selectionFeather: "選択範囲のぼかし",
            invertSelection: "反転（選択範囲の外側に適用）",
            selectAll: "すべて選択",
            clearSelection: "選択を解除",
            selectionHint: "画像上をドラッグして範囲を選択します。ブラシは続けて塗れます。",
            imagePreview: "画像プレビュー",
            previewBackground: "プレビュー背景",
            checkerBackground: "市松模様",
            whiteBackground: "白",
            blackBackground: "黒",
            customBackground: "背景色を指定",
            guides: "ガイド",
            compareOriginal: "長押しで元画像",
            canvasPreview: "処理後のプレビュー",
            canvasDefaultHint: "プレビューの縮小は書き出しサイズに影響しません",
            exportSettings: "書き出し設定",
            exportInfo: "書き出し情報",
            alphaChannel: "アルファチャンネル",
            dimensions: "画像サイズ",
            processing: "処理",
            localOnly: "ブラウザ内",
            fileFormat: "ファイル形式",
            pngLossless: "PNG · 可逆圧縮・透明",
            webpSmaller: "WebP · 小さいファイル",
            webpQuality: "WebP 品質",
            downloadTransparent: "透明画像をダウンロード",
            copyClipboard: "クリップボードにコピー",
            exportPrivacy: "書き出しはこの端末で完了します。元画像は送信されません。",
            exportImage: "画像を書き出す",
            dropInvalid: "PNG、JPG、WebP の画像をドロップしてください。",
            invalidImage: "有効な画像ファイルを選択してください。",
            imageTooLarge: "画像が大きすぎます。60MP 未満、最長辺 16,384px 未満の画像を使用してください。",
            imageLoaded: "画像を読み込みました。すべての処理はブラウザ内で行われます。",
            imageUnreadable: "画像を読み込めませんでした。別の PNG、JPG、WebP をお試しください。",
            imageCleared: "画像をエディターから削除しました。",
            localCanvasHint: "ドラッグして範囲を選択 · 青い部分に効果が適用されます",
            gradientCanvasHint: "ハンドルをドラッグしてフェード範囲を調整",
            webpFallback: "このブラウザでは WebP を書き出せないため、PNG で保存しました。",
            downloadStarted: "透明画像のダウンロードを開始しました。",
            exportFailed: "書き出しに失敗しました。もう一度試すか、PNG に切り替えてください。",
            clipboardUnsupported: "このブラウザは画像のコピーに対応していません。ダウンロードをご利用ください。",
            copied: "透明画像をクリップボードにコピーしました。",
            copyFailed: "コピーに失敗しました。安全な接続の権限が必要な場合があります。",
            generating: "生成中…",
            resultReady: "効果のプレビューができました。そのままダウンロードするか、続けて調整できます。",
            downloadWithFormat: "{format} をダウンロード",
            copyShort: "コピー",
            processAnother: "別の画像を処理",
            downloadComplete: "ダウンロードを開始しました",
            copyComplete: "コピーしました"
        }
    }[LANGUAGE];

    const MODE_DEFINITIONS = {
        global: { icon: icon("global"), defaultOpacity: 55 },
        gradient: { icon: icon("gradient"), defaultOpacity: 0 },
        feather: { icon: icon("feather"), defaultOpacity: 0 },
        local: { icon: icon("local"), defaultOpacity: 0 }
    };

    const MODE_COPY = {
        "zh-CN": {
            global: { label: "整体透明", opacityLabel: "图片不透明度", hint: "数值越低，整张图片越透明。" },
            gradient: { label: "渐变透明", opacityLabel: "渐变最低不透明度", hint: "控制渐变最淡一端的透明程度。" },
            feather: { label: "边缘羽化", opacityLabel: "边缘不透明度", hint: "控制羽化边缘最终保留的可见程度。" },
            local: { label: "局部透明", opacityLabel: "选区不透明度", hint: "先在画布上框选或涂抹，再调整选区透明度。" }
        },
        en: {
            global: { label: "Overall opacity", opacityLabel: "Image opacity", hint: "Lower values make the entire image more transparent." },
            gradient: { label: "Gradient fade", opacityLabel: "Minimum gradient opacity", hint: "Controls how transparent the faded end becomes." },
            feather: { label: "Edge feather", opacityLabel: "Edge opacity", hint: "Controls how visible the feathered edge remains." },
            local: { label: "Local opacity", opacityLabel: "Selection opacity", hint: "Select or paint an area, then adjust its opacity." }
        },
        ja: {
            global: { label: "全体の透明度", opacityLabel: "画像の不透明度", hint: "数値を下げるほど、画像全体が透明になります。" },
            gradient: { label: "透明グラデーション", opacityLabel: "最低不透明度", hint: "フェード側をどこまで透明にするか調整します。" },
            feather: { label: "ふちぼかし", opacityLabel: "ふちの不透明度", hint: "ふちに残す見え方を調整します。" },
            local: { label: "部分透明", opacityLabel: "選択範囲の不透明度", hint: "範囲を選択または塗ってから、不透明度を調整します。" }
        }
    };

    const MODE_CONFIG = Object.fromEntries(
        Object.entries(MODE_DEFINITIONS).map(([mode, definition]) => [
            mode,
            { ...definition, ...MODE_COPY[LANGUAGE][mode] }
        ])
    );

    const VALID_MODES = Object.keys(MODE_CONFIG);
    function escapeText(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) return COPY.unknownSize;
        const units = ["B", "KB", "MB", "GB"];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / (1024 ** index);
        return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
    }

    function createCanvas(width, height) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function scrollToElement(element) {
        if (!element) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const top = element.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
    }

    class ImageFaderEditor {
        constructor(mount) {
            this.mount = mount;
            this.state = {
                image: null,
                file: null,
                fileName: "",
                mode: this.resolveInitialMode(),
                opacity: {
                    global: MODE_CONFIG.global.defaultOpacity,
                    gradient: MODE_CONFIG.gradient.defaultOpacity,
                    feather: MODE_CONFIG.feather.defaultOpacity,
                    local: MODE_CONFIG.local.defaultOpacity
                },
                gradient: {
                    type: "linear",
                    conicFade: "angular",
                    angle: 0,
                    start: 8,
                    end: 92,
                    centerX: 50,
                    centerY: 50,
                    invert: false
                },
                feather: {
                    shape: "rectangle",
                    sides: "all",
                    width: 22,
                    softness: 72,
                    invert: false
                },
                local: {
                    tool: "rectangle",
                    operation: "add",
                    brushSize: 8,
                    feather: 3,
                    invert: false,
                    hasSelection: false
                },
                export: {
                    type: "image/png",
                    quality: 0.9
                },
                previewBackground: "checker",
                customBackground: "#d7deea",
                showOriginal: false,
                showGuides: true,
                isRendering: false,
                pointer: {
                    active: false,
                    id: null,
                    start: null,
                    current: null,
                    previous: null,
                    gradientHandle: null
                }
            };

            this.applyPageDefaults();
            this.taskMeasurement = createTaskMeasurement();
            this.exportCtaObserver = null;
            this.exportViewTimers = new Map();
            this.exportViewFallbackTimer = 0;
            this.actionLabelTimer = 0;
            this.renderFrame = 0;
            this.selectionCanvas = createCanvas(1, 1);
            this.selectionContext = this.selectionCanvas.getContext("2d", { willReadFrequently: false });
            const startupFile = window.imageFaderStartup?.take();
            const startupInput = this.mount.querySelector("#imageInput");
            const pendingFile = startupFile || (startupInput?.files?.[0]
                ? { file: startupInput.files[0], source: "picker" } : null);
            const restoreUploadFocus = this.mount.contains(document.activeElement);
            // Keep the native input connected: a file picker may still be open during hydration.
            if (startupInput) this.mount.before(startupInput);
            this.mount.innerHTML = this.getTemplate();
            if (startupInput) this.mount.querySelector("#imageInput").replaceWith(startupInput);
            this.cacheElements();
            this.bindEvents();
            this.syncAllControls();
            this.updateModeUI();
            this.mount.dataset.editorReady = "true";
            if (restoreUploadFocus) this.elements.dropZone.focus({ preventScroll: true });
            if (pendingFile) this.loadFile(pendingFile.file, pendingFile.source);
        }

        resolveInitialMode() {
            const params = new URLSearchParams(window.location.search);
            const requested = params.get("mode");
            const fromMount = this.mount.dataset.defaultMode;
            const fromBody = document.body.dataset.defaultMode;
            return [requested, fromMount, fromBody, "global"].find((mode) => VALID_MODES.includes(mode));
        }

        applyPageDefaults() {
            const params = new URLSearchParams(window.location.search);
            const preset = params.get("preset") || this.mount.dataset.defaultPreset || document.body.dataset.defaultPreset || "";
            const presets = {
                "global-soft": () => {
                    this.state.opacity.global = 50;
                },
                "gradient-right": () => {
                    this.state.gradient.type = "linear";
                    this.state.gradient.angle = 0;
                    this.state.gradient.start = 8;
                    this.state.gradient.end = 88;
                    this.state.opacity.gradient = 0;
                },
                "edge-right": () => {
                    this.state.feather.shape = "rectangle";
                    this.state.feather.sides = "right";
                    this.state.feather.width = 28;
                    this.state.opacity.feather = 0;
                },
                "edge-all": () => {
                    this.state.feather.shape = "rectangle";
                    this.state.feather.sides = "all";
                    this.state.feather.width = 24;
                    this.state.opacity.feather = 0;
                },
                "ellipse-feather": () => {
                    this.state.feather.shape = "ellipse";
                    this.state.feather.width = 25;
                    this.state.opacity.feather = 0;
                },
                "local-rectangle": () => {
                    this.state.local.tool = "rectangle";
                    this.state.local.feather = 4;
                    this.state.opacity.local = 0;
                },
                "ppt-background": () => {
                    this.state.gradient.type = "linear";
                    this.state.gradient.angle = 0;
                    this.state.gradient.start = 15;
                    this.state.gradient.end = 78;
                    this.state.opacity.gradient = 15;
                }
            };
            presets[preset]?.();
        }

        getRecipe() {
            const mode = this.state.mode === "local" ? "global" : this.state.mode;
            return normalizeRecipe({
                version: RECIPE_VERSION,
                mode,
                opacity: this.state.opacity[mode],
                gradient: this.state.gradient,
                feather: this.state.feather,
                export: this.state.export,
                naming: {
                    suffix: `-${mode}-imagefader`
                }
            });
        }

        getTemplate() {
            const c = COPY;
            return `
                <input class="visually-hidden" type="file" id="imageInput" accept="image/png,image/jpeg,image/webp" hidden>
                <div class="editor-shell">
                    <div class="editor-topbar">
                        <div class="editor-title"><span aria-hidden="true"></span> ${c.editorTitle}</div>
                        <div class="file-chip" id="fileChip" hidden>
                            ${icon("image")}
                            <strong id="fileName">${c.notUploaded}</strong>
                            <small id="fileSize"></small>
                        </div>
                        <div class="editor-topbar__actions">
                            <button class="icon-button" type="button" id="replaceImage" hidden>${icon("refresh")} ${c.replaceImage}</button>
                            <button class="icon-button" type="button" id="resetEditor" hidden>${icon("close")} ${c.clearImage}</button>
                        </div>
                    </div>

                    <div class="editor-empty" id="editorEmpty">
                        <div class="drop-zone" id="dropZone" tabindex="0" role="button" aria-label="${c.uploadImageAria}">
                            <div>
                                <div class="drop-zone__icon" aria-hidden="true">${icon("plus")}</div>
                                <h3>${c.dropTitle}</h3>
                                <p>${c.dropDescription}</p>
                                <span class="button button--primary">${icon("upload")}<span>${c.chooseImage}</span></span>
                                <div class="drop-zone__meta" aria-label="${c.supportedFormats}">
                                    <span>PNG</span><span>JPG</span><span>WebP</span><span>${c.maxSize}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="editor-workspace" id="editorWorkspace" hidden>
                        <aside class="control-panel" aria-label="${c.effectSettings}">
                            <div class="panel-heading"><strong>${c.effect}</strong><small id="activeModeName">${MODE_CONFIG.global.label}</small></div>
                            <div class="mode-tabs" role="tablist" aria-label="${c.modesAria}">
                                ${VALID_MODES.map((mode) => `
                                    <button class="mode-tab" type="button" role="tab" data-mode="${mode}" aria-selected="false">
                                        <span aria-hidden="true">${MODE_CONFIG[mode].icon}</span>${MODE_CONFIG[mode].label}
                                    </button>
                                `).join("")}
                            </div>

                            <div class="control-group">
                                <label class="control-label" for="effectOpacity">
                                    <span id="opacityLabel">${MODE_CONFIG.global.opacityLabel}</span>
                                    <output id="opacityOutput" for="effectOpacity">55%</output>
                                </label>
                                <input type="range" id="effectOpacity" min="0" max="100" step="1" value="55">
                                <div class="preset-row" aria-label="${c.opacityPresets}">
                                    ${[0, 25, 50, 75, 100].map((value) => `<button class="preset-button" type="button" data-opacity-preset="${value}">${value}%</button>`).join("")}
                                </div>
                                <p class="control-hint" id="opacityHint"></p>
                            </div>

                            <div class="mode-controls" data-mode-controls="global">
                                <div class="control-group">
                                    <div class="panel-heading"><strong>${c.commonUses}</strong><small>${c.oneClick}</small></div>
                                    <div class="preset-row">
                                        <button class="choice-button" type="button" data-global-preset="25">${c.softWatermark}</button>
                                        <button class="choice-button" type="button" data-global-preset="50">${c.backgroundImage}</button>
                                        <button class="choice-button" type="button" data-global-preset="75">${c.slightFade}</button>
                                    </div>
                                </div>
                            </div>

                            <div class="mode-controls" data-mode-controls="gradient" hidden>
                                <div class="control-group">
                                    <div class="control-label"><span>${c.gradientType}</span></div>
                                    <div class="segmented-control">
                                        <button type="button" data-gradient-type="linear">${c.linear}</button>
                                        <button type="button" data-gradient-type="radial">${c.radial}</button>
                                        <button type="button" data-gradient-type="conic">${c.conic}</button>
                                    </div>
                                </div>
                                <div class="control-group" id="conicFadeControls" hidden>
                                    <div class="control-label" id="conicFadeLabel"><span>${c.conicFade}</span></div>
                                    <div class="segmented-control" role="group" aria-labelledby="conicFadeLabel">
                                        <button type="button" data-conic-fade="angular">${c.conicAngular}</button>
                                        <button type="button" data-conic-fade="radial">${c.conicRadial}</button>
                                    </div>
                                </div>
                                <div class="control-group" id="linearGradientControls">
                                    <div class="control-label"><span>${c.quickDirection}</span></div>
                                    <div class="preset-row">
                                        <button class="preset-button" type="button" data-gradient-angle="0">${c.leftToRight}</button>
                                        <button class="preset-button" type="button" data-gradient-angle="180">${c.rightToLeft}</button>
                                        <button class="preset-button" type="button" data-gradient-angle="90">${c.topToBottom}</button>
                                        <button class="preset-button" type="button" data-gradient-angle="270">${c.bottomToTop}</button>
                                        <button class="preset-button" type="button" data-gradient-angle="45">${c.diagonalDown}</button>
                                        <button class="preset-button" type="button" data-gradient-angle="315">${c.diagonalUp}</button>
                                    </div>
                                </div>
                                <div class="control-group" id="gradientAngleGroup">
                                    <label class="control-label" for="gradientAngle"><span>${c.angle}</span><output id="gradientAngleOutput">0°</output></label>
                                    <input type="range" id="gradientAngle" min="0" max="359" step="1" value="0">
                                </div>
                                <div class="control-group">
                                    <div class="field-row">
                                        <label class="field" for="gradientStart"><span><span id="gradientStartLabel">${c.fadeStart}</span> <output id="gradientStartOutput" hidden></output></span><input type="range" id="gradientStart" min="0" max="98" step="1" value="8"></label>
                                        <label class="field" for="gradientEnd"><span><span id="gradientEndLabel">${c.fadeEnd}</span> <output id="gradientEndOutput" hidden></output></span><input type="range" id="gradientEnd" min="2" max="100" step="1" value="92"></label>
                                    </div>
                                    <p class="control-hint" id="gradientRangeHint">${c.dragHandles}</p>
                                </div>
                                <div class="control-group" id="radialCenterControls" hidden>
                                    <div class="field-row">
                                        <label class="field" for="gradientCenterX"><span>${c.centerX}</span><input type="range" id="gradientCenterX" min="0" max="100" value="50"></label>
                                        <label class="field" for="gradientCenterY"><span>${c.centerY}</span><input type="range" id="gradientCenterY" min="0" max="100" value="50"></label>
                                    </div>
                                </div>
                                <div class="control-group">
                                    <label class="toggle-row">${c.reverseGradient}
                                        <span class="switch"><input type="checkbox" id="gradientInvert"><span></span></span>
                                    </label>
                                </div>
                            </div>

                            <div class="mode-controls" data-mode-controls="feather" hidden>
                                <div class="control-group">
                                    <div class="control-label"><span>${c.featherShape}</span></div>
                                    <div class="segmented-control">
                                        <button type="button" data-feather-shape="rectangle">${c.rectangleEdges}</button>
                                        <button type="button" data-feather-shape="ellipse">${c.ellipseFocus}</button>
                                    </div>
                                </div>
                                <div class="control-group" id="featherSidesGroup">
                                    <label class="field" for="featherSides"><span>${c.featherEdges}</span>
                                        <select id="featherSides">
                                            <option value="all">${c.allSides}</option>
                                            <option value="horizontal">${c.horizontalSides}</option>
                                            <option value="vertical">${c.verticalSides}</option>
                                            <option value="top">${c.topOnly}</option>
                                            <option value="bottom">${c.bottomOnly}</option>
                                            <option value="left">${c.leftOnly}</option>
                                            <option value="right">${c.rightOnly}</option>
                                        </select>
                                    </label>
                                </div>
                                <div class="control-group">
                                    <label class="control-label" for="featherWidth"><span>${c.featherWidth}</span><output id="featherWidthOutput">22%</output></label>
                                    <input type="range" id="featherWidth" min="2" max="50" step="1" value="22">
                                </div>
                                <div class="control-group">
                                    <label class="control-label" for="featherSoftness"><span>${c.edgeSoftness}</span><output id="featherSoftnessOutput">72%</output></label>
                                    <input type="range" id="featherSoftness" min="10" max="100" step="1" value="72">
                                </div>
                                <div class="control-group">
                                    <label class="toggle-row">${c.reverseFeather}
                                        <span class="switch"><input type="checkbox" id="featherInvert"><span></span></span>
                                    </label>
                                </div>
                            </div>

                            <div class="mode-controls" data-mode-controls="local" hidden>
                                <div class="control-group">
                                    <div class="control-label"><span>${c.selectionTool}</span></div>
                                    <div class="segmented-control">
                                        <button type="button" data-local-tool="rectangle">${c.rectangle}</button>
                                        <button type="button" data-local-tool="ellipse">${c.ellipse}</button>
                                        <button type="button" data-local-tool="brush">${c.brush}</button>
                                    </div>
                                </div>
                                <div class="control-group">
                                    <div class="control-label"><span>${c.editSelection}</span></div>
                                    <div class="segmented-control">
                                        <button type="button" data-local-operation="add">${c.add}</button>
                                        <button type="button" data-local-operation="erase">${c.restore}</button>
                                    </div>
                                </div>
                                <div class="control-group" id="brushSizeGroup" hidden>
                                    <label class="control-label" for="brushSize"><span>${c.brushSize}</span><output id="brushSizeOutput">8%</output></label>
                                    <input type="range" id="brushSize" min="1" max="30" step="1" value="8">
                                </div>
                                <div class="control-group">
                                    <label class="control-label" for="localFeather"><span>${c.selectionFeather}</span><output id="localFeatherOutput">3%</output></label>
                                    <input type="range" id="localFeather" min="0" max="20" step="1" value="3">
                                </div>
                                <div class="control-group">
                                    <label class="toggle-row">${c.invertSelection}
                                        <span class="switch"><input type="checkbox" id="localInvert"><span></span></span>
                                    </label>
                                </div>
                                <div class="control-group">
                                    <div class="mini-actions">
                                        <button class="choice-button" type="button" id="selectAll">${c.selectAll}</button>
                                        <button class="choice-button" type="button" id="clearSelection">${c.clearSelection}</button>
                                    </div>
                                    <p class="control-hint">${c.selectionHint}</p>
                                </div>
                            </div>
                        </aside>

                        <section class="canvas-panel" aria-label="${c.imagePreview}">
                            <div class="canvas-toolbar">
                                <span class="canvas-toolbar__label">${c.previewBackground}</span>
                                <div class="background-picker" aria-label="${c.previewBackground}">
                                    <button class="background-button" type="button" data-background="checker" aria-label="${c.checkerBackground}"></button>
                                    <button class="background-button" type="button" data-background="white" aria-label="${c.whiteBackground}"></button>
                                    <button class="background-button" type="button" data-background="black" aria-label="${c.blackBackground}"></button>
                                    <label class="color-input-wrap" aria-label="${c.customBackground}"><input type="color" id="customBackground" value="#d7deea"></label>
                                </div>
                                <button type="button" id="toggleGuides" aria-pressed="true">${icon("guides")}<span>${c.guides}</span></button>
                                <button type="button" id="compareOriginal">${icon("eye")}<span>${c.compareOriginal}</span></button>
                            </div>
                            <div class="canvas-viewport" id="canvasViewport">
                                <div class="canvas-frame canvas-checker" id="canvasFrame" data-background="checker">
                                    <canvas id="imageCanvas" aria-label="${c.canvasPreview}"></canvas>
                                </div>
                            </div>
                            <div class="result-ready" id="resultReady" role="status">
                                <span class="result-ready__icon" aria-hidden="true">${icon("check")}</span>
                                <span>${c.resultReady}</span>
                                <button class="result-ready__next" type="button" id="processAnother" hidden>${c.processAnother}</button>
                            </div>
                            <div class="canvas-status">
                                <span id="canvasDimensions">0 × 0 px</span>
                                <span id="canvasHint">${c.canvasDefaultHint}</span>
                            </div>
                        </section>

                        <aside class="export-panel" aria-label="${c.exportSettings}">
                            <div class="export-preview">
                                <div class="export-preview__title">${c.exportInfo} <span>${c.alphaChannel}</span></div>
                                <dl class="export-meta">
                                    <div><dt>${c.dimensions}</dt><dd id="exportDimensions">-</dd></div>
                                    <div><dt>${c.effect}</dt><dd id="exportEffect">${MODE_CONFIG.global.label}</dd></div>
                                    <div><dt>${c.processing}</dt><dd>${c.localOnly}</dd></div>
                                </dl>
                            </div>
                            <div class="export-settings">
                                <label class="field" for="exportFormat"><span>${c.fileFormat}</span>
                                    <select id="exportFormat">
                                        <option value="image/png">${c.pngLossless}</option>
                                        <option value="image/webp">${c.webpSmaller}</option>
                                    </select>
                                </label>
                                <div id="qualityControl" hidden>
                                    <label class="control-label" for="exportQuality"><span>${c.webpQuality}</span><output id="exportQualityOutput">90%</output></label>
                                    <input type="range" id="exportQuality" min="50" max="100" step="1" value="90">
                                </div>
                            </div>
                            <div class="export-actions">
                                <button class="button button--primary button--block download-button" type="button" data-download data-export-location="panel">
                                    <span>${c.downloadWithFormat.replace("{format}", "PNG")}</span>${icon("download")}
                                </button>
                                <button class="button button--ghost button--block" type="button" data-copy>
                                    <span>${c.copyClipboard}</span>${icon("copy")}
                                </button>
                                <p class="privacy-note">${c.exportPrivacy}</p>
                            </div>
                        </aside>
                    </div>
                </div>
                <div class="mobile-export-bar" id="mobileExportBar" hidden>
                    <span class="mobile-export-bar__ready">${icon("check")}${c.resultReady}</span>
                    <button class="icon-button" type="button" id="mobileCompare" aria-label="${c.compareOriginal}">${icon("eye")}</button>
                    <button class="button button--ghost medium-copy-button" type="button" data-copy>
                        <span>${c.copyShort}</span>${icon("copy")}
                    </button>
                    <button class="button button--primary download-button" type="button" data-download data-export-location="sticky">
                        <span>${c.downloadWithFormat.replace("{format}", "PNG")}</span>${icon("download")}
                    </button>
                </div>
            `;
        }

        cacheElements() {
            const $ = (selector) => this.mount.querySelector(selector);
            const $$ = (selector) => [...this.mount.querySelectorAll(selector)];

            this.elements = {
                fileInput: $("#imageInput"),
                editorEmpty: $("#editorEmpty"),
                editorWorkspace: $("#editorWorkspace"),
                dropZone: $("#dropZone"),
                fileChip: $("#fileChip"),
                fileName: $("#fileName"),
                fileSize: $("#fileSize"),
                replaceImage: $("#replaceImage"),
                resetEditor: $("#resetEditor"),
                controlPanel: $(".control-panel"),
                modeTabs: $$("[data-mode]"),
                modeControls: $$("[data-mode-controls]"),
                activeModeName: $("#activeModeName"),
                opacityLabel: $("#opacityLabel"),
                opacityInput: $("#effectOpacity"),
                opacityOutput: $("#opacityOutput"),
                opacityHint: $("#opacityHint"),
                opacityPresets: $$("[data-opacity-preset]"),
                globalPresets: $$("[data-global-preset]"),
                gradientTypeButtons: $$("[data-gradient-type]"),
                conicFadeControls: $("#conicFadeControls"),
                conicFadeButtons: $$("[data-conic-fade]"),
                gradientStartLabel: $("#gradientStartLabel"),
                gradientEndLabel: $("#gradientEndLabel"),
                gradientAngleButtons: $$("[data-gradient-angle]"),
                gradientAngle: $("#gradientAngle"),
                gradientAngleOutput: $("#gradientAngleOutput"),
                gradientStart: $("#gradientStart"),
                gradientStartOutput: $("#gradientStartOutput"),
                gradientEnd: $("#gradientEnd"),
                gradientEndOutput: $("#gradientEndOutput"),
                gradientRangeHint: $("#gradientRangeHint"),
                gradientCenterX: $("#gradientCenterX"),
                gradientCenterY: $("#gradientCenterY"),
                gradientInvert: $("#gradientInvert"),
                linearGradientControls: $("#linearGradientControls"),
                gradientAngleGroup: $("#gradientAngleGroup"),
                radialCenterControls: $("#radialCenterControls"),
                featherShapeButtons: $$("[data-feather-shape]"),
                featherSidesGroup: $("#featherSidesGroup"),
                featherSides: $("#featherSides"),
                featherWidth: $("#featherWidth"),
                featherWidthOutput: $("#featherWidthOutput"),
                featherSoftness: $("#featherSoftness"),
                featherSoftnessOutput: $("#featherSoftnessOutput"),
                featherInvert: $("#featherInvert"),
                localToolButtons: $$("[data-local-tool]"),
                localOperationButtons: $$("[data-local-operation]"),
                brushSizeGroup: $("#brushSizeGroup"),
                brushSize: $("#brushSize"),
                brushSizeOutput: $("#brushSizeOutput"),
                localFeather: $("#localFeather"),
                localFeatherOutput: $("#localFeatherOutput"),
                localInvert: $("#localInvert"),
                selectAll: $("#selectAll"),
                clearSelection: $("#clearSelection"),
                canvas: $("#imageCanvas"),
                canvasFrame: $("#canvasFrame"),
                canvasViewport: $("#canvasViewport"),
                canvasDimensions: $("#canvasDimensions"),
                canvasHint: $("#canvasHint"),
                resultReady: $("#resultReady"),
                processAnother: $("#processAnother"),
                backgroundButtons: $$("[data-background]"),
                customBackground: $("#customBackground"),
                toggleGuides: $("#toggleGuides"),
                compareOriginal: $("#compareOriginal"),
                mobileCompare: $("#mobileCompare"),
                exportDimensions: $("#exportDimensions"),
                exportEffect: $("#exportEffect"),
                exportFormat: $("#exportFormat"),
                qualityControl: $("#qualityControl"),
                exportQuality: $("#exportQuality"),
                exportQualityOutput: $("#exportQualityOutput"),
                downloadButtons: $$("[data-download]"),
                copyButtons: $$("[data-copy]"),
                mobileExportBar: $("#mobileExportBar")
            };

            this.context = this.elements.canvas.getContext("2d", { alpha: true });
        }

        bindEvents() {
            const { elements } = this;

            document.querySelectorAll("[data-upload-trigger]").forEach((button) => {
                button.addEventListener("click", () => elements.fileInput.click());
            });

            document.querySelectorAll("[data-mode-link]").forEach((link) => {
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.setMode(link.dataset.modeLink);
                    scrollToElement(document.querySelector("#tool"));
                });
            });

            elements.dropZone.addEventListener("click", () => elements.fileInput.click());
            elements.dropZone.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    elements.fileInput.click();
                }
            });
            elements.fileInput.addEventListener("change", (event) => {
                const [file] = event.target.files;
                if (file) this.loadFile(file, "picker");
            });
            elements.replaceImage.addEventListener("click", () => elements.fileInput.click());
            elements.resetEditor.addEventListener("click", () => this.reset());
            elements.processAnother.addEventListener("click", () => elements.fileInput.click());

            this.bindDropTarget(elements.dropZone);
            this.bindDropTarget(elements.canvasViewport);
            document.addEventListener("paste", (event) => {
                const files = [...(event.clipboardData?.files || [])];
                const image = files.find((file) => file.type.startsWith("image/"));
                if (image) {
                    event.preventDefault();
                    this.loadFile(image, "paste");
                }
            });

            elements.modeTabs.forEach((button) => {
                button.addEventListener("click", () => this.setMode(button.dataset.mode));
            });

            elements.controlPanel.addEventListener("input", (event) => {
                if (event.target.matches('input[type="range"]')) this.trackFirstInteraction("slider");
            });
            elements.controlPanel.addEventListener("change", (event) => {
                if (event.target.matches("select, input[type=checkbox]")) this.trackFirstInteraction("slider");
            });
            elements.controlPanel.addEventListener("click", (event) => {
                const button = event.target.closest("button");
                if (!button || button.matches("[data-mode]")) return;
                if (button.matches("[data-opacity-preset], [data-global-preset], [data-gradient-type], [data-conic-fade], [data-gradient-angle], [data-feather-shape], [data-local-tool], [data-local-operation], #selectAll, #clearSelection")) {
                    this.trackFirstInteraction("preset");
                }
            });

            elements.opacityInput.addEventListener("input", () => {
                this.state.opacity[this.state.mode] = Number(elements.opacityInput.value);
                this.updateOpacityUI();
                this.scheduleRender();
            });

            elements.opacityPresets.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.opacity[this.state.mode] = Number(button.dataset.opacityPreset);
                    this.updateOpacityUI();
                    this.scheduleRender();
                    trackEvent("preset_select", {
                        language: LANGUAGE,
                        mode: this.state.mode,
                        source: "opacity"
                    });
                });
            });

            elements.globalPresets.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.opacity.global = Number(button.dataset.globalPreset);
                    this.updateOpacityUI();
                    this.scheduleRender();
                    trackEvent("preset_select", {
                        language: LANGUAGE,
                        mode: "global",
                        source: "scene"
                    });
                });
            });

            elements.gradientTypeButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.gradient.type = button.dataset.gradientType;
                    this.updateGradientUI();
                    this.scheduleRender();
                    trackEvent("preset_select", {
                        ...this.analyticsContext(),
                        source: "gradient-type"
                    });
                });
            });

            elements.conicFadeButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.gradient.conicFade = button.dataset.conicFade;
                    this.updateGradientUI();
                    this.scheduleRender();
                    trackEvent("preset_select", { ...this.analyticsContext(), source: "gradient-type" });
                });
            });

            elements.gradientAngleButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.gradient.type = "linear";
                    this.state.gradient.angle = Number(button.dataset.gradientAngle);
                    this.updateGradientUI();
                    this.scheduleRender();
                    trackEvent("preset_select", {
                        language: LANGUAGE,
                        mode: "gradient",
                        source: "direction"
                    });
                });
            });

            elements.gradientAngle.addEventListener("input", () => {
                this.state.gradient.angle = Number(elements.gradientAngle.value);
                this.updateGradientUI();
                this.scheduleRender();
            });

            elements.gradientStart.addEventListener("input", () => {
                this.state.gradient.start = Math.min(Number(elements.gradientStart.value), this.state.gradient.end - 2);
                this.updateGradientUI();
                this.scheduleRender();
            });

            elements.gradientEnd.addEventListener("input", () => {
                this.state.gradient.end = Math.max(Number(elements.gradientEnd.value), this.state.gradient.start + 2);
                this.updateGradientUI();
                this.scheduleRender();
            });

            elements.gradientCenterX.addEventListener("input", () => {
                this.state.gradient.centerX = Number(elements.gradientCenterX.value);
                this.updateGradientUI();
                this.scheduleRender();
            });

            elements.gradientCenterY.addEventListener("input", () => {
                this.state.gradient.centerY = Number(elements.gradientCenterY.value);
                this.updateGradientUI();
                this.scheduleRender();
            });

            elements.gradientInvert.addEventListener("change", () => {
                this.state.gradient.invert = elements.gradientInvert.checked;
                this.scheduleRender();
            });

            elements.featherShapeButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.feather.shape = button.dataset.featherShape;
                    this.updateFeatherUI();
                    this.scheduleRender();
                });
            });

            elements.featherSides.addEventListener("change", () => {
                this.state.feather.sides = elements.featherSides.value;
                this.scheduleRender();
            });

            elements.featherWidth.addEventListener("input", () => {
                this.state.feather.width = Number(elements.featherWidth.value);
                this.updateFeatherUI();
                this.scheduleRender();
            });

            elements.featherSoftness.addEventListener("input", () => {
                this.state.feather.softness = Number(elements.featherSoftness.value);
                this.updateFeatherUI();
                this.scheduleRender();
            });

            elements.featherInvert.addEventListener("change", () => {
                this.state.feather.invert = elements.featherInvert.checked;
                this.scheduleRender();
            });

            elements.localToolButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.local.tool = button.dataset.localTool;
                    this.updateLocalUI();
                });
            });

            elements.localOperationButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.local.operation = button.dataset.localOperation;
                    this.updateLocalUI();
                });
            });

            elements.brushSize.addEventListener("input", () => {
                this.state.local.brushSize = Number(elements.brushSize.value);
                this.updateLocalUI();
                this.scheduleRender();
            });

            elements.localFeather.addEventListener("input", () => {
                this.state.local.feather = Number(elements.localFeather.value);
                this.updateLocalUI();
                this.scheduleRender();
            });

            elements.localInvert.addEventListener("change", () => {
                this.state.local.invert = elements.localInvert.checked;
                this.scheduleRender();
            });

            elements.selectAll.addEventListener("click", () => {
                this.selectionContext.save();
                this.selectionContext.globalCompositeOperation = "source-over";
                this.selectionContext.fillStyle = "#fff";
                this.selectionContext.fillRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);
                this.selectionContext.restore();
                this.state.local.hasSelection = true;
                this.scheduleRender();
            });

            elements.clearSelection.addEventListener("click", () => this.clearSelection());

            elements.backgroundButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    this.state.previewBackground = button.dataset.background;
                    this.updateBackgroundUI();
                });
            });

            elements.customBackground.addEventListener("input", () => {
                this.state.customBackground = elements.customBackground.value;
                this.state.previewBackground = "custom";
                this.updateBackgroundUI();
            });

            elements.toggleGuides.addEventListener("click", () => {
                this.state.showGuides = !this.state.showGuides;
                elements.toggleGuides.classList.toggle("is-active", this.state.showGuides);
                elements.toggleGuides.setAttribute("aria-pressed", String(this.state.showGuides));
                this.scheduleRender();
            });

            this.bindCompareButton(elements.compareOriginal);
            this.bindCompareButton(elements.mobileCompare);

            elements.exportFormat.addEventListener("change", () => {
                this.state.export.type = elements.exportFormat.value;
                this.updateExportUI();
            });

            elements.exportQuality.addEventListener("input", () => {
                this.state.export.quality = Number(elements.exportQuality.value) / 100;
                this.updateExportUI();
            });

            elements.downloadButtons.forEach((button) => {
                button.addEventListener("click", () => this.download());
            });

            elements.copyButtons.forEach((button) => {
                button.addEventListener("click", () => this.copyToClipboard());
            });

            elements.canvas.addEventListener("pointerdown", (event) => this.onCanvasPointerDown(event));
            elements.canvas.addEventListener("pointermove", (event) => this.onCanvasPointerMove(event));
            elements.canvas.addEventListener("pointerup", (event) => this.onCanvasPointerUp(event));
            elements.canvas.addEventListener("pointercancel", (event) => this.onCanvasPointerUp(event));
        }

        bindDropTarget(target) {
            ["dragenter", "dragover"].forEach((type) => {
                target.addEventListener(type, (event) => {
                    event.preventDefault();
                    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
                    this.elements.dropZone.classList.add("is-dragging");
                });
            });
            ["dragleave", "drop"].forEach((type) => {
                target.addEventListener(type, (event) => {
                    event.preventDefault();
                    this.elements.dropZone.classList.remove("is-dragging");
                });
            });
            target.addEventListener("drop", (event) => {
                const files = [...(event.dataTransfer?.files || [])];
                const image = files.find((file) => file.type.startsWith("image/"));
                if (image) this.loadFile(image, "drop");
                else {
                    this.showToast(COPY.dropInvalid, true);
                    this.trackUploadFailure("drop", "unsupported");
                }
            });
        }

        bindCompareButton(button) {
            const show = (event) => {
                if (!this.state.image) return;
                event.preventDefault();
                this.state.showOriginal = true;
                button.classList.add("is-active");
                this.scheduleRender();
            };
            const hide = () => {
                if (!this.state.showOriginal) return;
                this.state.showOriginal = false;
                button.classList.remove("is-active");
                this.scheduleRender();
            };

            button.addEventListener("pointerdown", show);
            button.addEventListener("pointerup", hide);
            button.addEventListener("pointercancel", hide);
            button.addEventListener("pointerleave", hide);
            button.addEventListener("keydown", (event) => {
                if (event.code === "Space" || event.code === "Enter") show(event);
            });
            button.addEventListener("keyup", hide);
            button.addEventListener("blur", hide);
        }

        analyticsContext(format = this.state.export.type === "image/webp" ? "webp" : "png") {
            return {
                language: LANGUAGE,
                mode: this.state.mode,
                ...(this.state.mode === "gradient" ? { gradient_type: this.state.gradient.type } : {}),
                format,
                viewport_bucket: viewportBucket(window.innerWidth)
            };
        }

        trackUploadFailure(source, status) {
            trackEvent("image_upload_failed", {
                language: LANGUAGE,
                source,
                status,
                viewport_bucket: viewportBucket(window.innerWidth)
            });
        }

        trackFirstInteraction(source) {
            if (!this.state.image || !this.taskMeasurement.claim("interaction")) return;
            trackEvent("editor_first_interaction", {
                ...this.analyticsContext(),
                source
            });
        }

        trackResultSuccess(source, format) {
            if (!this.taskMeasurement.claim("result")) return;
            trackEvent("result_success", {
                ...this.analyticsContext(format),
                source,
                duration_bucket: this.taskMeasurement.durationBucket()
            });
        }

        clearExportCtaTracking() {
            this.exportCtaObserver?.disconnect();
            this.exportCtaObserver = null;
            this.exportViewTimers.forEach((timer) => clearTimeout(timer));
            this.exportViewTimers.clear();
            clearTimeout(this.exportViewFallbackTimer);
            this.exportViewFallbackTimer = 0;
        }

        isCtaVisible(target) {
            if (!target || !this.state.image) return false;
            const style = getComputedStyle(target);
            if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
            const rect = target.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return false;
            const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
            const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
            return (visibleWidth * visibleHeight) / (rect.width * rect.height) >= 0.5;
        }

        recordExportCtaView(target) {
            if (!this.isCtaVisible(target) || !this.taskMeasurement.claim("cta-view")) return;
            trackEvent("export_cta_view", {
                ...this.analyticsContext(),
                source: target.dataset.exportLocation || "panel"
            });
            this.clearExportCtaTracking();
        }

        armExportCtaTracking() {
            this.clearExportCtaTracking();
            const candidates = this.elements.downloadButtons;
            if (!this.state.image || !candidates.length) return;

            if ("IntersectionObserver" in window) {
                this.exportCtaObserver = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        const existing = this.exportViewTimers.get(entry.target);
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                            if (existing) return;
                            const timer = setTimeout(() => {
                                this.exportViewTimers.delete(entry.target);
                                this.recordExportCtaView(entry.target);
                            }, 1_000);
                            this.exportViewTimers.set(entry.target, timer);
                        } else if (existing) {
                            clearTimeout(existing);
                            this.exportViewTimers.delete(entry.target);
                        }
                    });
                }, { threshold: [0, 0.5, 1] });
                candidates.forEach((button) => this.exportCtaObserver.observe(button));
                return;
            }

            this.exportViewFallbackTimer = setTimeout(() => {
                const visible = candidates.find((button) => this.isCtaVisible(button));
                if (visible) this.recordExportCtaView(visible);
            }, 1_000);
        }

        async loadFile(file, source = "picker") {
            if (!isSupportedImageFile(file)) {
                this.showToast(COPY.invalidImage, true);
                this.trackUploadFailure(source, "unsupported");
                return;
            }

            let decodedImage = null;
            try {
                decodedImage = await decodeImageFile(file);
                const { width, height } = sourceDimensions(decodedImage);

                this.state.image?.close?.();
                this.state.image = decodedImage;
                decodedImage = null;
                this.state.file = file;
                this.state.fileName = file.name || "pasted-image";

                this.elements.canvas.width = width;
                this.elements.canvas.height = height;
                this.selectionCanvas.width = width;
                this.selectionCanvas.height = height;
                this.selectionContext = this.selectionCanvas.getContext("2d", { willReadFrequently: false });
                this.state.local.hasSelection = false;
                this.state.pointer.active = false;

                this.elements.editorEmpty.hidden = true;
                this.elements.editorWorkspace.hidden = false;
                this.elements.fileChip.hidden = false;
                this.elements.replaceImage.hidden = false;
                this.elements.resetEditor.hidden = false;
                this.elements.mobileExportBar.hidden = false;
                this.elements.fileName.textContent = this.state.fileName;
                this.elements.fileSize.textContent = formatBytes(file.size);
                this.elements.canvasDimensions.textContent = `${width} × ${height} px`;
                this.elements.exportDimensions.textContent = `${width} × ${height}`;
                document.body.classList.add("is-editor-active");
                this.taskMeasurement.start();
                this.elements.processAnother.hidden = true;
                clearTimeout(this.actionLabelTimer);

                this.syncAllControls();
                this.scheduleRender();
                scrollToElement(this.mount);
                this.showToast(COPY.imageLoaded);
                trackEvent("image_upload_success", {
                    language: LANGUAGE,
                    source,
                    viewport_bucket: viewportBucket(window.innerWidth)
                });
                requestAnimationFrame(() => this.armExportCtaTracking());
            } catch (error) {
                console.error("ImageFader: image decode failed", error);
                const tooLarge = error?.code === "image-too-large";
                this.showToast(tooLarge ? COPY.imageTooLarge : COPY.imageUnreadable, true);
                this.trackUploadFailure(source, tooLarge ? "too_large" : "unreadable");
            } finally {
                decodedImage?.close?.();
                this.elements.fileInput.value = "";
            }
        }

        reset() {
            this.state.image?.close?.();
            this.state.image = null;
            this.state.file = null;
            this.state.fileName = "";
            this.state.showOriginal = false;
            this.state.local.hasSelection = false;
            this.state.pointer.active = false;
            this.taskMeasurement.stop();
            this.clearExportCtaTracking();
            clearTimeout(this.actionLabelTimer);
            this.selectionCanvas.width = 1;
            this.selectionCanvas.height = 1;
            this.selectionContext = this.selectionCanvas.getContext("2d");
            this.context.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
            this.elements.canvas.width = 1;
            this.elements.canvas.height = 1;
            this.elements.editorWorkspace.hidden = true;
            this.elements.editorEmpty.hidden = false;
            this.elements.fileChip.hidden = true;
            this.elements.replaceImage.hidden = true;
            this.elements.resetEditor.hidden = true;
            this.elements.mobileExportBar.hidden = true;
            this.elements.processAnother.hidden = true;
            document.body.classList.remove("is-editor-active");
            this.showToast(COPY.imageCleared);
        }

        setMode(mode, source = "control") {
            if (!VALID_MODES.includes(mode)) return;
            const changed = this.state.mode !== mode;
            this.state.mode = mode;
            this.updateModeUI();
            this.scheduleRender();
            if (changed) {
                this.trackFirstInteraction("mode");
                trackEvent("mode_select", {
                    language: LANGUAGE,
                    mode,
                    source
                });
            }
        }

        updateModeUI() {
            const mode = this.state.mode;
            const config = MODE_CONFIG[mode];

            this.elements.modeTabs.forEach((button) => {
                const active = button.dataset.mode === mode;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-selected", String(active));
                button.tabIndex = active ? 0 : -1;
            });

            this.elements.modeControls.forEach((panel) => {
                panel.hidden = panel.dataset.modeControls !== mode;
            });

            this.elements.activeModeName.textContent = config.label;
            this.elements.opacityLabel.textContent = config.opacityLabel;
            this.elements.opacityHint.textContent = config.hint;
            this.elements.exportEffect.textContent = config.label;
            this.elements.canvas.classList.toggle("is-selecting", mode === "local");
            this.updateOpacityUI();
            this.updateGradientUI();
            this.updateFeatherUI();
            this.updateLocalUI();
        }

        updateOpacityUI() {
            const value = this.state.opacity[this.state.mode];
            this.elements.opacityInput.value = String(value);
            this.elements.opacityOutput.value = `${value}%`;
            this.elements.opacityOutput.textContent = `${value}%`;
            this.setRangeProgress(this.elements.opacityInput);
            this.elements.opacityPresets.forEach((button) => {
                button.classList.toggle("is-active", Number(button.dataset.opacityPreset) === value);
            });
            this.elements.globalPresets.forEach((button) => {
                button.classList.toggle("is-active", this.state.mode === "global" && Number(button.dataset.globalPreset) === value);
            });
        }

        updateGradientUI() {
            const gradient = this.state.gradient;
            const conic = gradient.type === "conic";
            const radialSector = conic && gradient.conicFade === "radial";
            this.elements.conicFadeControls.hidden = !conic;
            this.elements.conicFadeButtons.forEach((button) => {
                const active = button.dataset.conicFade === gradient.conicFade;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            this.elements.gradientStartLabel.textContent = radialSector ? COPY.sectorStart : COPY.fadeStart;
            this.elements.gradientEndLabel.textContent = radialSector ? COPY.sectorEnd : COPY.fadeEnd;
            this.elements.gradientTypeButtons.forEach((button) => {
                const active = button.dataset.gradientType === gradient.type;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            this.elements.gradientAngleButtons.forEach((button) => {
                button.classList.toggle("is-active", gradient.type === "linear" && Number(button.dataset.gradientAngle) === gradient.angle);
            });
            this.elements.gradientAngle.value = String(Math.round(gradient.angle));
            this.elements.gradientAngleOutput.textContent = `${Math.round(gradient.angle)}°`;
            this.elements.gradientStart.value = String(Math.round(gradient.start));
            this.elements.gradientEnd.value = String(Math.round(gradient.end));
            for (const key of ["Start", "End"]) {
                const value = gradient[key.toLowerCase()];
                const label = `${Math.round(value * 3.6)}°`;
                this.elements[`gradient${key}Output`].hidden = !conic;
                this.elements[`gradient${key}Output`].textContent = label;
                this.elements[`gradient${key}`].setAttribute("aria-valuetext", conic ? label : `${Math.round(value)}%`);
            }
            this.elements.gradientRangeHint.textContent = radialSector ? COPY.conicRadialHint : conic ? COPY.conicHint : COPY.dragHandles;
            if (this.state.mode === "gradient") {
                this.elements.canvasHint.textContent = conic ? COPY.conicCanvasHint : COPY.gradientCanvasHint;
            }
            this.elements.gradientCenterX.value = String(Math.round(gradient.centerX));
            this.elements.gradientCenterY.value = String(Math.round(gradient.centerY));
            this.elements.gradientInvert.checked = gradient.invert;
            this.elements.linearGradientControls.hidden = gradient.type !== "linear";
            this.elements.gradientAngleGroup.hidden = gradient.type === "radial";
            this.elements.radialCenterControls.hidden = gradient.type === "linear";
            [
                this.elements.gradientAngle,
                this.elements.gradientStart,
                this.elements.gradientEnd,
                this.elements.gradientCenterX,
                this.elements.gradientCenterY
            ].forEach((input) => this.setRangeProgress(input));
        }

        updateFeatherUI() {
            const feather = this.state.feather;
            this.elements.featherShapeButtons.forEach((button) => {
                const active = button.dataset.featherShape === feather.shape;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            this.elements.featherSidesGroup.hidden = feather.shape !== "rectangle";
            this.elements.featherSides.value = feather.sides;
            this.elements.featherWidth.value = String(feather.width);
            this.elements.featherSoftness.value = String(feather.softness);
            this.elements.featherWidthOutput.textContent = `${feather.width}%`;
            this.elements.featherSoftnessOutput.textContent = `${feather.softness}%`;
            this.elements.featherInvert.checked = feather.invert;
            this.setRangeProgress(this.elements.featherWidth);
            this.setRangeProgress(this.elements.featherSoftness);
        }

        updateLocalUI() {
            const local = this.state.local;
            this.elements.localToolButtons.forEach((button) => {
                const active = button.dataset.localTool === local.tool;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            this.elements.localOperationButtons.forEach((button) => {
                const active = button.dataset.localOperation === local.operation;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            this.elements.brushSizeGroup.hidden = local.tool !== "brush";
            this.elements.brushSize.value = String(local.brushSize);
            this.elements.localFeather.value = String(local.feather);
            this.elements.brushSizeOutput.textContent = `${local.brushSize}%`;
            this.elements.localFeatherOutput.textContent = `${local.feather}%`;
            this.elements.localInvert.checked = local.invert;
            this.setRangeProgress(this.elements.brushSize);
            this.setRangeProgress(this.elements.localFeather);
            this.elements.canvasHint.textContent = this.state.mode === "local"
                ? COPY.localCanvasHint
                : this.state.mode === "gradient"
                    ? (this.state.gradient.type === "conic" ? COPY.conicCanvasHint : COPY.gradientCanvasHint)
                    : COPY.canvasDefaultHint;
        }

        updateBackgroundUI() {
            this.elements.canvasFrame.dataset.background = this.state.previewBackground;
            this.elements.canvasFrame.style.setProperty("--custom-preview", this.state.customBackground);
            this.elements.customBackground.value = this.state.customBackground;
            this.elements.backgroundButtons.forEach((button) => {
                button.classList.toggle("is-active", button.dataset.background === this.state.previewBackground);
            });
        }

        updateExportUI() {
            this.elements.exportFormat.value = this.state.export.type;
            this.elements.qualityControl.hidden = this.state.export.type !== "image/webp";
            this.elements.exportQuality.value = String(Math.round(this.state.export.quality * 100));
            this.elements.exportQualityOutput.textContent = `${Math.round(this.state.export.quality * 100)}%`;
            this.setRangeProgress(this.elements.exportQuality);
            clearTimeout(this.actionLabelTimer);
            this.updateActionLabels();
        }

        updateActionLabels() {
            const format = this.state.export.type === "image/webp" ? "WebP" : "PNG";
            const downloadLabel = COPY.downloadWithFormat.replace("{format}", format);
            this.elements.downloadButtons.forEach((button) => {
                const label = button.querySelector("span");
                if (label) label.textContent = downloadLabel;
            });
            this.elements.copyButtons.forEach((button) => {
                const label = button.querySelector("span");
                if (!label) return;
                label.textContent = button.closest(".mobile-export-bar") ? COPY.copyShort : COPY.copyClipboard;
            });
        }

        showActionSuccess(action) {
            clearTimeout(this.actionLabelTimer);
            const buttons = action === "copy" ? this.elements.copyButtons : this.elements.downloadButtons;
            const message = action === "copy" ? COPY.copyComplete : COPY.downloadComplete;
            buttons.forEach((button) => {
                const label = button.querySelector("span");
                if (label) label.textContent = message;
            });
            this.elements.processAnother.hidden = false;
            this.actionLabelTimer = setTimeout(() => this.updateActionLabels(), 1_800);
        }

        syncAllControls() {
            this.updateModeUI();
            this.updateBackgroundUI();
            this.updateExportUI();
            this.elements.toggleGuides.classList.toggle("is-active", this.state.showGuides);
            this.elements.toggleGuides.setAttribute("aria-pressed", String(this.state.showGuides));
            this.elements.exportDimensions.textContent = this.state.image
                ? `${this.elements.canvas.width} × ${this.elements.canvas.height}`
                : "-";
        }

        setRangeProgress(input) {
            if (!input) return;
            const min = Number(input.min || 0);
            const max = Number(input.max || 100);
            const value = Number(input.value);
            const progress = ((value - min) / Math.max(1, max - min)) * 100;
            input.style.setProperty("--range-progress", `${clamp(progress, 0, 100)}%`);
        }

        scheduleRender() {
            if (!this.state.image || this.renderFrame) return;
            this.renderFrame = requestAnimationFrame(() => {
                this.renderFrame = 0;
                this.renderPreview();
            });
        }

        renderPreview() {
            if (!this.state.image) return;
            const { context, elements } = this;
            context.save();
            context.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

            if (this.state.showOriginal) {
                context.globalCompositeOperation = "source-over";
                context.globalAlpha = 1;
                context.drawImage(this.state.image, 0, 0, elements.canvas.width, elements.canvas.height);
            } else {
                this.renderEffect(context, true);
            }

            context.restore();
        }

        renderEffect(targetContext, includeGuides = false) {
            const width = targetContext.canvas.width;
            const height = targetContext.canvas.height;
            targetContext.save();
            targetContext.setTransform(1, 0, 0, 1, 0, 0);
            targetContext.clearRect(0, 0, width, height);
            targetContext.globalAlpha = 1;
            targetContext.globalCompositeOperation = "source-over";
            targetContext.imageSmoothingEnabled = true;
            targetContext.imageSmoothingQuality = "high";

            if (this.state.mode === "local") this.renderLocal(targetContext);
            else renderRecipeToContext(targetContext, this.state.image, this.getRecipe());

            if (includeGuides && this.state.showGuides) {
                if (this.state.mode === "gradient") this.drawGradientGuides(targetContext);
                if (this.state.mode === "local") this.drawLocalGuides(targetContext);
            }

            targetContext.restore();
        }

        getGradientLine(width, height) {
            const radians = (this.state.gradient.angle * Math.PI) / 180;
            const vectorX = Math.cos(radians);
            const vectorY = Math.sin(radians);
            const length = Math.abs(width * vectorX) + Math.abs(height * vectorY);
            const centerX = width / 2;
            const centerY = height / 2;
            return {
                x1: centerX - (vectorX * length) / 2,
                y1: centerY - (vectorY * length) / 2,
                x2: centerX + (vectorX * length) / 2,
                y2: centerY + (vectorY * length) / 2,
                length,
                vectorX,
                vectorY
            };
        }


        renderLocal(targetContext) {
            const width = targetContext.canvas.width;
            const height = targetContext.canvas.height;
            targetContext.drawImage(this.state.image, 0, 0, width, height);
            if (!this.state.local.hasSelection) return;

            const mask = this.getLocalEffectMask();
            const opacity = this.state.opacity.local / 100;
            targetContext.save();
            targetContext.globalCompositeOperation = "destination-out";
            targetContext.globalAlpha = 1 - opacity;
            targetContext.drawImage(mask, 0, 0);
            targetContext.restore();
        }

        getLocalEffectMask() {
            const width = this.selectionCanvas.width;
            const height = this.selectionCanvas.height;
            const feather = this.state.local.feather;
            let mask = createCanvas(width, height);
            let maskContext = mask.getContext("2d");

            if (feather > 0 && "filter" in maskContext) {
                const blur = Math.max(1, Math.min(width, height) * (feather / 100));
                maskContext.save();
                maskContext.filter = `blur(${blur}px)`;
                maskContext.drawImage(this.selectionCanvas, 0, 0);
                maskContext.restore();
            } else {
                maskContext.drawImage(this.selectionCanvas, 0, 0);
            }

            if (this.state.local.invert) mask = this.invertAlphaCanvas(mask);
            return mask;
        }

        invertAlphaCanvas(source) {
            const inverted = createCanvas(source.width, source.height);
            const context = inverted.getContext("2d");
            context.fillStyle = "#fff";
            context.fillRect(0, 0, inverted.width, inverted.height);
            context.globalCompositeOperation = "destination-out";
            context.drawImage(source, 0, 0);
            context.globalCompositeOperation = "source-over";
            return inverted;
        }

        drawGradientGuides(targetContext) {
            const width = targetContext.canvas.width;
            const height = targetContext.canvas.height;
            const scale = Math.max(width, height) / 900;
            targetContext.save();
            targetContext.globalCompositeOperation = "source-over";
            targetContext.globalAlpha = 1;
            targetContext.lineWidth = Math.max(2, 2.3 * scale);
            targetContext.strokeStyle = "rgba(255,255,255,0.92)";
            targetContext.fillStyle = "#6756e8";
            targetContext.shadowColor = "rgba(0,0,0,0.32)";
            targetContext.shadowBlur = 8 * scale;

            if (this.state.gradient.type === "conic") {
                const guide = this.getConicGuideHandles(width, height);
                targetContext.beginPath();
                targetContext.moveTo(guide.start.x, guide.start.y);
                targetContext.lineTo(guide.center.x, guide.center.y);
                targetContext.lineTo(guide.end.x, guide.end.y);
                targetContext.stroke();
                targetContext.beginPath();
                targetContext.arc(guide.center.x, guide.center.y, guide.radius, guide.startAngle, guide.endAngle);
                targetContext.stroke();
                if (this.state.gradient.conicFade !== "radial") {
                    targetContext.beginPath();
                    targetContext.setLineDash([5 * scale, 5 * scale]);
                    targetContext.moveTo(guide.center.x, guide.center.y);
                    targetContext.lineTo(guide.seam.x, guide.seam.y);
                    targetContext.stroke();
                    targetContext.setLineDash([]);
                }
                this.drawHandle(targetContext, guide.start.x, guide.start.y, scale, "start");
                this.drawHandle(targetContext, guide.end.x, guide.end.y, scale, "end");
                this.drawHandle(targetContext, guide.center.x, guide.center.y, scale, "center");
            } else if (this.state.gradient.type === "radial") {
                const center = {
                    x: width * (this.state.gradient.centerX / 100),
                    y: height * (this.state.gradient.centerY / 100)
                };
                const radius = Math.min(width, height) * (this.state.gradient.end / 150);
                targetContext.beginPath();
                targetContext.arc(center.x, center.y, Math.max(8, radius), 0, Math.PI * 2);
                targetContext.setLineDash([8 * scale, 7 * scale]);
                targetContext.stroke();
                targetContext.setLineDash([]);
                this.drawHandle(targetContext, center.x, center.y, scale, "center");
                this.drawHandle(targetContext, center.x + radius, center.y, scale, "end");
            } else {
                const handles = this.getLinearGuideHandles(width, height);
                targetContext.beginPath();
                targetContext.moveTo(handles.start.x, handles.start.y);
                targetContext.lineTo(handles.end.x, handles.end.y);
                targetContext.stroke();
                this.drawHandle(targetContext, handles.start.x, handles.start.y, scale, "start");
                this.drawHandle(targetContext, handles.end.x, handles.end.y, scale, "end");
            }

            targetContext.restore();
        }

        drawHandle(context, x, y, scale, label) {
            const radius = Math.max(7, 8 * scale);
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.shadowBlur = 0;
            context.fillStyle = "white";
            context.font = `${Math.max(9, 10 * scale)}px ${getComputedStyle(document.body).fontFamily}`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            const text = label === "center" ? "＋" : label === "start" ? "A" : "B";
            context.fillText(text, x, y + 0.5 * scale);
            context.fillStyle = "#6756e8";
        }

        getConicGuideHandles(width, height) {
            const config = this.state.gradient;
            const center = { x: width * config.centerX / 100, y: height * config.centerY / 100 };
            const radius = Math.min(width, height) * 0.3;
            const angle = config.angle * Math.PI / 180;
            const startAngle = angle + config.start / 100 * Math.PI * 2;
            const endAngle = angle + config.end / 100 * Math.PI * 2;
            const point = (radians, distance = radius) => ({
                x: center.x + distance * Math.cos(radians),
                y: center.y + distance * Math.sin(radians)
            });
            // Keep A and B individually reachable for a full circle or a narrow arc.
            const closeHandles = 2 * radius * Math.abs(Math.sin((endAngle - startAngle) / 2)) < Math.min(width, height) * 0.12;
            return { center, radius, startAngle, endAngle, start: point(startAngle), end: point(endAngle, closeHandles ? radius * 0.6 : radius), seam: point(angle) };
        }

        getLinearGuideHandles(width, height) {
            const line = this.getGradientLine(width, height);
            const start = this.state.gradient.start / 100;
            const end = this.state.gradient.end / 100;
            return {
                start: {
                    x: line.x1 + (line.x2 - line.x1) * start,
                    y: line.y1 + (line.y2 - line.y1) * start
                },
                end: {
                    x: line.x1 + (line.x2 - line.x1) * end,
                    y: line.y1 + (line.y2 - line.y1) * end
                },
                line
            };
        }

        drawLocalGuides(targetContext) {
            if (this.state.local.hasSelection) {
                const mask = this.getLocalEffectMask();
                const overlay = createCanvas(mask.width, mask.height);
                const overlayContext = overlay.getContext("2d");
                overlayContext.fillStyle = "rgba(103,86,232,0.32)";
                overlayContext.fillRect(0, 0, overlay.width, overlay.height);
                overlayContext.globalCompositeOperation = "destination-in";
                overlayContext.drawImage(mask, 0, 0);
                targetContext.save();
                targetContext.globalCompositeOperation = "source-over";
                targetContext.drawImage(overlay, 0, 0);
                targetContext.restore();
            }

            const pointer = this.state.pointer;
            if (pointer.active && pointer.start && pointer.current && this.state.local.tool !== "brush") {
                const x = Math.min(pointer.start.x, pointer.current.x);
                const y = Math.min(pointer.start.y, pointer.current.y);
                const width = Math.abs(pointer.current.x - pointer.start.x);
                const height = Math.abs(pointer.current.y - pointer.start.y);
                const scale = Math.max(targetContext.canvas.width, targetContext.canvas.height) / 900;
                targetContext.save();
                targetContext.globalCompositeOperation = "source-over";
                targetContext.strokeStyle = "rgba(255,255,255,0.96)";
                targetContext.lineWidth = Math.max(2, 2 * scale);
                targetContext.setLineDash([8 * scale, 6 * scale]);
                targetContext.beginPath();
                if (this.state.local.tool === "ellipse") {
                    targetContext.ellipse(x + width / 2, y + height / 2, Math.max(1, width / 2), Math.max(1, height / 2), 0, 0, Math.PI * 2);
                } else {
                    targetContext.rect(x, y, width, height);
                }
                targetContext.stroke();
                targetContext.restore();
            }
        }

        onCanvasPointerDown(event) {
            if (!this.state.image || !["local", "gradient"].includes(this.state.mode)) return;
            event.preventDefault();
            this.elements.canvas.setPointerCapture(event.pointerId);
            const point = this.getCanvasPoint(event);
            this.state.pointer = {
                active: true,
                id: event.pointerId,
                start: point,
                current: point,
                previous: point,
                gradientHandle: null
            };

            if (this.state.mode === "gradient") {
                this.state.pointer.gradientHandle = this.pickGradientHandle(point);
            } else if (this.state.local.tool === "brush") {
                this.trackFirstInteraction("canvas");
                this.drawBrushStroke(point, point);
                this.scheduleRender();
            }
        }

        onCanvasPointerMove(event) {
            const pointer = this.state.pointer;
            if (!pointer.active || pointer.id !== event.pointerId) return;
            event.preventDefault();
            const point = this.getCanvasPoint(event);
            pointer.previous = pointer.current;
            pointer.current = point;
            this.trackFirstInteraction("canvas");

            if (this.state.mode === "gradient") {
                this.dragGradientHandle(point);
            } else if (this.state.local.tool === "brush") {
                this.drawBrushStroke(pointer.previous, point);
            }
            this.scheduleRender();
        }

        onCanvasPointerUp(event) {
            const pointer = this.state.pointer;
            if (!pointer.active || pointer.id !== event.pointerId) return;
            event.preventDefault();
            pointer.current = this.getCanvasPoint(event);

            if (this.state.mode === "local" && this.state.local.tool !== "brush") {
                this.commitShapeSelection(pointer.start, pointer.current);
            }

            pointer.active = false;
            pointer.id = null;
            pointer.gradientHandle = null;
            try {
                this.elements.canvas.releasePointerCapture(event.pointerId);
            } catch {
                // Pointer may already be released by the browser.
            }
            this.scheduleRender();
        }

        getCanvasPoint(event) {
            const rect = this.elements.canvas.getBoundingClientRect();
            return {
                x: clamp((event.clientX - rect.left) * (this.elements.canvas.width / rect.width), 0, this.elements.canvas.width),
                y: clamp((event.clientY - rect.top) * (this.elements.canvas.height / rect.height), 0, this.elements.canvas.height)
            };
        }

        pickGradientHandle(point) {
            const width = this.elements.canvas.width;
            const height = this.elements.canvas.height;
            const threshold = Math.max(width, height) * 0.035;

            if (this.state.gradient.type === "conic") {
                const guides = this.getConicGuideHandles(width, height);
                const touchThreshold = Math.max(threshold, 24 * width / this.elements.canvas.getBoundingClientRect().width);
                const nearest = ["center", "start", "end"]
                    .map((key) => ({ key, distance: Math.hypot(point.x - guides[key].x, point.y - guides[key].y) }))
                    .sort((a, b) => a.distance - b.distance)[0];
                return nearest.distance <= touchThreshold ? nearest.key : "center";
            }

            if (this.state.gradient.type === "radial") {
                const center = {
                    x: width * (this.state.gradient.centerX / 100),
                    y: height * (this.state.gradient.centerY / 100)
                };
                const radius = Math.min(width, height) * (this.state.gradient.end / 150);
                const end = { x: center.x + radius, y: center.y };
                if (Math.hypot(point.x - center.x, point.y - center.y) <= threshold) return "center";
                if (Math.hypot(point.x - end.x, point.y - end.y) <= threshold) return "end";
                return "center";
            }

            const handles = this.getLinearGuideHandles(width, height);
            const startDistance = Math.hypot(point.x - handles.start.x, point.y - handles.start.y);
            const endDistance = Math.hypot(point.x - handles.end.x, point.y - handles.end.y);
            return startDistance <= endDistance ? "start" : "end";
        }

        dragGradientHandle(point) {
            const handle = this.state.pointer.gradientHandle;
            if (!handle) return;
            const width = this.elements.canvas.width;
            const height = this.elements.canvas.height;

            if (this.state.gradient.type === "conic") {
                const config = this.state.gradient;
                if (handle === "center") {
                    config.centerX = clamp(point.x / width * 100, 0, 100);
                    config.centerY = clamp(point.y / height * 100, 0, 100);
                } else {
                    const cx = width * config.centerX / 100;
                    const cy = height * config.centerY / 100;
                    if (Math.hypot(point.x - cx, point.y - cy) < 1) return;
                    let percent = 100 * conicPosition(point.x, point.y, cx, cy, config.angle);
                    // Unwrap near the current handle so crossing 0° does not jump 360°.
                    percent += Math.round((config[handle] - percent) / 100) * 100;
                    config[handle] = handle === "start"
                        ? clamp(percent, 0, config.end - 2)
                        : clamp(percent, config.start + 2, 100);
                }
                this.updateGradientUI();
                return;
            }

            if (this.state.gradient.type === "radial") {
                if (handle === "center") {
                    this.state.gradient.centerX = clamp((point.x / width) * 100, 0, 100);
                    this.state.gradient.centerY = clamp((point.y / height) * 100, 0, 100);
                } else {
                    const centerX = width * (this.state.gradient.centerX / 100);
                    const centerY = height * (this.state.gradient.centerY / 100);
                    const radius = Math.hypot(point.x - centerX, point.y - centerY);
                    this.state.gradient.end = clamp((radius / Math.min(width, height)) * 150, this.state.gradient.start + 2, 100);
                }
                this.updateGradientUI();
                return;
            }

            const line = this.getGradientLine(width, height);
            const relativeX = point.x - line.x1;
            const relativeY = point.y - line.y1;
            const projection = ((relativeX * line.vectorX) + (relativeY * line.vectorY)) / line.length;
            const percent = clamp(projection * 100, 0, 100);
            if (handle === "start") {
                this.state.gradient.start = Math.min(percent, this.state.gradient.end - 2);
            } else {
                this.state.gradient.end = Math.max(percent, this.state.gradient.start + 2);
            }
            this.updateGradientUI();
        }

        drawBrushStroke(from, to) {
            const context = this.selectionContext;
            const width = this.selectionCanvas.width;
            const height = this.selectionCanvas.height;
            const brushWidth = Math.max(2, Math.min(width, height) * (this.state.local.brushSize / 100));
            context.save();
            context.globalCompositeOperation = this.state.local.operation === "erase" ? "destination-out" : "source-over";
            context.strokeStyle = "#fff";
            context.fillStyle = "#fff";
            context.lineWidth = brushWidth;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.beginPath();
            context.moveTo(from.x, from.y);
            context.lineTo(to.x, to.y);
            context.stroke();
            context.beginPath();
            context.arc(to.x, to.y, brushWidth / 2, 0, Math.PI * 2);
            context.fill();
            context.restore();
            if (this.state.local.operation === "add") this.state.local.hasSelection = true;
        }

        commitShapeSelection(start, end) {
            const x = Math.min(start.x, end.x);
            const y = Math.min(start.y, end.y);
            const width = Math.abs(end.x - start.x);
            const height = Math.abs(end.y - start.y);
            if (width < 2 || height < 2) return;

            this.trackFirstInteraction("canvas");

            const context = this.selectionContext;
            context.save();
            context.globalCompositeOperation = this.state.local.operation === "erase" ? "destination-out" : "source-over";
            context.fillStyle = "#fff";
            context.beginPath();
            if (this.state.local.tool === "ellipse") {
                context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
            } else {
                context.rect(x, y, width, height);
            }
            context.fill();
            context.restore();
            if (this.state.local.operation === "add") this.state.local.hasSelection = true;
        }

        clearSelection() {
            this.selectionContext.clearRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);
            this.state.local.hasSelection = false;
            this.scheduleRender();
        }

        async exportBlob() {
            if (!this.state.image) throw new Error("No image loaded");
            if (this.state.mode !== "local") {
                const result = await processDecodedImage(this.state.image, this.getRecipe(), {
                    dimensions: {
                        width: this.elements.canvas.width,
                        height: this.elements.canvas.height
                    },
                    canvasFactory: createCanvas
                });
                return {
                    blob: result.blob,
                    type: result.mimeType,
                    fallback: result.fallback,
                    warnings: result.warnings
                };
            }
            const exportCanvas = createCanvas(this.elements.canvas.width, this.elements.canvas.height);
            const exportContext = exportCanvas.getContext("2d", { alpha: true });
            this.renderEffect(exportContext, false);

            const requestedType = this.state.export.type;
            const quality = requestedType === "image/webp" ? this.state.export.quality : undefined;
            const blob = await new Promise((resolve, reject) => {
                exportCanvas.toBlob((result) => {
                    if (result) resolve(result);
                    else reject(new Error("Canvas export returned null"));
                }, requestedType, quality);
            });

            return {
                blob,
                type: blob.type || requestedType,
                fallback: requestedType === "image/webp" && blob.type !== "image/webp"
            };
        }

        async download() {
            if (!this.state.image || this.state.isRendering) return;
            trackEvent("export_click", {
                ...this.analyticsContext(),
                source: "download"
            });
            this.setExportLoading(true, "download");
            let succeeded = false;

            try {
                const result = await this.exportBlob();
                const url = URL.createObjectURL(result.blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = createOutputFilename(
                    this.state.fileName,
                    result.type,
                    `-${this.state.mode}-imagefader`
                );
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1500);
                this.showToast(result.fallback ? COPY.webpFallback : COPY.downloadStarted);
                const format = result.type === "image/webp" ? "webp" : "png";
                trackEvent("export_success", {
                    ...this.analyticsContext(format),
                    source: "download",
                    fallback: result.fallback
                });
                this.trackResultSuccess("download", format);
                succeeded = true;
            } catch (error) {
                console.error("ImageFader: export failed", error);
                this.showToast(COPY.exportFailed, true);
                trackEvent("export_failed", {
                    ...this.analyticsContext(),
                    source: "download"
                });
            } finally {
                this.setExportLoading(false);
                if (succeeded) this.showActionSuccess("download");
            }
        }

        async copyToClipboard() {
            if (!this.state.image || this.state.isRendering) return;
            trackEvent("copy_click", {
                ...this.analyticsContext("png"),
                source: "clipboard"
            });
            if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
                this.showToast(COPY.clipboardUnsupported, true);
                trackEvent("copy_failed", {
                    ...this.analyticsContext("png"),
                    source: "clipboard",
                    status: "unsupported"
                });
                return;
            }

            const previousType = this.state.export.type;
            let succeeded = false;
            this.setExportLoading(true, "copy");
            try {
                this.state.export.type = "image/png";
                const { blob } = await this.exportBlob();
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                this.showToast(COPY.copied);
                trackEvent("copy_success", {
                    ...this.analyticsContext("png"),
                    source: "clipboard"
                });
                this.trackResultSuccess("clipboard", "png");
                succeeded = true;
            } catch (error) {
                console.error("ImageFader: clipboard copy failed", error);
                this.showToast(COPY.copyFailed, true);
                trackEvent("copy_failed", {
                    ...this.analyticsContext("png"),
                    source: "clipboard",
                    status: "failed"
                });
            } finally {
                this.state.export.type = previousType;
                this.setExportLoading(false);
                if (succeeded) this.showActionSuccess("copy");
            }
        }

        setExportLoading(loading, action = "") {
            this.state.isRendering = loading;
            [...this.elements.downloadButtons, ...this.elements.copyButtons].forEach((button) => {
                button.disabled = loading;
                button.classList.toggle("is-loading", loading);
            });
            if (!loading) {
                this.updateActionLabels();
                return;
            }
            const activeButtons = action === "copy" ? this.elements.copyButtons : this.elements.downloadButtons;
            activeButtons.forEach((button) => {
                const label = button.querySelector("span");
                if (label) label.textContent = COPY.generating;
            });
        }

        showToast(message, isError = false) {
            const region = document.querySelector(".toast-region");
            if (!region) return;
            const toast = document.createElement("div");
            toast.className = `toast${isError ? " is-error" : ""}`;
            toast.setAttribute("role", isError ? "alert" : "status");
            toast.textContent = message;
            region.appendChild(toast);
            setTimeout(() => toast.remove(), 3400);
        }
    }

    function setupPageChrome() {
        document.querySelectorAll("[data-current-year]").forEach((node) => {
            node.textContent = String(new Date().getFullYear());
        });

        const dialog = document.querySelector("#qrDialog");
        document.querySelectorAll("[data-qr-open]").forEach((button) => {
            button.addEventListener("click", () => {
                if (typeof dialog?.showModal === "function") dialog.showModal();
            });
        });
        document.querySelectorAll("[data-qr-close]").forEach((button) => {
            button.addEventListener("click", () => dialog?.close());
        });
        dialog?.addEventListener("click", (event) => {
            const rect = dialog.getBoundingClientRect();
            const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
            if (outside) dialog.close();
        });
    }

    setupPageChrome();
    const mount = document.querySelector("#editorApp");
    if (mount) {
        window.imageFaderEditor = new ImageFaderEditor(mount);
    }
})();
