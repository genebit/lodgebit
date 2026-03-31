"use client";

import { useEffect } from "react";

export default function PaceLoader() {
  useEffect(() => {
    import("pace-js");
  }, []);

  return null;
}
