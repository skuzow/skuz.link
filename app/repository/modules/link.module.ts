import type { Link, LinkCreation } from '#shared/types/link.type';

import HttpFactory from '@/repository/factory';
import Routes from '@/repository/routes.client';

class LinkModule extends HttpFactory {
  private readonly ROUTE = Routes.Link;

  async getAll() {
    return this.call<{ links: Link[] }>({
      method: 'GET',
      url: this.ROUTE.Links()
    });
  }

  async create(dto: LinkCreation) {
    return this.call<{ link: Link }>({
      method: 'POST',
      url: this.ROUTE.Links(),
      body: dto
    });
  }

  async update(id: string, dto: LinkCreation) {
    return this.call<{ link: Link }>({
      method: 'PUT',
      url: this.ROUTE.LinkById(id),
      body: dto
    });
  }

  async delete(id: string) {
    return this.call({
      method: 'DELETE',
      url: this.ROUTE.LinkById(id)
    });
  }
}

export default LinkModule;
