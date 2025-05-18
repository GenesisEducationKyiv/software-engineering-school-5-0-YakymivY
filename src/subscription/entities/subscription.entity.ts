import { Frequency } from 'src/common/enums/frequency.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false, enum: Frequency })
  frequency: Frequency;

  @Column({ unique: true })
  token: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
