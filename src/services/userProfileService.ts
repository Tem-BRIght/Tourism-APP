import { ref, set, get, update, child } from 'firebase/database';
import { db } from '../firebase';

export interface UserName {
  firstname?: string;
  surname?: string;
  suffix?: string;
}

export interface UserProfile {
  name?: UserName;
  email?: string;
  dateOfBirth?: string;
  nickname?: string;
  img?: string | null;
  nationality?: string;
  createdAt?: string;
}

export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const dataToWrite = {
      name: profileData.name || {
        firstname: (profileData as any).firstName || '',
        surname: (profileData as any).surname || '',
        suffix: (profileData as any).suffix || '',
      },
      email: profileData.email || (profileData as any).email || '',
      dateOfBirth: profileData.dateOfBirth || (profileData as any).dateOfBirth || '',
      nationality: (profileData as any).nationality || '',
      nickname: profileData.nickname || (profileData as any).username || '',
      img: profileData.img || (profileData as any).profilePic || null,
      createdAt: new Date().toISOString(),
    };

    await set(ref(db, `users/${userId}`), dataToWrite);
    console.log('User profile created successfully in Realtime DB:', userId);
  } catch (error) {
    console.error('Error creating user profile:', error);
    console.error('Error details:', (error as any).code, (error as any).message);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await get(child(ref(db), `users/${userId}`));
    
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    // Build a flattened updates object so we only write provided fields
    // and avoid inadvertently deleting nested keys when partial objects are provided.
    const updates: Record<string, any> = {};

    const rootPath = `users/${userId}`;

    Object.keys(profileData).forEach((key) => {
      const val = (profileData as any)[key];
      if (val === undefined) return; // skip undefined to avoid deletions

      if (key === 'name' && val && typeof val === 'object') {
        Object.keys(val).forEach((subKey) => {
          const subVal = (val as any)[subKey];
          if (subVal === undefined) return;
          updates[`${rootPath}/name/${subKey}`] = subVal;
        });
      } else {
        updates[`${rootPath}/${key}`] = val;
      }
    });

    if (Object.keys(updates).length === 0) {
      console.log('No valid fields to update for user:', userId);
      return;
    }

    await update(ref(db), updates);
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        await updateUserProfile(userId, { img: base64String });
        resolve(base64String);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};
