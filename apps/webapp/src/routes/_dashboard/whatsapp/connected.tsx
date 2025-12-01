import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/_dashboard/whatsapp/connected')({
  component: WhatsAppConnectedPage,
});

function WhatsAppConnectedPage() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">WhatsApp Connected Successfully!</CardTitle>
          <CardDescription className="text-base">
            Your WhatsApp Business account has been connected to Threadway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Start creating AI-powered workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Connect your favorite tools and integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Automate conversations with your customers</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate({ to: '/' })}
              className="flex-1"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate({ to: '/integrations' })}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Manage Integrations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
