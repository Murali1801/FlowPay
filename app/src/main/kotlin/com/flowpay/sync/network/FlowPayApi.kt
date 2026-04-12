package com.flowpay.sync.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Url

interface FlowPayApi {
    @POST
    suspend fun syncSms(
        @Url url: String,
        @Header("Authorization") bearerToken: String,
        @Body payload: SmsPayload
    ): Response<SmsResponse>
}
