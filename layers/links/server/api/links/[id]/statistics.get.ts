import { requireUser } from '#layers/auth/server/current-user';
import { useStatisticsService } from '#layers/links/server/container';
import {
  defineLinkEventHandler,
  readClicksQuery,
  readLinkId
} from '#layers/links/server/http';

export default defineLinkEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = readLinkId(event);
  const { range } = readClicksQuery(event);

  const statisticsService = await useStatisticsService(event);

  return statisticsService.getStatistics(user.id, id, range);
});
