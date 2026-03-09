export interface EggVariable {
  name: string;
  env_variable: string;
  default_value: string;
  user_viewable: boolean;
  user_editable: boolean;
  description?: string;
  rules?: string;
}

export interface EggMeta {
  slug: string;
  name: string;
  category: string;
  source: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  rawUrl: string;
}

export interface EggData {
  _comment?: string;
  exported_at?: string;
  author?: string;
  name?: string;
  description?: string;
  features?: string[];
  images?: string[];
  docker_images?: Record<string, string>;
  startup?: string;
  variables?: EggVariable[];
  meta?: { version?: string; update_url?: string };
  config?: {
    files?: Record<string, unknown>;
    startup?: { done?: string; userInteraction?: string[] };
    stop?: string;
    logs?: Record<string, unknown>;
  };
  scripts?: {
    installation?: { script: string; container: string; entrypoint: string };
  };
}

export interface EggDetail {
  egg: EggData;
  meta: EggMeta;
  readme: string | null;
}

export interface EggResponse {
  egg: EggData;
  meta: EggMeta;
  readme: string | null;
}

export type EggEntry = EggMeta;

export type EggListItem = Pick<EggMeta, 'slug' | 'name' | 'category' | 'repo' | 'source'>;
