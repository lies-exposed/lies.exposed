import { type GeocodeProvider } from "../providers/geocode/geocode.provider.js";
import { type IGProvider } from "../providers/ig/ig.provider.js";
import { type ImgProcClient } from "../providers/imgproc/imgproc.provider.js";
import { type NERProvider } from "../providers/ner/ner.provider.js";
import { type TGBotProvider } from "../providers/tg/tg.provider.js";
import { type WikipediaProvider } from "../providers/wikipedia/wikipedia.provider.js";

export interface GeocodeProviderContext {
  geo: GeocodeProvider;
}

export interface IGProviderContext {
  ig: IGProvider;
}

export interface ImgProcClientContext {
  imgProc: ImgProcClient;
}

export interface NERProviderContext {
  ner: NERProvider;
}

export interface TGBotProviderContext {
  tg: TGBotProvider;
}

export interface WikipediaProviderContext {
  wp: WikipediaProvider;
}
