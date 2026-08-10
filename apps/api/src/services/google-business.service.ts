import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { google } from "googleapis";
import { env } from "../config/env.js";
import { GoogleBusinessConnectionModel } from "../models/google-business-connection.model.js";
import { GoogleReviewModel } from "../models/google-review.model.js";

const scope = "https://www.googleapis.com/auth/business.manage";
const stars: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const encryptionKey = () => createHash("sha256").update(env.JWT_SECRET).digest();
const encrypt = (text: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  return `${iv.toString("base64url")}.${Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
};
const decrypt = (value: string) => {
  const [iv, content, tag] = value.split(".");
  if (!iv || !content || !tag) throw new Error("Stored Google token is invalid.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(content, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

export function googleIsConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI);
}
export function createGoogleOAuthClient() {
  if (!googleIsConfigured()) throw new Error("Google Business Profile OAuth is not configured.");
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}
export function getGoogleAuthorizationUrl(state: string) {
  return createGoogleOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [scope],
    state,
  });
}

async function googleFetch<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Google Business Profile API error (${response.status}).`);
  return response.json() as Promise<T>;
}
async function accessToken() {
  const connection = await GoogleBusinessConnectionModel.findOne({ isConnected: true }).select(
    "+encryptedRefreshToken",
  );
  if (!connection) throw new Error("Google Business Profile is not connected.");
  const client = createGoogleOAuthClient();
  client.setCredentials({ refresh_token: decrypt(connection.encryptedRefreshToken) });
  const result = await client.getAccessToken();
  if (!result.token) throw new Error("Unable to refresh the Google access token.");
  return { connection, token: result.token };
}

export async function connectFromCode(code: string, adminId: string) {
  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token)
    throw new Error(
      "Google did not return a refresh token. Disconnect this app from Google then connect again.",
    );
  client.setCredentials(tokens);
  const token = tokens.access_token;
  if (!token) throw new Error("Google did not return an access token.");
  const accounts = await googleFetch<{ accounts?: Array<{ name: string; accountName?: string }> }>(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    token,
  );
  const account = accounts.accounts?.[0];
  if (!account)
    throw new Error("No Google Business Profile account is available for this Google user.");
  const locations = await googleFetch<{
    locations?: Array<{ name: string; locationName?: string }>;
  }>(`https://mybusiness.googleapis.com/v4/${account.name}/locations?pageSize=100`, token);
  const location = locations.locations?.[0];
  if (!location) throw new Error("No Business Profile location is available for this account.");
  const [, accountId] = account.name.split("/");
  const [, locationId] = location.name.split("/");
  return GoogleBusinessConnectionModel.findOneAndUpdate(
    {},
    {
      adminId,
      accountId,
      accountName: account.accountName ?? account.name,
      locationId,
      locationName: location.locationName ?? location.name,
      locationResourceName: location.name,
      encryptedRefreshToken: encrypt(tokens.refresh_token),
      isConnected: true,
      lastSyncError: undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function syncGoogleReviews() {
  const { connection, token } = await accessToken();
  let pageToken = "";
  let created = 0;
  let updated = 0;
  let total = 0;
  let averageRating = 0;
  let totalReviewCount = 0;
  do {
    const query = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
    if (pageToken) query.set("pageToken", pageToken);
    const result = await googleFetch<{
      reviews?: Array<any>;
      nextPageToken?: string;
      averageRating?: number;
      totalReviewCount?: number;
    }>(
      `https://mybusiness.googleapis.com/v4/${connection.locationResourceName}/reviews?${query}`,
      token,
    );
    averageRating = result.averageRating ?? averageRating;
    totalReviewCount = result.totalReviewCount ?? totalReviewCount;
    for (const review of result.reviews ?? []) {
      const rating = stars[review.starRating];
      if (!rating) continue;
      const outcome = await GoogleReviewModel.updateOne(
        { googleReviewId: review.reviewId },
        {
          $set: {
            resourceName: review.name,
            reviewer: {
              displayName: review.reviewer?.displayName,
              profilePhotoUrl: review.reviewer?.profilePhotoUrl,
              isAnonymous: review.reviewer?.isAnonymous,
            },
            starRating: rating,
            comment: review.comment ?? "",
            reviewCreatedAt: review.createTime ? new Date(review.createTime) : undefined,
            googleUpdatedAt: review.updateTime ? new Date(review.updateTime) : undefined,
            ownerReply: review.reviewReply
              ? {
                  comment: review.reviewReply.comment,
                  updatedAt: review.reviewReply.updateTime
                    ? new Date(review.reviewReply.updateTime)
                    : undefined,
                }
              : undefined,
            googleStatus: "ACTIVE",
            lastSyncedAt: new Date(),
          },
          $setOnInsert: { moderation: { isPublic: false, isFeatured: false, displayOrder: 0 } },
        },
        { upsert: true },
      );
      outcome.upsertedCount ? created++ : updated++;
      total++;
    }
    pageToken = result.nextPageToken ?? "";
  } while (pageToken);
  connection.lastSyncedAt = new Date();
  connection.lastSyncStatus = "SUCCESS";
  connection.lastSyncError = undefined;
  connection.reviewSummary = { averageRating, totalReviewCount };
  await connection.save();
  return {
    created,
    updated,
    fetched: total,
    averageRating,
    totalReviewCount,
    lastSyncedAt: connection.lastSyncedAt,
  };
}
