// v3 adds radial sector fades. v1/v2 links and saved recipes remain readable.
export const RECIPE_VERSION = 3;
const READABLE_RECIPE_VERSIONS = new Set([1, 2, RECIPE_VERSION]);
export const MAX_IMAGE_PIXELS = 60_000_000;
export const MAX_IMAGE_EDGE = 16_384;
export const SUPPORTED_IMAGE_TYPES = Object.freeze(["image/png", "image/jpeg", "image/webp"]);
export const OUTPUT_IMAGE_TYPES = Object.freeze(["image/png", "image/webp"]);

const VALID_MODES = new Set(["global", "gradient", "feather"]);
const VALID_GRADIENT_TYPES = new Set(["linear", "radial", "conic"]);
const VALID_CONIC_FADES = new Set(["angular", "radial"]);
const VALID_FEATHER_SHAPES = new Set(["rectangle", "ellipse"]);
const VALID_FEATHER_SIDES = new Set(["all", "horizontal", "vertical", "top", "right", "bottom", "left"]);

export const DEFAULT_RECIPE = Object.freeze({
    version: RECIPE_VERSION,
    mode: "global",
    opacity: 55,
    gradient: Object.freeze({
        type: "linear",
        conicFade: "angular",
        angle: 0,
        start: 8,
        end: 92,
        centerX: 50,
        centerY: 50,
        invert: false
    }),
    feather: Object.freeze({
        shape: "rectangle",
        sides: "all",
        width: 22,
        softness: 72,
        invert: false
    }),
    export: Object.freeze({
        type: "image/png",
        quality: 0.9
    }),
    naming: Object.freeze({
        suffix: "-imagefader"
    })
});

export class ImageFaderError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "ImageFaderError";
        this.code = code;
        this.details = details;
    }
}

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function enumValue(value, validValues, fallback) {
    return validValues.has(value) ? value : fallback;
}

function booleanValue(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}

export function normalizeSuffix(value, fallback = DEFAULT_RECIPE.naming.suffix) {
    const input = String(value ?? "")
        .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
    const normalizedFallback = String(fallback || "imagefader")
        .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "imagefader";
    return `-${input || normalizedFallback}`;
}

export function normalizeRecipe(input = {}) {
    if (input?.version != null && !READABLE_RECIPE_VERSIONS.has(Number(input.version))) {
        throw new ImageFaderError(
            "unsupported-recipe-version",
            `Unsupported recipe version: ${input.version}`,
            { version: input.version }
        );
    }

    const gradientInput = input?.gradient || {};
    const featherInput = input?.feather || {};
    const exportInput = input?.export || {};
    const namingInput = input?.naming || {};
    let start = clamp(finiteNumber(gradientInput.start, DEFAULT_RECIPE.gradient.start), 0, 98);
    let end = clamp(finiteNumber(gradientInput.end, DEFAULT_RECIPE.gradient.end), 2, 100);

    if (end < start + 2) {
        if (start <= 98) end = Math.min(100, start + 2);
        if (end < start + 2) start = Math.max(0, end - 2);
    }

    return {
        version: RECIPE_VERSION,
        mode: enumValue(input?.mode, VALID_MODES, DEFAULT_RECIPE.mode),
        opacity: clamp(finiteNumber(input?.opacity, DEFAULT_RECIPE.opacity), 0, 100),
        gradient: {
            type: enumValue(gradientInput.type, VALID_GRADIENT_TYPES, DEFAULT_RECIPE.gradient.type),
            conicFade: enumValue(gradientInput.conicFade, VALID_CONIC_FADES, DEFAULT_RECIPE.gradient.conicFade),
            angle: clamp(finiteNumber(gradientInput.angle, DEFAULT_RECIPE.gradient.angle), 0, 359),
            start,
            end,
            centerX: clamp(finiteNumber(gradientInput.centerX, DEFAULT_RECIPE.gradient.centerX), 0, 100),
            centerY: clamp(finiteNumber(gradientInput.centerY, DEFAULT_RECIPE.gradient.centerY), 0, 100),
            invert: booleanValue(gradientInput.invert, DEFAULT_RECIPE.gradient.invert)
        },
        feather: {
            shape: enumValue(featherInput.shape, VALID_FEATHER_SHAPES, DEFAULT_RECIPE.feather.shape),
            sides: enumValue(featherInput.sides, VALID_FEATHER_SIDES, DEFAULT_RECIPE.feather.sides),
            width: clamp(finiteNumber(featherInput.width, DEFAULT_RECIPE.feather.width), 0, 50),
            softness: clamp(finiteNumber(featherInput.softness, DEFAULT_RECIPE.feather.softness), 0, 100),
            invert: booleanValue(featherInput.invert, DEFAULT_RECIPE.feather.invert)
        },
        export: {
            type: OUTPUT_IMAGE_TYPES.includes(exportInput.type) ? exportInput.type : DEFAULT_RECIPE.export.type,
            quality: clamp(finiteNumber(exportInput.quality, DEFAULT_RECIPE.export.quality), 0.5, 1)
        },
        naming: {
            suffix: normalizeSuffix(namingInput.suffix, DEFAULT_RECIPE.naming.suffix)
        }
    };
}

export function cloneRecipe(recipe) {
    return normalizeRecipe(JSON.parse(JSON.stringify(normalizeRecipe(recipe))));
}

export function recipeFingerprint(recipe) {
    return JSON.stringify(normalizeRecipe(recipe));
}

export function serializeRecipe(recipe) {
    const value = normalizeRecipe(recipe);
    const params = new URLSearchParams();
    params.set("v", String(value.version));
    params.set("mode", value.mode);
    params.set("opacity", String(value.opacity));
    params.set("gt", value.gradient.type);
    params.set("cf", value.gradient.conicFade);
    params.set("ga", String(value.gradient.angle));
    params.set("gs", String(value.gradient.start));
    params.set("ge", String(value.gradient.end));
    params.set("gx", String(value.gradient.centerX));
    params.set("gy", String(value.gradient.centerY));
    params.set("gi", value.gradient.invert ? "1" : "0");
    params.set("fs", value.feather.shape);
    params.set("fd", value.feather.sides);
    params.set("fw", String(value.feather.width));
    params.set("ff", String(value.feather.softness));
    params.set("fi", value.feather.invert ? "1" : "0");
    params.set("format", value.export.type === "image/webp" ? "webp" : "png");
    params.set("quality", String(value.export.quality));
    params.set("suffix", value.naming.suffix);
    return params;
}

function queryBoolean(value, fallback = false) {
    if (value === "1" || value === "true") return true;
    if (value === "0" || value === "false") return false;
    return fallback;
}

export function deserializeRecipe(value) {
    const params = value instanceof URLSearchParams
        ? value
        : new URLSearchParams(String(value || "").replace(/^\?/, ""));
    if (!params.has("v")) return null;
    const version = Number(params.get("v"));
    if (!READABLE_RECIPE_VERSIONS.has(version)) {
        throw new ImageFaderError("unsupported-recipe-version", `Unsupported recipe version: ${version}`, { version });
    }
    return normalizeRecipe({
        version,
        mode: params.get("mode"),
        opacity: params.get("opacity"),
        gradient: {
            type: params.get("gt"),
            conicFade: params.get("cf"),
            angle: params.get("ga"),
            start: params.get("gs"),
            end: params.get("ge"),
            centerX: params.get("gx"),
            centerY: params.get("gy"),
            invert: queryBoolean(params.get("gi"))
        },
        feather: {
            shape: params.get("fs"),
            sides: params.get("fd"),
            width: params.get("fw"),
            softness: params.get("ff"),
            invert: queryBoolean(params.get("fi"))
        },
        export: {
            type: params.get("format") === "webp" ? "image/webp" : "image/png",
            quality: params.get("quality")
        },
        naming: {
            suffix: params.get("suffix")
        }
    });
}

export function recipeUrl(baseUrl, recipe) {
    const url = new URL(baseUrl);
    url.search = serializeRecipe(recipe).toString();
    url.hash = "batch-tool";
    return url.href;
}

export function isSupportedImageFile(file) {
    return Boolean(file && SUPPORTED_IMAGE_TYPES.includes(String(file.type).toLowerCase()));
}

export function validateImageDimensions(width, height) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new ImageFaderError("image-unreadable", "Unable to read image dimensions");
    }
    if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
        throw new ImageFaderError(
            "image-too-large",
            `Image exceeds ${MAX_IMAGE_PIXELS} pixels or ${MAX_IMAGE_EDGE}px on one edge`,
            { width, height }
        );
    }
    return { width, height };
}

export function sourceDimensions(image) {
    const width = image?.width || image?.naturalWidth || image?.videoWidth || 0;
    const height = image?.height || image?.naturalHeight || image?.videoHeight || 0;
    return validateImageDimensions(width, height);
}

export async function decodeImageFile(file) {
    if (!isSupportedImageFile(file)) {
        throw new ImageFaderError("unsupported-file-type", "Only PNG, JPG, and WebP images are supported");
    }

    if (typeof createImageBitmap === "function") {
        try {
            return await createImageBitmap(file, { imageOrientation: "from-image" });
        } catch {
            // Fall through to the HTMLImageElement decoder when available.
        }
    }

    if (typeof Image === "undefined" || typeof URL === "undefined") {
        throw new ImageFaderError("image-unreadable", "No supported image decoder is available");
    }

    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new ImageFaderError("image-unreadable", "Image decode failed"));
        };
        image.src = objectUrl;
    });
}

function createRuntimeCanvas(width, height) {
    if (typeof OffscreenCanvas === "function") return new OffscreenCanvas(width, height);
    if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    throw new ImageFaderError("canvas-unavailable", "Canvas is unavailable in this browser");
}

function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
}

function getGradientLine(width, height, angle) {
    const radians = (angle * Math.PI) / 180;
    const vectorX = Math.cos(radians);
    const vectorY = Math.sin(radians);
    const length = Math.abs(width * vectorX) + Math.abs(height * vectorY);
    const centerX = width / 2;
    const centerY = height / 2;
    return {
        x1: centerX - (vectorX * length) / 2,
        y1: centerY - (vectorY * length) / 2,
        x2: centerX + (vectorX * length) / 2,
        y2: centerY + (vectorY * length) / 2
    };
}

// Coordinates are in image pixels, so angles stay circular on non-square images.
export function conicPosition(x, y, centerX, centerY, angle) {
    const turn = Math.PI * 2;
    const theta = Math.atan2(y - centerY, x - centerX) - angle * Math.PI / 180;
    return ((theta % turn) + turn) % turn / turn;
}

export function gradientAlphaAt(position, recipe) {
    const start = recipe.gradient.start / 100;
    const end = recipe.gradient.end / 100;
    const progress = clamp((position - start) / (end - start), 0, 1);
    const low = recipe.opacity / 100;
    return recipe.gradient.invert ? 1 - progress * (1 - low) : low + progress * (1 - low);
}

function applyRadialSector(context, width, height, recipe) {
    const config = recipe.gradient;
    const cx = width * config.centerX / 100;
    const cy = height * config.centerY / 100;
    // Use image pixels, not separate X/Y normalization, to keep a circular fade
    // on non-square images. Match the radius convention of the radial mode.
    const radius = Math.max(
        Math.hypot(cx, cy), Math.hypot(width - cx, cy),
        Math.hypot(cx, height - cy), Math.hypot(width - cx, height - cy)
    );
    const low = recipe.opacity / 100;
    const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${config.invert ? low : 1})`);
    gradient.addColorStop(1, `rgba(255,255,255,${config.invert ? 1 : low})`);
    context.globalCompositeOperation = "destination-in";
    context.fillStyle = gradient;
    if (config.start === 0 && config.end === 100) {
        // A full turn has no cut or antialiased seam.
        context.fillRect(0, 0, width, height);
        return;
    }
    const rotation = config.angle * Math.PI / 180;
    const start = rotation + config.start / 100 * Math.PI * 2;
    const end = rotation + config.end / 100 * Math.PI * 2;
    context.beginPath();
    context.moveTo(cx, cy);
    context.arc(cx, cy, radius + 1, start, end);
    context.closePath();
    // destination-in clears outside the sector and multiplies the original alpha.
    // Invert only changes the radial fade; it never reveals pixels outside it.
    context.fill();
}

function applyConicFallback(context, width, height, recipe) {
    // Tile the mask to avoid a second full-resolution RGBA buffer on large images.
    const rows = Math.min(128, height);
    const tile = createRuntimeCanvas(width, rows);
    const tileContext = tile.getContext("2d");
    const pixels = tileContext.createImageData(width, rows);
    const config = recipe.gradient;
    const centerX = width * config.centerX / 100;
    const centerY = height * config.centerY / 100;
    for (let top = 0; top < height; top += rows) {
        const count = Math.min(rows, height - top);
        for (let y = 0; y < count; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const offset = (y * width + x) * 4;
                const position = conicPosition(x + 0.5, top + y + 0.5, centerX, centerY, config.angle);
                pixels.data[offset] = pixels.data[offset + 1] = pixels.data[offset + 2] = 255;
                pixels.data[offset + 3] = Math.round(255 * gradientAlphaAt(position, recipe));
            }
        }
        tileContext.putImageData(pixels, 0, 0);
        context.save();
        context.beginPath();
        context.rect(0, top, width, count);
        context.clip();
        context.globalCompositeOperation = "destination-in";
        context.drawImage(tile, 0, 0, width, count, 0, top, width, count);
        context.restore();
    }
}

function addSoftGradientStops(gradient, start, end, alphaStart, alphaEnd, softness) {
    const curve = clamp(softness / 100, 0.1, 1);
    const steps = 8;
    gradient.addColorStop(0, `rgba(255,255,255,${alphaStart})`);
    for (let index = 0; index <= steps; index += 1) {
        const linear = index / steps;
        const curved = smoothstep(linear) ** (1.35 - curve);
        const offset = start + (end - start) * linear;
        const alpha = alphaStart + (alphaEnd - alphaStart) * curved;
        gradient.addColorStop(clamp(offset, 0, 1), `rgba(255,255,255,${clamp(alpha, 0, 1)})`);
    }
    gradient.addColorStop(1, `rgba(255,255,255,${alphaEnd})`);
}

function invertAlphaCanvas(source) {
    const inverted = createRuntimeCanvas(source.width, source.height);
    const context = inverted.getContext("2d", { alpha: true });
    context.fillStyle = "#fff";
    context.fillRect(0, 0, inverted.width, inverted.height);
    context.globalCompositeOperation = "destination-out";
    context.drawImage(source, 0, 0);
    context.globalCompositeOperation = "source-over";
    return inverted;
}

function featherSides(value) {
    const mapping = {
        all: ["top", "right", "bottom", "left"],
        horizontal: ["left", "right"],
        vertical: ["top", "bottom"],
        top: ["top"],
        right: ["right"],
        bottom: ["bottom"],
        left: ["left"]
    };
    return mapping[value] || mapping.all;
}

function createFeatherMask(width, height, recipe) {
    const mask = createRuntimeCanvas(width, height);
    const maskContext = mask.getContext("2d", { alpha: true });
    const config = recipe.feather;
    const edgeAlpha = recipe.opacity / 100;

    if (config.shape === "ellipse") {
        const size = 640;
        const radial = createRuntimeCanvas(size, size);
        const radialContext = radial.getContext("2d", { alpha: true });
        const gradient = radialContext.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        const inner = clamp(1 - (config.width / 50), 0, 0.96);
        addSoftGradientStops(gradient, inner, 1, 1, edgeAlpha, config.softness);
        radialContext.fillStyle = gradient;
        radialContext.fillRect(0, 0, size, size);
        maskContext.drawImage(radial, 0, 0, width, height);
    } else {
        maskContext.fillStyle = "#fff";
        maskContext.fillRect(0, 0, width, height);
        const widthX = Math.max(1, width * (config.width / 100));
        const widthY = Math.max(1, height * (config.width / 100));
        for (const side of featherSides(config.sides)) {
            const sideMask = createRuntimeCanvas(width, height);
            const sideContext = sideMask.getContext("2d", { alpha: true });
            let gradient;
            if (side === "left") gradient = sideContext.createLinearGradient(0, 0, widthX, 0);
            if (side === "right") gradient = sideContext.createLinearGradient(width, 0, width - widthX, 0);
            if (side === "top") gradient = sideContext.createLinearGradient(0, 0, 0, widthY);
            if (side === "bottom") gradient = sideContext.createLinearGradient(0, height, 0, height - widthY);
            addSoftGradientStops(gradient, 0, 1, edgeAlpha, 1, config.softness);
            sideContext.fillStyle = gradient;
            sideContext.fillRect(0, 0, width, height);
            maskContext.save();
            maskContext.globalCompositeOperation = "destination-in";
            maskContext.drawImage(sideMask, 0, 0);
            maskContext.restore();
        }
    }
    return config.invert ? invertAlphaCanvas(mask) : mask;
}

export function renderRecipeToContext(targetContext, image, inputRecipe) {
    const recipe = normalizeRecipe(inputRecipe);
    const width = targetContext.canvas.width;
    const height = targetContext.canvas.height;
    targetContext.save();
    targetContext.setTransform(1, 0, 0, 1, 0, 0);
    targetContext.clearRect(0, 0, width, height);
    targetContext.globalAlpha = 1;
    targetContext.globalCompositeOperation = "source-over";
    targetContext.imageSmoothingEnabled = true;
    targetContext.imageSmoothingQuality = "high";

    if (recipe.mode === "global") {
        targetContext.globalAlpha = recipe.opacity / 100;
        targetContext.drawImage(image, 0, 0, width, height);
        targetContext.restore();
        return recipe;
    }

    targetContext.drawImage(image, 0, 0, width, height);
    if (recipe.mode === "gradient") {
        const config = recipe.gradient;
        const lowAlpha = recipe.opacity / 100;
        const alphaStart = config.invert ? 1 : lowAlpha;
        const alphaEnd = config.invert ? lowAlpha : 1;
        let gradient;
        if (config.type === "conic") {
            if (config.conicFade === "radial") {
                applyRadialSector(targetContext, width, height, recipe);
                targetContext.restore();
                return recipe;
            }
            if (typeof targetContext.createConicGradient !== "function") {
                applyConicFallback(targetContext, width, height, recipe);
                targetContext.restore();
                return recipe;
            }
            gradient = targetContext.createConicGradient(
                config.angle * Math.PI / 180,
                width * config.centerX / 100,
                height * config.centerY / 100
            );
        } else if (config.type === "radial") {
            const centerX = width * (config.centerX / 100);
            const centerY = height * (config.centerY / 100);
            const maxRadius = Math.max(
                Math.hypot(centerX, centerY),
                Math.hypot(width - centerX, centerY),
                Math.hypot(centerX, height - centerY),
                Math.hypot(width - centerX, height - centerY)
            );
            gradient = targetContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        } else {
            const line = getGradientLine(width, height, config.angle);
            gradient = targetContext.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
        }
        const start = clamp(config.start / 100, 0, 0.98);
        const end = clamp(config.end / 100, start + 0.01, 1);
        gradient.addColorStop(0, `rgba(255,255,255,${alphaStart})`);
        if (start > 0) gradient.addColorStop(start, `rgba(255,255,255,${alphaStart})`);
        gradient.addColorStop(end, `rgba(255,255,255,${alphaEnd})`);
        if (end < 1) gradient.addColorStop(1, `rgba(255,255,255,${alphaEnd})`);
        targetContext.globalCompositeOperation = "destination-in";
        targetContext.fillStyle = gradient;
        targetContext.fillRect(0, 0, width, height);
    } else if (recipe.mode === "feather") {
        const mask = createFeatherMask(width, height, recipe);
        targetContext.globalCompositeOperation = "destination-in";
        targetContext.drawImage(mask, 0, 0);
    }
    targetContext.restore();
    return recipe;
}

async function exportCanvas(canvas, requestedType, quality) {
    let blob;
    try {
        if (typeof canvas.convertToBlob === "function") {
            blob = await canvas.convertToBlob({ type: requestedType, quality });
        } else {
            blob = await new Promise((resolve, reject) => {
                canvas.toBlob((result) => {
                    if (result) resolve(result);
                    else reject(new ImageFaderError("export-failed", "Canvas export returned null"));
                }, requestedType, quality);
            });
        }
    } catch (error) {
        if (requestedType !== "image/webp") throw error;
        if (typeof canvas.convertToBlob === "function") {
            blob = await canvas.convertToBlob({ type: "image/png" });
        } else {
            blob = await new Promise((resolve, reject) => {
                canvas.toBlob((result) => {
                    if (result) resolve(result);
                    else reject(new ImageFaderError("export-failed", "PNG fallback export returned null"));
                }, "image/png");
            });
        }
    }
    const mimeType = blob.type === "image/webp" ? "image/webp" : "image/png";
    return {
        blob,
        mimeType,
        fallback: requestedType === "image/webp" && mimeType !== "image/webp",
        warnings: requestedType === "image/webp" && mimeType !== "image/webp" ? ["webp-fallback"] : []
    };
}

export async function processDecodedImage(image, inputRecipe, options = {}) {
    const recipe = normalizeRecipe(inputRecipe);
    const { width, height } = options.dimensions || sourceDimensions(image);
    validateImageDimensions(width, height);
    const canvas = options.canvasFactory
        ? options.canvasFactory(width, height)
        : createRuntimeCanvas(width, height);
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new ImageFaderError("canvas-unavailable", "Unable to create a 2D canvas context");
    renderRecipeToContext(context, image, recipe);
    const exported = await exportCanvas(
        canvas,
        recipe.export.type,
        recipe.export.type === "image/webp" ? recipe.export.quality : undefined
    );
    return { ...exported, width, height };
}

export async function processImage(file, recipe, options = {}) {
    const image = await decodeImageFile(file);
    try {
        const dimensions = sourceDimensions(image);
        return await processDecodedImage(image, recipe, { ...options, dimensions });
    } finally {
        if (options.closeSource !== false) image.close?.();
    }
}

export function sanitizeBaseName(fileName, fallback = "image") {
    return String(fileName || "")
        .replace(/\.[^.]+$/, "")
        .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || fallback;
}

export function extensionForMimeType(mimeType) {
    return mimeType === "image/webp" ? "webp" : "png";
}

export function createOutputFilename(fileName, mimeType, suffix = DEFAULT_RECIPE.naming.suffix) {
    return `${sanitizeBaseName(fileName)}${normalizeSuffix(suffix)}.${extensionForMimeType(mimeType)}`;
}

export function uniquifyFilename(fileName, usedNames) {
    const used = usedNames instanceof Set ? usedNames : new Set(usedNames || []);
    const normalized = fileName.toLocaleLowerCase();
    if (!used.has(normalized)) {
        used.add(normalized);
        return fileName;
    }
    const match = fileName.match(/^(.*?)(\.[^.]+)$/);
    const base = match?.[1] || fileName;
    const extension = match?.[2] || "";
    let index = 2;
    let candidate = `${base}-${index}${extension}`;
    while (used.has(candidate.toLocaleLowerCase())) {
        index += 1;
        candidate = `${base}-${index}${extension}`;
    }
    used.add(candidate.toLocaleLowerCase());
    return candidate;
}
