package com.flowpay.smsrelay

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.flowpay.smsrelay.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val requestPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (!granted) {
            Toast.makeText(this, R.string.sms_permission_needed, Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val prefs = getSharedPreferences(SmsReceiver.PREFS, MODE_PRIVATE)
        binding.webhookUrl.setText(prefs.getString(SmsReceiver.KEY_WEBHOOK_URL, ""))
        binding.bearerToken.setText(prefs.getString(SmsReceiver.KEY_BEARER, ""))

        binding.saveButton.setOnClickListener {
            prefs.edit()
                .putString(SmsReceiver.KEY_WEBHOOK_URL, binding.webhookUrl.text?.toString()?.trim())
                .putString(SmsReceiver.KEY_BEARER, binding.bearerToken.text?.toString()?.trim())
                .apply()
            Toast.makeText(this, R.string.saved, Toast.LENGTH_SHORT).show()
        }

        ensureSmsPermission()
    }

    private fun ensureSmsPermission() {
        val permission = Manifest.permission.RECEIVE_SMS
        when {
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED -> Unit
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M -> requestPermission.launch(permission)
        }
    }
}
