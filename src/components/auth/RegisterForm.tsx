import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { Eye, EyeOff } from 'lucide-react'
import { GoogleButton } from './GoogleButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import type { RegisterRequest } from '@/interfaces/auth/User.interface'
import { useModal } from '@/contexts/ModalContext'

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  accountType: 'customer' | 'service_provider'
  agreeToTerms: boolean
}

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void>
  onGoogleLogin?: () => void
  onSuccess?: () => void
  isLoading?: boolean
}

export function RegisterForm({
  onSubmit,
  onGoogleLogin,
  onSuccess,
  isLoading = false,
}: RegisterFormProps) {
  const { openLogin } = useModal()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'customer' as const,
      agreeToTerms: false,
    } as RegisterFormData,
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value)
      } else {
        // Default implementation using auth service
        try {
          console.log('Form submission - Form values:', value);

          const registerData: RegisterRequest = {
            first_name: value.firstName,
            last_name: value.lastName,
            email: value.email,
            password: value.password,
            role: value.accountType,
          }

          console.log('Form submission - RegisterRequest data:', registerData);

          console.log('Form submission - Final data to send:', registerData);
          await register(registerData)
          onSuccess?.()
        } catch (error: any) {
          console.error('Registration failed:', error)
          console.error('Error details:', {
            message: error?.message,
            response: error?.response,
            data: error?.response?.data,
            status: error?.response?.status
          })
          throw error
        }
      }
    },
  })

  return (
    <div className="space-y-6">
      {/* Switch to login */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={openLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Register Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <Label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </Label>
            <form.Field
              name="firstName"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'First name is required'
                  if (value.length < 2)
                    return 'First name must be at least 2 characters'
                  return undefined
                },
              }}
            >
              {(field) => (
                <>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
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

          {/* Last Name */}
          <div>
            <Label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </Label>
            <form.Field
              name="lastName"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Last name is required'
                  if (value.length < 2)
                    return 'Last name must be at least 2 characters'
                  return undefined
                },
              }}
            >
              {(field) => (
                <>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
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
        </div>

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
                  placeholder="john.doe@example.com"
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

        {/* Account Type */}
        <div>
          <Label
            htmlFor="accountType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Account Type
          </Label>
          <form.Field name="accountType">
            {(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as 'customer' | 'service_provider')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">
                    Customer - Book car wash services
                  </SelectItem>
                  <SelectItem value="service_provider">
                    Service Provider - Offer car wash services
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </form.Field>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 gap-4">
          {/* Password */}
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
                  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value))
                    return 'Password must contain both uppercase and lowercase letters'
                  if (!/(?=.*\d)/.test(value))
                    return 'Password must contain at least one number'
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
                      placeholder="Create a strong password"
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

          {/* Confirm Password */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </Label>
            <form.Field
              name="confirmPassword"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  if (!value) return 'Please confirm your password'
                  const password = fieldApi.form.getFieldValue('password')
                  if (value !== password) return 'Passwords do not match'
                  return undefined
                },
              }}
            >
              {(field) => (
                <>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`pr-10 ${field.state.meta.errors.length > 0 && field.state.meta.isTouched ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
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
        </div>

        {/* Terms Agreement */}
        <div>
          <form.Field
            name="agreeToTerms"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'You must agree to the terms and conditions'
                return undefined
              },
            }}
          >
            {(field) => (
              <>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                    className="mt-1"
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    I agree to the{' '}
                    <a
                      href="/terms"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Privacy Policy
                    </a>
                  </Label>
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
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
        onClick={
          onGoogleLogin || (() => console.log('Google register clicked'))
        }
        disabled={isLoading}
      />
    </div>
  )
}
