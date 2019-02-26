import { JsonController, Get, Param, Body, Post, HttpCode, Put, NotFoundError, CurrentUser } from 'routing-controllers'
import Event from './entity'
import User from '../users/entity';


@JsonController()
export default class EventController {

    // @Authorized()
    @Get('/events')
    async allEvents() {
        const events = await Event.find()
        return { events }
    }

    // @Authorized()
    @Post('/events')
    @HttpCode(201)
    async createEvent(
        @CurrentUser() user: User,
        @Body() event: Event
                ) {
            event.user = user
            console.log(event, '<======================')
            const newEvent = await Event.create(event)
        return await newEvent.save();
    }


    // @Authorized()
    @Get('/events/:id')
    getEvent(
        @Param('id') id: number
    ) {
        return Event.findOne(id)
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

}