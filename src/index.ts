import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Message,
  GuildMember,
} from 'discord.js';
import { nowait } from './utils/utils.js';
import { config } from './utils/config.js';
import { logger } from './utils/log.js';

/**
 * Bot クライアントを初期化。
 * guildMemberAdd イベントを扱うので GuildMembers のIntentが必要です。
 * @returns Bot クライアント
 */
function createBotClient(): Client {
  const client: Client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  return client;
}

/**
 * 新メンバーが参加したときの処理をセットアップします。
 * @param client Discord.js Client
 */
function setupGuildMemberAddEvent(client: Client): void {
  client.on(
    'guildMemberAdd',
    nowait(async (member: GuildMember): Promise<void> => {
      try {
        // 指定されたチャンネルを取得
        const channel = member.guild.channels.cache.get(config.channel_id);
        if (!channel || !(channel instanceof TextChannel)) {
          logger.error(
            '指定された channel_id がテキストチャンネルとして見つかりません。',
          );
          return;
        }

        // テンプレートメッセージを取得
        const templateChannel = member.guild.channels.cache.get(
          config.template_channel_id,
        );
        if (!templateChannel || !(templateChannel instanceof TextChannel)) {
          logger.error(
            '指定された template_channel_id がテキストチャンネルとして見つかりません。',
          );
          return;
        }

        const templateMessage: Message = await templateChannel.messages.fetch(
          config.template_message_id,
        );
        if (!templateMessage) {
          logger.error(
            '指定された template_message_id に合致するメッセージが見つかりません。',
          );
          return;
        }

        // テンプレート本文を取得
        const templateContent: string = templateMessage.content;

        // メンション (例: <@123456789012345678>)
        const mention: string = member.toString();

        // ニックネーム(サーバーでの表示名)。設定が無い場合はユーザー名
        const nickname: string = member.displayName;

        // テンプレート中にプレースホルダーを仕込む例
        // 例えば {userMention} や {userNickname} を置換
        const finalMessage: string = templateContent
          .replace('{userMention}', mention)
          .replace('{userNickname}', nickname);

        // チャンネルに送信
        await channel.send(finalMessage);
        logger.log('新規メンバーを歓迎しました:', member.user.tag);
      } catch (error: unknown) {
        logger.error('guildMemberAdd イベント内でエラーが発生しました:', error);
      }
    }),
  );
}

/**
 * メイン処理を実行する関数
 */
const client: Client = createBotClient();

// Bot が準備完了した際に呼ばれる
client.once('ready', () => {
  logger.log(`Bot ログイン完了: ${client.user?.tag ?? 'UnknownUser'}`);
});

// guildMemberAdd イベント処理をセットアップ
setupGuildMemberAddEvent(client);

// Bot にログイン
await client.login(process.env.DISCORD_TOKEN);
