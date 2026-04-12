package com.flowpay.sync.network

import com.google.gson.annotations.SerializedName

data class StatsResponse(
    @SerializedName("total_orders") val totalOrders: Int,
    @SerializedName("pending") val pending: Int,
    @SerializedName("paid") val paid: Int,
    @SerializedName("total_paid_amount") val totalPaidAmount: String
)

data class OrderRow(
    @SerializedName("order_id") val orderId: String,
    @SerializedName("amount") val amount: String,
    @SerializedName("status") val status: String,
    @SerializedName("utr_number") val utrNumber: String?,
    @SerializedName("created_at") val createdAt: String?
)

data class SmsPayload(
    val amount: Double,
    val utr: String
)
