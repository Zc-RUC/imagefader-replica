(() => {
    "use strict";

    const STORAGE_KEY = "imagefader.language";
    const html = document.documentElement;
    const SUPPORTED_LANGUAGES = ["zh-CN", "en", "ja"];

    function normalizeLanguage(value) {
        const language = String(value || "").toLowerCase();
        if (language.startsWith("zh")) return "zh-CN";
        if (language.startsWith("ja")) return "ja";
        return "en";
    }

    const currentLanguage = normalizeLanguage(html.lang);

    function readPreference() {
        try {
            const value = window.localStorage.getItem(STORAGE_KEY);
            return SUPPORTED_LANGUAGES.includes(value) ? value : "";
        } catch {
            return "";
        }
    }

    function savePreference(value) {
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // Language switching still works when storage is unavailable.
        }
    }

    function alternateUrl(language) {
        const link = document.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
        return link?.href || "";
    }

    if (html.dataset.autoLanguage === "true") {
        const preferredLanguage = readPreference()
            || normalizeLanguage(navigator.languages?.[0] || navigator.language);

        if (preferredLanguage !== currentLanguage) {
            const alternate = alternateUrl(preferredLanguage);
            if (alternate) {
                const target = new URL(alternate);
                target.search = window.location.search;
                target.hash = window.location.hash;
                window.location.replace(target.href);
                return;
            }
        }
    }

    const bindLanguageSwitches = () => {
        document.querySelectorAll("[data-language-switch]").forEach((link) => {
            link.addEventListener("click", () => {
                savePreference(normalizeLanguage(link.dataset.language));
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindLanguageSwitches, { once: true });
    } else {
        bindLanguageSwitches();
    }
})();
