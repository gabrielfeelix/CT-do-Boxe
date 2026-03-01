import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export const payment = new Payment(client)
export const preference = new Preference(client)
export default client
