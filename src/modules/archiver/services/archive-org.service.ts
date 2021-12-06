import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { HttpService } from '@nestjs/axios';
import { DateTime } from 'luxon';
import { RpcException } from '@nestjs/microservices';
import { status as grpcStatus } from '@grpc/grpc-js';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

// https://archive.org/help/wayback_api.php
const MEMENTO_DATE_FORMAT = 'yyyyMMddHHmmss';

function formatDateFromJSDate(datetime: Date): string {
  const dt = DateTime.fromJSDate(datetime, { zone: 'UTC' });
  return dt.toFormat(MEMENTO_DATE_FORMAT);
}

interface ApiResponse {
  url: string;
  archived_snapshots: {
    closest: {
      status: string;
      available: boolean;
      url: string;
      timestamp: string;
    };
  };
  timestamp: string;
}

@Injectable()
export class ArchiveOrgService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private httpService: HttpService,
  ) {
    super(rootLogger);
    this.httpService.axiosRef.defaults.baseURL =
      'https://archive.org/wayback/available';
  }

  async findClosest(url: string, desiredDate: Date) {
    const { data } = await this.httpService.axiosRef.get<ApiResponse>('/', {
      params: {
        url,
        timestamp: formatDateFromJSDate(new Date(desiredDate)),
      },
    });

    if (data.timestamp === 'Invalid DateTime') {
      throw new RpcException({
        code: grpcStatus.NOT_FOUND,
        message: data.timestamp,
      });
    }

    if (!data?.archived_snapshots?.closest) {
      throw new RpcException({
        code: grpcStatus.NOT_FOUND,
        message: 'Snapshots not found',
      });
    }

    const snapshotStatus = Number(data.archived_snapshots.closest.status);
    if (snapshotStatus !== StatusCodes.OK) {
      throw new Error(`Snapshot status: ${getReasonPhrase(snapshotStatus)}`);
    }

    return {
      status: snapshotStatus,
      available: data.archived_snapshots.closest.available,
      url: data.archived_snapshots.closest.url,
      timestamp: DateTime.fromFormat(
        data.archived_snapshots.closest.timestamp,
        MEMENTO_DATE_FORMAT,
      ).toJSDate(),
    };
  }
}
