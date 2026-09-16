import type { Link, LinkCreation, LinkUpdate } from '#shared/types/link.type';

import HttpFactory from '@/repository/factory';
import Routes from '@/repository/routes.client';

class LinkModule extends HttpFactory {
  private readonly ROUTE = Routes.Link;

  async getAll() {
    return this.call<{ links: Link[] }>({
      method: 'GET',
      url: this.ROUTE.Fetch()
    });
  }

  async create(dto: LinkCreation) {
    return this.call<{ link: Link }>({
      method: 'POST',
      url: this.ROUTE.Fetch(),
      body: dto
    });
  }

  async update(id: string, dto: LinkUpdate) {
    return this.call<{ link: Link }>({
      method: 'PUT',
      url: this.ROUTE.FetchId(id),
      body: dto
    });
  }

  async delete(id: string) {
    return this.call({
      method: 'DELETE',
      url: this.ROUTE.FetchId(id)
    });
  }
}

export default LinkModule;
