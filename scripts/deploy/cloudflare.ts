import Cloudflare from "cloudflare";
import "dotenv/config";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CUSTOM_DOMAINS = Array.from(
  new Set(
    (process.env.CUSTOM_DOMAIN ?? "")
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean)
  )
);
const PROJECT_NAME = process.env.PROJECT_NAME || "moemail";
const DATABASE_NAME = process.env.DATABASE_NAME || "moemail-db";
const KV_NAMESPACE_NAME = process.env.KV_NAMESPACE_NAME || "moemail-kv";
const DATABASE_ID = process.env.DATABASE_ID;

const client = new Cloudflare({
  apiToken: CF_API_TOKEN,
});

export const getPages = async () => {
  const projectInfo = await client.pages.projects.get(PROJECT_NAME, {
    account_id: CF_ACCOUNT_ID,
  });

  return projectInfo;
};

export const createPages = async () => {
  console.log(`🆕 Creating new Cloudflare Pages project: "${PROJECT_NAME}"`);

  const project = await client.pages.projects.create({
    account_id: CF_ACCOUNT_ID,
    name: PROJECT_NAME,
    production_branch: "main",
  });

  console.log("✅ Project created successfully");

  return project;
};

export const syncPagesDomains = async () => {
  if (CUSTOM_DOMAINS.length === 0) {
    return [];
  }

  const domains = [];

  for await (const domain of client.pages.projects.domains.list(PROJECT_NAME, {
    account_id: CF_ACCOUNT_ID,
  })) {
    domains.push(domain);
  }

  const syncedDomains = [];

  for (const customDomain of CUSTOM_DOMAINS) {
    const existingDomain = domains.find((domain) => domain.name === customDomain);

    if (existingDomain) {
      console.log(
        `✨ Pages domain "${customDomain}" already configured (status: ${existingDomain.status || "unknown"})`
      );
      syncedDomains.push(existingDomain);
      continue;
    }

    console.log(`🔗 Adding Pages domain "${customDomain}"...`);

    const createdDomain = await client.pages.projects.domains.create(PROJECT_NAME, {
      account_id: CF_ACCOUNT_ID,
      name: customDomain,
    });

    console.log(`✅ Pages domain "${customDomain}" set successfully`);
    syncedDomains.push(createdDomain);
  }

  const staleDomains = domains.filter(
    (domain) => domain.name && !CUSTOM_DOMAINS.includes(domain.name)
  );

  for (const staleDomain of staleDomains) {
    const staleDomainName = staleDomain.name;

    if (!staleDomainName) {
      continue;
    }

    console.log(
      `🧹 Removing stale Pages domain "${staleDomainName}"...`
    );

    await client.pages.projects.domains.delete(PROJECT_NAME, staleDomainName, {
      account_id: CF_ACCOUNT_ID,
    });

    console.log(`✅ Removed stale Pages domain "${staleDomainName}"`);
  }

  return syncedDomains;
};

export const getDatabase = async () => {
  if (DATABASE_ID) {
    return {
      uuid: DATABASE_ID,
    }
  }

  const database = await client.d1.database.get(DATABASE_NAME, {
    account_id: CF_ACCOUNT_ID,
  });

  return database;
};

export const createDatabase = async () => {
  console.log(`🆕 Creating new D1 database: "${DATABASE_NAME}"`);

  const database = await client.d1.database.create({
    account_id: CF_ACCOUNT_ID,
    name: DATABASE_NAME,
  });

  console.log("✅ Database created successfully");

  return database;
};

export const getKVNamespaceList = async () => {
  const kvNamespaces = [];

  for await (const namespace of client.kv.namespaces.list({
    account_id: CF_ACCOUNT_ID,
  })) {
    kvNamespaces.push(namespace);
  }

  return kvNamespaces;
};

export const createKVNamespace = async () => {
  console.log(`🆕 Creating new KV namespace: "${KV_NAMESPACE_NAME}"`);

  const kvNamespace = await client.kv.namespaces.create({
    account_id: CF_ACCOUNT_ID,
    title: KV_NAMESPACE_NAME,
  });

  console.log("✅ KV namespace created successfully");

  return kvNamespace;
};
