package com.flowpay.sync

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.flowpay.sync.data.ConfigManager
import com.flowpay.sync.network.FlowPayApi
import com.flowpay.sync.network.SmsPayload
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.util.regex.Pattern

class SmsReceiver : BroadcastReceiver() {
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val msgs = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        val config = ConfigManager(context)
        
        for (msg in msgs) {
            val sender = msg.originatingAddress ?: ""
            val body = msg.messageBody ?: ""
            Log.d("SmsReceiver", "Received from $sender: $body")

            if (isTargetSender(sender, config.senderFilter)) {
                processSms(context, config, body)
            }
        }
    }

    private fun isTargetSender(sender: String, filter: String): Boolean {
        if (filter.isBlank()) return true
        val allowed = filter.split(",").map { it.trim().uppercase() }
        return allowed.any { sender.uppercase().contains(it) }
    }

    private fun processSms(context: Context, config: ConfigManager, body: String) {
        val amount = extractAmount(body)
        val utr = extractUtr(body)

        if (amount != null && utr != null) {
            config.addLog("Match found: ₹$amount, UTR: $utr")
            syncToBackend(config, amount, utr)
        } else {
            Log.d("SmsReceiver", "No match in body: amount=$amount, utr=$utr")
        }
    }

    private fun extractAmount(body: String): Double? {
        val patterns = mutableListOf(
            Pattern.compile("(?i)(?:Rs|INR|₹)\\.?\\s*([\\d,]+\\.?\\d*)"),
            Pattern.compile("(?i)amounted\\s+to\\s+(?:Rs|INR|₹)?\\s*([\\d,]+\\.?\\d*)"),
            Pattern.compile("(?i)received\\s+(?:Rs|INR|₹)?\\s*([\\d,]+\\.?\\d*)")
        )
        
        if (config.useCustomRegex && config.customRegex.isNotBlank()) {
            try {
                patterns.add(0, Pattern.compile(config.customRegex))
            } catch (e: Exception) {
                Log.e("SmsReceiver", "Invalid custom regex: ${config.customRegex}")
            }
        }
        for (p in patterns) {
            val m = p.matcher(body)
            if (m.find()) {
                return m.group(1)?.replace(",", "")?.toDoubleOrNull()
            }
        }
        return null
    }

    private fun extractUtr(body: String): String? {
        val patterns = listOf(
            Pattern.compile("(?i)(?:UTR|Ref|Ref\\s*No|Transaction\\s*ID)\\s*:?\\s*([a-zA-Z0-9]{8,22})"),
            Pattern.compile("(?i)UTR[:\\s]*([0-9]{12})"),
            Pattern.compile("(?i)(\\d{12,14})")
        )
        for (p in patterns) {
            val m = p.matcher(body)
            if (m.find()) {
                return m.group(1)
            }
        }
        return null
    }

    private fun syncToBackend(config: ConfigManager, amount: Double, utr: String) {
        val url = config.webhookUrl
        val token = config.bearerToken
        if (url.isBlank() || token.isBlank()) return

        val retrofit = Retrofit.Builder()
            .baseUrl("https://placeholder.com") // dynamic URL used in call
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val api = retrofit.create(FlowPayApi::class.java)

        scope.launch {
            try {
                val bearer = if (token.startsWith("Bearer ")) token else "Bearer $token"
                val response = api.syncSms(url, bearer, SmsPayload(amount, utr))
                if (response.isSuccessful) {
                    config.addLog("✅ Sync Success: ₹$amount")
                    showNotification(context, amount, utr)
                } else {
                    config.addLog("❌ Sync Failed: ${response.code()} ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                config.addLog("❌ Network Error: ${e.message}")
            }
        }
    }

    private fun showNotification(context: Context, amount: Double, utr: String) {
        val notification = NotificationCompat.Builder(context, SyncService.ALERTS_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle("Payment Verified: ₹$amount")
            .setContentText("UTR: $utr has been synced successfully.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        try {
            NotificationManagerCompat.from(context).notify(SyncService.ALERT_NOTIF_ID, notification)
        } catch (e: SecurityException) {
            Log.e("SmsReceiver", "Notification permission missing")
        }
    }
}
