import { ImageUploadResult } from '@/utils/types';
import { apiRateLimiter } from '@/utils/rateLimit';

export class BunnyStorageService {
  private accessKey: string;
  private storageName: string;
  private region: string;
  private pullZoneId: string;
  private baseUrl: string;

  /**
   * Create a new BunnyStorageService
   * @param accessKey Bunny.net Storage Access Key
   * @param storageName Storage Zone Name
   * @param region Storage Region (default: 'de')
   * @param pullZoneId Pull Zone ID (optional)
   */
  constructor(accessKey: string, storageName: string, region: string = 'de', pullZoneId: string = '') {
    this.accessKey = accessKey;
    this.storageName = storageName;
    this.region = region;
    this.pullZoneId = pullZoneId;
    this.baseUrl = `https://${region}.storage.bunnycdn.com/${storageName}/`;
    
    console.log('BunnyStorageService initialized:', {
      hasAccessKey: !!accessKey,
      accessKeyLength: accessKey ? accessKey.length : 0,
      storageName,
      region,
      hasPullZoneId: !!pullZoneId,
      baseUrl: this.baseUrl
    });
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
        hasAccessKey: !!this.accessKey,
        accessKeyFirstChars: this.accessKey ? this.accessKey.substring(0, 5) + '...' : 'missing',
        storageName: this.storageName,
        fileType: file.type,
        fileName: file.name,
        hasPullZoneId: !!this.pullZoneId
      });
      
      // Validate that we have an access key before making the request
      if (!this.accessKey) {
        console.error('Bunny.net upload failed: Access key is missing');
        return {
          success: false,
          error: 'Bunny.net access key is missing'
        };
      }

      // Use the rate limiter for the API request
      return await apiRateLimiter.add(async () => {
        try {
          // Convert the file to an array buffer for the request
          const arrayBuffer = await file.arrayBuffer();
          
          // Create a request with the proper headers
          const response = await fetch(`${this.baseUrl}${filePath}`, {
            method: 'PUT',
            headers: {
              'AccessKey': this.accessKey,
              'Content-Type': file.type || 'application/octet-stream',
              'Accept': '*/*'
            },
            body: arrayBuffer,
          });

          // Log the response headers for debugging
          console.log('Bunny.net response headers:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries([...response.headers.entries()])
          });

          const responseText = await response.text();
          console.log('Bunny.net response text:', responseText);
          
          if (!response.ok) {
            console.error('Bunny.net upload failed:', response.status, responseText);
            return {
              success: false,
              error: `Upload failed: ${response.status} ${response.statusText || responseText}`
            };
          }

          // Construct public URL using pull zone if available
          let publicUrl;
          if (this.pullZoneId) {
            publicUrl = `https://${this.pullZoneId}.b-cdn.net/${filePath}`;
          } else {
            publicUrl = `https://${this.storageName}.b-cdn.net/${filePath}`;
          }
          
          console.log('Bunny.net upload successful:', publicUrl);
          
          // Return the public URL
          return {
            success: true,
            url: publicUrl
          };
        } catch (error) {
          console.error('Bunny.net fetch error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error'
          };
        }
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

  /**
   * Test connection to Bunny.net storage
   * @returns True if connection is successful
   */
  public async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Bunny.net connection...');
      
      return await apiRateLimiter.add(async () => {
        try {
          // Try to list files in the root directory to test connection
          const response = await fetch(`${this.baseUrl}`, {
            method: 'GET',
            headers: {
              'AccessKey': this.accessKey,
              'Accept': 'application/json'
            },
          });

          // Log response details for debugging
          console.log('Bunny.net test connection response:', {
            status: response.status,
            statusText: response.statusText,
          });

          return response.ok;
        } catch (error) {
          console.error('Bunny.net test connection error:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('Bunny.net test connection error:', error);
      return false;
    }
  }
}

// Export a singleton instance that will be initialized with credentials later
let bunnyStorageService: BunnyStorageService | null = null;

export const initBunnyStorage = (
  accessKey: string,
  storageName: string,
  region: string = 'de',
  pullZoneId: string = ''
): BunnyStorageService => {
  console.log('Initializing Bunny Storage with:', {
    storageName,
    region,
    hasAccessKey: !!accessKey,
    accessKeyLength: accessKey ? accessKey.length : 0,
    hasPullZoneId: !!pullZoneId
  });
  
  // Create a new instance with the provided credentials
  bunnyStorageService = new BunnyStorageService(accessKey, storageName, region, pullZoneId);
  return bunnyStorageService;
};

export const getBunnyStorage = (): BunnyStorageService | null => {
  return bunnyStorageService;
};
