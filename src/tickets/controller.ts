import { JsonController, Get, Param, Body, Post, HttpCode, Put, NotFoundError, CurrentUser } from 'routing-controllers'
import Ticket from './entity'
import Event from '../events/entity'
import User from '../users/entity'



@JsonController()
export default class TicketController {

    @Get('/events/:event_id/tickets')
    async getTicketsPerEvent(
        @Param('event_id') event_id: number
    ) {
        const event = await Event.findOne(event_id)
        console.log(event,'<===========')
        const tickets = await Ticket.find({ relations: ['user'], where: { event: event } })
        console.log(tickets,'<===========')

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
      const { price, description, picture } = ticket;
      const event = await Event.findOne(eventId);  
      const newTicket = await Ticket.create({description, price, picture, event, user}).save();
      return newTicket;
    }

    // @Authorized()
    @Get('/tickets/:id')
    Ticket(
        @Param('id') id: number
    ) {
        return Ticket.findOne(id)
    }

    // @Authorized()
    @Get('/tickets')
    async allTickets() {
        const tickets = await Ticket.find()
        return { tickets }
    }


    // @Authorized()
    @Put('/tickets/:id')
    async updateTicket(
        @Param('id') id: number,
        @Body() update: Partial<Ticket>
    ) {
        const ticket = await Ticket.findOne(id)
        if (!ticket) throw new NotFoundError('Cannot find ticket')

        return Ticket.merge(ticket, update).save()
    }

    // @Authorized()
    // @Post('/tickets')
    // @HttpCode(201)
    // createTicket(
    //     @Body() ticket: Ticket
    // ) {
    //     return ticket.save()
    // }
}