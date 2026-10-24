import type { $Fetch } from 'nitropack';

interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
}

interface ApiResponse<T> {
  statusCode: number;
  statusMessage: string;
  body: T;
}

abstract class ApiModule {
  private readonly $fetch: $Fetch;

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher;
  }

  async call<T>({ method, url, body }: HttpRequest) {
    const cookie = useRequestHeaders(['cookie']);

    return this.$fetch<ApiResponse<T>>(url, {
      method,
      body,
      headers: {
        ...cookie
      }
    });
  }
}

export default ApiModule;
