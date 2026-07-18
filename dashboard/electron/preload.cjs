// Preload script runs in a sandboxed context before the renderer page loads.
// contextIsolation is enabled so the renderer cannot access Node.js APIs directly.
// Expose only what you explicitly need via contextBridge here.

const { contextBridge } = require('electron');

// Example: expose app version to the renderer
const { app } = require('@electron/remote') || {};

// Nothing to expose yet — keeping this file as the established entry point
// so you can easily add contextBridge.exposeInMainWorld() calls later.
