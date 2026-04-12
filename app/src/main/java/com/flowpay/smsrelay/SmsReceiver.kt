package com.flowpay.smsrelay

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val app = context.applicationContext as? FlowPayApp ?: run {
            Log.e(TAG, "Application must be FlowPayApp")
            return
        }

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        val fullBody = messages.joinToString(separator = "") { it.messageBody }

        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val webhookUrl = prefs.getString(KEY_WEBHOOK_URL, null)?.trim().orEmpty()
        val bearer = prefs.getString(KEY_BEARER, null)?.trim().orEmpty()
        if (webhookUrl.isEmpty() || bearer.isEmpty()) {
            Log.w(TAG, "Webhook URL or bearer token not configured in the app")
            return
        }

        val parsed = SmsParser.parse(fullBody)
        if (parsed == null) {
            Log.d(TAG, "SMS did not match amount/UTR patterns; skip")
            return
        }

        val pending = goAsync()
        app.applicationScope.launch(Dispatchers.IO) {
            try {
                val result = WebhookSender.post(webhookUrl, bearer, parsed)
                result.onSuccess { Log.i(TAG, "Webhook OK: $it") }
                result.onFailure { Log.e(TAG, "Webhook failed", it) }
            } finally {
                pending.finish()
            }
        }
    }

    companion object {
        private const val TAG = "FlowPaySms"
        const val PREFS = "flowpay_sms_relay"
        const val KEY_WEBHOOK_URL = "webhook_url"
        const val KEY_BEARER = "bearer_token"
    }
}
