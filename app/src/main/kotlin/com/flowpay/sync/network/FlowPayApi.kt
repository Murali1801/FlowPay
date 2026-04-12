package com.flowpay.sync.network

import retrofit2.Response
import retrofit2.http.*

interface FlowPayApi {
    @POST
    suspend fun syncSms(
        @Url url: String,
        @Header("Authorization") bearerToken: String,
        @Body payload: SmsPayload
    ): Response<Unit>

    @GET("api/admin/stats")
    suspend fun getStats(
        @Header("Authorization") bearerToken: String
    ): Response<StatsResponse>

    @GET("api/admin/orders")
    suspend fun getOrders(
        @Header("Authorization") bearerToken: String
    ): Response<List<OrderRow>>
}
