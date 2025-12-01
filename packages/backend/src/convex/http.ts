import { httpRouter } from 'convex/server'
import { betterAuthComponent } from './auth'
import { createAuth } from '../lib/auth'
import { WhatsappIncomingMessageWebhook } from './twilio/webhooks'
import { handleKapsoSuccess, handleKapsoFailure } from './kapso/webhooks'

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

http.route({
    path: "/webhooks/twilio",
    method: "POST",
    handler: WhatsappIncomingMessageWebhook
})

// Kapso webhook routes
http.route({
    path: "/api/webhooks/kapso/success",
    method: "GET",
    handler: handleKapsoSuccess
})

http.route({
    path: "/api/webhooks/kapso/failed",
    method: "GET",
    handler: handleKapsoFailure
})

export default http