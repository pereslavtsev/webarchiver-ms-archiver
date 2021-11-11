import { Test, TestingModule } from '@nestjs/testing';
import { ArchiverController } from './archiver.controller';

describe('ArchiverController', () => {
  let controller: ArchiverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchiverController],
    }).compile();

    controller = module.get<ArchiverController>(ArchiverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
