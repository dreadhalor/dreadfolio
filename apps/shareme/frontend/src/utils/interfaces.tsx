export interface SanityUniversalSchema {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

export interface User extends SanityUniversalSchema {
  userName: string;
  image: string;
  googleLoginResponse: string;
}

export interface IPin {
  image: {
    asset: {
      url: string;
    };
  };
  _id: string;
  title: string;
  about: string;
  category: string;
  destination: string;
  postedBy: {
    _id: string;
    userName: string;
    image: string;
  };
  save: [
    {
      _key: string;
      postedBy: {
        _id: string;
        userName: string;
        image: string;
      };
    }
  ];
  comments: [
    {
      comment: string;
      _key: string;
      postedBy: {
        _id: string;
        userName: string;
        image: string;
      };
    }
  ];
}
