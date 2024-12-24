import {
  Client,
  Account,
  ID,
  Avatars,
  OAuthProvider,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
  platformId: "com.oiketerio.app",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platformId);

export const avatar = new Avatars(client);
export const account = new Account(client);

export const login = async () => {
  try {
    const redirectUri = Linking.createURL("/");

    console.log("Redirect URI = ", redirectUri);

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );

    console.log("OAuth Token Response token = ", response);

    if (!response) throw new Error("Failed to login");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    console.log("Browser Result = ", browserResult);

    if (browserResult.type !== "success") {
      throw new Error("Failed to login");
    }

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    console.log("Secret = ", secret);
    console.log("UserId = ", userId);

    if (!secret || !userId) {
      throw new Error("Failed to login");
    }

    const session = account.createSession(secret, userId);

    if (!session) {
      throw new Error("Failed to login");
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const response = await account.get();

    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);

      return { ...response, avatar: userAvatar.toString() };
    }
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};
