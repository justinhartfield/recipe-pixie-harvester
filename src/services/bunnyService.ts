
import { ImageUploadResult } from '@/utils/types';
import { apiRateLimiter } from '@/utils/rateLimit';

export class BunnyStorageService {
  private accessKey: string;
  private storageName: string;
  private region: string;
  private baseUrl: string;

  /**
   * Create a new BunnyStorageService
   * @param accessKey Bunny.net Storage Access Key
   * @param storageName Storage Zone Name
   * @param region Storage Region (default: 'de')
   */
  constructor(accessKey: string, storageName: string, region: string = 'de') {
    this.accessKey = accessKey;
    this.storageName = storageName;
    this.region = region;
    this.baseUrl = `https://${region}.storage.bunnycdn.com/${storageName}/`;
  }

  /**
   * Upload a file to Bunny.net storage
   * @param file The file to upload
   * @param path The path within the storage (including filename)
   * @returns Upload result with URL if successful
   */
  public async uploadFile(file: File, path?: string): Promise<ImageUploadResult> {
    try {
      // Generate a path if not provided
      const filePath = path || `recipes/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      
      console.log('Uploading to Bunny.net:', {
        url: `${this.baseUrl}${filePath}`,
        accessKey: this.accessKey ? '***' : 'missing', // Log masked key for debugging
        storageName: this.storageName,
        fileType: file.type,
        fileName: file.name
      });
      
      // Use the rate limiter for the API request
      return await apiRateLimiter.add(async () => {
        const response = await fetch(`${this.baseUrl}${filePath}`, {
          method: 'PUT',
          headers: {
            'AccessKey': this.accessKey,
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Bunny.net upload failed:', response.status, errorText);
          return {
            success: false,
            error: `Upload failed: ${response.status} ${response.statusText || errorText}`
          };
        }

        // Return the public URL
        return {
          success: true,
          url: `https://${this.storageName}.b-cdn.net/${filePath}`
        };
      });
    } catch (error) {
      console.error('Bunny.net upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Delete a file from Bunny.net storage
   * @param path The path of the file to delete
   * @returns True if deletion was successful
   */
  public async deleteFile(path: string): Promise<boolean> {
    try {
      return await apiRateLimiter.add(async () => {
        const response = await fetch(`${this.baseUrl}${path}`, {
          method: 'DELETE',
          headers: {
            'AccessKey': this.accessKey,
          },
        });

        return response.ok;
      });
    } catch (error) {
      console.error('Bunny.net delete error:', error);
      return false;
    }
  }

  /**
   * List files in a directory
   * @param path Directory path
   * @returns Array of file objects
   */
  public async listFiles(path: string = ''): Promise<any[]> {
    try {
      return await apiRateLimiter.add(async () => {
        const response = await fetch(`${this.baseUrl}${path}`, {
          method: 'GET',
          headers: {
            'AccessKey': this.accessKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      });
    } catch (error) {
      console.error('Bunny.net list files error:', error);
      return [];
    }
  }
}

// Export a singleton instance that will be initialized with credentials later
let bunnyStorageService: BunnyStorageService | null = null;

export const initBunnyStorage = (
  accessKey: string,
  storageName: string,
  region: string = 'de'
): BunnyStorageService => {
  console.log('Initializing Bunny Storage with:', {
    storageName,
    region,
    hasAccessKey: !!accessKey
  });
  bunnyStorageService = new BunnyStorageService(accessKey, storageName, region);
  return bunnyStorageService;
};

export const getBunnyStorage = (): BunnyStorageService | null => {
  return bunnyStorageService;
};
