import { JsonController, Get, Param, Body, Post, HttpCode, Put, NotFoundError } from 'routing-controllers'
import Ticket from './entity'


@JsonController()
export default class TicketController {

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
    @Post('/tickets')
    @HttpCode(201)
    createTicket(
        @Body() ticket: Ticket
    ) {
        return ticket.save()
    }
}