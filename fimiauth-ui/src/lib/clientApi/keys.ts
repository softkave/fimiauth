export const kApiPostSWRKeys = {
  fetchPosts: "/api/posts/fetch",
  fetchPost: (postId: string) => `/api/posts/${postId}`,
  addPost: "/api/posts",
  updatePost: (postId: string) => `/api/posts/${postId}`,
  deletePost: (postId: string) => `/api/posts/${postId}`,
  countPosts: "/api/posts/count",
};

export const kApiPostCategorySWRKeys = {
  fetchPostCategories: "/api/categories/fetch",
  fetchPostCategory: (postCategoryId: string) =>
    `/api/categories/${postCategoryId}`,
  addPostCategory: "/api/categories",
  updatePostCategory: (postCategoryId: string) =>
    `/api/categories/${postCategoryId}`,
  deletePostCategory: (postCategoryId: string) =>
    `/api/categories/${postCategoryId}`,
  countPostCategories: "/api/categories/count",
};
