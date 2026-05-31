"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * CSSカスタムプロパティ（変数）を読み込み、R3F Uniform用の値（THREE.Color または数値）にブリッジするフック
 */
export function useCSSVariable(variableName: string, type: "color" | "number" = "number") {
  const [val, setVal] = useState<THREE.Color | number>(
    type === "color" ? new THREE.Color("#000000") : 0
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getVariableValue = () => {
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();

      if (!computed) return;

      if (type === "color") {
        // Handle direct hex/rgb or HSL variables
        const color = new THREE.Color(computed);
        setVal(color);
      } else {
        // Convert to float/int
        const parsed = parseFloat(computed);
        if (!isNaN(parsed)) {
          setVal(parsed);
        }
      }
    };

    getVariableValue();

    // Trigger update on resize or possible class mutations
    window.addEventListener("resize", getVariableValue);
    
    const observer = new MutationObserver(getVariableValue);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      window.removeEventListener("resize", getVariableValue);
      observer.disconnect();
    };
  }, [variableName, type]);

  return val;
}
