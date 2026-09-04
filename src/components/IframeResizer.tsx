"use client";

import { useEffect } from "react";

export function IframeResizer() {
  useEffect(() => {
    // Only run if running inside an iframe
    if (typeof window === "undefined" || window.parent === window) {
      return;
    }

    let lastSentHeight = 0;

    const sendHeight = () => {
      try {
        const content = document.getElementById("adhkar-app-content");
        // Measure the content wrapper itself, completely independent of iframe viewport height
        const height = content
          ? Math.ceil(Math.max(content.offsetHeight, content.scrollHeight))
          : Math.ceil(document.body.scrollHeight);

        if (!height || height <= 0) return;

        // Prevent infinite resize loops: only postMessage if height changed by at least 10px
        if (Math.abs(height - lastSentHeight) >= 10) {
          lastSentHeight = height;
          window.parent.postMessage({ height, type: "adhkar-height" }, "*");
        }
      } catch {
        // Cross-origin safety
      }
    };

    // Send initial height once mounted
    sendHeight();

    // Use ResizeObserver strictly on the content container
    const target = document.getElementById("adhkar-app-content") || document.body;
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(target);

    // Also send height after all assets/fonts load
    window.addEventListener("load", sendHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("load", sendHeight);
    };
  }, []);

  return null;
}
