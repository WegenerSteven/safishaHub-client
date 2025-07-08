import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { GoogleButton } from './GoogleButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { authService } from '@/services/auth.service'
import { useModal } from '@/contexts/ModalContext'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>
  onGoogleLogin?: () => void
  onSuccess?: () => void
  isLoading?: boolean
  showTabs?: boolean
}

export function LoginForm({
  onSubmit,
  onGoogleLogin,
  onSuccess,
  isLoading = false,
  showTabs = true,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const { openRegister } = useModal()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    } as LoginFormData,
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value)
      } else {
        // Default implementation using auth service
        try {
          await authService.login({
            email: value.email,
            password: value.password,
          })
          onSuccess?.()
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      }
    },
  })

  return (
    <div className="space-y-6">
      {/* Tab Navigation - only show if requested */}
      {showTabs && (
        <div className="flex bg-gray-100 rounded-lg p-1">
          <div className="flex-1 text-center py-2 px-4 bg-white rounded-md shadow-sm cursor-pointer">
            <span className="text-sm font-medium text-gray-900">Logi</span>
          </div>
          <Link
            to="/register"
            className="flex-1 text-center py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600">Register</span>
          </Link>
        </div>
      )}

      {/* Modal version - switch to register */}
      {!showTabs && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={openRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Email Field */}
        <div>
          <Label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </Label>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email is required'
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value))
                  return 'Please enter a valid email address'
                return undefined
              },
            }}
          >
            {(field) => (
              <>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-500'
                      : ''
                  }
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </>
            )}
          </form.Field>
        </div>

        {/* Password Field */}
        <div>
          <Label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </Label>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Password is required'
                if (value.length < 6)
                  return 'Password must be at least 6 characters'
                return undefined
              },
            }}
          >
            {(field) => (
              <>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`pr-10 ${field.state.meta.errors.length > 0 && field.state.meta.isTouched ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </>
            )}
          </form.Field>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <form.Field name="rememberMe">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
            )}
          </form.Field>
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleButton
        onClick={onGoogleLogin || (() => console.log('Google login clicked'))}
        disabled={isLoading}
      />
    </div>
  )
}
