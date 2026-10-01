// SERVICE - Điều phối SmartCA Client + tự động refresh access_token
import { SmartCaHttpClient } from "./SmartCaClient";
import type {
  SmartCaClient,
  SmartCaEnv,
  SmartCaTokenPair,
} from "../../types/smartcaTypes";

export interface SmartCaClientConfig {
  env: SmartCaEnv;
  clientId: string;
  clientSecret: string;
}

/** Tạo client theo môi trường (demo | production) */
export function createSmartCaClient(
  config: SmartCaClientConfig,
): SmartCaClient {
  return new SmartCaHttpClient({
    env: config.env,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  });
}

/** Token còn hiệu lực hay không (đã trừ biên an toàn khi tính expiresAt) */
export function isTokenUsable(pair: SmartCaTokenPair | null): boolean {
  if (!pair) return false;
  return Date.now() < pair.accessTokenExpiresAt;
}

/**
 * Đảm bảo access_token còn hạn; hết hạn thì refresh tự động.
 * Ném lỗi nếu refresh thất bại (bắt người dùng đăng nhập lại).
 */
export async function ensureValidToken(
  client: SmartCaClient,
  pair: SmartCaTokenPair | null,
): Promise<SmartCaTokenPair> {
  if (isTokenUsable(pair)) return pair as SmartCaTokenPair;
  if (!pair?.refreshToken) {
    throw new Error(
      "Chưa đăng nhập SmartCA - vui lòng cấu hình và đăng nhập trước khi ký số",
    );
  }
  return client.refresh(pair.refreshToken);
}

/** Kiểm tra kết nối: login -> list credential -> info đầu tiên */
export async function testSmartCaConnection(
  client: SmartCaClient,
  username: string,
  password: string,
): Promise<{
  credential: Awaited<ReturnType<SmartCaClient["getCredentialInfo"]>>;
  uid: string;
}> {
  const pair = await client.login(username, password);
  const userInfo = await client.getUserInfo(pair.accessToken);
  const ids = await client.listCredentials(pair.accessToken);
  if (ids.length === 0) {
    throw new Error(
      "Tài khoản SmartCA chưa có chứng thư số nào (credential) - liên hệ VNPT để đăng ký",
    );
  }
  const credential = await client.getCredentialInfo(pair.accessToken, ids[0]);
  return { credential, uid: userInfo.uid };
}
