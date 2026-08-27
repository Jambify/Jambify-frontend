import { cn } from "../../lib/utils/utils";

export const inputCls = (hasError: boolean) =>
  cn(
    "w-full min-w-0 px-4 py-2.5 bg-bgSurface rounded-brand border text-sm text-textMain",
    "placeholder:text-textDim focus:outline-none transition-colors",
    hasError
      ? "border-danger focus:border-danger"
      : "border-borderMuted focus:border-brand/50",
  );
