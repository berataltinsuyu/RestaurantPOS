const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const explicitApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const fallbackApiBaseUrls = [
  "http://localhost:5227",
  "http://127.0.0.1:5227",
  "https://localhost:7200",
  "http://localhost:5087",
  "http://127.0.0.1:5087",
];

const apiBaseUrls = explicitApiBaseUrl
  ? [trimTrailingSlash(explicitApiBaseUrl)]
  : fallbackApiBaseUrls;

export const env = {
  apiBaseUrl: apiBaseUrls[0],
  apiBaseUrls,
  defaultBranchCode: import.meta.env.VITE_DEFAULT_BRANCH_CODE || "8547293",
};
