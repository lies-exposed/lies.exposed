import { fc } from "@liexp/test";
import { MediaArb } from "../tests";

export const [firstImage, secondImage, thirdImage] = fc.sample(MediaArb, 3);
