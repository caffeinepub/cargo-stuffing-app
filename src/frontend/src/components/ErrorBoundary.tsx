import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isThreeJsError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isThreeJsError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a Three.js or React Three Fiber error
    const isThreeJsError = 
      error.message?.includes('THREE') ||
      error.message?.includes('WebGL') ||
      error.message?.includes('Canvas') ||
      error.stack?.includes('three') ||
      error.stack?.includes('@react-three/fiber');

    return {
      hasError: true,
      error,
      isThreeJsError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log additional context for Three.js errors
    if (this.state.isThreeJsError) {
      console.error('3D Rendering Error Details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, isThreeJsError } = this.state;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">
                  {isThreeJsError ? '3D Rendering Error' : 'Something went wrong'}
                </CardTitle>
              </div>
              <CardDescription>
                {isThreeJsError ? (
                  <>
                    The 3D visualization encountered an error. This may be due to browser compatibility or graphics driver issues.
                    Try reloading the page or using a different browser.
                  </>
                ) : (
                  <>
                    The application encountered an unexpected error. Please try reloading the page.
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-64">
                  <p className="text-sm font-mono text-destructive mb-2">
                    {error.toString()}
                  </p>
                  {errorInfo && (
                    <pre className="text-xs text-muted-foreground overflow-auto">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              {isThreeJsError && (
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                  <p className="font-medium">Troubleshooting tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                    <li>Enable hardware acceleration in your browser settings</li>
                    <li>Update your graphics drivers</li>
                    <li>Try using Chrome, Firefox, or Edge browsers</li>
                    <li>Check if WebGL is supported: visit get.webgl.org</li>
                  </ul>
                </div>
              )}
              
              <Button onClick={this.handleReload} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
