import { httpRouter } from 'convex/server'
import { authComponent } from './auth'
import { createAuth } from '../lib/auth'
import { WhatsappIncomingMessageWebhook } from './twilio/webhooks'

const http = httpRouter()

authComponent.registerRoutes(http, createAuth)

http.route({
    path: "/webhooks/twilio",
    method: "POST",
    handler: WhatsappIncomingMessageWebhook
})

export default http
