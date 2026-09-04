"use client";

import { useEffect } from "react";

export function IframeResizer() {
  useEffect(() => {
    // Only run if running inside an iframe
    if (typeof window === "undefined" || window.parent === window) {
      return;
    }

    const sendHeight = () => {
      try {
        const body = document.body;
        const html = document.documentElement;
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );

        window.parent.postMessage({ height, type: "adhkar-height" }, "*");
      } catch {
        // Cross-origin safety
      }
    };

    // Send initial height once mounted
    sendHeight();

    // Use ResizeObserver for responsive DOM changes (audio players opening, card expanding, etc.)
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(document.body);
    window.addEventListener("resize", sendHeight);

    // Also send height after all assets load
    window.addEventListener("load", sendHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", sendHeight);
      window.removeEventListener("load", sendHeight);
    };
  }, []);

  return null;
}
