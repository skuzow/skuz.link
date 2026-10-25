type Fetcher = ReturnType<typeof useRequestFetch>;

interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
}

abstract class ApiModule {
  private readonly $fetch: Fetcher;

  constructor(fetcher: Fetcher) {
    this.$fetch = fetcher;
  }

  async call<T>({ method, url, body }: HttpRequest) {
    return this.$fetch<T>(url, { method, body });
  }
}

export default ApiModule;
