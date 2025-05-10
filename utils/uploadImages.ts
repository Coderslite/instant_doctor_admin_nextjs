// utils/uploadImages.ts
import { storage } from '@/firebase/clientApp';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImages(images: File[]): Promise<string[]> {
  const uploadPromises = images.map(async (image) => {
    const storageRef = ref(storage, `products/${Date.now()}-${image.name}`);
    await uploadBytes(storageRef, image);
    return await getDownloadURL(storageRef);
  });

  return Promise.all(uploadPromises);
}