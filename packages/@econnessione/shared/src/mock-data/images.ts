import { Media } from "../io/http";
import { uuid } from "../utils/uuid";

// Images
const thirdImagePath =
  "http://localhost:4010/static/media/img/elderly-woman-hong-kong-protest-viral-video.jpg";
const firstImagePath = "https://placekitten.com/1200/300";
const secondImagePath =
  "http://localhost:4010/static/media/actors/825a1180-ea9c-11ea-89c1-952ed30e8319/29178199_10216293038707708_991755429509857280_n.jpg";

export const firstImage: Media.Media = {
  id: uuid() as any,
  description: "first image",
  type: "image/jpg",
  location: firstImagePath,
  createdAt: new Date(),
  updatedAt: new Date(),
};
export const secondImage: Media.Media = {
  id: uuid() as any,
  description: "second image",
  type: "image/jpg",
  location: secondImagePath,
  createdAt: new Date(),
  updatedAt: new Date(),
};
export const thirdImage: Media.Media = {
  id: uuid() as any,
  description: "first image",
  type: "image/jpg",
  location: thirdImagePath,
  createdAt: new Date(),
  updatedAt: new Date(),
};
