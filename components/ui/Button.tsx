// /components/ui/Button.tsx

export default function Button({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base = "px-6 py-3 rounded-xl font-semibold transition";

  const styles =
    variant === "primary"
      ? "bg-green-500 hover:bg-green-600 text-white"
      : "border border-gray-600 hover:bg-white/5";

  return <button className={`${base} ${styles}`}>{children}</button>;
}