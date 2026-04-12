package com.flowpay.sync.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import kotlinx.coroutines.launch
import com.flowpay.sync.network.SmsPayload
import com.flowpay.sync.network.FlowPayApi
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import com.flowpay.sync.data.ConfigManager
import com.flowpay.sync.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SyncScreen(config: ConfigManager, onNavigateToRegex: () -> Unit) {
    val scope = rememberCoroutineScope()
    var url by remember { mutableStateOf(config.webhookUrl) }
    var token by remember { mutableStateOf(config.bearerToken) }
    var filters by remember { mutableStateOf(config.senderFilter) }
    var logs by remember { mutableStateOf(config.lastSyncLog) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                "Sync Engine Configuration",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F172A)
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth().clickable {
                    scope.launch {
                        try {
                            val retrofit = Retrofit.Builder()
                                .baseUrl("https://flowpay-api.onrender.com")
                                .addConverterFactory(GsonConverterFactory.create())
                                .build()
                            val api = retrofit.create(FlowPayApi::class.java)
                            val bearer = if (config.bearerToken.startsWith("Bearer ")) config.bearerToken else "Bearer ${config.bearerToken}"
                            api.syncSms(config.webhookUrl, bearer, SmsPayload(0.01, "TEST_CONN"))
                            config.addLog("✅ Connection Test Sent")
                        } catch(e: Exception) {
                            config.addLog("❌ Test Failed: ${e.message}")
                        }
                    }
                },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Indigo.copy(alpha = 0.1f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Indigo.copy(alpha = 0.2f))
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.BugReport, null, tint = Indigo)
                    Spacer(Modifier.width(12.dp))
                    Text("Test Webhook Connection", color = Indigo, fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            StatusCard()
        }

        item {
            ConfigSection(
                url = url, onUrlChange = { url = it },
                token = token, onTokenChange = { token = it },
                filters = filters, onFiltersChange = { filters = it },
                onSave = {
                    config.webhookUrl = url
                    config.bearerToken = token
                    config.senderFilter = filters
                    logs = config.lastSyncLog
                }
            )
        }

        item {
            AdvancedTriggersSection(onNavigateToRegex)
        }

        item {
            Text("Recent Activity Log", fontWeight = FontWeight.Bold, color = TextSecondary)
        }

        item {
            LogCard(logs)
        }
    }
}

@Composable
fun StatusCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Green)
            )
            Spacer(Modifier.width(12.dp))
            Column {
                Text("Real-time Listener Active", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Intercepting bank notifications...", color = TextSecondary, fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun ConfigSection(
    url: String, onUrlChange: (String) -> Unit,
    token: String, onTokenChange: (String) -> Unit,
    filters: String, onFiltersChange: (String) -> Unit,
    onSave: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            ConfigField("Webhook URL", url, onUrlChange, Icons.Default.Link, "https://...")
            ConfigField("Bearer Token", token, onTokenChange, Icons.Default.Lock, "Bearer ...")
            ConfigField("Sender Filters", filters, onFiltersChange, Icons.Default.FilterList, "HDFCBK, AXISBK...")
            
            Button(
                onClick = onSave,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Teal)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Update Settings", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AdvancedTriggersSection(onNavigateToRegex: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(20.dp)) {
            Text("Advanced Trigger Logic", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(Modifier.height(12.dp))
            
            ListItem(
                headlineContent = { Text("Bank Templates") },
                supportingContent = { Text("HDFC, SBI, ICICI Preconfigured") },
                trailingContent = { Switch(checked = true, onCheckedChange = {}) },
                colors = ListItemDefaults.colors(containerColor = Color.Transparent)
            )
            Divider(color = Border.copy(alpha = 0.5f))
            ListItem(
                headlineContent = { Text("Custom Regex") },
                supportingContent = { Text("Define your own parsing rules") },
                trailingContent = { Icon(Icons.Default.ChevronRight, null) },
                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                modifier = Modifier.clickable { onNavigateToRegex() }
            )
        }
    }
}

@Composable
fun ConfigField(label: String, value: String, onValueChange: (String) -> Unit, icon: ImageVector, placeholder: String) {
    Column {
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary, modifier = Modifier.padding(bottom = 6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            placeholder = { Text(placeholder, fontSize = 14.sp) },
            leadingIcon = { Icon(icon, contentDescription = null, modifier = Modifier.size(20.dp), tint = TextSecondary) },
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Border,
                focusedBorderColor = Teal
            ),
            singleLine = true
        )
    }
}

@Composable
fun LogCard(logs: String) {
    Card(
        modifier = Modifier.fillMaxWidth().heightIn(min = 120.dp, max = 300.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(16.dp).verticalScroll(rememberScrollState())) {
            if (logs.isBlank() || logs == "No syncs yet") {
                Text("No recent activity recorded.", color = TextSecondary, fontSize = 13.sp)
            } else {
                logs.split("\n").filter { it.isNotBlank() }.forEach { line ->
                    RichLogEntry(line)
                    Spacer(Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun RichLogEntry(line: String) {
    val color = when {
        line.contains("✅") -> Green
        line.contains("❌") -> Red
        line.contains("Match") -> Indigo
        else -> TextSecondary
    }
    Row(verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier
                .padding(top = 4.dp)
                .size(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(color)
        )
        Spacer(Modifier.width(10.dp))
        Text(
            line,
            fontSize = 12.sp,
            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
            color = if (color == TextSecondary) TextSecondary else color.copy(alpha = 0.8f),
            lineHeight = 16.sp
        )
    }
}
