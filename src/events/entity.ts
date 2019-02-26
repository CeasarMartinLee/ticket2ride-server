import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity'
import { IsString } from 'class-validator'
import Ticket from '../tickets/entity'
import User from '../users/entity'

@Entity()
export default class Event extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @IsString()
  @Column('text', { nullable: false })
  name: string;

  @IsString()
  @Column('text', { nullable: false })
  description: string;

  @IsString()
  @Column('text', { nullable: false })
  logo: string;

  // @IsDate()
  @Column('date', { nullable: false })
  startDate: string;

  // @IsDate()
  @Column('date', { nullable: false })
  endDate: string;

  @OneToMany(_ => Ticket, tickets => tickets.event)
  tickets: Ticket;

  @ManyToOne(_ => User, user => user.events)
  user: User;
}