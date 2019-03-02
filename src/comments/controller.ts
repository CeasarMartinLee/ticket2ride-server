import { JsonController, Get, Param, Body, Post, HttpCode, CurrentUser, Authorized, Delete} from 'routing-controllers'
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

    @Authorized("admin")
    @Delete('/comments/:id')
    async deleteComment(
        @Param('id') id: number
    ) {
        return Comment.delete(id)
    }
}