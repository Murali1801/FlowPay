package com.flowpay.sync.data

import android.content.Context
import android.content.SharedPreferences

class ConfigManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("flowpay_sync_prefs", Context.MODE_PRIVATE)

    var webhookUrl: String
        get() = prefs.getString("webhook_url", "") ?: ""
        set(value) = prefs.edit().putString("webhook_url", value).apply()

    var bearerToken: String
        get() = prefs.getString("bearer_token", "") ?: ""
        set(value) = prefs.edit().putString("bearer_token", value).apply()

    var senderFilter: String
        get() = prefs.getString("sender_filter", "HDFCBK,SBIPAY,PAYTM") ?: "HDFCBK,SBIPAY,PAYTM"
        set(value) = prefs.edit().putString("sender_filter", value).apply()

    var lastSyncLog: String
        get() = prefs.getString("last_sync_log", "No syncs yet") ?: "No syncs yet"
        set(value) = prefs.edit().putString("last_sync_log", value).apply()

    fun addLog(log: String) {
        val current = lastSyncLog
        val newLog = "[${System.currentTimeMillis()}] $log\n${current.take(2000)}"
        lastSyncLog = newLog
    }
}
