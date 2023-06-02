import type { paths } from "@/types/schema";

export type PathParams<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  parameters: { path: Record<string, unknown> };
}
  ? paths[P][M]["parameters"]["path"]
  : undefined;

export type QueryParams<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  parameters: { query: Record<string, unknown> };
}
  ? paths[P][M]["parameters"]["query"]
  : undefined;

export type RequestBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody: { content: { "application/json": Record<string, unknown> } };
}
  ? paths[P][M]["requestBody"]["content"]["application/json"]
  : undefined;

type ExtractJsonResponse<T> = T extends { content: { "application/json": unknown } }
  ? T["content"]["application/json"]
  : never;

type ResponsesToTuple<T extends Record<number, unknown>, C extends keyof T> = C extends keyof T
  ? [C, ExtractJsonResponse<T[C]>]
  : never;

export type ResponseBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  responses: Record<number, unknown>;
}
  ? ResponsesToTuple<paths[P][M]["responses"], keyof paths[P][M]["responses"]>
  : undefined;

export async function fetchAPI<P extends keyof paths, M extends keyof paths[P]>(
  pathTemplate: P & string,
  method: M & string,
  pathParams: PathParams<P, M>,
  queryParams: QueryParams<P, M>,
  body: RequestBody<P, M>
): Promise<ResponseBody<P, M>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  let path: string = pathTemplate;
  if (pathParams !== undefined) {
    for (const paramKey in pathParams) {
      if (Object.prototype.hasOwnProperty.call(pathParams, paramKey)) {
        path = path.replaceAll(`{${paramKey}}`, String(pathParams[paramKey]));
      }
    }
  }

  const url = new URL(path, location.origin);
  if (queryParams !== undefined) {
    for (const paramKey in queryParams) {
      if (Object.prototype.hasOwnProperty.call(queryParams, paramKey)) {
        url.searchParams.append(String(paramKey), String(queryParams[paramKey]));
      }
    }
  }

  const response = await fetch(url.href, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status !== 204) {
    return [response.status, await response.json()] as unknown as ResponseBody<P, M>;
  } else {
    return [response.status, undefined] as unknown as ResponseBody<P, M>;
  }
}
