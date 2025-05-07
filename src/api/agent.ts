/**
 * BskyAgentの初期化・管理を行うモジュール
 */
import { BskyAgent } from '@atproto/api';
import { BlueskyAuthCredentials } from '../types';

// BlueskyのデフォルトサービスURL
const DEFAULT_SERVICE = 'https://bsky.social';

/**
 * BlueskyエージェントとAPIを管理するクラス
 */
export class BlueskyAgentManager {
  private static instance: BlueskyAgentManager;
  private agent: BskyAgent;
  private isAuthenticated: boolean = false;

  /**
   * コンストラクタ - サービスURLを指定してBskyAgentを初期化
   * @param service サービスURL（省略時はデフォルト値）
   */
  private constructor(service: string = DEFAULT_SERVICE) {
    this.agent = new BskyAgent({ service });
  }

  /**
   * シングルトンインスタンスの取得
   * @param service サービスURL（初回のみ有効）
   * @returns BlueskyAgentManagerのインスタンス
   */
  public static getInstance(service?: string): BlueskyAgentManager {
    if (!BlueskyAgentManager.instance) {
      BlueskyAgentManager.instance = new BlueskyAgentManager(service);
    }
    return BlueskyAgentManager.instance;
  }

  /**
   * Blueskyにログイン
   * @param credentials 認証情報
   * @returns 認証結果
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
   * セッションの状態を確認
   * @returns セッションが有効な場合はtrue
   */
  public isSessionValid(): boolean {
    return this.isAuthenticated && !!this.agent.session;
  }

  /**
   * サインアウト
   */
  public logout(): void {
    // sessionプロパティは読み取り専用なので、新しいエージェントを作成して
    // 認証状態をリセットする
    const service = this.agent.service.toString();
    this.agent = new BskyAgent({ service });
    this.isAuthenticated = false;
  }

  /**
   * BskyAgentインスタンスの取得
   * @returns BskyAgentインスタンス
   */
  public getAgent(): BskyAgent {
    return this.agent;
  }
}

// エクスポート用のシングルトンインスタンス
export const blueskyAgent = BlueskyAgentManager.getInstance();
