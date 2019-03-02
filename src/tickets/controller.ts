import { JsonController, Get, Param, Body, Post, HttpCode, Put, NotFoundError, CurrentUser, ForbiddenError, Authorized, Delete } from 'routing-controllers'
import Ticket from './entity'
import Event from '../events/entity'
import User from '../users/entity'
import Comment from '../comments/entity'
import getRisk from '../risk/getRisk'


@JsonController()
export default class TicketController {

    // @Authorized()
    @Get('/events/:event_id/tickets')
    async getTicketsPerEvent(
        @Param('event_id') event_id: number
    ) {
        const event = await Event.findOne(event_id)
        // console.log(event,'<===========')
        const tickets = await Ticket.find({ relations: ['user'], where: { event: event } })
        // console.log(tickets,'<===========')

        return { tickets }
    }


    // @Authorized()
    @Post('/events/:eventId/tickets')
    @HttpCode(201)
    async createTicket(
        @Param('eventId') eventId: number,
        @CurrentUser() user: User,
        @Body() ticket: Ticket
    ) {
        let { price, description, picture, risk, dateCreated } = ticket;
        dateCreated = new Date()
        const event = await Event.findOne(eventId);
        const newTicket = await Ticket.create({ description, price, picture, event, user, dateCreated, risk }).save()
        const allTickets = await Ticket.find({ relations: ['user'] })
        const userId = newTicket!.user.id

        getRisk(newTicket, allTickets, userId, eventId)

        return newTicket;
    }

    // @Authorized()
    @Get('/events/:event_id/tickets/:ticket_id')
    Ticket(
        // @Param('event_id') event_id: number,
        @Param('ticket_id') ticket_id: number
    ) {
        return Ticket.findOne(ticket_id, { relations: ['user', 'event'] })
    }


    @Get('/events/:event_id/tickets/:ticket_id/risk')
    async getRiskPerTicket(
        @Param('event_id') event_id: number,
        @Param('ticket_id') ticket_id: number
    ) {
        const currentTicket = await Ticket.findOne(ticket_id, { relations: ['user'] });
        // console.log(ticket, '<===============')
        const userId = currentTicket!.user.id
        const allTickets = await Ticket.find({ relations: ['user'] })
        // console.log(allTickets)
        currentTicket!.risk = 0
        //if the ticket is the only ticket of the author, add 10%
        const countAuthorTickets =
            allTickets
                .map(ticket => (ticket.user))
                .map(user => (user.id === userId))
                .length
        if (countAuthorTickets === 1) {
            currentTicket!.risk += 10
        }

        // average ticket price for event = sum of all prices for event / number of tickets for event
        const event = await Event.findOne(event_id)
        const allTicketsForEvent = await Ticket.find({ where: { event: event } })
        const totalPrice = allTicketsForEvent.reduce((acc, current) => acc + current.price, 0)
        const averageTicketPrice = totalPrice / allTicketsForEvent.length

        //if a ticket is X% cheaper than the average price, add X% to the risk
        if (averageTicketPrice > currentTicket!.price) {
            currentTicket!.risk += (1 - (currentTicket!.price / averageTicketPrice)) * 100
            //if a ticket is X% more expensive than the average price, deduct X% from the risk, with a maximum of 10% deduction
        } else if (averageTicketPrice < currentTicket!.price) {
            if ((((currentTicket!.price / averageTicketPrice) - 1) * 100) > 10) {
                currentTicket!.risk -= 10
            } else {
                currentTicket!.risk -= ((currentTicket!.price / averageTicketPrice) - 1) * 100
            }
        }

        // if the ticket was added during business hours (9-17), deduct 10% from the risk, if not, add 10% to the risk
        const hourCreated = currentTicket!.dateCreated.getHours()
        if (hourCreated >= 9 && hourCreated <= 17) {
            currentTicket!.risk -= 10
        } else {
            currentTicket!.risk += 10
        }

        // if there are >3 comments on the ticket, add 5% to the risk
        const commentsInTicket = await Comment.find({ where: { ticket: currentTicket } })
        if (commentsInTicket.length > 3) {
            currentTicket!.risk += 5
        }

        //The minimal risk is 5% (there's no such thing as no risk) and the maximum risk is 95%.
        if (currentTicket!.risk < 5) currentTicket!.risk = 5
        if (currentTicket!.risk > 95) currentTicket!.risk = 95

        currentTicket!.risk = Math.round(currentTicket!.risk)
        await currentTicket!.save()



        return currentTicket!.risk
    }

    @Authorized()
    @Put('/events/:event_id/tickets/:ticket_id')
    async updateTicket(
        // @Param('event_id') event_id: number,
        @Param('ticket_id') ticket_id: number,
        @Body() update: Partial<Ticket>,
        @CurrentUser() user: User
    ) {
        const ticket = await Ticket.findOne(ticket_id, { relations: ['user', 'event']})

        if (!ticket) throw new NotFoundError('Cannot find ticket')
        if(user.roles === "admin") {
            return Ticket.merge(ticket, update).save()
        } else if(ticket.user.id !== user.id) {
            throw new ForbiddenError ('You have insufficent rights to edit a ticket')
        }

        return Ticket.merge(ticket, update).save()
    }

    @Authorized("admin")
    @Delete('/tickets/:id')
    async deleteTicket(
        @Param('id') id: number
    ) {
        return Ticket.delete(id)
    }
}


    // @Authorized()
    // @Get('/tickets')
    // async allTickets() {
    //     const tickets = await Ticket.find()
    //     return { tickets }
    // }


    // @Authorized()
    // @Post('/tickets')
    // @HttpCode(201)
    // createTicket(
    //     @Body() ticket: Ticket
    // ) {
    //     return ticket.save()
    // }
