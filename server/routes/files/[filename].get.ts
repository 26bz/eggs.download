export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename');
  if (!filename) {
    throw createError({ statusCode: 400, statusMessage: 'Filename required' });
  }

  const url = FILE_ALLOWLIST[filename];
  if (!url) {
    throw createError({ statusCode: 404, statusMessage: 'File not allowlisted' });
  }

  const result = await syncFileFromGitHub({ filename, url }, { allowList: FILE_ALLOWLIST });

  if (result.lastModified) setHeader(event, 'Last-Modified', result.lastModified);
  if (result.etag) setHeader(event, 'ETag', result.etag);
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);
  setHeader(event, 'Cache-Control', 'public, max-age=60');

  if (!result.data) {
    throw createError({ statusCode: 502, statusMessage: 'Cached file missing after sync' });
  }

  return result.data;
});
