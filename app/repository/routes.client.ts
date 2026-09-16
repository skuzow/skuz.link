const API_PREFIX: string = '/api';

const PREFIX = {
  LINK: `${API_PREFIX}/links`
};

const Routes = {
  Link: {
    Fetch: () => PREFIX.LINK,
    FetchId: (id: string) => `${PREFIX.LINK}/${id}`
  }
};

export default Routes;
