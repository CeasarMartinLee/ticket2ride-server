import Event from '../events/entity'
import Comment from '../comments/entity'
import Ticket from '../tickets/entity'


export default async function getRisk(currentTicket,allTickets,userId,event_id) {
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
    const allTicketsForEvent =  await Ticket.find({where: { event: event }})
    const totalPrice = allTicketsForEvent.reduce((acc, current) => acc + current.price, 0)
    const averageTicketPrice = totalPrice / allTicketsForEvent.length
    
    //if a ticket is X% cheaper than the average price, add X% to the risk
    if (averageTicketPrice > currentTicket!.price) {
        currentTicket!.risk += (1 - (currentTicket!.price/averageTicketPrice)) * 100
    //if a ticket is X% more expensive than the average price, deduct X% from the risk, with a maximum of 10% deduction
    } else if (averageTicketPrice < currentTicket!.price) {
        if ((((currentTicket!.price/averageTicketPrice) - 1) * 100) > 10) {
            currentTicket!.risk -= 10
        } else {
            currentTicket!.risk -= ((currentTicket!.price/averageTicketPrice) - 1) * 100
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
    const commentsInTicket = await Comment.find({where: { ticket: currentTicket }})
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
  