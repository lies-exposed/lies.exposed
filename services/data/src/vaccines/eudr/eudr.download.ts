import { GetLogger, Logger } from "@liexp/core/lib/logger";
import {
  AgeGroup,
  EighteenToSixtyFourYears,
  Female,
  Male,
  MoreThanEightyFiveYears,
  NotSpecified,
  Sex,
  SixtyFiveToEightyfiveYears,
  ThreeToTwelveYears,
  TwelveToSixteenYears,
  TwoMonthsToTwoYears,
  ZeroToOneMonth
} from "@liexp/shared/lib/io/http/covid/VaccineDatum";
import {
  GetPuppeteerProvider,
  PuppeteerError,
  toPuppeteerError
} from "@liexp/backend/lib/providers/puppeteer.provider";
import { differenceInDays } from "date-fns";
import * as A from "fp-ts/lib/Array.js";
import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line import/default
import type puppeteer from "puppeteer-core";
import extraPup from "puppeteer-extra";

const DATA_DIR_PATH = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/eudr/import"
);

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const checkFileIsDownloaded = (
  log: Logger,
  downloadFilePath: string
): TE.TaskEither<PuppeteerError, void> => {
  return pipe(
    TE.tryCatch(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const downloadExists = fs.existsSync(downloadFilePath);
          // eslint-disable-next-line
          log.debug.log(`Path %s exists?`, downloadFilePath, downloadExists);
          resolve(downloadExists);
        }, 5000);
      });
    }, toPuppeteerError),
    TE.chain((result) =>
      !result
        ? checkFileIsDownloaded(log, downloadFilePath)
        : TE.right(undefined)
    )
  );
};

const sleepAmount = 2000;

const getYearFromIndex = (i: number): string => {
  return i === 0 ? "2021" : "2020";
};

const getAgeGroupFromIndex = (i: number): AgeGroup => {
  switch (i) {
    case 0:
      return NotSpecified.value;
    case 1:
      return ZeroToOneMonth.value;
    case 2:
      return TwoMonthsToTwoYears.value;
    case 3:
      return ThreeToTwelveYears.value;
    case 4:
      return TwelveToSixteenYears.value;
    case 5:
      return EighteenToSixtyFourYears.value;
    case 6:
      return SixtyFiveToEightyfiveYears.value;
    case 7:
      return MoreThanEightyFiveYears.value;
  }
  return NotSpecified.value;
};

const getSexFromIndex = (i: number): Sex => {
  return i === 0 ? Female.value : i === 1 ? Male.value : NotSpecified.value;
};

interface GetDownloadCSVOptions {
  downloadPath: string;
}

interface ValuesIndexes<T> {
  year: T;
  gender: T;
  ageGroup: T;
}

const getFilePath = (
  manufacturer: string,
  { year, ageGroup, gender }: ValuesIndexes<string>
): string => {
  return `eudrvigilance-${year}-${manufacturer}-${ageGroup}-${gender}.csv`;
};

export const GetDownloadCSV =
  (log: Logger, b: puppeteer.Browser, opts: GetDownloadCSVOptions) =>
  (
    page: puppeteer.Page,
    indexes: ValuesIndexes<number>,
    manufacturer: string
  ): TE.TaskEither<PuppeteerError, void> => {
    return TE.tryCatch(async () => {
      const gender = getSexFromIndex(indexes.gender);
      const year = getYearFromIndex(indexes.year);
      const ageGroup = getAgeGroupFromIndex(indexes.ageGroup);

      const newDownloadPath = path.resolve(
        opts.downloadPath,
        getFilePath(manufacturer, { gender, year, ageGroup })
      );

      if (fs.existsSync(newDownloadPath)) {
        log.debug.log("File %s already exists at path %s", newDownloadPath);
        const fileStat = fs.statSync(newDownloadPath);
        const daysDelta = differenceInDays(new Date(), fileStat.mtime);
        if (daysDelta === 0) {
          log.debug.log("File is already up to date %s", fileStat.mtime);
          return;
        }
      }

      log.debug.log("Processing %O", {
        year,
        gender,
        ageGroup,
        vaccineManufacturer: manufacturer,
      });

      const formDropdownSelector = ".promptComboBoxButtonMoz";
      const dropdownContextMenuInputSelctor =
        ".masterMenuItem.promptMenuOption > div > input";

      // get age group dropdown values;
      const ageGroupDropdownEl = await page
        .$$(formDropdownSelector)
        .then((els) => els[4]);
      await ageGroupDropdownEl.click();
      log.debug.log("Open 'Age Group' dropdown");

      await page.waitForSelector(dropdownContextMenuInputSelctor, {
        timeout: 60 * 1000,
      });
      const ageGroupEl = await page
        .$$(dropdownContextMenuInputSelctor)
        .then((els) => els[indexes.ageGroup]);
      await ageGroupEl.click();

      log.debug.log("Select 'Age Group' %s", ageGroup);

      await sleep(sleepAmount);
      await page.click("label[title='Age Group']");
      await sleep(sleepAmount);

      const yearDropdownArrowSelector =
        ".masterCustomChoiceList.promptChoiceListBox > img";
      await page.click(yearDropdownArrowSelector);

      // get year dropdown values
      const yearDropdownInputSelector = ".masterMenu.DropDownValueList > div";
      await page.waitForSelector(yearDropdownInputSelector);
      const yearOptionsEl = await page
        .$$(yearDropdownInputSelector)
        .then((els) => els[indexes.year]);

      await yearOptionsEl.click();
      await sleep(sleepAmount);

      await page.click("label[title='Gateway Date']");
      await sleep(sleepAmount);

      const genderDropdownEl = await page
        .$$(formDropdownSelector)
        .then((els) => els[3]);

      // get gender  dropdown values;
      await genderDropdownEl.click();
      log.debug.log("Open 'Sex' dropdown");

      await page.waitForSelector(dropdownContextMenuInputSelctor);
      log.debug.log("Selector %s ready", dropdownContextMenuInputSelctor);
      const genderEl = await page
        .$$(dropdownContextMenuInputSelctor)
        .then((els) => els[indexes.gender]);

      await genderEl.click();
      log.debug.log("Selected 'Sex' value '%s'", gender);
      await sleep(sleepAmount);
      await page.click("label[title='Sex']");
      await sleep(sleepAmount);

      const runListingButtonSelector = '[id*="d:dashboard"] > a';

      log.debug.log("Waiting for selector %s", runListingButtonSelector);
      await page.waitForSelector(runListingButtonSelector);

      log.debug.log("Running listing...");
      const [target] = await Promise.all<puppeteer.Target>([
        new Promise((resolve) => page.browser().once("targetcreated", resolve)),
        page.click(runListingButtonSelector) as any,
      ]);

      const listingPage = await target.page();

      await (listingPage as any)._client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: opts.downloadPath,
      });
      await listingPage?.bringToFront();

      // check for errors
      // click "export" button
      const exportButtonSelector = "td.ResultLinksCell > a";
      await listingPage?.waitForSelector(exportButtonSelector, {
        timeout: 120 * 1000,
      });
      const actionButtons = await listingPage?.$$(exportButtonSelector);

      if (Array.isArray(actionButtons) && actionButtons.length > 2) {
        const exportButton = actionButtons[actionButtons.length - 1];
        await exportButton.click();

        const exportMenuItemsSelector =
          "a.masterMenuItem.NQWMenuItem.NQWMenuItemWIconMixin";

        await listingPage?.waitForSelector(exportMenuItemsSelector, {
          timeout: 60 * 1000,
        });

        const exportMenuItems = await listingPage?.$$(exportMenuItemsSelector);

        if (Array.isArray(exportMenuItems)) {
          await exportMenuItems[exportMenuItems.length - 1].click();
        }
        await sleep(1000);

        const dataMenuItems = await listingPage?.$$(exportMenuItemsSelector);

        if (Array.isArray(dataMenuItems)) {
          const csvMenuItem = dataMenuItems[dataMenuItems.length - 3];
          await csvMenuItem.click();
        }

        const downloadFilePath = path.resolve(
          opts.downloadPath,
          "Run Line Listing Report.csv"
        );
        await checkFileIsDownloaded(log, downloadFilePath)();

        fs.renameSync(downloadFilePath, newDownloadPath);
        log.debug.log("Saved %s", newDownloadPath);
      } else {
        // write a stub file
        fs.writeFileSync(newDownloadPath, "");
        log.debug.log("Write stub file");
      }
      log.debug.log("Saved %s", newDownloadPath);

      await listingPage?.close();
      await page.click(".promptResetDropDownButton");
      const menuOptionsCells = "td.contextMenuOptionTextCell";
      await page.waitForSelector(menuOptionsCells);
      const menuOptions = await page.$$(menuOptionsCells);

      await menuOptions[0].click();
      await sleep(1000);
    }, toPuppeteerError);
  };

export const GetManufacturerDataProcess =
  (log: Logger, b: puppeteer.Browser, opts: GetDownloadCSVOptions) =>
  (manufacturer: string, url: string) => {
    return pipe(
      TE.tryCatch(() => b.pages().then((pages) => pages[0]), toPuppeteerError),
      TE.chain((page) => {
        return TE.tryCatch(async () => {
          log.debug.log("Donwloading data for manufacturer %s", manufacturer);
          await page.goto(url, { timeout: 0, waitUntil: "networkidle0" });
          log.debug.log("Page %s loaded!", url);
          const dropdownArrowClassName = "td.DashTabsToolbarCell";
          log.debug.log(
            "Opening dropdown header menu %s",
            dropdownArrowClassName
          );
          await page.waitForSelector(dropdownArrowClassName, {
            timeout: 30 * 1000,
          });
          await page.click(dropdownArrowClassName);

          const lineListingSelector = "#menuOptionItem_LineListing";
          await page.waitForSelector(lineListingSelector);

          log.debug.log('Clicking on "Run Line listing" dropdown menu item.');
          await page.click(lineListingSelector);

          await page.waitForNavigation({ waitUntil: "networkidle2" });

          const ageGroupOptionIndexes = A.range(0, 7);
          const yearOptionIndexes = A.range(0, 1);
          const genderOptionIndexes = A.range(0, 2);

          const downloadCSV = GetDownloadCSV(log, b, opts);
          await TE.sequenceSeqArray(
            pipe(
              ageGroupOptionIndexes.map((d) =>
                A.flatten(
                  yearOptionIndexes.map((y) =>
                    genderOptionIndexes.map((g) => {
                      const opts = { year: y, gender: g, ageGroup: d };

                      return downloadCSV(page, opts, manufacturer);
                    })
                  )
                )
              ),
              A.flatten
            )
          )();
        }, toPuppeteerError);
      })
    );
  };

const pfizerEMAURL = [
  "pfizer",
  "https://dap.ema.europa.eu/analyticsSOAP/saw.dll?PortalPages&PortalPath=%2Fshared%2FPHV%20DAP%2F_portal%2FDAP&Action=Navigate&P0=1&P1=eq&P2=%22Line%20Listing%20Objects%22.%22Substance%20High%20Level%20Code%22&P3=1+42325700",
];
const astrazenecaEMAURL = [
  "astrazeneca",
  "https://dap.ema.europa.eu/analyticsSOAP/saw.dll?PortalPages&PortalPath=%2Fshared%2FPHV%20DAP%2F_portal%2FDAP&Action=Navigate&P0=1&P1=eq&P2=%22Line%20Listing%20Objects%22.%22Substance%20High%20Level%20Code%22&P3=1+40995439",
];
const janssenEMAURL = [
  "janssen",
  "https://dap.ema.europa.eu/analytics/saw.dll?PortalPages&PortalPath=%2Fshared%2FPHV%20DAP%2F_portal%2FDAP&Action=Navigate&P0=1&P1=eq&P2=%22Line%20Listing%20Objects%22.%22Substance%20High%20Level%20Code%22&P3=1+42287887",
];
const modernaEMAURL = [
  "moderna",
  "https://dap.ema.europa.eu/analyticsSOAP/saw.dll?PortalPages&PortalPath=%2Fshared%2FPHV%20DAP%2F_portal%2FDAP&Action=Navigate&P0=1&P1=eq&P2=%22Line%20Listing%20Objects%22.%22Substance%20High%20Level%20Code%22&P3=1+40983312",
];

export const runDownload = (): TE.TaskEither<Error, void> => {
  const log = GetLogger("adr-reports-download");
  const pupClient = GetPuppeteerProvider(extraPup, {});

  const dateDownloadPath = path.resolve(DATA_DIR_PATH);
  const dateDownloadPathExists = fs.existsSync(dateDownloadPath);

  if (!dateDownloadPathExists) {
    log.debug.log(
      "Folder at %s does not exist, creating it...",
      dateDownloadPath
    );
    fs.mkdirSync(dateDownloadPath, { recursive: true });
  }

  return pipe(
    pupClient.getBrowserFirstPage('about:blank', {
    }),
    TE.chain((pup) => {
      const processManufacturerData = GetManufacturerDataProcess(log, pup, {
        downloadPath: dateDownloadPath,
      });

      const tasks = [
        pfizerEMAURL,
        astrazenecaEMAURL,
        janssenEMAURL,
        modernaEMAURL,
      ].map(([manufacturer, url]) =>
        processManufacturerData(manufacturer, url)
      );

      return pipe(
        TE.sequenceSeqArray(tasks),
        TE.chain(() => TE.tryCatch(() => pup.close(), toPuppeteerError))
      );
    })
  );
};
