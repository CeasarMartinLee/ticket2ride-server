import { JsonController, Get, Param, Body, Post, HttpCode, Put, NotFoundError } from 'routing-controllers'
import Comment from './entity'


@JsonController()
export default class CommentController {

    // @Authorized()
    @Get('/comments/:id')
    getComment(
        @Param('id') id: number
    ) {
        return Comment.findOne(id)
    }

    // @Authorized()
    @Get('/comments')
    async allcomments() {
        const comments = await Comment.find()
        return { comments }
    }


    // @Authorized()
    @Put('/comments/:id')
    async updateComment(
        @Param('id') id: number,
        @Body() update: Partial<Comment>
    ) {
        const comment = await Comment.findOne(id)
        if (!comment) throw new NotFoundError('Cannot find comment')

        return Comment.merge(comment, update).save()
    }

    // @Authorized()
    @Post('/comments')
    @HttpCode(201)
    createComment(
        @Body() comment: Comment
    ) {
        return comment.save()
    }
}