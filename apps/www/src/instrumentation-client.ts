// instrumentation-client.js
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: "/relay-r5mr",
    ui_host: 'https://us.posthog.com',
    defaults: '2025-05-24'
});
            