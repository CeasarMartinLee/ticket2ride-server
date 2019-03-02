import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity'
import { IsString, IsEmail, MinLength } from 'class-validator'
import { Exclude } from 'class-transformer'
import * as bcrypt from 'bcrypt'
import Ticket from '../tickets/entity'
import Event from '../events/entity'
import Comment from '../comments/entity'


@Entity()
export default class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number

    @IsString()
    @MinLength(2)
    @Column('text', { nullable: false })
    firstName: string

    @IsString()
    @MinLength(2)
    @Column('text', { nullable: false })
    lastName: string

    @Column('text', { default: 'customer' })
    roles: string

    @IsEmail()
    @Column('text', { nullable: false })
    email: string

    @IsString()
    @MinLength(8)
    @Column('text', { nullable:true })
    @Exclude({toPlainOnly:true})
    password: string

    @OneToMany(_ => Ticket, tickets => tickets.user)
    tickets: Ticket;

    @OneToMany(_ => Event, events => events.user)
    events: Event;

    @OneToMany(_ => Comment, comments => comments.user)
    comments: Comment;

    async setPassword(rawPassword: string) {
        const hash = await bcrypt.hash(rawPassword, 10)
        this.password = hash
      }

    checkPassword(rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, this.password)
    }
}