import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '../core/firebase';

export class StorageService {
  // Upload evidence or document file
  async uploadFile(
    path: string,
    file: Blob | Uint8Array | ArrayBuffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata: metadata,
    });
    return await getDownloadURL(snapshot.ref);
  }

  // Upload with progress callback
  uploadWithProgress(
    path: string,
    file: Blob | Uint8Array | ArrayBuffer,
    onProgress: (pct: number) => void,
    onComplete: (url: string) => void,
    onError: (err: Error) => void
  ) {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => {
        onError(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        onComplete(downloadUrl);
      }
    );
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }
}

export const storageService = new StorageService();
