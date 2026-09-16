import type { $Fetch, NitroFetchOptions } from 'nitropack';

interface HttpRequest {
  url: string;
  method:
    | 'GET'
    | 'HEAD'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE';
  body?: object;
  fetchOptions?: NitroFetchOptions<'json'>;
}

interface ApiResponse<T> {
  statusCode: number;
  statusMessage: string;
  body: T;
}

abstract class HttpFactory {
  private readonly $fetch: $Fetch;

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher;
  }

  async call<T>({ method, url, body, fetchOptions }: HttpRequest) {
    const cookie = useRequestHeaders(['cookie']);

    return this.$fetch<ApiResponse<T>>(url, {
      method,
      body,
      headers: {
        ...cookie
      },
      ...fetchOptions
    });
  }
}

export default HttpFactory;
