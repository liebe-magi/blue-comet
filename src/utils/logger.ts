/**
 * ロガーユーティリティ
 * コンソール出力をラップし、環境に応じた出力制御を可能にするシンプルなロガー
 */

/**
 * ログレベルの定義
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * 現在の環境がプロダクション環境かどうかを判定
 * 将来的には環境変数などを使って設定することも可能
 */
const isProduction = (): boolean => {
  // processオブジェクトがundefinedの場合があるため、より安全な判定方法を使用
  return typeof window !== 'undefined' && window.location?.hostname !== 'localhost';
};

/**
 * エラーログを出力する関数
 * @param message ログメッセージ
 * @param optionalParams 追加パラメータ
 */
export const logError = (message: string, ...optionalParams: unknown[]): void => {
  // プロダクション環境でもエラーは出力する
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${message}`, ...optionalParams);
};

/**
 * 警告ログを出力する関数
 * @param message ログメッセージ
 * @param optionalParams 追加パラメータ
 */
export const logWarn = (message: string, ...optionalParams: unknown[]): void => {
  // プロダクション環境でも警告は出力する
  // eslint-disable-next-line no-console
  console.warn(`[WARN] ${message}`, ...optionalParams);
};

/**
 * 情報ログを出力する関数
 * @param message ログメッセージ
 * @param optionalParams 追加パラメータ
 */
export const logInfo = (message: string, ...optionalParams: unknown[]): void => {
  // プロダクション環境では情報ログは出力しない
  if (!isProduction()) {
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${message}`, ...optionalParams);
  }
};

/**
 * デバッグログを出力する関数
 * @param message ログメッセージ
 * @param optionalParams 追加パラメータ
 */
export const logDebug = (message: string, ...optionalParams: unknown[]): void => {
  // プロダクション環境ではデバッグログは出力しない
  if (!isProduction()) {
    // eslint-disable-next-line no-console
    console.debug(`[DEBUG] ${message}`, ...optionalParams);
  }
};

/**
 * ロガー関数をまとめたオブジェクト
 */
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
};
