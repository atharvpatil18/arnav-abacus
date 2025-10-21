'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ParentEventsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button>View Calendar</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Register for school events and activities</p>
            <div className="space-y-2">
              <div className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">No upcoming events</h3>
                    <p className="text-sm text-gray-500">Check back later</p>
                  </div>
                  <Badge variant="outline">Soon</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">View past event participation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
