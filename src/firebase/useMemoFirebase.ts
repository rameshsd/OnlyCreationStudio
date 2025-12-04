"use client";

import { useMemo } from "react";

export function useMemoFirebase<T>(value: T, deps: any[]) {
  return useMemo(() => value, deps);
}
