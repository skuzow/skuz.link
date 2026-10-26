export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated.value) return;

  const localePath = useLocalePath();
  const { auth } = useAppConfig();

  return await navigateTo(localePath(auth.signedInRoute));
});
