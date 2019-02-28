import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity'
import { IsString, IsNumber } from 'class-validator'
import User from '../users/entity'
import Event from '../events/entity'
import Comment from  '../comments/entity'


@Entity()
export default class Ticket extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @IsNumber()
  @Column('integer', { nullable: false })
  price: number;

  @IsString()
  @Column('text', { nullable: false })
  description: string;

  @IsString()
  @Column('text', { nullable: true })
  picture: string;

  @Column('timestamp', { nullable: false })
  dateCreated: Date

  @Column('decimal', { nullable: true, scale: 2, default: 0 })
  risk: number

  @ManyToOne(_ => User, user => user.tickets)
  user: User;

  @ManyToOne(_ => Event, event => event.tickets, { onDelete: "CASCADE" })
  event: Event;

  @OneToMany(_ => Comment, comments => comments.ticket)
  comments: Comment;
}