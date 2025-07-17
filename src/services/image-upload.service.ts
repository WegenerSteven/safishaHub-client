import { apiService } from './api';

export async function uploadBusinessImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Use apiService to ensure auth token is included
  const response = await apiService.post(
    '/file-upload/business-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    }
  );
  // Return the image URL from the backend
  if (typeof response === 'object' && response !== null && 'url' in response) {
    return (response as { url: string }).url;
  }
  throw new Error('Invalid response from server: missing image URL');
}
