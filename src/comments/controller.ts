import { JsonController, Get, Param, Body, Post, HttpCode, CurrentUser} from 'routing-controllers'
import Comment from './entity'
import Ticket from '../tickets/entity'
import User from '../users/entity'


@JsonController()
export default class CommentController {

    // @Authorized()
    @Get('/events/:event_id/tickets/:ticket_id/comments')
    async getCommentsPerTicket(
        @Param('ticket_id') ticket_id: number
    ) {
        const ticket = await Ticket.findOne(ticket_id)
        const comments = await Comment.find({ relations: ['user'], where: { ticket: ticket } })
        return { comments }
    }
    // async getCommentsPerTicket() {
    //     const comments = await Comment.find()
    //     return { comments }
    // }

    // @Authorized()
    // @Post('/comments')
    // @HttpCode(201)
    // createComment(
    //     @Body() comment: Comment
    // ) {
    //     return comment.save()
    // }

    // @Authorized()
    @Post('/events/:event_id/tickets/:ticket_id/comments')
    @HttpCode(201)
    async createComment(
      @Param('ticket_id') ticketId: number,
      @CurrentUser() user: User,
      @Body() data: Comment
    ) {
      const { comment } = data;
      const ticket = await Ticket.findOne(ticketId);  
      const newComment = await Comment.create({comment, ticket, user}).save();
      return newComment;
    }
}