const ICON_PATHS = {
    global: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" opacity=".24"/>',
    gradient: '<path d="M5 5h14v14H5z" opacity=".35"/><path d="M5 19 19 5M9 5h10v10"/>',
    feather: '<rect x="4" y="4" width="16" height="16" rx="5" stroke-dasharray="3 2"/><rect x="8" y="8" width="8" height="8" rx="2" opacity=".45"/>',
    local: '<path d="m14.5 5.5 4 4L9 19H5v-4zM12.5 7.5l4 4M4 4h5M4 4v5"/>',
    image: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><circle cx="9" cy="9" r="1.5"/><path d="m5 18 5-5 3 3 2.5-2.5L19 17"/>',
    upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8a7 7 0 0 1 11.8-1L20 12M4 12l2.1 5a7 7 0 0 0 11.8-1"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    guides: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    check: '<path d="m6 12.5 4 4L18.5 8"/>',
    download: '<path d="M12 4v12m0 0 4.5-4.5M12 16l-4.5-4.5M5 20h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'
};

export function icon(name) {
    return `<svg class="ui-icon ui-icon--${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.image}</svg>`;
}
