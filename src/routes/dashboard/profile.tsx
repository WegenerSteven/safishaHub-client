import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Camera, Mail, MapPin, Phone, User } from 'lucide-react'
import type { User as AuthUser } from '@/services/auth.service';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { authService } from '@/services/auth.service'

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const currentUser = await authService.getCurrentUserProfile();
        setUser(currentUser);
        console.log('User Profile:', currentUser);
        setFormData({
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      }
    }
    fetchProfile();
    console.log("Profile page loaded with user:", user)
  }, [])

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      // Call backend to update profile
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.deleteAccount();
      await authService.logout();
      navigate({ to: "/login" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unkown error");
    } finally {
      setLoading(false);
      setOpen(false);
    }
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

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const result = await authService.uploadAvatar(file);
      setUser(prev => prev ? { ...prev, avatar: result.avatar } : prev);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  // Verification status
  const isVerified = !!user?.email_verified_at || user?.isVerified;

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
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
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
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span>{user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}</span>
                )}
              </div>
              {isEditing && (
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 cursor-pointer">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
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
                <div className={`w-2 h-2 rounded-full mr-2 ${isVerified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-sm text-blue-100">
                  {isVerified ? 'Verified Account' : 'Unverified Account'}
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
                    {user?.phone || 'Not provided'}
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
                    {user?.address || 'Not provided'}
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
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">
              {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
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
          <Button variant="outline" className='cursor-pointer' onClick={() => navigate({ to: "/reset-password" })}>
            Change Password
          </Button>
          <Button variant="outline" className='cursor-pointer'>Two-Factor Authentication</Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
            onClick={() => setOpen(true)}>
            Delete Account
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2 className="text-lg font-semibold">Confirm Account Deletion</h2>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
              </AlertDialogHeader>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <AlertDialogFooter>
                <AlertDialogAction asChild>
                  <Button variant="destructive" className='bg-red-600 cursor-pointer' onClick={handleDelete} disabled={loading}>
                    {loading ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogAction>
                <AlertDialogCancel asChild>
                  <Button variant="outline" className='border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer' onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
