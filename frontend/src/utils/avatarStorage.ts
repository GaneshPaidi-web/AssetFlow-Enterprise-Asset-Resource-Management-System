const AVATAR_PREFIX = 'avatar_';
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function getStoredAvatar(userId: string): string | null {
  return localStorage.getItem(`${AVATAR_PREFIX}${userId}`);
}

export function saveAvatar(userId: string, dataUrl: string): void {
  localStorage.setItem(`${AVATAR_PREFIX}${userId}`, dataUrl);
}

export function removeAvatar(userId: string): void {
  localStorage.removeItem(`${AVATAR_PREFIX}${userId}`);
}

export function mergeAvatar<T extends { id: string; avatar?: string }>(user: T): T {
  const stored = getStoredAvatar(user.id);
  return stored ? { ...user, avatar: stored } : user;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      reject(new Error('Image must be smaller than 2 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
