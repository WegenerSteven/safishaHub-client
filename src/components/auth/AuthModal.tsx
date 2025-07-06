import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useModal } from '@/contexts/ModalContext'

export function AuthModal() {
  const { isLoginOpen, isRegisterOpen, closeAll } = useModal()
  const isOpen = isLoginOpen || isRegisterOpen
  const defaultTab = isLoginOpen ? 'login' : 'register'

  const handleSuccess = () => {
    closeAll()
    // Trigger auth state update
    window.dispatchEvent(new CustomEvent('auth-change'))
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeAll}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome to SafishaHub
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="text-sm font-medium">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm font-medium">
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm showTabs={false} onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm showTabs={false} onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
