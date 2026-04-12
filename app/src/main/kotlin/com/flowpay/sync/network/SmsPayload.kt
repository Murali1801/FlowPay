package com.flowpay.sync.network

import com.google.gson.annotations.SerializedName

data class SmsPayload(
    @SerializedName("amount") val amount: Double,
    @SerializedName("utr") val utr: String,
    @SerializedName("merchant_id") val merchantId: String? = null
)

data class SmsResponse(
    @SerializedName("matched") val matched: Boolean,
    @SerializedName("message") val message: String
)
