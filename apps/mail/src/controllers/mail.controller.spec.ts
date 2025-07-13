import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../services/mail.service';

import { MailController } from './mail.controller';

describe('MailController', () => {
  let mailController: MailController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [MailService],
    }).compile();

    mailController = app.get<MailController>(MailController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mailController.getHello()).toBe('Hello World!');
    });
  });
});
