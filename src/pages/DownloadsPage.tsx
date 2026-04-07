import { Download, FileText, FileSpreadsheet, FileImage, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const iconMap: Record<string, any> = {
  PDF: FileText,
  DOCX: FileText,
  PPTX: FileImage,
  XLSX: FileSpreadsheet,
  ZIP: FileText,
};

export default function DownloadsPage() {
  const { data: notes = [], isLoading } = useQuery({ 
    queryKey: ['notes'], 
    queryFn: () => apiFetch('/api/notes') 
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Downloads</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-1 text-sm text-muted-foreground">Your academic resources and shared files</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/50" />
            <p className="mt-4 text-sm text-muted-foreground">Loading resources...</p>
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full py-10 text-center">No downloads available.</p>
        ) : notes.map((f: any, i: number) => {
          const type = (f.file_type || 'PDF').toUpperCase();
          const Icon = iconMap[type] || FileText;
          const fullUrl = `${apiUrl}/${f.file_path}`;
          
          return (
            <AnimatedCard key={f.id} index={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground" title={f.original_filename || f.title}>
                  {f.original_filename || f.title}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">{type} · {new Date(f.created_at).toLocaleDateString()}</p>
              </div>
              <a 
                href={fullUrl} 
                download={f.original_filename}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Download className="h-4 w-4" />
              </a>
            </AnimatedCard>
          );
        })}
      </div>
    </PageTransition>
  );
}
