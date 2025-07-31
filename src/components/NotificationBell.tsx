import React from 'react';
import { useNotifications } from '@/contexts/notification-context';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
// Removed Dialog imports for dropdown approach

interface Notification {
  id: string | number;
  title: string;
  message: string;
  status: 'unread' | 'read';
  created_at?: string;
}


const NotificationBell = () => {
  const { notifications, markAsRead } = useNotifications() || { notifications: [] as Notification[], markAsRead: { mutate: () => { } } };
  const unread = notifications?.filter((n: Notification) => n.status === 'unread') || [];
  const [open, setOpen] = React.useState(false);
  // const [selected, setSelected] = React.useState<Notification | null>(null);

  function formatDistanceToNow(date: Date, { addSuffix }: { addSuffix: boolean }): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
      [60, 'second'],
      [60, 'minute'],
      [24, 'hour'],
      [30, 'day'],
      [12, 'month'],
      [Number.POSITIVE_INFINITY, 'year'],
    ];
    let value = seconds;
    let unit: Intl.RelativeTimeFormatUnit = 'second';
    for (let i = 0; i < intervals.length; i++) {
      if (Math.abs(value) < intervals[i][0]) {
        unit = intervals[i][1];
        break;
      }
      value = value / intervals[i][0];
    }
    value = Math.floor(value);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    return rtf.format(-value, unit) + (addSuffix ? '' : '');
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center sm:justify-end pt-4 sm:pt-0"
          onClick={() => setOpen(false)}
          aria-label="Close notifications overlay"
        >
          {/* Dropdown panel, centered on mobile, right on desktop */}
          <div
            className="w-[95vw] max-w-xs sm:max-w-sm bg-white border border-border rounded-lg shadow-lg mt-2 sm:mt-8"
            style={{ maxHeight: 'calc(4 * 4.5rem + 3px)', overflowY: 'auto', zIndex: 50 }}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-lg font-bold">Notifications</span>
            </div>
            <div className="divide-y divide-border">
              {notifications?.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : (
                unread.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`flex flex-col gap-1 px-2 py-2 transition-colors ${n.status === "unread" ? "bg-muted/30 font-semibold" : "hover:bg-muted/20"}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{n.title}</span>
                      {n.created_at && (
                        <span className="text-xs text-muted-foreground ml-2">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Button
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-7 w-14 text-xs px-0"
                        onClick={() => {
                          alert(n.message); // Show message in alert for dropdown version
                          if (n.status === 'unread') markAsRead.mutate(n.id);
                        }}
                      >
                        Read
                      </Button>
                      {n.status === 'unread' && (
                        <Button
                          size="icon"
                          className="bg-green-600 hover:bg-green-700 text-white h-7 w-20 text-xs px-0"
                          onClick={() => markAsRead.mutate(n.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <div className="relative z-50">
        <Button
          variant='ghost'
          size='icon'
          className='relative'
          aria-label="Open notifications"
          onClick={() => setOpen((v) => !v)}
        >
          <Bell className='h-5 w-5' />
          {unread.length > 0 && (
            <span
              className="absolute -top-2 -right-2 flex items-center justify-center bg-red-600 text-white rounded-full font-bold text-sm h-6 w-6 border-2 border-white ring-2 ring-red-400 shadow-lg z-10"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              {unread.length}
            </span>
          )}
        </Button>
      </div>
    </>
  );
};

export default NotificationBell;
