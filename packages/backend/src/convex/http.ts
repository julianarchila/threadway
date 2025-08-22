import { httpRouter } from 'convex/server'
import { betterAuthComponent } from './auth'
import { createAuth } from '../lib/auth'
import { WhatsappIncomingMessageWebhook } from './twilio/webhooks'

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

http.route({
    path: "/webhooks/twilio",
    method: "POST",
    handler: WhatsappIncomingMessageWebhook
})

export default http