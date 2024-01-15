import { type URL } from "../../io/http/Common/index.js";
import { sanitizeURL } from "../url.utils.js";

describe("URL utils", () => {
  it("sanitizeURL url", () => {
    expect(
      sanitizeURL(
        "https://www.telegraph.co.uk/world-news/2023/05/01/geoffrey-hinton-ai-google-artificial-intelligence-chatgpt/?utm_content=xxx&utm_medium=xxx&utm_campaign=xxx&utm_source=xxx&fbclid=xxxx#Echobox=1682972823" as URL,
      ),
    ).toBe(
      "https://www.telegraph.co.uk/world-news/2023/05/01/geoffrey-hinton-ai-google-artificial-intelligence-chatgpt/",
    );
    expect(
      sanitizeURL(
        "https://www.telegraph.co.uk/world-news/2023/05/01/?item=geoffrey-hinton-ai-google-artificial-intelligence-chatgpt&utm_content=xxx&utm_medium=xxx&utm_campaign=xxx&utm_source=xxx&fbclid=xxxx#Echobox=1682972823" as URL,
      ),
    ).toBe(
      "https://www.telegraph.co.uk/world-news/2023/05/01/?item=geoffrey-hinton-ai-google-artificial-intelligence-chatgpt",
    );
  });
});
