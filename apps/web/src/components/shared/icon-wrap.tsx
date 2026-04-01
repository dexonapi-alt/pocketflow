import { cn } from "@/lib/utils";

interface IconWrapProps {
  tone?: string;
  children: React.ReactNode;
  className?: string;
}

export function IconWrap({ tone, children, className }: IconWrapProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6",
        tone,
        className,
      )}
    >
      {children}
    </div>
  );
}
