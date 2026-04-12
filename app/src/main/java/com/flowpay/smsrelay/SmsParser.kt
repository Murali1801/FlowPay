package com.flowpay.smsrelay

import java.util.regex.Pattern

data class ParsedSms(val amount: Double, val utr: String)

object SmsParser {
    private val amountPattern = Pattern.compile("(?:Rs\\.?|INR)\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE)
    private val utrPattern = Pattern.compile("(?i)(?:ref|utr|upi).{0,5}(\\d{12})")

    fun parse(body: String): ParsedSms? {
        val amountMatcher = amountPattern.matcher(body)
        if (!amountMatcher.find()) return null
        val amountRaw = amountMatcher.group(1)?.replace(",", "") ?: return null
        val amount = amountRaw.toDoubleOrNull() ?: return null

        val utrMatcher = utrPattern.matcher(body)
        if (!utrMatcher.find()) return null
        val utr = utrMatcher.group(1) ?: return null

        return ParsedSms(amount = amount, utr = utr)
    }
}
