package com.flowpay.smsrelay

import android.app.Application
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

class FlowPayApp : Application() {
    val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
}
