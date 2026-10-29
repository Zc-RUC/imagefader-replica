/* Tiny, dependency-free bridge for uploads made before the editor module is ready. */
(() => {
    "use strict";
    const mount = document.querySelector("#editorApp");
    const shell = mount?.querySelector("[data-editor-startup]");
    const input = mount?.querySelector("#imageInput");
    if (!shell || !input || mount.dataset.editorReady === "true") return;

    const zone = shell.querySelector("#dropZone");
    const status = shell.querySelector("[data-startup-status]");
    const retry = shell.querySelector("[data-startup-retry]");
    const listeners = [];
    let pending = input.files?.[0] ? { file: input.files[0], source: "picker" } : null;
    let stopped = false;
    let slow = false;
    let failed = false;

    function on(target, name, callback, capture = false) {
        target.addEventListener(name, callback, capture);
        listeners.push(() => target.removeEventListener(name, callback, capture));
    }

    function showStatus() {
        const key = failed ? "failed" : slow ? "slow" : pending ? "queued" : "loading";
        status.textContent = status.dataset[key];
        retry.hidden = !(slow || failed);
    }

    function queue(file, source) {
        if (!file || stopped) return;
        // Keep only the latest selection, in memory. Validation and analytics belong to loadFile.
        pending = { file, source };
        showStatus();
    }

    on(input, "change", () => queue(input.files?.[0], "picker"));
    on(document, "click", (event) => {
        if (event.target.closest("label[for=imageInput]")) return; // Native label works even before this script.
        if (event.target.closest("[data-upload-trigger]") || zone.contains(event.target)) {
            event.preventDefault();
            input.click();
        }
    });
    on(zone, "keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            input.click();
        }
    });
    for (const name of ["dragenter", "dragover"]) {
        on(zone, name, (event) => {
            event.preventDefault();
            zone.classList.add("is-dragging");
        });
    }
    for (const name of ["dragleave", "drop"]) {
        on(zone, name, (event) => {
            event.preventDefault();
            zone.classList.remove("is-dragging");
        });
    }
    on(zone, "drop", (event) => {
        const files = [...(event.dataTransfer?.files || [])];
        queue(files.find((file) => file.type.startsWith("image/")) || files[0], "drop");
    });
    on(document, "paste", (event) => {
        const file = [...(event.clipboardData?.files || [])].find((item) => item.type.startsWith("image/"));
        if (file) {
            event.preventDefault();
            queue(file, "paste");
        }
    });
    on(window, "error", (event) => {
        const target = event.target;
        if (target?.matches?.('script[type="module"][src*="/js/main.js"], link[rel="modulepreload"][href*="/js/"]')) {
            failed = true;
            showStatus();
        }
    }, true);
    const timer = setTimeout(() => {
        slow = true;
        showStatus();
    }, 8_000);

    window.imageFaderStartup = {
        take() {
            if (stopped) return null;
            stopped = true;
            clearTimeout(timer);
            listeners.forEach((remove) => remove());
            const selected = pending;
            pending = null;
            delete window.imageFaderStartup;
            return selected;
        }
    };
    showStatus();
})();
