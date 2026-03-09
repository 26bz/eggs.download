export interface GitTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  url: string;
}
