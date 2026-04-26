export default defineEventHandler((event) => {
  const auth = useAuth(event);

  return auth.handler(toWebRequest(event));
});
