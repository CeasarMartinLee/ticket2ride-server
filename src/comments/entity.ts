import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity'
import { IsString } from 'class-validator'
import User from '../users/entity'
import Ticket from '../tickets/entity'


@Entity()
export default class Comment extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @IsString()
  @Column('text', { nullable: false })
  comment: string;

  @ManyToOne(_ => User, user => user.comments)
  user: User;

  @ManyToOne(_ => Ticket, ticket => ticket.comments, { onDelete: "CASCADE" })
  ticket: Ticket;
}