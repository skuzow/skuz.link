const API_PREFIX: string = '/api';

const PREFIX = {
  LINK: `${API_PREFIX}/links`
};

const Routes = {
  Link: {
    Links: () => PREFIX.LINK,
    LinkById: (id: string) => `${PREFIX.LINK}/${id}`,
    LinkClicks: (id: string) => `${PREFIX.LINK}/${id}/clicks`
  }
};

export default Routes;
