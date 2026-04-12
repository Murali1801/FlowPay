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

    var customRegex: String
        get() = prefs.getString("custom_regex", "(?i)(?:Amount|Rs|INR|₹)\\.?\\s*([\\d,]+\\.?\\d*)") ?: "(?i)(?:Amount|Rs|INR|₹)\\.?\\s*([\\d,]+\\.?\\d*)"
        set(value) = prefs.edit().putString("custom_regex", value).apply()

    var useCustomRegex: Boolean
        get() = prefs.getBoolean("use_custom_regex", false)
        set(value) = prefs.edit().putBoolean("use_custom_regex", value).apply()

    var isFirstRun: Boolean
        get() = prefs.getBoolean("is_first_run", true)
        set(value) = prefs.edit().putBoolean("is_first_run", value).apply()

    fun addLog(log: String) {
        val current = lastSyncLog
        val newLog = "[${System.currentTimeMillis()}] $log\n${current.take(2000)}"
        lastSyncLog = newLog
    }
}
