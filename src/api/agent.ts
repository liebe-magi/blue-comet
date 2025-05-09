/**
 * Module for initializing and managing BskyAgent
 */
import { BskyAgent } from '@atproto/api';
import { BlueskyAuthCredentials } from '../types';

// Default service URL for Bluesky
const DEFAULT_SERVICE = 'https://bsky.social';

/**
 * Class for managing Bluesky agent and API
 */
export class BlueskyAgentManager {
  private static instance: BlueskyAgentManager;
  private agent: BskyAgent;
  private isAuthenticated: boolean = false;

  /**
   * Constructor - Initialize BskyAgent with a service URL
   * @param service Service URL (default value if omitted)
   */
  private constructor(service: string = DEFAULT_SERVICE) {
    this.agent = new BskyAgent({ service });
  }

  /**
   * Get the singleton instance
   * @param service Service URL (only effective on first call)
   * @returns Instance of BlueskyAgentManager
   */
  public static getInstance(service?: string): BlueskyAgentManager {
    if (!BlueskyAgentManager.instance) {
      BlueskyAgentManager.instance = new BlueskyAgentManager(service);
    }
    return BlueskyAgentManager.instance;
  }

  /**
   * Login to Bluesky
   * @param credentials Authentication information
   * @returns Authentication result
   */
  public async login(credentials: BlueskyAuthCredentials) {
    try {
      const result = await this.agent.login(credentials);
      this.isAuthenticated = true;
      return {
        success: true,
        did: result.data.did,
        handle: result.data.handle,
      };
    } catch (error) {
      this.isAuthenticated = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check session state
   * @returns true if the session is valid
   */
  public isSessionValid(): boolean {
    return this.isAuthenticated && !!this.agent.session;
  }

  /**
   * Sign out
   */
  public logout(): void {
    // Since the session property is read-only, create a new agent
    // to reset the authentication state
    const service = this.agent.service.toString();
    this.agent = new BskyAgent({ service });
    this.isAuthenticated = false;
  }

  /**
   * Get the BskyAgent instance
   * @returns BskyAgent instance
   */
  public getAgent(): BskyAgent {
    return this.agent;
  }
}

// Singleton instance for export
export const blueskyAgent = BlueskyAgentManager.getInstance();
