import { fc } from "@econnessione/core/tests";
import { MediaArb } from "../tests";

export const [firstImage, secondImage, thirdImage] = fc.sample(MediaArb, 3);
