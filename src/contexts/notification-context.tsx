import { notificationsService } from "@/services";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useAuth } from "./auth-context";

const NotificationContext = createContext(null)
import type { PropsWithChildren } from "react";

export function NotificationProvider({ children }: PropsWithChildren<{}>) {
  const { user } = useAuth();
  const queryClient = useQueryClient()
  const {data: notifications = [], refetch} = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
    enabled: !!user,
    refetchInterval: !!user ? 30000 : false, //poll every 30s
  })
  const markAsRead = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <NotificationContext.Provider value={{notifications, refetch, markAsRead}}>
      {children}
    </NotificationContext.Provider>
  )
}
export function useNotifications(){
  return useContext(NotificationContext)
}