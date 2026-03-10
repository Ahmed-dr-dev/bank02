import AgentSidebar from '@/components/AgentSidebar';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AgentSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
