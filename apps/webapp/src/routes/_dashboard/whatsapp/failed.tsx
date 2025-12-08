import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/_dashboard/whatsapp/failed')({
  component: WhatsAppFailedPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      error: (search.error as string) || undefined,
      error_description: (search.error_description as string) || undefined,
    };
  },
});

function WhatsAppFailedPage() {
  const navigate = useNavigate();
  const { error, error_description } = useSearch({ from: '/_dashboard/whatsapp/failed' });

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">WhatsApp Connection Failed</CardTitle>
          <CardDescription className="text-base">
            We couldn't connect your WhatsApp Business account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(error || error_description) && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Error Details
              </h3>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {error && (
                  <p>
                    <strong>Error:</strong> {error}
                  </p>
                )}
                {error_description && (
                  <p>
                    <strong>Description:</strong> {error_description}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Common Issues
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Make sure you have a WhatsApp Business account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Check that you're logged into the correct Facebook account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Ensure your WhatsApp Business is verified</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
