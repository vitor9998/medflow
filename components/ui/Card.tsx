// /components/ui/Card.tsx

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0B1120] border border-gray-800 rounded-xl p-6">
      {children}
    </div>
  );
}