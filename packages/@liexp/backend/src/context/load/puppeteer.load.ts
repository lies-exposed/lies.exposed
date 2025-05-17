import type { KnownDevices } from "puppeteer-core";
import type { VanillaPuppeteer } from "puppeteer-extra";

export const loadPuppeteer = async (): Promise<{
  client: VanillaPuppeteer;
  KnownDevices: typeof KnownDevices;
}> => {
  const puppeteer = await import("puppeteer-core");
  const { default: puppeteerStealth } = await import(
    "puppeteer-extra-plugin-stealth"
  );
  const { addExtra } = await import("puppeteer-extra");
  const p = addExtra(puppeteer as any);
  p.use(puppeteerStealth());

  return { client: p, KnownDevices: puppeteer.KnownDevices };
};
