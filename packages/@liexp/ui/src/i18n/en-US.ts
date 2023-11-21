import englishMessages from "ra-language-english";

export default {
  ...(englishMessages as any),
  resources: {
    actors: {
      name: "Actor |||| Actors",
      fields: {
        fullName: "full name",
        username: "username",
        avatar: "avatar",
      },
    },
    groups: {
      name: "Group |||| Groups",
      fields: {
        avatar: "avatar",
      },
    },
    "groups-members": {
      name: "Group Member |||| Groups Members",
      fields: {
        name: "Name",
        "actor.avatar": "Actor Avatar",
        "group.avatar": "Group Avatar",
      },
    },
    events: {
      name: "Event |||| Events",
      fields: {
        title: "Title",
        actors: "Actors",
        groups: "Groups",
        groupsMembers: "Groups Members",
        addNew: "Add new",
        "newMedia.fromURL": "From URL",
      },
    },
    links: {
      name: "Link |||| Links",
      fields: {
        events_length: "N of events",
        social_posts_length: "N of social posts"
      },
      actions: {
        update_metadata: "Update URL Metadata",
        override_thumbnail: "Override Thumbnail",
        take_web_page_screenshot: 'Take Web Page Screenshot'
      },
    },
  },
};
