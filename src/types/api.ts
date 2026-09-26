// Error body every API route returns: { error: { code, message, issues? } }
export type ApiIssue = { path: string; message: string };

export type ApiErrorBody = { error: { code: string; message: string; issues?: ApiIssue[] } };
