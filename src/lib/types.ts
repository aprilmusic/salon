import { z } from 'zod'

export const performanceSchema = z.object({
    id: z.string(),
    title: z.string(),
    composer: z.string(),
    performers: z.string(),
    order: z.number()
})

export type Performance = z.infer<typeof performanceSchema>

export const concertSchema = z.object({
    id: z.string(),
    date: z.string(),
    passcode: z.string(),
    performances: z.array(performanceSchema)
})

export type Concert = z.input<typeof concertSchema>

export const errorSchema = z.object({
    message: z.string(),
})
export type ErrorResponse = z.infer<typeof errorSchema>

// Generic zod schema that can either be an {success: true, data: T} or {success: false, error: E}
export const makeResponseSchema = <T extends z.ZodType<any, any, any>>(
    data: T
) =>
    z.union([
        z.object({ success: z.literal(true), result: data }),
        z.object({ success: z.literal(false), error: errorSchema }),
    ])
