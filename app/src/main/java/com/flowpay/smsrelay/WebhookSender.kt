package com.flowpay.smsrelay

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object WebhookSender {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    fun post(webhookUrl: String, bearerToken: String, parsed: ParsedSms): Result<String> {
        val bodyJson = JSONObject()
            .put("amount", parsed.amount)
            .put("utr", parsed.utr)
            .toString()

        val request = Request.Builder()
            .url(webhookUrl)
            .post(bodyJson.toRequestBody(jsonMedia))
            .header("Authorization", "Bearer $bearerToken")
            .header("Content-Type", "application/json")
            .build()

        return runCatching {
            client.newCall(request).execute().use { response ->
                val text = response.body?.string().orEmpty()
                if (!response.isSuccessful) {
                    error("HTTP ${response.code}: $text")
                }
                text
            }
        }
    }
}
