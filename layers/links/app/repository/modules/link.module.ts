import type {
  ClickFilter,
  ClicksPage,
  ClicksQuery,
  LinkStatistics
} from '#layers/links/shared/domain/click.type';
import type { Link, LinkInput } from '#layers/links/shared/domain/link.type';

import ApiModule from '#layers/base/app/repository/api.module';
import Routes from '#layers/links/app/repository/routes.client';

class LinkModule extends ApiModule {
  private readonly ROUTE = Routes.Link;

  getAll() {
    return this.call<Link[]>({
      method: 'GET',
      url: this.ROUTE.Links()
    });
  }

  get(id: string) {
    return this.call<Link>({
      method: 'GET',
      url: this.ROUTE.LinkById(id)
    });
  }

  getStatistics(id: string, query: ClickFilter) {
    return this.call<LinkStatistics>({
      method: 'GET',
      url: this.ROUTE.LinkStatistics(id),
      query
    });
  }

  getClicks(id: string, query: ClicksQuery) {
    return this.call<ClicksPage>({
      method: 'GET',
      url: this.ROUTE.LinkClicks(id),
      query
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
