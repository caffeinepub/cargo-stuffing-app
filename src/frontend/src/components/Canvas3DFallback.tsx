import { Loader2, AlertCircle, MonitorX } from 'lucide-react';

interface Canvas3DFallbackProps {
  isLoading?: boolean;
  error?: string;
}

export function Canvas3DFallback({ isLoading = true, error }: Canvas3DFallbackProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-cargo-accent" />
          <p className="text-sm font-medium">Initializing 3D view...</p>
          <p className="text-xs text-muted-foreground">This may take a few moments</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground max-w-md text-center px-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <MonitorX className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">3D View Unavailable</p>
            <p className="text-xs leading-relaxed">
              {error || 'WebGL is not available in your browser. The 3D visualization cannot be displayed.'}
            </p>
            {!error?.includes('timeout') && (
              <p className="text-xs text-muted-foreground mt-3">
                💡 Try enabling hardware acceleration in your browser settings or use a modern browser like Chrome, Firefox, or Edge.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
