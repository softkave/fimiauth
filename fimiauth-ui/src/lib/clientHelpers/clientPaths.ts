const kBaseUrl = process.env.NEXT_PUBLIC_URL;

export const kClientPaths = {
  index: "/",
  signin: "/signin",
  signinWithRedirect: (redirectTo: string) =>
    `/signin?redirectTo=${redirectTo}`,
  app: {
    index: "/app",
    profile: "/app/profile",
    posts: {
      index: "/app/posts",
      single: (postId: string) => `/app/posts/${postId}`,
    },
  },
  withURL(path: string) {
    return `${kBaseUrl}${path}`;
  },
};
