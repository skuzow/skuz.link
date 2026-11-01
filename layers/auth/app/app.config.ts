export default defineAppConfig({
  auth: {
    // where a signed-in User lands; root sets it to the Links page
    signedInRoute: '/',
    // the documents signing in accepts; root sets them to its legal pages
    termsRoute: '/',
    privacyRoute: '/'
  }
});
