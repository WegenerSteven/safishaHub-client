import { useNotifications } from '@/contexts/notification-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  status: 'unread' | 'read';
  created_at?: string;
}

const NotificationBell = () => {
  const { notifications, markAsRead } = useNotifications() || { notifications: [] as Notification[], markAsRead: { mutate: () => { } } }
  const unread = notifications?.filter((n: Notification) => n.status === 'unread') || [];
  // Simple implementation using Intl.RelativeTimeFormat
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />{unread.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-500 text-white rounded-full text-xs px-1 border border-white">
              {unread.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto shadow-lg rounded-lg p-0">
        {notifications?.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          notifications.map(n => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col gap-1 px-4 py-2 cursor-pointer transition-colors ${n.status === "unread" ? "bg-muted/30 font-semibold" : "hover:bg-muted/20"}`}
              onClick={() => markAsRead.mutate()}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{n.title}</span>
                {n.created_at && (
                  <span className="text-xs text-muted-foreground ml-2">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
