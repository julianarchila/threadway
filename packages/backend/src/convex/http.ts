import { httpRouter } from 'convex/server'
import { betterAuthComponent } from './auth'
import { createAuth } from '../lib/auth'
import { WhatsappIncomingMessageWebhook } from './twilio/webhooks'
import { handleKapsoWebhook } from './kapso/webhooks'

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

http.route({
    path: "/webhooks/twilio",
    method: "POST",
    handler: WhatsappIncomingMessageWebhook
})

// Kapso webhook route - handles "WhatsApp Phone Number Created" event
http.route({
    path: "/api/webhooks/kapso",
    method: "POST",
    handler: handleKapsoWebhook
})

export default http