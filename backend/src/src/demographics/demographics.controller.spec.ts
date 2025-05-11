import { Test, TestingModule } from '@nestjs/testing';
import { DemographicsController } from './demographics.controller';

describe('DemographicsController', () => {
  let controller: DemographicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemographicsController],
    }).compile();

    controller = module.get<DemographicsController>(DemographicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
