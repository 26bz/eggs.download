import type { AllowedFileMap } from '#shared/types/sync';

// Map of filename -> raw.githubusercontent.com URL
// Add entries to allow serving cached copies via /api/files/{filename}
export const FILE_ALLOWLIST: AllowedFileMap = {
  // 'example.json': 'https://raw.githubusercontent.com/owner/repo/branch/path/to/example.json',
};
