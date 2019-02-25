import 'reflect-metadata'
import {createKoaServer} from 'routing-controllers'
import PageController from './pages/controller'
import setupDb from './db'
import UserController from './users/controller'
import LoginController from './logins/controller'
import EventController from './events/controller'
import TicketController from './events/controller'
import {Action} from 'routing-controllers'
import {verify} from './jwt'


const app = createKoaServer({
  controllers: [
    PageController,
    UserController,
    LoginController,
    EventController,
    TicketController
  ],
  authorizationChecker: (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')
      return !!(token && verify(token))
    }
    return false
  }
})

setupDb()
  .then(_ =>
    app.listen(process.env.PORT|| 4010, () => console.log('Listening on port 4010'))
  )
  .catch(err => console.error(err))