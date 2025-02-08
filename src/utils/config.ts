import assert from 'assert';
import { parse } from 'toml';
import { getWorkdirPath } from './workdir.js';
import { copyFileSync, existsSync, readFileSync } from 'fs';

/**
 * TOML構成の設定ファイルに対応する型定義。
 * 命名規則は snake_case とし、ESLint の naming-convention は一時的に無効化しています。
 */
export interface Config {
  /* eslint-disable @typescript-eslint/naming-convention */
  /** チャンネルID */
  channel_id: string;
  /** テンプレートチャンネルID */
  template_channel_id: string;
  /** テンプレートメッセージID */
  template_message_id: string;
  /* eslint-enable @typescript-eslint/naming-convention */
}

/**
 * config.toml が存在しない場合は config.default.toml をコピーします。
 */
if (!existsSync(getWorkdirPath('config.toml'))) {
  copyFileSync(
    getWorkdirPath('config.default.toml'),
    getWorkdirPath('config.toml'),
  );
}

/**
 * TOMLをパースして Config 型としてエクスポート
 */
export const config: Config = parse(
  readFileSync(getWorkdirPath('config.toml'), 'utf-8'),
) as Config;

/**
 * 必要な設定値が型通りに存在するかアサートします。
 */

assert(
  typeof config.channel_id === 'string' && config.channel_id.length > 0,
  'channel_id is required and must be a non-empty string.',
);

assert(
  typeof config.template_channel_id === 'string' &&
    config.template_channel_id.length > 0,
  'template_channel_id is required and must be a non-empty string.',
);

assert(
  typeof config.template_message_id === 'string' &&
    config.template_message_id.length > 0,
  'template_message_id is required and must be a non-empty string.',
);
