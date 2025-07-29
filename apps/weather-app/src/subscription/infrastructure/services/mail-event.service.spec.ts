import { Test, TestingModule } from '@nestjs/testing';
import { MailEventService } from './mail-event.service';

describe('MailEventService', () => {
  let service: MailEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailEventService],
    }).compile();

    service = module.get<MailEventService>(MailEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
