import { Injectable } from '@nestjs/common';
import { InjectMementoClient } from '@archiver/memento';
import MementoClient from '@mementoweb/client';
import { InjectQueue } from '@nestjs/bull';
import { TIMETRAVEL_QUEUE } from '@archiver/archiver/archiver.constants';
import { Queue } from 'bull';

@Injectable()
export class ArchiverService {
  constructor(
    @InjectMementoClient()
    private mementoClient: MementoClient,
    @InjectQueue(TIMETRAVEL_QUEUE)
    private timetravelQueue: Queue<any>,
  ) {}

  findSnapshots(url: string) {
    this.mementoClient.uri(url);
  }
}
