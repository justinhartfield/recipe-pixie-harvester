
/**
 * A utility for implementing API rate limiting
 */
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private delayMs: number;

  /**
   * Create a new rate limiter
   * @param delayMs Delay between requests in milliseconds
   */
  constructor(delayMs = 5000) {
    this.delayMs = delayMs;
  }

  /**
   * Add a function to the rate-limited queue
   * @param fn The function to execute (must return a Promise)
   * @returns A promise that resolves with the result of the function
   */
  public async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Set the delay between requests
   * @param delayMs Delay in milliseconds
   */
  public setDelay(delayMs: number): void {
    this.delayMs = delayMs;
  }

  /**
   * Process the queue of rate-limited functions
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const next = this.queue.shift();

    if (next) {
      try {
        await next();
      } catch (error) {
        console.error('Error in rate-limited function:', error);
      }

      await new Promise(resolve => setTimeout(resolve, this.delayMs));
      this.processQueue();
    }
  }
}

// Create and export a default rate limiter instance
export const apiRateLimiter = new RateLimiter(5000);

/**
 * A decorator for rate-limiting class methods
 * @param delayMs Delay between requests in milliseconds (default: 5000ms)
 */
export function rateLimit(delayMs = 5000) {
  const limiter = new RateLimiter(delayMs);
  
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      return limiter.add(() => originalMethod.apply(this, args));
    };
    
    return descriptor;
  };
}
