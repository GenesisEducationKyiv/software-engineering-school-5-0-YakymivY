import { Test, TestingModule } from '@nestjs/testing';
import { MailEventController } from './mail-event.controller';

describe('MailEventController', () => {
  let controller: MailEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailEventController],
    }).compile();

    controller = module.get<MailEventController>(MailEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
