export function Card({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[#0B1120] border border-gray-800/80 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}
