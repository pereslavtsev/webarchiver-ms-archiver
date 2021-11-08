import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArchiverModule } from './archiver/archiver.module';
import { CheckerModule } from './checker/checker.module';

@Module({
  imports: [ArchiverModule, CheckerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
