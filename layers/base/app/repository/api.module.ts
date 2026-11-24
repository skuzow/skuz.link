type Fetcher = ReturnType<typeof useRequestFetch>;

interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  query?: Record<string, string>;
}

abstract class ApiModule {
  private readonly $fetch: Fetcher;

  constructor(fetcher: Fetcher) {
    this.$fetch = fetcher;
  }

  async call<T>({ method, url, body, query }: HttpRequest) {
    return this.$fetch<T, string, HttpRequest['method']>(url, {
      method,
      body,
      query
    });
  }
}

export default ApiModule;
