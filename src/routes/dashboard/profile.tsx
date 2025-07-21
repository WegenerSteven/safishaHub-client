import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Camera, Mail, MapPin, Phone, User } from 'lucide-react'
import type {User as AuthUser} from '@/services/auth.service';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {  authService } from '@/services/auth.service'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: '', // Would come from API
        address: '', // Would come from API
      })
    }
  }, [])

  const handleSave = () => {
    // Here you would typically call an API to update the profile
    console.log('Saving profile:', formData)
    setIsEditing(false)
    // Update user state with new data
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: '',
        address: '',
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Loading profile...
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user?.first_name?.[0] || 'U'}
                {user?.last_name?.[0] || ''}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-blue-100 capitalize">
                {user.role?.replace('_', ' ') || 'User'}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-blue-100">
                  {user.isVerified ? 'Verified Account' : 'Unverified Account'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <Label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </Label>
              {isEditing ? (
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="Enter your first name"
                />
              ) : (
                <div className="flex items-center space-x-2 py-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user?.first_name || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </Label>
              {isEditing ? (
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Enter your last name"
                />
              ) : (
                <div className="flex items-center space-x-2 py-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user?.last_name || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              ) : (
                <div className="flex items-center space-x-2 py-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user?.email || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center space-x-2 py-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {formData.phone || 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter your address"
                />
              ) : (
                <div className="flex items-center space-x-2 py-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {formData.address || 'Not provided'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Account Type:</span>
            <span className="ml-2 font-medium capitalize">
              {user?.role?.replace('_', ' ') || 'User'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Member Since:</span>
            <span className="ml-2 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Verification Status:</span>
            <span
              className={`ml-2 font-medium ${user?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}
            >
              {user?.isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Two-Factor Authentication</Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}
