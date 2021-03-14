export const query = `query ProfilePubHandlerQuery($id: ID, $username: ID, $homepagePostsLimit: PaginationLimit, $homepagePostsFrom: String, $includeDistributedResponses: Boolean) {
    userResult(id: $id, username: $username) {
      ... on User {
        id
        name
        username
        bio
        ...ProfilePubScreen_user
      }
    }
  }
  
  fragment ProfilePubScreen_user on User {
    id
    ...PublisherHomepagePosts_publisher
  }
  
  fragment PublisherHomepagePosts_publisher on Publisher {
    id
    homepagePostsConnection(paging: {limit: $homepagePostsLimit, from: $homepagePostsFrom}, includeDistributedResponses: $includeDistributedResponses) {
      posts {
        ...PublisherHomepagePosts_post
      }
      pagingInfo {
        next {
          ...PublisherHomepagePosts_pagingInfo
        }
      }
    }
  }
  
  fragment PublisherHomepagePosts_post on Post {
      ...TruncatedPostCard_post
  }
  
  fragment PublisherHomepagePosts_pagingInfo on PageParams {
    from
    limit
  }
  
  fragment TruncatedPostCard_post on Post {
    mediumUrl
    firstPublishedAt
    title
    previewContent {
        subtitle
    }
  }`