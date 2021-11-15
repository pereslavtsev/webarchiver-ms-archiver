import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Snapshot } from '@archiver/snapshots';
import { InjectContext } from 'nest-puppeteer';
import { BrowserContext, Page } from 'puppeteer';
import { Task } from '@archiver/tasks';
import cheerio from 'cheerio';
import parse from 'url-parse';

@Injectable()
export class CheckerService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectContext() private readonly browserContext: BrowserContext,
  ) {
    super(rootLogger);
  }

  private async gotoPage(uri: Snapshot['uri']) {
    const page = await this.browserContext.newPage();
    await page.goto(uri, { waitUntil: 'networkidle2', timeout: 60 * 1000 });
    return page;
  }

  private async getPageContent(page: Page): Promise<string> {
    const { hostname } = parse(page.url());

    switch (hostname) {
      case 'arquivo.pt': {
        const iframe = await page.$('#replay_iframe');
        const contentFrame = await iframe.contentFrame();

        return contentFrame.content();
      }
      default: {
        return page.content();
      }
    }
  }

  async checkSnapshot(
    snapshot: Snapshot,
    quote: Task['quote'],
  ): Promise<boolean> {
    const log = this.log.child({ reqId: snapshot.id });
    const { uri } = snapshot;

    log.debug(`goto page ${uri}...`);
    const page = await this.gotoPage(uri);
    const content = await this.getPageContent(page);

    const $ = cheerio.load(content);
    const res = new RegExp(quote, 'ig').exec($.text());

    await page.close();

    if (!res) {
      log.warn(
        `no matched phrase "${quote}" has been found on the page ${uri}`,
      );
      return false;
    }

    log.debug(
      `quote "${quote}" has been founded (${res.length}) on the page ${uri}`,
    );

    return true;
  }
}
