import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BusinessRegistrationPrompt() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">Please register your business first</h3>
          <p className="text-muted-foreground">
            You need to register your business before you can manage services.
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard/business/register'}
            className="mt-4"
          >
            Register Business
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
