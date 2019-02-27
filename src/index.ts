import 'reflect-metadata'
import {createKoaServer, BadRequestError} from 'routing-controllers'
import PageController from './pages/controller'
import setupDb from './db'
import UserController from './users/controller'
import LoginController from './logins/controller'
import EventController from './events/controller'
import TicketController from './tickets/controller'
import CommentController from './comments/controller'
import {Action} from 'routing-controllers'
import {verify} from './jwt'
import User from './users/entity';


const app = createKoaServer({
  cors: true,
  controllers: [
    PageController,
    UserController,
    LoginController,
    EventController,
    TicketController,
    CommentController
  ],
  authorizationChecker: (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')
      try {
        return !!(token && verify(token))
      }
      catch (e) {
        throw new BadRequestError(e)
      }    }
    return false
  },
  currentUserChecker: async (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')
      if (token) {
        const userId = verify(token).data.id;
        const user = await User.findOne(userId);
        return user
      }
    }
    return undefined
  }
})

setupDb()
  .then(_ =>
    app.listen(process.env.PORT|| 4010, () => console.log('Listening on port 4010'))
  )
  .catch(err => console.error(err))