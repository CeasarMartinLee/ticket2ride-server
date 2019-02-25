import { JsonController, Get, Param, Body, Post, HttpCode, Put, NotFoundError } from 'routing-controllers'
import Event from './entity'


@JsonController()
export default class EventController {

    // @Authorized()
    @Get('/events/:id')
    getEvent(
        @Param('id') id: number
    ) {
        return Event.findOne(id)
    }

    // @Authorized()
    @Get('/events')
    async allEvents() {
        const events = await Event.find()
        return { events }
    }


    // @Authorized()
    @Put('/events/:id')
    async updateEvent(
        @Param('id') id: number,
        @Body() update: Partial<Event>
    ) {
        const event = await Event.findOne(id)
        if (!event) throw new NotFoundError('Cannot find event')

        return Event.merge(event, update).save()
    }

    // @Authorized()
    @Post('/events')
    @HttpCode(201)
    createEvent(
        @Body() event: Event
    ) {
        return event.save()
    }
}