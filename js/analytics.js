export function trackEvent() {}

export function viewportBucket(width) {
    return width < 720 ? "mobile" : "desktop";
}

export function createTaskMeasurement() {
    const claimed = new Set();
    let startedAt = 0;

    return {
        start() {
            startedAt = performance.now();
        },
        stop() {
            startedAt = 0;
        },
        claim(key) {
            if (claimed.has(key)) return false;
            claimed.add(key);
            return true;
        },
        durationBucket() {
            if (!startedAt) return "unknown";
            const seconds = (performance.now() - startedAt) / 1000;
            if (seconds < 10) return "0-9s";
            if (seconds < 30) return "10-29s";
            if (seconds < 60) return "30-59s";
            return "60s+";
        }
    };
}
