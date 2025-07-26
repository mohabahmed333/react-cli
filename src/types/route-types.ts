export interface RouteConfig {
  path: string;
  element: string;
  children?: RouteConfig[];
  index?: boolean;
  lazy?: boolean;
}

export interface RouteInfo {
  pageName: string;
  fullPath: string;
  routePath: string;
  isNested: boolean;
  isDynamic: boolean;
  parentRoute?: string;
  importPath: string;
}

export interface ParsedRoute {
  segments: string[];
  params: string[];
  isNested: boolean;
  parentPath?: string;
}
