import type { Link, LinkInput } from '#layers/links/shared/domain/link.type';

import ApiModule from '#layers/base/app/repository/api.module';
import Routes from '#layers/links/app/repository/routes.client';

class LinkModule extends ApiModule {
  private readonly ROUTE = Routes.Link;

  async getAll() {
    return this.call<Link[]>({
      method: 'GET',
      url: this.ROUTE.Links()
    });
  }

  async create(dto: LinkInput) {
    return this.call<Link>({
      method: 'POST',
      url: this.ROUTE.Links(),
      body: dto
    });
  }

  async update(id: string, dto: LinkInput) {
    return this.call<Link>({
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
